// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Make utility functions global
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        switch(type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    window.updateProtectedContent = function(isLoggedIn) {
        const protectedElements = document.querySelectorAll('[data-auth-required]');
        protectedElements.forEach(element => {
            if (isLoggedIn) {
                element.style.display = '';
                element.removeAttribute('disabled');
            } else {
                element.style.display = 'none';
                element.setAttribute('disabled', 'true');
            }
        });
    }

    // Add CSS for notifications
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(notificationStyles);

    // Initialize all advanced features
    initializeAdvancedFeatures();
    
    // Initialize Google Auth when available
    if (typeof google !== 'undefined') {
        initializeGoogleAuth();
    } else {
        // Wait for Google API to load
        window.addEventListener('load', () => {
            if (typeof google !== 'undefined') {
                initializeGoogleAuth();
            }
        });
    }
    
    // Check for existing authentication
    checkExistingAuth();
});

// Smooth scrolling for navigation links
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// Modal functionality
function openChatbot() {
    const modal = document.getElementById('chatbotModal');
    modal.style.display = 'block';
    loadChatbot();
}

function closeChatbot() {
    const modal = document.getElementById('chatbotModal');
    modal.style.display = 'none';
}

function showEmergencyNumbers() {
    const modal = document.getElementById('emergencyModal');
    modal.style.display = 'block';
}

function closeEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    modal.style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const chatModal = document.getElementById('chatbotModal');
    const emergencyModal = document.getElementById('emergencyModal');
    
    if (event.target === chatModal) {
        chatModal.style.display = 'none';
    }
    if (event.target === emergencyModal) {
        emergencyModal.style.display = 'none';
    }
}

// Feature functions
function openSymptomChecker() {
    alert('Symptom Checker will be available soon! For now, please chat with Sathi for symptom assessment.');
    openChatbot();
}

function openDiseaseDB() {
    alert('Disease Database will be available soon! For now, please chat with Sathi for disease information.');
    openChatbot();
}

function openRiskAssessment() {
    alert('Risk Assessment tool will be available soon! For now, please chat with Sathi for health risk evaluation.');
    openChatbot();
}

function openPrevention() {
    alert('Prevention Guidance will be available soon! For now, please chat with Sathi for prevention strategies.');
    openChatbot();
}

function changeLanguage() {
    const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];
    const selectedLang = prompt('Select your preferred language:\n' + languages.map((lang, index) => `${index + 1}. ${lang}`).join('\n'));
    
    if (selectedLang && selectedLang >= 1 && selectedLang <= languages.length) {
        alert(`Language changed to ${languages[selectedLang - 1]}. This feature will be fully implemented soon!`);
    }
}

// Health tools functions
function startHealthQuiz() {
    alert('Health Assessment Quiz will be available soon! For now, please chat with Sathi for health assessment.');
    openChatbot();
}

function openSymptomTracker() {
    alert('Symptom Tracker will be available soon! For now, please chat with Sathi to discuss your symptoms.');
    openChatbot();
}

function openVaccinationScheduler() {
    alert('Vaccination Scheduler will be available soon! For now, please chat with Sathi for vaccination guidance.');
    openChatbot();
}

function openGoalTracker() {
    alert('Health Goal Tracker will be available soon! For now, please chat with Sathi to set health goals.');
    openChatbot();
}

// Resource functions
function openHealthBlog() {
    alert('Health Blog will be available soon! For now, please chat with Sathi for health information.');
}

function openResourceDirectory() {
    alert('Healthcare Directory will be available soon! For now, please chat with Sathi for healthcare provider information.');
}

function openEducationalContent() {
    alert('Educational Content will be available soon! For now, please chat with Sathi for health education.');
}

function openPrivacyPolicy() {
    alert('Privacy Policy will be available soon!');
}

function openTerms() {
    alert('Terms of Service will be available soon!');
}

// Initialize advanced features
let sathiBot = null;
let aiDiagnostics = null;
let advancedIntegrations = null;
let interactiveFeatures = null;
let healthTools = null;
let currentUser = null;

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const GOOGLE_CLIENT_ID = 'your-google-client-id';

