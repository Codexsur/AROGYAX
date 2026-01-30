// Advanced Chatbot Engine for Sathi - AROGYAX AI Health Companion
class SathiChatbot {
    constructor() {
        this.diseaseDatabase = new DiseaseDatabase();
        this.symptomChecker = new SymptomChecker();
        this.emergencyDetector = new EmergencyDetector();
        this.indianMedicalFacilities = new IndianMedicalFacilities();
        this.conversationHistory = [];
        this.userProfile = {
            age: null,
            gender: null,
            location: null,
            medicalHistory: [],
            currentSymptoms: []
        };
    }

    async processMessage(userMessage, userContext = {}) {
        const message = userMessage.toLowerCase().trim();
        this.conversationHistory.push({ role: 'user', message: userMessage, timestamp: new Date() });

        // Update user profile if information is provided
        this.updateUserProfile(message, userContext);

        let response;

        // Emergency detection - highest priority
        if (this.emergencyDetector.detectEmergency(message)) {
            response = this.handleEmergency(message);
        }
        // Symptom assessment
        else if (this.isSymptomQuery(message)) {
            response = await this.symptomChecker.assessSymptoms(message, this.userProfile);
        }
        // Disease information
        else if (this.isDiseaseQuery(message)) {
            response = await this.diseaseDatabase.getInformation(message);
        }
        // Prevention and health tips
        else if (this.isPreventionQuery(message)) {
            response = this.getPreventionGuidance(message);
        }
        // Medical facility search
        else if (this.isFacilityQuery(message)) {
            response = this.indianMedicalFacilities.findNearbyFacilities(message, this.userProfile.location);
        }
        // General health query
        else {
            response = this.generateGeneralResponse(message);
        }

        this.conversationHistory.push({ role: 'sathi', message: response, timestamp: new Date() });
        return response;
    }

    updateUserProfile(message, context) {
        // Extract age
        const ageMatch = message.match(/(\d+)\s*(years?|yrs?)\s*old|age\s*(\d+)/i);
        if (ageMatch) {
            this.userProfile.age = parseInt(ageMatch[1] || ageMatch[3]);
        }

        // Extract gender
        if (message.includes('male') || message.includes('man') || message.includes('boy')) {
            this.userProfile.gender = 'male';
        } else if (message.includes('female') || message.includes('woman') || message.includes('girl')) {
            this.userProfile.gender = 'female';
        }

        // Extract location from Indian cities
        const indianCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow'];
        for (const city of indianCities) {
            if (message.includes(city)) {
                this.userProfile.location = city;
                break;
            }
        }
    }

    isSymptomQuery(message) {
        const symptomKeywords = ['fever', 'headache', 'cough', 'cold', 'pain', 'ache', 'sick', 'symptoms', 'feeling', 'hurt'];
        return symptomKeywords.some(keyword => message.includes(keyword));
    }

    isDiseaseQuery(message) {
        const diseaseKeywords = ['diabetes', 'hypertension', 'covid', 'malaria', 'dengue', 'typhoid', 'tuberculosis', 'asthma'];
        return diseaseKeywords.some(keyword => message.includes(keyword));
    }

    isPreventionQuery(message) {
        const preventionKeywords = ['prevent', 'avoid', 'healthy', 'diet', 'exercise', 'vaccination', 'immunity'];
        return preventionKeywords.some(keyword => message.includes(keyword));
    }

    isFacilityQuery(message) {
        const facilityKeywords = ['hospital', 'doctor', 'clinic', 'medical', 'pharmacy', 'emergency'];
        return facilityKeywords.some(keyword => message.includes(keyword));
    }

    handleEmergency(message) {
        return `🚨 EMERGENCY DETECTED 🚨

This appears to be a medical emergency. Please take immediate action:

📞 CALL IMMEDIATELY:
• 112 - National Emergency Number (All services)
• 102 - Ambulance/Medical Emergency
• 100 - Police (if needed)

🏥 NEAREST EMERGENCY SERVICES:
If you're in a major city, go to the nearest:
• Government Hospital Emergency Ward
• Private Hospital Emergency Department
• Primary Health Center (PHC)

⚠️ DO NOT DELAY - Seek immediate medical attention!

While waiting for help:
• Stay calm and keep the person conscious
• Do not give food or water
• Keep airways clear
• Monitor breathing and pulse

Your safety is our priority. Please get professional medical help immediately.`;
    }

