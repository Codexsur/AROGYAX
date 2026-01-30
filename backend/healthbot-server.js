// HealthBot - AI-Powered Healthcare Assistant via WhatsApp/SMS
// Main server with WhatsApp Business API and SMS integration

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');

// Import custom modules
const NLPEngine = require('./nlp-engine');
const MedicalKnowledgeBase = require('./medical-knowledge-base');
const SymptomAssessment = require('./symptom-assessment');
const EmergencyDetection = require('./emergency-detection');
const MultilingualSupport = require('./multilingual-support');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'your-whatsapp-token';
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'healthbot-verify-token';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your-twilio-sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your-twilio-token';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
const JWT_SECRET = process.env.JWT_SECRET || 'healthbot-super-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthbot';
const POSTGRES_URI = process.env.POSTGRES_URI || 'postgresql://localhost:5432/healthbot_knowledge';

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Initialize custom modules
const nlpEngine = new NLPEngine();
const medicalKB = new MedicalKnowledgeBase(POSTGRES_URI);
const symptomAssessment = new SymptomAssessment();
const emergencyDetection = new EmergencyDetection();
const multilingualSupport = new MultilingualSupport();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for messaging endpoints
const messagingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit each phone number to 30 messages per minute
    keyGenerator: (req) => {
        return req.body.From || req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || req.ip;
    },
    message: 'Too many messages. Please wait a moment before sending another message.'
});

app.use('/webhook', messagingLimiter);

// MongoDB connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema for messaging platform
const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['whatsapp', 'sms'], required: true },
    name: String,
    preferredLanguage: { type: String, default: 'english' },
    location: {
        state: String,
        district: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    demographics: {
        age: Number,
        gender: { type: String, enum: ['male', 'female', 'other'] },
        occupation: String,
        education: String
    },
    medicalProfile: {
        conditions: [String],
        medications: [{
            name: String,
            dosage: String,
            frequency: String,
            reminderTime: [String],
            startDate: Date,
            endDate: Date
        }],
        allergies: [String],
        emergencyContacts: [{
            name: String,
            relationship: String,
            phone: String
        }]
    },
    conversationHistory: [{
        message: String,
        sender: { type: String, enum: ['user', 'bot'] },
        timestamp: { type: Date, default: Date.now },
        intent: String,
        confidence: Number,
        language: String
    }],
    healthAssessments: [{
        type: String,
        responses: mongoose.Schema.Types.Mixed,
        result: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now }
    }],
    preferences: {
        notifications: { type: Boolean, default: true },
        reminderFrequency: { type: String, default: 'daily' },
        emergencyAlerts: { type: Boolean, default: true },
        dataSharing: { type: Boolean, default: false }
    },
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Conversation Session Schema
const conversationSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    platform: { type: String, enum: ['whatsapp', 'sms'], required: true },
    currentFlow: String, // 'symptom_assessment', 'medication_reminder', 'health_education', etc.
    flowData: mongoose.Schema.Types.Mixed,
    lastInteraction: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

const ConversationSession = mongoose.model('ConversationSession', conversationSessionSchema);

// Health Alert Schema
const healthAlertSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    alertType: { type: String, enum: ['emergency', 'medication', 'appointment', 'health_tip'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    message: String,
    data: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
    scheduledTime: Date,
    sentTime: Date,
    createdAt: { type: Date, default: Date.now }
});

const HealthAlert = mongoose.model('HealthAlert', healthAlertSchema);

// WhatsApp webhook verification
app.get('/webhook/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        console.log('WhatsApp webhook verified');
        res.status(200).send(challenge);
    } else {
        res.status(403).send('Forbidden');
    }
});

