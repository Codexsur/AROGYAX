/**
 * Advanced Voice Interaction System for Sathi AI
 * Natural speech recognition and text-to-speech capabilities
 */

class VoiceInteractionSystem {
    constructor() {
        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        
        this.settings = {
            language: 'en-IN',
            voiceGender: 'female',
            speechRate: 0.9,
            speechPitch: 1.0,
            volume: 0.8,
            autoSpeak: true,
            continuousListening: false
        };

        this.initializeVoiceSystem();
        this.setupVoiceCommands();
    }

    async initializeVoiceSystem() {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = this.settings.language;
            this.recognition.maxAlternatives = 3;

            this.setupRecognitionEvents();
        }

        // Initialize Speech Synthesis
        if (this.synthesis) {
            this.loadVoices();
            this.synthesis.addEventListener('voiceschanged', () => {
                this.loadVoices();
            });
        }
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // Find best voice for Indian English
        const preferredVoices = [
            'Google हिन्दी',
            'Google UK English Female',
            'Google UK English Male',
            'Microsoft Zira - English (United States)',
            'Microsoft David - English (United States)'
        ];

        for (const voiceName of preferredVoices) {
            const voice = this.voices.find(v => v.name.includes(voiceName));
            if (voice) {
                this.currentVoice = voice;
                break;
            }
        }

