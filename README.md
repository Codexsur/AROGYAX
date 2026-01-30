# HealthBot - AI-Powered Healthcare Assistant via WhatsApp/SMS

![HealthBot Logo](https://img.shields.io/badge/HealthBot-WhatsApp%20SMS%20Healthcare-green?style=for-the-badge&logo=whatsapp)

## 🏥 Overview

HealthBot is a revolutionary AI-powered healthcare assistant that provides medical guidance, symptom assessment, and emergency response through WhatsApp and SMS messaging platforms. Designed specifically for rural and underserved communities in India, HealthBot democratizes healthcare access through ubiquitous messaging platforms.

**Target Metrics:**
- 80% accuracy in health query responses
- 20% increase in health awareness
- Focus on rural and underserved communities

## ✨ Key Features

### 🩺 Symptom Assessment
- AI-powered initial health screening via messaging
- Decision tree-based symptom evaluation
- Risk assessment and severity scoring
- Personalized health recommendations
- Emergency symptom detection and alerts

### 📚 Health Education
- Personalized health tips and preventive care advice
- Disease information database with Indian context
- Seasonal health guidance and regional awareness
- Nutrition and lifestyle recommendations
- Health literacy improvement programs

### 💊 Medication Reminders
- Automated prescription adherence support
- Customizable reminder schedules via SMS/WhatsApp
- Medication interaction warnings
- Dosage tracking and management
- Pharmacy integration for refills

### 👨‍⚕️ Doctor Consultation Booking
- Integration with telemedicine platforms
- Appointment scheduling via messaging
- Doctor availability checking
- Consultation history tracking
- Follow-up reminders and care coordination

### 🚨 Emergency Response
- Critical symptom detection and immediate alerts
- Emergency contact notifications
- Nearest hospital location services
- Emergency protocol guidance
- 24/7 emergency support system

### 🌐 Multilingual Support
- Regional language processing (Hindi, Tamil, Telugu, Bengali, Marathi)
- Voice message support and transcription
- Cultural context awareness
- Local dialect understanding
- Real-time translation capabilities

### 🎤 Voice Input Interface
- Voice-to-text conversion for chat interactions
- Hands-free health query submission
- Visual feedback during voice recording
- Accessibility support for users with disabilities
- Keyboard shortcut support (Ctrl+Shift+V)
- Error handling for common microphone issues

## 🏗️ Technical Architecture

```
[User] ↔ [WhatsApp/SMS/Web Interface] ↔ [API Gateway] ↔ [NLP Engine] 
                                              ↓
[Response Generator] ↔ [Medical Knowledge Base] ↔ [User Profile DB]
                                              ↓
[External APIs] ← [Healthcare Providers] ← [Emergency Services]
```

### 🛠️ Technology Stack

**Backend Framework:**
- **Node.js/Express.js**: RESTful API architecture
- **Microservices**: Modular design pattern
- **JWT Authentication**: Secure token-based auth

**NLP Engine:**
- **Natural Language Processing**: BERT-based models
- **Intent Classification**: Healthcare-specific intents
- **Entity Recognition**: Medical entity extraction
- **Decision Trees**: Custom healthcare logic

**Databases:**
- **MongoDB**: User data and conversation history
- **PostgreSQL**: Medical knowledge base
- **Redis**: Caching and session management

**Messaging APIs:**
- **WhatsApp Business API**: Meta platform integration
- **Twilio SMS API**: SMS messaging service
- **Multi-platform routing**: Unified message handling

**AI & Machine Learning:**
- **Custom Healthcare Models**: Symptom assessment
- **Emergency Detection**: Critical symptom algorithms
- **Predictive Analytics**: Health trend analysis
- **Multilingual NLP**: Regional language support

**Voice Interface:**
- **Web Speech API**: Browser-based voice recognition
- **Speech Synthesis**: Text-to-speech capabilities
- **Accessibility Features**: Screen reader support
- **Keyboard Navigation**: Full keyboard control

## 🚀 Quick Start

### Prerequisites
- Node.js (v16.0.0 or higher)
- MongoDB (v5.0 or higher)
- PostgreSQL (v13 or higher)
- WhatsApp Business API access
- Twilio account for SMS

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/healthbot-whatsapp-sms.git
   cd healthbot-whatsapp-sms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

4. **Set up databases:**
   ```bash
   npm run setup-db
   npm run seed-data
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Configuration

#### WhatsApp Business API Setup
1. Create a Meta Business account
2. Set up WhatsApp Business API
3. Configure webhook URL: `https://your-domain.com/webhook/whatsapp`
4. Add your phone number and verify

#### Twilio SMS Setup
1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Configure webhook URL: `https://your-domain.com/webhook/sms`

#### Database Configuration
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/healthbot

# PostgreSQL
POSTGRES_URI=postgresql://localhost:5432/healthbot_knowledge
```

## 📱 Usage

### WhatsApp Integration
Users can interact with HealthBot by:
1. Sending a message to your WhatsApp Business number
2. Starting with "Hi" or "Help" for initial guidance
3. Describing symptoms or asking health questions
4. Following guided symptom assessment flows

### SMS Integration
Users can text your Twilio number:
1. Send "START" to begin interaction
2. Use simple keywords like "fever", "pain", "help"
3. Receive structured health guidance
4. Get emergency assistance when needed

### Web Interface Voice Input
Users can interact with the web chatbot using voice:
1. Click the microphone icon in the chat input area
2. Speak your health question clearly
3. The system will convert speech to text automatically
4. Your message will be sent and processed by the AI

Keyboard shortcut: Press `Ctrl+Shift+V` to toggle voice input

### Sample Conversations

**Symptom Assessment:**
```
User: "I have fever and headache"
HealthBot: "I'll help assess your symptoms. How long have you had fever?"
User: "2 days"
HealthBot: "What's your temperature? 1) Normal but feeling hot 2) 99-100°F 3) 101-102°F 4) 103°F or higher"
```

**Emergency Detection:**
```
User: "Severe chest pain can't breathe"
HealthBot: "🚨 EMERGENCY DETECTED 🚨
CALL 112 IMMEDIATELY
- Keep calm and sit down
- Loosen tight clothing
- Take aspirin if available and not allergic
Nearest hospitals: [location data]"
```

**Voice Input:**
```
User clicks microphone and says: "What are the symptoms of diabetes?"
HealthBot converts speech to text and responds: "Diabetes symptoms include frequent urination, excessive thirst, unexplained weight loss, fatigue, and blurred vision..."
```

## 🏥 Medical Features

### Symptom Assessment Engine
- **Decision Trees**: Structured symptom evaluation
- **Risk Scoring**: Severity assessment algorithms