// Load chatbot interface
function loadChatbot() {
    console.log('Loading chatbot...');
    
    // Use existing chatbot modal from HTML and populate it
    const container = document.getElementById('chatbotContainer');
    if (container) {
        console.log('Chatbot container found, populating...');
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        container.innerHTML = `
            <div class="chatbot-interface">
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot-message">
                        <div class="message-avatar">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232563eb'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="Sathi" class="avatar-img">
                        </div>
                        <div class="message-content">
                            <div class="message-text">
                                <strong>Namaste! I'm Sathi, your AI health companion.</strong><br><br>
                                I can help you with:
                                <ul>
                                    <li>Symptom assessment and guidance</li>
                                    <li>Disease information and prevention</li>
                                    <li>Health risk evaluation</li>
                                    <li>Emergency situation identification</li>
                                    <li>General health questions</li>
                                </ul>
                                How can I assist you today?
                            </div>
                            <div class="message-time">${currentTime}</div>
                        </div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" placeholder="Type your health question in English or Hindi..." onkeypress="handleChatKeyPress(event)">
                    <button onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        console.log('Chatbot interface loaded successfully');
    } else {
        console.error('Chatbot container not found!');
    }
    
    // Initialize the advanced chatbot
    if (typeof SathiChatbot !== 'undefined') {
        sathiBot = new SathiChatbot();
        console.log('Advanced Sathi chatbot initialized');
    }
}

function createChatbotModal() {
    const modal = document.createElement('div');
    modal.id = 'chatbotModal';
    modal.className = 'chatbot-modal';
    modal.innerHTML = `
        <div class="chatbot-container">
            <div class="chatbot-header">
                <div class="chatbot-title">
                    <i class="fas fa-robot"></i>
                    <span>Chat with Sathi</span>
                </div>
                <button class="close-btn" onclick="closeChatbot()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chatbot-interface">
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot-message">
                        <div class="message-avatar">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232563eb'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="Sathi" class="avatar-img">
                        </div>
                        <div class="message-content">
                            <div class="message-text">
                                <strong>Namaste! I'm Sathi, your AI health companion.</strong><br><br>
                                I can help you with:
                                <ul>
                                    <li>Symptom assessment and guidance</li>
                                    <li>Disease information and prevention</li>
                                    <li>Health risk evaluation</li>
                                    <li>Emergency situation identification</li>
                                    <li>General health questions</li>
                                </ul>
                                How can I assist you today?
                            </div>
                            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" placeholder="Type your health question in English or Hindi..." onkeypress="handleChatKeyPress(event)">
                    <button onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Chat functionality
let chatMessages = [];
let advancedSathiInitialized = false;

// Remove duplicate function since it's now defined globally above

// Remove duplicate functions since they're now defined globally above

function addMessageToChat(message, sender) {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) {
        console.error('Chat messages container not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message fade-in`;
    
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${formatMessage(message)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232563eb'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="Sathi" class="avatar-img">
            </div>
            <div class="message-content">
                <div class="message-text">${formatMessage(message)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    chatMessages.push({ message, sender, timestamp: new Date() });
}

function addEnhancedMessageToChat(response, sender) {
    const chatContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message enhanced-message fade-in`;
    
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let messageHTML = `
        <div class="message-avatar">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232563eb'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="Sathi" class="avatar-img">
        </div>
        <div class="message-content">
            <div class="message-text">${formatMessage(response.text)}</div>
    `;

    // Add confidence indicator
    if (response.confidence) {
        const confidencePercent = Math.round(response.confidence * 100);
        messageHTML += `
            <div class="confidence-indicator">
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
                </div>
                <span class="confidence-text">${confidencePercent}% confident</span>
            </div>
        `;
    }

    // Add quick actions
    if (response.quickActions && response.quickActions.length > 0) {
        messageHTML += '<div class="quick-actions">';
        response.quickActions.forEach(action => {
            messageHTML += `
                <button class="quick-action-btn" onclick="handleQuickAction('${action.action}')">
                    <i class="fas fa-${getActionIcon(action.action)}"></i>
                    ${action.text}
                </button>
            `;
        });
        messageHTML += '</div>';
    }

    // Add suggestions
    if (response.suggestions && response.suggestions.length > 0) {
        messageHTML += '<div class="suggestions">';
        messageHTML += '<div class="suggestions-header">💡 Suggestions:</div>';
        response.suggestions.forEach(suggestion => {
            messageHTML += `
                <button class="suggestion-btn" onclick="sendSuggestion('${suggestion}')">
                    ${suggestion}
                </button>
            `;
        });
        messageHTML += '</div>';
    }

    // Add emergency actions if present
    if (response.urgency === 'critical' && response.actions) {
        messageHTML += '<div class="emergency-actions">';
        messageHTML += '<div class="emergency-header">🚨 Emergency Actions:</div>';
        response.actions.forEach(action => {
            messageHTML += `
                <button class="emergency-action-btn" onclick="handleEmergencyAction('${action.action}')">
                    <i class="fas fa-phone"></i>
                    ${action.text}
                </button>
            `;
        });
        messageHTML += '</div>';
    }

    messageHTML += `
            <div class="message-time">${timestamp}</div>
        </div>
    `;

    messageDiv.innerHTML = messageHTML;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    chatMessages.push({ message: response.text, sender, timestamp: new Date(), enhanced: true });
}

function formatMessage(message) {
    return message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

function showTypingIndicator() {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) {
        console.error('Chat container not found for typing indicator');
        return;
    }
    
    // Remove existing typing indicator if any
    const existingIndicator = document.getElementById('typingIndicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-avatar">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232563eb'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="Sathi" class="avatar-img">
        </div>
        <div class="typing-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="typing-text">Sathi is thinking...</div>
        </div>
    `;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function handleQuickAction(action) {
    switch (action) {
        case 'health_assessment':
            sendSuggestion('I would like a health assessment');
            break;
        case 'symptom_tracker':
            sendSuggestion('Help me track my symptoms');
            break;
        case 'wellness_tips':
            sendSuggestion('Give me wellness tips');
            break;
        case 'find_hospital':
            if (window.findNearestHospitals) {
                window.findNearestHospitals();
            }
            break;
        case 'show_emergency_contacts':
            if (window.showEmergencyContacts) {
                window.showEmergencyContacts();
            }
            break;
    }
}

function handleEmergencyAction(action) {
    if (action.startsWith('call:')) {
        const number = action.split(':')[1];
        window.location.href = `tel:${number}`;
    } else if (action === 'find_hospital') {
        if (window.findNearestHospitals) {
            window.findNearestHospitals();
        }
    }
}

function sendSuggestion(suggestion) {
    const input = document.getElementById('chatInput');
    input.value = suggestion;
    sendMessage();
}

function getActionIcon(action) {
    const icons = {
        'health_assessment': 'heart',
        'symptom_tracker': 'notes-medical',
        'wellness_tips': 'lightbulb',
        'find_hospital': 'hospital',
        'show_emergency_contacts': 'phone'
    };
    return icons[action] || 'arrow-right';
}

function generateBasicAIResponse(message) {
    const responses = [
        "I understand your concern. Can you provide more details about your symptoms?",
        "Based on what you've described, I recommend consulting with a healthcare professional.",
        "Here are some general wellness tips that might help...",
        "For emergency situations, please call 112 or visit the nearest hospital."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function initializeAdvancedSathi() {
    // Initialize enhanced chat UI if available
    if (window.EnhancedChatUI && !window.enhancedChatUI) {
        window.enhancedChatUI = new window.EnhancedChatUI();
        if (window.enhancedChatUI.integrateWithArogyax) {
            window.enhancedChatUI.integrateWithArogyax();
        }
    }
    
    // Initialize advanced Sathi AI if available
    if (window.AdvancedSathiAI && !window.advancedSathiAI) {
        window.advancedSathiAI = new window.AdvancedSathiAI();
        if (window.advancedSathiAI.integrateWithArogyax) {
            window.advancedSathiAI.integrateWithArogyax();
        }
    }
    
    // Initialize voice interaction if available
    if (window.VoiceInteractionSystem && !window.voiceInteraction) {
        window.voiceInteraction = new window.VoiceInteractionSystem();
        if (window.voiceInteraction.integrateWithArogyax) {
            window.voiceInteraction.integrateWithArogyax();
        }
    }
    
    // Don't add duplicate welcome message since it's already in the HTML
}

function addMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const senderName = sender === 'bot' ? 'Sathi' : 'You';
    
    // Format message with proper line breaks and styling
    const formattedMessage = message.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${senderName}:</strong> ${formattedMessage}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateSathiResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Emergency keywords
    if (message.includes('emergency') || message.includes('urgent') || message.includes('chest pain') || 
        message.includes('difficulty breathing') || message.includes('severe pain') || message.includes('unconscious')) {
        return `🚨 This sounds like a potential emergency situation. Please call:
        • 112 - National Emergency Number
        • 102 - Ambulance
        • 100 - Police
        
        If you're experiencing severe symptoms, please seek immediate medical attention at the nearest hospital.`;
    }
    
    // Symptom-related responses
    if (message.includes('fever') || message.includes('headache') || message.includes('cold') || message.includes('cough')) {
        return `I understand you're experiencing symptoms. Here's some general guidance:
        
        For fever and headache:
        • Rest and stay hydrated
        • Monitor your temperature
        • Consider paracetamol if needed
        • If fever persists >3 days or is >101°F, consult a doctor
        
        Would you like me to help assess your symptoms further or provide information about nearby healthcare facilities?`;
    }
    
    // Prevention and health tips
    if (message.includes('prevent') || message.includes('healthy') || message.includes('diet') || message.includes('exercise')) {
        return `Great question about prevention! Here are some key health tips:
        
        🍎 Nutrition: Include fruits, vegetables, whole grains, and lean proteins
        🏃‍♂️ Exercise: 30 minutes of moderate activity daily
        💧 Hydration: 8-10 glasses of water daily
        😴 Sleep: 7-8 hours of quality sleep
        🧼 Hygiene: Regular handwashing and personal hygiene
        
        Would you like specific guidance for any particular health concern?`;
    }
    
    // Default response
    return `Thank you for your question. I'm here to help with health-related queries. I can provide:
    
    • Symptom assessment and guidance
    • Disease prevention information
    • Health tips and recommendations
    • Emergency situation identification
    • Healthcare facility information
    
    Please note: I provide general health information only. For serious concerns, always consult with a qualified healthcare professional.
    
    What specific health topic would you like to know more about?`;
}

// Make functions globally available immediately
window.openChatbot = function() {
    console.log('Opening chatbot...');
    const modal = document.getElementById('chatbotModal');
    if (modal) {
        console.log('Modal found, showing...');
        modal.style.display = 'block';
        
        // Initialize chatbot content if not already loaded
        const container = document.getElementById('chatbotContainer');
        if (container && !container.querySelector('.chatbot-interface')) {
            console.log('Loading chatbot interface...');
            loadChatbot();
        }
        
        // Focus on input field
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) {
                input.focus();
                console.log('Input field focused');
            } else {
                console.error('Chat input field not found');
            }
        }, 200);
    } else {
        console.error('Chatbot modal not found');
    }
};

window.closeChatbot = function() {
    const modal = document.getElementById('chatbotModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.sendMessage = async function() {
    const input = document.getElementById('chatInput');
    if (!input) {
        console.error('Chat input not found');
        return;
    }
    
    const message = input.value.trim();
    
    if (message) {
        // Add user message to chat
        addMessageToChat(message, 'user');
        input.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Use basic AI response for now
            let response = generateSathiResponse(message);
            
            // Simulate delay for realistic typing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add AI response to chat
            addMessageToChat(response, 'bot');
            
        } catch (error) {
            console.error('Error generating AI response:', error);
            hideTypingIndicator();
            addMessageToChat("I apologize, but I'm having trouble processing your request. Please try again.", 'bot');
        }
    }
};

window.handleChatKeyPress = function(event) {
    if (event.key === 'Enter') {
        window.sendMessage();
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load chatbot modal
    loadChatbot();
    
    // Initialize other components if available
    if (typeof initializeAIDiagnostics === 'function') {
        aiDiagnostics = initializeAIDiagnostics();
    }
    
    if (typeof initializeAdvancedIntegrations === 'function') {
        advancedIntegrations = initializeAdvancedIntegrations();
    }
    
    if (typeof initializeInteractiveFeatures === 'function') {
        interactiveFeatures = initializeInteractiveFeatures();
    }
    
    if (typeof initializeHealthTools === 'function') {
        healthTools = initializeHealthTools();
    }
    
    // Initialize advanced features with error handling
    try {
        if (typeof initializeAdvancedFeatures === 'function') {
            initializeAdvancedFeatures();
        }
    } catch (error) {
        console.log('Advanced features not available:', error.message);
    }
    
    try {
        if (typeof initializeGoogleAuth === 'function') {
            initializeGoogleAuth();
        }
    } catch (error) {
        console.log('Google Auth not available:', error.message);
    }
    
    try {
        if (typeof checkExistingAuth === 'function') {
            checkExistingAuth();
        }
    } catch (error) {
        console.log('Auth check not available:', error.message);
    }
});

// Google Authentication
function initializeGoogleAuth() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('arogyax_user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        updateUIForLoggedInUser(user);
        return;
    }

    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with actual client ID
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
    });
    
    const signInButton = document.getElementById("google-signin-btn");
    if (signInButton) {
        google.accounts.id.renderButton(signInButton, { 
            theme: "outline", 
            size: "large",
            text: "signin_with",
            shape: "rectangular"
        });
    }
}

function handleCredentialResponse(response) {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const user = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture
    };
    
    // Save user data locally
    localStorage.setItem('arogyax_user', JSON.stringify(user));
    localStorage.setItem('arogyax_token', response.credential);
    
    // Send to backend for verification and session creation
    fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: response.credential })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('arogyax_backend_token', data.token);
            currentUser = data.user;
            updateUIForLoggedInUser(data.user);
            showNotification('Welcome to AROGYAX! You are now logged in.', 'success');
        } else {
            console.error('Backend authentication failed:', data.error);
            // Still allow frontend functionality with Google token
            currentUser = user;
            updateUIForLoggedInUser(user);
            showNotification('Logged in successfully! Some features may be limited.', 'warning');
        }
    })
    .catch(error => {
        console.error('Backend connection error:', error);
        // Fallback to frontend-only mode
        currentUser = user;
        updateUIForLoggedInUser(user);
        showNotification('Logged in successfully! Running in offline mode.', 'info');
    });
}