// WhatsApp message webhook
app.post('/webhook/whatsapp', async (req, res) => {
    try {
        const body = req.body;
        
        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            
            if (value?.messages) {
                const message = value.messages[0];
                const phoneNumber = message.from;
                const messageText = message.text?.body || '';
                const messageType = message.type;
                
                console.log(`WhatsApp message from ${phoneNumber}: ${messageText}`);
                
                // Process the message
                await processIncomingMessage(phoneNumber, messageText, 'whatsapp', messageType, message);
            }
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// SMS webhook (Twilio)
app.post('/webhook/sms', async (req, res) => {
    try {
        const { From: phoneNumber, Body: messageText } = req.body;
        
        console.log(`SMS from ${phoneNumber}: ${messageText}`);
        
        // Process the message
        await processIncomingMessage(phoneNumber, messageText, 'sms');
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('SMS webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Core message processing function
async function processIncomingMessage(phoneNumber, messageText, platform, messageType = 'text', rawMessage = null) {
    try {
        // Get or create user
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            user = new User({
                phoneNumber,
                platform,
                preferredLanguage: await detectLanguage(messageText)
            });
            await user.save();
            
            // Send welcome message
            await sendWelcomeMessage(phoneNumber, platform, user.preferredLanguage);
            return;
        }
        
        // Update last active
        user.lastActive = new Date();
        
        // Detect language if not set
        if (!user.preferredLanguage || user.preferredLanguage === 'english') {
            const detectedLang = await detectLanguage(messageText);
            if (detectedLang !== 'english') {
                user.preferredLanguage = detectedLang;
            }
        }
        
        // Get or create conversation session
        let session = await ConversationSession.findOne({
            phoneNumber,
            isActive: true
        });
        
        if (!session) {
            session = new ConversationSession({
                sessionId: uuidv4(),
                phoneNumber,
                platform
            });
        }
        
        session.lastInteraction = new Date();
        
        // Process different message types
        let response;
        if (messageType === 'text') {
            // NLP processing
            const nlpResult = await nlpEngine.processMessage(messageText, user.preferredLanguage);
            
            // Emergency detection
            const emergencyResult = await emergencyDetection.checkEmergency(messageText, nlpResult);
            if (emergencyResult.isEmergency) {
                response = await handleEmergency(user, emergencyResult);
                await session.save();
                await user.save();
                await sendMessage(phoneNumber, platform, response, user.preferredLanguage);
                return;
            }
            
            // Intent-based routing
            response = await routeByIntent(nlpResult, user, session, messageText);
        } else {
            // Handle non-text messages (images, audio, etc.)
            response = await handleNonTextMessage(messageType, rawMessage, user, session);
        }
        
        // Save conversation history
        user.conversationHistory.push({
            message: messageText,
            sender: 'user',
            intent: response.intent,
            confidence: response.confidence,
            language: user.preferredLanguage
        });
        
        user.conversationHistory.push({
            message: response.text,
            sender: 'bot',
            language: user.preferredLanguage
        });
        
        // Keep only last 50 messages
        if (user.conversationHistory.length > 50) {
            user.conversationHistory = user.conversationHistory.slice(-50);
        }
        
        await session.save();
        await user.save();
        
        // Send response
        await sendMessage(phoneNumber, platform, response.text, user.preferredLanguage);
        
        // Handle follow-up actions
        if (response.followUpActions) {
            await handleFollowUpActions(response.followUpActions, user, session);
        }
        
    } catch (error) {
        console.error('Message processing error:', error);
        await sendMessage(phoneNumber, platform, 
            'I apologize, but I encountered an error. Please try again or type "help" for assistance.',
            'english'
        );
    }
}

// Intent-based message routing
async function routeByIntent(nlpResult, user, session, messageText) {
    const { intent, entities, confidence } = nlpResult;
    
    let response = {
        text: '',
        intent,
        confidence,
        followUpActions: []
    };
    
    switch (intent) {
        case 'symptom_assessment':
            response = await handleSymptomAssessment(messageText, entities, user, session);
            break;
            
        case 'health_education':
            response = await handleHealthEducation(messageText, entities, user, session);
            break;
            
        case 'medication_reminder':
            response = await handleMedicationReminder(messageText, entities, user, session);
            break;
            
        case 'doctor_consultation':
            response = await handleDoctorConsultation(messageText, entities, user, session);
            break;
            
        case 'emergency_help':
            response = await handleEmergencyHelp(messageText, entities, user, session);
            break;
            
        case 'health_tips':
            response = await handleHealthTips(messageText, entities, user, session);
            break;
            
        case 'language_change':
            response = await handleLanguageChange(messageText, entities, user, session);
            break;
            
        case 'greeting':
            response = await handleGreeting(messageText, entities, user, session);
            break;
            
        case 'profile_update':
            response = await handleProfileUpdate(messageText, entities, user, session);
            break;
            
        default:
            response = await handleGeneralQuery(messageText, entities, user, session);
    }
    
    return response;
}

// Symptom Assessment Handler
async function handleSymptomAssessment(messageText, entities, user, session) {
    if (!session.currentFlow || session.currentFlow !== 'symptom_assessment') {
        // Start new assessment
        session.currentFlow = 'symptom_assessment';
        session.flowData = {
            step: 0,
            symptoms: [],
            responses: {}
        };
        
        const welcomeText = await multilingualSupport.translate(
            "I'll help you assess your symptoms. This is not a medical diagnosis, but can help you understand when to seek care. Let's start with your main concern today.",
            user.preferredLanguage
        );
        
        const firstQuestion = await symptomAssessment.getFirstQuestion(user.preferredLanguage);
        
        return {
            text: `${welcomeText}\n\n${firstQuestion}`,
            intent: 'symptom_assessment',
            confidence: 0.9
        };
    } else {
        // Continue assessment
        const result = await symptomAssessment.processResponse(
            messageText,
            session.flowData,
            user.preferredLanguage
        );
        
        if (result.completed) {
            // Assessment completed
            session.currentFlow = null;
            
            // Save assessment
            user.healthAssessments.push({
                type: 'symptom_assessment',
                responses: session.flowData.responses,
                result: result.assessment
            });
            
            // Generate recommendations
            const recommendations = await generateHealthRecommendations(result.assessment, user);
            
            return {
                text: result.text + '\n\n' + recommendations,
                intent: 'symptom_assessment',
                confidence: 0.9,
                followUpActions: result.urgency === 'high' ? ['emergency_alert'] : ['health_tips']
            };
        } else {
            // Continue with next question
            session.flowData = result.flowData;
            return {
                text: result.text,
                intent: 'symptom_assessment',
                confidence: 0.9
            };
        }
    }
}

// Health Education Handler
async function handleHealthEducation(messageText, entities, user, session) {
    const topics = extractHealthTopics(entities);
    const educationalContent = await medicalKB.getEducationalContent(topics, user.preferredLanguage);
    
    let response = await multilingualSupport.translate(
        "Here's some helpful health information:",
        user.preferredLanguage
    );
    
    if (educationalContent.length > 0) {
        response += '\n\n' + educationalContent.join('\n\n');
    } else {
        response = await multilingualSupport.translate(
            "I'd be happy to provide health information. Could you be more specific about what you'd like to learn about? For example: diabetes, hypertension, nutrition, exercise, or mental health.",
            user.preferredLanguage
        );
    }
    
    return {
        text: response,
        intent: 'health_education',
        confidence: 0.8,
        followUpActions: ['related_tips']
    };
}

// Medication Reminder Handler
async function handleMedicationReminder(messageText, entities, user, session) {
    const medicationEntities = extractMedicationInfo(entities);
    
    if (medicationEntities.action === 'add') {
        // Add new medication reminder
        const medication = {
            name: medicationEntities.name,
            dosage: medicationEntities.dosage,
            frequency: medicationEntities.frequency,
            reminderTime: medicationEntities.times || ['09:00'],
            startDate: new Date()
        };
        
        user.medicalProfile.medications.push(medication);
        
        const confirmText = await multilingualSupport.translate(
            `Medication reminder added: ${medication.name} ${medication.dosage} ${medication.frequency}. You'll receive reminders at ${medication.reminderTime.join(', ')}.`,
            user.preferredLanguage
        );
        
        return {
            text: confirmText,
            intent: 'medication_reminder',
            confidence: 0.9,
            followUpActions: ['schedule_reminders']
        };
    } else if (medicationEntities.action === 'list') {
        // List current medications
        if (user.medicalProfile.medications.length === 0) {
            const noMedsText = await multilingualSupport.translate(
                "You don't have any medication reminders set up. Would you like to add one?",
                user.preferredLanguage
            );
            return {
                text: noMedsText,
                intent: 'medication_reminder',
                confidence: 0.9
            };
        }
        
        let medicationList = await multilingualSupport.translate(
            "Your current medications:",
            user.preferredLanguage
        );
        
        user.medicalProfile.medications.forEach((med, index) => {
            medicationList += `\n${index + 1}. ${med.name} - ${med.dosage} - ${med.frequency}`;
        });
        
        return {
            text: medicationList,
            intent: 'medication_reminder',
            confidence: 0.9
        };
    } else {
        // General medication reminder help
        const helpText = await multilingualSupport.translate(
            "I can help you set up medication reminders. Try saying:\n• 'Add medication [name] [dosage] [frequency]'\n• 'List my medications'\n• 'Remove medication [name]'",
            user.preferredLanguage
        );
        
        return {
            text: helpText,
            intent: 'medication_reminder',
            confidence: 0.8
        };
    }
}

// Emergency Handler
async function handleEmergency(user, emergencyResult) {
    const { severity, symptoms, recommendations } = emergencyResult;
    
    // Create emergency alert
    const alert = new HealthAlert({
        phoneNumber: user.phoneNumber,
        alertType: 'emergency',
        severity: 'critical',
        message: `Emergency detected: ${symptoms.join(', ')}`,
        data: emergencyResult
    });
    await alert.save();
    
    // Get emergency contacts and services
    const emergencyInfo = await getEmergencyInfo(user.location);
    
    let response = await multilingualSupport.translate(
        "🚨 EMERGENCY DETECTED 🚨\n\nBased on your symptoms, you may need immediate medical attention.",
        user.preferredLanguage
    );
    
    response += '\n\n' + await multilingualSupport.translate(
        "IMMEDIATE ACTIONS:\n• Call emergency services: 112\n• Go to nearest hospital\n• Contact family/friends",
        user.preferredLanguage
    );
    
    if (emergencyInfo.hospitals.length > 0) {
        response += '\n\n' + await multilingualSupport.translate(
            "Nearest hospitals:",
            user.preferredLanguage
        );
        emergencyInfo.hospitals.slice(0, 3).forEach(hospital => {
            response += `\n• ${hospital.name} - ${hospital.distance} - ${hospital.phone}`;
        });
    }
    
    // Notify emergency contacts if available
    if (user.medicalProfile.emergencyContacts.length > 0) {
        await notifyEmergencyContacts(user, emergencyResult);
    }
    
    return response;
}

// Send message function
async function sendMessage(phoneNumber, platform, message, language = 'english') {
    try {
        if (platform === 'whatsapp') {
            await sendWhatsAppMessage(phoneNumber, message);
        } else if (platform === 'sms') {
            await sendSMSMessage(phoneNumber, message);
        }
        
        console.log(`Message sent to ${phoneNumber} via ${platform}`);
    } catch (error) {
        console.error(`Failed to send message to ${phoneNumber}:`, error);
    }
}

// WhatsApp message sender
async function sendWhatsAppMessage(phoneNumber, message) {
    const url = `https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages`;
    
    const data = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
            body: message
        }
    };
    
    await axios.post(url, data, {
        headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
}

// SMS message sender
async function sendSMSMessage(phoneNumber, message) {
    await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber
    });
}

// Welcome message
async function sendWelcomeMessage(phoneNumber, platform, language) {
    const welcomeText = await multilingualSupport.translate(
        "🏥 Welcome to HealthBot! I'm your AI healthcare assistant.\n\nI can help you with:\n• Symptom assessment\n• Health education\n• Medication reminders\n• Doctor consultations\n• Emergency guidance\n\nType 'help' anytime for assistance. What can I help you with today?",
        language
    );
    
    await sendMessage(phoneNumber, platform, welcomeText, language);
}

// Language detection
async function detectLanguage(text) {
    // Simple language detection - in production, use proper language detection service
    const hindiPattern = /[\u0900-\u097F]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const bengaliPattern = /[\u0980-\u09FF]/;
    
    if (hindiPattern.test(text)) return 'hindi';
    if (tamilPattern.test(text)) return 'tamil';
    if (teluguPattern.test(text)) return 'telugu';
    if (bengaliPattern.test(text)) return 'bengali';
    
    return 'english';
}

// Utility functions
function extractHealthTopics(entities) {
    return entities.filter(entity => entity.type === 'health_topic').map(entity => entity.value);
}

function extractMedicationInfo(entities) {
    const info = { action: 'help' };
    
    entities.forEach(entity => {
        switch (entity.type) {
            case 'medication_action':
                info.action = entity.value;
                break;
            case 'medication_name':
                info.name = entity.value;
                break;
            case 'dosage':
                info.dosage = entity.value;
                break;
            case 'frequency':
                info.frequency = entity.value;
                break;
            case 'time':
                info.times = info.times || [];
                info.times.push(entity.value);
                break;
        }
    });
    
    return info;
}

// Scheduled tasks for medication reminders
setInterval(async () => {
    await processMedicationReminders();
}, 60000); // Check every minute

async function processMedicationReminders() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    try {
        const users = await User.find({
            'medicalProfile.medications.reminderTime': currentTime,
            'preferences.notifications': true,
            isActive: true
        });
        
        for (const user of users) {
            const dueMedications = user.medicalProfile.medications.filter(med => 
                med.reminderTime.includes(currentTime)
            );
            
            if (dueMedications.length > 0) {
                let reminderText = await multilingualSupport.translate(
                    "💊 Medication Reminder",
                    user.preferredLanguage
                );
                
                dueMedications.forEach(med => {
                    reminderText += `\n• ${med.name} - ${med.dosage}`;
                });
                
                reminderText += '\n\n' + await multilingualSupport.translate(
                    "Reply 'taken' when you've taken your medication.",
                    user.preferredLanguage
                );
                
                await sendMessage(user.phoneNumber, user.platform, reminderText, user.preferredLanguage);
            }
        }
    } catch (error) {
        console.error('Medication reminder processing error:', error);
    }
}

// Health tips scheduler
setInterval(async () => {
    await sendDailyHealthTips();
}, 24 * 60 * 60 * 1000); // Daily

async function sendDailyHealthTips() {
    try {
        const users = await User.find({
            'preferences.notifications': true,
            'preferences.reminderFrequency': 'daily',
            isActive: true
        });
        
        for (const user of users) {
            const personalizedTip = await generatePersonalizedHealthTip(user);
            await sendMessage(user.phoneNumber, user.platform, personalizedTip, user.preferredLanguage);
        }
    } catch (error) {
        console.error('Daily health tips error:', error);
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`HealthBot Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('WhatsApp webhook: /webhook/whatsapp');
    console.log('SMS webhook: /webhook/sms');
});

module.exports = app;