    getPreventionGuidance(message) {
        const preventionTips = {
            general: `🌟 GENERAL HEALTH PREVENTION TIPS:

🍎 NUTRITION:
• Include seasonal Indian fruits and vegetables
• Consume whole grains like brown rice, millets
• Include protein sources: dal, paneer, eggs, fish
• Limit processed and fried foods
• Stay hydrated with 8-10 glasses of water daily

🏃‍♂️ PHYSICAL ACTIVITY:
• 30 minutes of moderate exercise daily
• Include yoga or pranayama
• Take stairs instead of elevators
• Walk after meals for better digestion

😴 SLEEP & STRESS:
• 7-8 hours of quality sleep
• Practice meditation or deep breathing
• Maintain regular sleep schedule
• Limit screen time before bed

🧼 HYGIENE:
• Wash hands frequently with soap
• Maintain oral hygiene
• Keep surroundings clean
• Use mosquito protection (nets, repellents)`,

            seasonal: `🌦️ SEASONAL HEALTH TIPS FOR INDIA:

MONSOON (June-September):
• Boil water before drinking
• Avoid street food and raw vegetables
• Use mosquito repellents (dengue/malaria prevention)
• Keep feet dry to prevent fungal infections

WINTER (December-February):
• Include vitamin C rich foods
• Stay warm and avoid sudden temperature changes
• Moisturize skin regularly
• Get adequate sunlight for Vitamin D

SUMMER (March-May):
• Stay hydrated, drink ORS if needed
• Avoid direct sun exposure (10 AM - 4 PM)
• Wear light-colored, loose cotton clothes
• Include cooling foods like cucumber, watermelon`
        };

        if (message.includes('seasonal') || message.includes('monsoon') || message.includes('summer') || message.includes('winter')) {
            return preventionTips.seasonal;
        }
        return preventionTips.general;
    }

