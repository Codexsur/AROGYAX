// Multilingual Support for HealthBot
// Regional language processing for Indian languages

const axios = require('axios');

class MultilingualSupport {
    constructor() {
        this.supportedLanguages = {
            'english': 'en',
            'hindi': 'hi',
            'tamil': 'ta',
            'telugu': 'te',
            'bengali': 'bn',
            'marathi': 'mr',
            'gujarati': 'gu',
            'kannada': 'kn',
            'malayalam': 'ml',
            'punjabi': 'pa'
        };
        
        this.translations = this.initializeTranslations();
        this.medicalTerms = this.initializeMedicalTerms();
    }

    // Initialize common translations
    initializeTranslations() {
        return {
            greetings: {
                english: "Hello! I'm your health assistant.",
                hindi: "नमस्ते! मैं आपका स्वास्थ्य सहायक हूं।",
                tamil: "வணக்கம்! நான் உங்கள் சுகாதார உதவியாளர்.",
                telugu: "నమస్కారం! నేను మీ ఆరోగ్య సహాయకుడిని.",
                bengali: "নমস্কার! আমি আপনার স্বাস্থ্য সহায়ক।",
                marathi: "नमस्कार! मी तुमचा आरोग्य सहाय्यक आहे।"
            },
            emergency: {
                english: "🚨 EMERGENCY - Call 112 immediately",
                hindi: "🚨 आपातकाल - तुरंत 112 पर कॉल करें",
                tamil: "🚨 அவசரநிலை - உடனே 112 க்கு அழைக்கவும்",
                telugu: "🚨 అత్యవసరం - వెంటనే 112 కు కాల్ చేయండి",
                bengali: "🚨 জরুরি অবস্থা - অবিলম্বে 112 এ কল করুন",
                marathi: "🚨 आणीबाणी - ताबडतोब 112 वर कॉल करा"
            },
            symptoms: {
                english: "What symptoms are you experiencing?",
                hindi: "आप कौन से लक्षण महसूस कर रहे हैं?",
                tamil: "நீங்கள் என்ன அறிகுறிகளை அனுபவிக்கிறீர்கள்?",
                telugu: "మీరు ఏ లక్షణాలను అనుభవిస్తున్నారు?",
                bengali: "আপনি কি কি লক্ষণ অনুভব করছেন?",
                marathi: "तुम्ही कोणती लक्षणे अनुभवत आहात?"
            }
        };
    }

    // Initialize medical terms translations
    initializeMedicalTerms() {
        return {
            fever: {
                english: "fever",
                hindi: "बुखार",
                tamil: "காய்ச்சல்",
                telugu: "జ్వరం",
                bengali: "জ্বর",
                marathi: "ताप"
            },
            headache: {
                english: "headache",
                hindi: "सिरदर्द",
                tamil: "தலைவலி",
                telugu: "తలనొప్పి",
                bengali: "মাথাব্যথা",
                marathi: "डोकेदुखी"
            },
            cough: {
                english: "cough",
                hindi: "खांसी",
                tamil: "இருமல்",
                telugu: "దగ్గు",
                bengali: "কাশি",
                marathi: "खोकला"
            },
            pain: {
                english: "pain",
                hindi: "दर्द",
                tamil: "வலி",
                telugu: "నొప్పి",
                bengali: "ব্যথা",
                marathi: "वेदना"
            }
        };
    }

    // Translate text to target language
    async translate(text, targetLanguage) {
        try {
            // Check if we have a direct translation
            const directTranslation = this.getDirectTranslation(text, targetLanguage);
            if (directTranslation) {
                return directTranslation;
            }

            // Use Google Translate API for complex translations
            if (process.env.GOOGLE_TRANSLATE_API_KEY) {
                return await this.googleTranslate(text, targetLanguage);
            }

            // Fallback to basic translation
            return await this.basicTranslate(text, targetLanguage);
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original text if translation fails
        }
    }

    // Get direct translation from predefined translations
    getDirectTranslation(text, targetLanguage) {
        const lowerText = text.toLowerCase();
        
        // Check common phrases
        for (const [category, translations] of Object.entries(this.translations)) {
            if (translations[targetLanguage] && 
                translations.english.toLowerCase() === lowerText) {
                return translations[targetLanguage];
            }
        }

        // Check medical terms
        for (const [term, translations] of Object.entries(this.medicalTerms)) {
            if (translations[targetLanguage] && 
                translations.english.toLowerCase() === lowerText) {
                return translations[targetLanguage];
            }
        }

        return null;
    }

    // Google Translate API integration
    async googleTranslate(text, targetLanguage) {
        try {
            const langCode = this.supportedLanguages[targetLanguage] || 'en';
            const response = await axios.post(
                `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
                {
                    q: text,
                    target: langCode,
                    source: 'en'
                }
            );

            return response.data.data.translations[0].translatedText;
        } catch (error) {
            console.error('Google Translate error:', error);
            throw error;
        }
    }

    // Basic translation using predefined patterns
    async basicTranslate(text, targetLanguage) {
        if (targetLanguage === 'english') {
            return text;
        }

        // Replace medical terms
        let translatedText = text;
        for (const [term, translations] of Object.entries(this.medicalTerms)) {
            if (translations[targetLanguage]) {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                translatedText = translatedText.replace(regex, translations[targetLanguage]);
            }
        }

        return translatedText;
    }

    // Detect language from text
    detectLanguage(text) {
        const patterns = {
            hindi: /[\u0900-\u097F]/,
            tamil: /[\u0B80-\u0BFF]/,
            telugu: /[\u0C00-\u0C7F]/,
            bengali: /[\u0980-\u09FF]/,
            marathi: /[\u0900-\u097F]/,
            gujarati: /[\u0A80-\u0AFF]/,
            kannada: /[\u0C80-\u0CFF]/,
            malayalam: /[\u0D00-\u0D7F]/,
            punjabi: /[\u0A00-\u0A7F]/
        };

        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                return lang;
            }
        }

        return 'english';
    }

    // Get supported languages list
    getSupportedLanguages() {
        return Object.keys(this.supportedLanguages);
    }

    // Add new translation
    addTranslation(category, key, translations) {
        if (!this.translations[category]) {
            this.translations[category] = {};
        }
        this.translations[category][key] = translations;
    }

    // Get language-specific medical advice
    getMedicalAdvice(condition, language) {
        const advice = {
            fever: {
                english: "Rest, drink fluids, take paracetamol if needed",
                hindi: "आराम करें, तरल पदार्थ पिएं, जरूरत पड़ने पर पैरासिटामोल लें",
                tamil: "ஓய்வு எடுங்கள், திரவங்களை குடியுங்கள், தேவைப்பட்டால் பாராசிட்டமால் எடுத்துக் கொள்ளுங்கள்"
            },
            diabetes: {
                english: "Monitor blood sugar, follow diet, exercise regularly",
                hindi: "रक्त शर्करा की निगरानी करें, आहार का पालन करें, नियमित व्यायाम करें",
                tamil: "இரத்த சர்க்கரையை கண்காணிக்கவும், உணவுமுறையை பின்பற்றவும், தவறாமல் உடற்பயிற்சி செய்யவும்"
            }
        };

        return advice[condition]?.[language] || advice[condition]?.english || "Consult a healthcare professional";
    }
}

module.exports = MultilingualSupport;