function checkExistingAuth() {
    const token = localStorage.getItem('arogyax_token');
    if (token) {
        fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(user => {
            currentUser = user;
            updateUIForLoggedInUser(user);
        })
        .catch(() => {
            localStorage.removeItem('arogyax_token');
        });
    }
}

function updateUIForLoggedInUser(user) {
    const signInBtn = document.getElementById('google-signin-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    if (signInBtn) signInBtn.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    if (userAvatar) userAvatar.src = user.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    if (userName) userName.textContent = user.name || 'User';
    
    // Update any protected content or navigation
    updateProtectedContent(true);
    
    // Enable premium features
    if (interactiveFeatures) {
        interactiveFeatures.enablePremiumFeatures();
    }
}

function logout() {
    localStorage.removeItem('arogyax_token');
    localStorage.removeItem('arogyax_user');
    localStorage.removeItem('arogyax_backend_token');
    currentUser = null;
    
    const signInBtn = document.getElementById('google-signin-btn');
    const userProfile = document.getElementById('user-profile');
    
    if (signInBtn) signInBtn.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
    
    updateProtectedContent(false);
    showNotification('You have been logged out successfully.', 'info');
    
    // Reinitialize Google Auth
    setTimeout(() => {
        initializeGoogleAuth();
    }, 100);
}

// Advanced Feature Functions
function startVoiceControl() {
    if (interactiveFeatures) {
        const voiceControl = interactiveFeatures.initVoiceControl();
        if (voiceControl) {
            voiceControl.start();
            voiceControl.speak('Voice control activated. You can now use voice commands to navigate AROGYAX.');
        } else {
            alert('Voice control is not supported on this device.');
        }
    }
}

function startVoiceAnalysis() {
    if (aiDiagnostics) {
        aiDiagnostics.initVoiceAnalysis().then(voiceAnalyzer => {
            if (voiceAnalyzer) {
                alert('Voice analysis ready. Please speak for 10 seconds to analyze your respiratory health.');
                const recordingData = voiceAnalyzer.start();
                setTimeout(() => {
                    voiceAnalyzer.stop();
                    const analysis = voiceAnalyzer.analyze(recordingData);
                    showAnalysisResults('Voice Analysis', analysis);
                }, 10000);
            } else {
                alert('Voice analysis requires microphone access.');
            }
        });
    }
}

function startGaitAnalysis() {
    if (aiDiagnostics) {
        const gaitAnalyzer = aiDiagnostics.initGaitAnalysis();
        if (gaitAnalyzer) {
            alert('Gait analysis starting. Please walk normally for 30 seconds while holding your phone.');
            gaitAnalyzer.start();
            setTimeout(() => {
                gaitAnalyzer.stop();
                const analysis = gaitAnalyzer.analyze();
                showAnalysisResults('Gait Analysis', analysis);
            }, 30000);
        } else {
            alert('Gait analysis requires device motion sensors.');
        }
    }
}

function open3DVisualization() {
    if (interactiveFeatures) {
        const visualization = interactiveFeatures.init3DHealthVisualization();
        const humanModel = visualization.createHumanModel();
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3><i class="fas fa-cube"></i> 3D Human Body Visualization</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div id="3d-container" style="height: 600px;"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('3d-container').appendChild(humanModel.renderer.domElement);
        humanModel.animate();
    }
}

function showAnalysisResults(title, analysis) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-chart-line"></i> ${title} Results</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="analysis-results">
                <pre>${JSON.stringify(analysis, null, 2)}</pre>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function openDashboard() {
    if (!currentUser) {
        alert('Please sign in to access your dashboard.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 1000px;">
            <div class="modal-header">
                <h3><i class="fas fa-tachometer-alt"></i> Health Dashboard</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div id="dashboard-content">
                <div class="loading">Loading your health data...</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    loadDashboardData();
}

function loadDashboardData() {
    const token = localStorage.getItem('arogyax_token');
    
    Promise.all([
        fetch(`${API_BASE_URL}/analytics/health-score`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()),
        fetch(`${API_BASE_URL}/symptoms?days=7`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()),
        fetch(`${API_BASE_URL}/appointments?upcoming=true`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
    ])
    .then(([healthScore, symptoms, appointments]) => {
        const dashboardHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h4>Health Score</h4>
                    <div class="health-score">${healthScore.healthScore}/100</div>
                </div>
                <div class="dashboard-card">
                    <h4>Recent Symptoms</h4>
                    <div class="symptom-count">${symptoms.length} logged this week</div>
                </div>
                <div class="dashboard-card">
                    <h4>Upcoming Appointments</h4>
                    <div class="appointment-count">${appointments.length} scheduled</div>
                </div>
            </div>
        `;
        document.getElementById('dashboard-content').innerHTML = dashboardHTML;
    })
    .catch(error => {
        document.getElementById('dashboard-content').innerHTML = '<p>Error loading dashboard data.</p>';
    });
}

function openProfile() {
    if (!currentUser) {
        alert('Please sign in to access your profile.');
        return;
    }
    alert('Profile management will be available soon!');
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add loading animation to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 1000);
        });
    });
});