    generateGeneralResponse(message) {
        const responses = [
            `Thank you for reaching out to Sathi! I'm here to help with your health concerns. 

I can assist you with:
• Symptom assessment and guidance
• Disease information and prevention
• Health tips tailored for Indian lifestyle
• Emergency situation identification
• Finding nearby healthcare facilities
• Vaccination schedules and health tracking

What specific health topic would you like to discuss today?`,

            `Namaste! I'm Sathi, your AI health companion. I understand you have a health-related question.

🏥 I provide evidence-based health information
🩺 I can help assess symptoms (not a replacement for doctor consultation)
🇮🇳 I'm designed specifically for Indian healthcare needs
🌍 I support multiple Indian languages

Please share your specific health concern, and I'll do my best to help you with accurate information and guidance.`,

            `Hello! I'm here to support your health journey. 

For the best assistance, please tell me:
• Your specific symptoms or health concern
• Your age and location (for localized advice)
• Any relevant medical history
• How long you've been experiencing the issue

Remember: I provide general health information. For serious concerns, always consult with a qualified healthcare professional.

How can I help you today?`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Disease Database Class
class DiseaseDatabase {
    constructor() {
        this.diseases = {
            'diabetes': {
                name: 'Diabetes Mellitus',
                description: 'A group of metabolic disorders characterized by high blood sugar levels.',
                symptoms: ['Increased thirst', 'Frequent urination', 'Unexplained weight loss', 'Fatigue', 'Blurred vision'],
                prevention: [
                    'Maintain healthy weight',
                    'Regular physical activity',
                    'Balanced diet with low sugar and refined carbs',
                    'Regular health checkups',
                    'Avoid smoking and excessive alcohol'
                ],
                indianContext: 'India has over 77 million diabetics. Include millets, bitter gourd, and fenugreek in diet.',
                riskFactors: ['Family history', 'Obesity', 'Sedentary lifestyle', 'Age >45', 'PCOS in women']
            },
            'hypertension': {
                name: 'High Blood Pressure',
                description: 'A condition where blood pressure in arteries is persistently elevated.',
                symptoms: ['Headaches', 'Shortness of breath', 'Nosebleeds', 'Chest pain', 'Vision problems'],
                prevention: [
                    'Reduce salt intake (<5g/day)',
                    'Regular exercise',
                    'Maintain healthy weight',
                    'Limit alcohol consumption',
                    'Manage stress through yoga/meditation'
                ],
                indianContext: 'Common in Indian urban population. Reduce pickle, papad consumption. Include garlic, onion.',
                riskFactors: ['Age', 'Family history', 'Obesity', 'High salt diet', 'Stress', 'Smoking']
            },
            'dengue': {
                name: 'Dengue Fever',
                description: 'A mosquito-borne viral infection common in tropical regions.',
                symptoms: ['High fever', 'Severe headache', 'Eye pain', 'Muscle aches', 'Skin rash', 'Nausea'],
                prevention: [
                    'Eliminate stagnant water around home',
                    'Use mosquito nets and repellents',
                    'Wear long-sleeved clothes',
                    'Keep surroundings clean',
                    'Use larvicide in water storage'
                ],
                indianContext: 'Peak season: Post-monsoon (Sept-Nov). Common in urban areas. Immediate medical attention needed.',
                riskFactors: ['Monsoon season', 'Urban areas', 'Stagnant water', 'Poor sanitation']
            }
        };
    }

    async getInformation(query) {
        const disease = this.findDisease(query);
        if (disease) {
            return this.formatDiseaseInfo(disease);
        }
        return "I don't have specific information about that condition. Please consult with a healthcare professional for accurate diagnosis and treatment.";
    }

    findDisease(query) {
        for (const [key, disease] of Object.entries(this.diseases)) {
            if (query.includes(key) || query.includes(disease.name.toLowerCase())) {
                return disease;
            }
        }
        return null;
    }

    formatDiseaseInfo(disease) {
        return `📋 **${disease.name}**

📖 **Description:**
${disease.description}

🔍 **Common Symptoms:**
${disease.symptoms.map(s => `• ${s}`).join('\n')}

🛡️ **Prevention:**
${disease.prevention.map(p => `• ${p}`).join('\n')}

🇮🇳 **Indian Context:**
${disease.indianContext}

⚠️ **Risk Factors:**
${disease.riskFactors.map(r => `• ${r}`).join('\n')}

**Important:** This is general information only. Please consult a healthcare professional for proper diagnosis and treatment.`;
    }
}

// Symptom Checker Class
class SymptomChecker {
    constructor() {
        this.symptomPatterns = {
            'fever_headache': {
                symptoms: ['fever', 'headache'],
                possibleCauses: ['Viral infection', 'Bacterial infection', 'Dengue', 'Malaria', 'Typhoid'],
                urgency: 'moderate',
                advice: 'Monitor temperature, stay hydrated, rest. Consult doctor if fever >101°F or persists >3 days.'
            },
            'chest_pain': {
                symptoms: ['chest pain', 'chest discomfort'],
                possibleCauses: ['Heart attack', 'Angina', 'Acid reflux', 'Muscle strain'],
                urgency: 'high',
                advice: 'SEEK IMMEDIATE MEDICAL ATTENTION. Call 102 or go to nearest emergency room.'
            },
            'breathing_difficulty': {
                symptoms: ['difficulty breathing', 'shortness of breath', 'breathless'],
                possibleCauses: ['Asthma', 'Heart problems', 'Pneumonia', 'COVID-19'],
                urgency: 'high',
                advice: 'URGENT: Seek immediate medical care. This could be serious.'
            }
        };
    }

    async assessSymptoms(message, userProfile) {
        const symptoms = this.extractSymptoms(message);
        const assessment = this.analyzeSymptoms(symptoms, userProfile);
        return this.formatAssessment(assessment, symptoms);
    }

    extractSymptoms(message) {
        const commonSymptoms = [
            'fever', 'headache', 'cough', 'cold', 'sore throat', 'body ache', 
            'nausea', 'vomiting', 'diarrhea', 'stomach pain', 'chest pain',
            'difficulty breathing', 'dizziness', 'fatigue', 'weakness'
        ];
        
        return commonSymptoms.filter(symptom => message.includes(symptom));
    }

    analyzeSymptoms(symptoms, userProfile) {
        // Simple rule-based analysis
        let urgency = 'low';
        let advice = 'Monitor symptoms and rest.';
        let possibleCauses = ['Common viral infection'];

        if (symptoms.includes('chest pain') || symptoms.includes('difficulty breathing')) {
            urgency = 'high';
            advice = 'SEEK IMMEDIATE MEDICAL ATTENTION';
            possibleCauses = ['Serious medical condition - requires immediate evaluation'];
        } else if (symptoms.includes('fever') && symptoms.length > 2) {
            urgency = 'moderate';
            advice = 'Consult a doctor if symptoms worsen or persist';
            possibleCauses = ['Viral/bacterial infection', 'Seasonal illness'];
        }

        return { urgency, advice, possibleCauses };
    }

    formatAssessment(assessment, symptoms) {
        const urgencyEmoji = {
            'high': '🚨',
            'moderate': '⚠️',
            'low': 'ℹ️'
        };

        return `${urgencyEmoji[assessment.urgency]} **SYMPTOM ASSESSMENT**

**Your Symptoms:** ${symptoms.join(', ')}

**Possible Causes:**
${assessment.possibleCauses.map(cause => `• ${cause}`).join('\n')}

**Recommendation:**
${assessment.advice}

**General Care:**
• Rest and stay hydrated
• Monitor your symptoms
• Maintain isolation if fever/cough
• Take paracetamol for fever (as per dosage)

**When to Seek Immediate Care:**
• Difficulty breathing
• Chest pain
• High fever (>103°F)
• Severe dehydration
• Persistent vomiting

**Disclaimer:** This is not a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation and treatment.`;
    }
}

// Emergency Detection Class
class EmergencyDetector {
    constructor() {
        this.emergencyKeywords = [
            'chest pain', 'heart attack', 'can\'t breathe', 'difficulty breathing',
            'unconscious', 'bleeding heavily', 'severe pain', 'stroke',
            'poisoning', 'overdose', 'accident', 'emergency', 'urgent',
            'choking', 'seizure', 'convulsion'
        ];
    }

    detectEmergency(message) {
        return this.emergencyKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
    }
}

// Indian Medical Facilities Database
class IndianMedicalFacilities {
    constructor() {
        this.facilities = {
            'mumbai': [
                'Tata Memorial Hospital', 'KEM Hospital', 'Lilavati Hospital',
                'Hinduja Hospital', 'Jaslok Hospital', 'Breach Candy Hospital'
            ],
            'delhi': [
                'AIIMS Delhi', 'Sir Ganga Ram Hospital', 'Apollo Hospital',
                'Fortis Hospital', 'Max Hospital', 'Safdarjung Hospital'
            ],
            'bangalore': [
                'Manipal Hospital', 'Apollo Hospital', 'Fortis Hospital',
                'Narayana Health', 'St. John\'s Hospital', 'Vikram Hospital'
            ],
            'chennai': [
                'Apollo Hospital', 'Fortis Malar', 'MIOT Hospital',
                'Stanley Medical College', 'Voluntary Health Services'
            ],
            'hyderabad': [
                'Apollo Hospital', 'NIMS Hospital', 'Care Hospital',
                'Continental Hospital', 'Yashoda Hospital'
            ]
        };
    }

    findNearbyFacilities(query, location) {
        if (!location) {
            return `To find nearby medical facilities, please share your city or location.

Major cities I have information for:
• Mumbai • Delhi • Bangalore • Chennai • Hyderabad • Kolkata • Pune

You can also call:
• 102 - Ambulance
• 108 - Emergency Ambulance Service
• 112 - National Emergency Number`;
        }

        const cityFacilities = this.facilities[location.toLowerCase()];
        if (cityFacilities) {
            return `🏥 **Medical Facilities in ${location.charAt(0).toUpperCase() + location.slice(1)}:**

${cityFacilities.map(facility => `• ${facility}`).join('\n')}

📞 **Emergency Numbers:**
• 102 - Ambulance
• 108 - Emergency Ambulance Service
• 112 - National Emergency Number

**Tip:** For non-emergency care, you can also visit nearby Primary Health Centers (PHC) or Community Health Centers (CHC).`;
        }

        return `I don't have specific facility information for ${location}. Please contact:
• 102 - Ambulance
• 108 - Emergency Ambulance Service
• Your local Primary Health Center (PHC)
• District Hospital`;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SathiChatbot };
} else {
    window.SathiChatbot = SathiChatbot;
}