        // Fallback to first English voice
        if (!this.currentVoice) {
            this.currentVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
        }
    }

    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceButton('listening');
            this.showVoiceStatus('Listening... Speak now');
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                this.showInterimTranscript(interimTranscript);
            }

            if (finalTranscript) {
                this.processFinalTranscript(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.handleRecognitionError(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton('idle');
            this.hideVoiceStatus();
        };
    }

    setupVoiceCommands() {
        this.voiceCommands = {
            // Navigation commands
            'open emergency contacts': () => window.showEmergencyContacts?.(),
            'find hospitals': () => window.findNearestHospitals?.(),
            'show health trends': () => window.showHealthTrends?.(),
            'anonymous report': () => window.showAnonymousReporting?.(),
            
            // Chat commands
            'clear chat': () => this.clearChat(),
            'repeat last message': () => this.repeatLastMessage(),
            'stop speaking': () => this.stopSpeaking(),
            
            // Health queries
            'health check': () => this.sendVoiceMessage('I want a health assessment'),
            'symptom checker': () => this.sendVoiceMessage('Help me check my symptoms'),
            'wellness tips': () => this.sendVoiceMessage('Give me wellness and health tips'),
            
            // Emergency commands
            'emergency help': () => this.handleEmergencyVoiceCommand(),
            'call ambulance': () => window.location.href = 'tel:102',
            'call emergency': () => window.location.href = 'tel:112'
        };
    }

    startListening() {
        if (!this.recognition) {
            this.showError('Speech recognition not supported in your browser');
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showError('Could not start voice recognition');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    async speakText(text, options = {}) {
        if (!this.synthesis || this.isSpeaking) {
            return;
        }

        // Stop any current speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.voice = this.currentVoice;
        utterance.rate = options.rate || this.settings.speechRate;
        utterance.pitch = options.pitch || this.settings.speechPitch;
        utterance.volume = options.volume || this.settings.volume;
        utterance.lang = this.settings.language;

        // Event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.showSpeakingIndicator();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
        };

        // Speak the text
        this.synthesis.speak(utterance);

        return new Promise((resolve) => {
            utterance.onend = () => {
                this.isSpeaking = false;
                this.hideSpeakingIndicator();
                resolve();
            };
        });
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
        }
    }

    processFinalTranscript(transcript) {
        const cleanTranscript = transcript.trim().toLowerCase();
        
        // Check for voice commands
        const command = Object.keys(this.voiceCommands).find(cmd => 
            cleanTranscript.includes(cmd)
        );

        if (command) {
            this.voiceCommands[command]();
            this.showVoiceStatus(`Executing: ${command}`);
            setTimeout(() => this.hideVoiceStatus(), 2000);
        } else {
            // Send as regular message
            this.sendVoiceMessage(transcript);
        }
    }

    sendVoiceMessage(message) {
        if (window.enhancedChatUI) {
            window.enhancedChatUI.sendMessage(message);
        } else if (window.sendMessage) {
            window.sendMessage(message);
        }
    }

    handleRecognitionError(error) {
        let errorMessage = 'Voice recognition error';
        
        switch (error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not accessible. Please check permissions.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied. Please enable microphone access.';
                break;
            case 'network':
                errorMessage = 'Network error. Please check your connection.';
                break;
            default:
                errorMessage = `Recognition error: ${error}`;
        }

        this.showError(errorMessage);
    }

    handleEmergencyVoiceCommand() {
        this.speakText('Emergency mode activated. What type of emergency assistance do you need?');
        
        // Show emergency options
        if (window.showEmergencyContacts) {
            window.showEmergencyContacts();
        }
    }

    // UI Integration Methods
    updateVoiceButton(state) {
        const voiceBtn = document.getElementById('voiceButton');
        if (!voiceBtn) return;

        voiceBtn.classList.remove('listening', 'processing', 'error');
        
        switch (state) {
            case 'listening':
                voiceBtn.classList.add('listening');
                voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
                voiceBtn.title = 'Stop listening';
                break;
            case 'processing':
                voiceBtn.classList.add('processing');
                voiceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                voiceBtn.title = 'Processing...';
                break;
            case 'error':
                voiceBtn.classList.add('error');
                voiceBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                voiceBtn.title = 'Voice error';
                setTimeout(() => this.updateVoiceButton('idle'), 3000);
                break;
            default:
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceBtn.title = 'Voice input';
        }
    }

    showVoiceStatus(message) {
        let statusDiv = document.getElementById('voiceStatus');
        
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'voiceStatus';
            statusDiv.className = 'voice-status';
            document.body.appendChild(statusDiv);
        }

        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
    }

    hideVoiceStatus() {
        const statusDiv = document.getElementById('voiceStatus');
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
    }

    showInterimTranscript(transcript) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = transcript;
            chatInput.style.fontStyle = 'italic';
            chatInput.style.color = '#64748b';
        }
    }

    showSpeakingIndicator() {
        let indicator = document.getElementById('speakingIndicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'speakingIndicator';
            indicator.className = 'speaking-indicator';
            indicator.innerHTML = `
                <div class="speaking-avatar">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232563eb'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="Sathi" class="avatar-img">
                </div>
                <div class="speaking-content">
                    <div class="sound-waves">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="speaking-text">Sathi is speaking...</div>
                </div>
            `;
            
            const chatContainer = document.getElementById('chatMessages');
            if (chatContainer) {
                chatContainer.appendChild(indicator);
            }
        }

        indicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideSpeakingIndicator() {
        const indicator = document.getElementById('speakingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    showError(message) {
        this.updateVoiceButton('error');
        this.showVoiceStatus(message);
        setTimeout(() => this.hideVoiceStatus(), 3000);
    }

    clearChat() {
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer) {
            chatContainer.innerHTML = '';
        }
        this.speakText('Chat cleared');
    }

    repeatLastMessage() {
        const messages = document.querySelectorAll('.bot-message .message-text');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1].textContent;
            this.speakText(lastMessage);
        }
    }

    scrollToBottom() {
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // Settings Methods
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        if (this.recognition) {
            this.recognition.lang = this.settings.language;
            this.recognition.continuous = this.settings.continuousListening;
        }
        
        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('arogyax_voice_settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('arogyax_voice_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    // Integration with Enhanced Chat UI
    integrateWithChatUI() {
        // Override AI response to include speech
        const originalGenerateResponse = window.generateAIResponse;
        
        window.generateAIResponse = async (message, context) => {
            const response = await originalGenerateResponse(message, context);
            
            // Auto-speak response if enabled
            if (this.settings.autoSpeak && response.text) {
                // Clean text for speech (remove markdown, emojis, etc.)
                const cleanText = this.cleanTextForSpeech(response.text);
                setTimeout(() => this.speakText(cleanText), 500);
            }
            
            return response;
        };

        // Add voice button event listener
        document.addEventListener('click', (e) => {
            if (e.target.closest('#voiceButton')) {
                this.startListening();
            }
        });
    }

    cleanTextForSpeech(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove code
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/[🔥💊😰🦠😴🚨🏥💡⚠️]/g, '') // Remove emojis
            .replace(/•/g, '') // Remove bullet points
            .replace(/\n+/g, '. ') // Replace newlines with periods
            .trim();
    }

    // Integration method
    async integrateWithArogyax() {
        if (typeof window !== 'undefined') {
            window.voiceInteraction = this;
            
            // Load saved settings
            this.loadSettings();
            
            // Integrate with chat UI
            this.integrateWithChatUI();
            
            // Add voice status styles
            this.addVoiceStyles();
        }
    }

    addVoiceStyles() {
        const styles = `
            <style>
            .voice-status {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(37, 99, 235, 0.9);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 25px;
                font-size: 0.9rem;
                font-weight: 500;
                z-index: 1000;
                backdrop-filter: blur(10px);
                display: none;
                animation: slideDown 0.3s ease;
            }
            
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            
            .speaking-indicator {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding: 1rem;
            }
            
            .speaking-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2563eb, #1e40af);
                padding: 2px;
            }
            
            .speaking-content {
                background: white;
                border-radius: 18px;
                padding: 1rem 1.25rem;
                box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
                position: relative;
            }
            
            .speaking-content::before {
                content: '';
                position: absolute;
                top: 15px;
                left: -8px;
                width: 0;
                height: 0;
                border-right: 8px solid white;
                border-top: 8px solid transparent;
                border-bottom: 8px solid transparent;
            }
            
            .sound-waves {
                display: flex;
                gap: 3px;
                margin-bottom: 0.5rem;
            }
            
            .sound-waves span {
                width: 3px;
                height: 20px;
                background: #2563eb;
                border-radius: 2px;
                animation: soundWave 1s infinite ease-in-out;
            }
            
            .sound-waves span:nth-child(1) { animation-delay: 0s; }
            .sound-waves span:nth-child(2) { animation-delay: 0.1s; }
            .sound-waves span:nth-child(3) { animation-delay: 0.2s; }
            .sound-waves span:nth-child(4) { animation-delay: 0.3s; }
            
            @keyframes soundWave {
                0%, 100% { height: 5px; }
                50% { height: 20px; }
            }
            
            .speaking-text {
                font-size: 0.9rem;
                color: #64748b;
                font-style: italic;
            }
            
            #voiceButton.listening {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                animation: pulse 1s infinite;
            }
            
            #voiceButton.processing {
                background: linear-gradient(135deg, #f59e0b, #d97706);
            }
            
            #voiceButton.error {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Initialize Voice Interaction System
const voiceInteractionSystem = new VoiceInteractionSystem();
voiceInteractionSystem.integrateWithArogyax();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceInteractionSystem;
} else if (typeof window !== 'undefined') {
    window.VoiceInteractionSystem = VoiceInteractionSystem;
}
