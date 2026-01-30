// Emergency Detection System for HealthBot
// Critical symptom detection and emergency response protocols

class EmergencyDetection {
    constructor() {
        this.emergencyKeywords = this.initializeEmergencyKeywords();
        this.criticalSymptoms = this.initializeCriticalSymptoms();
        this.emergencyProtocols = this.initializeEmergencyProtocols();
        this.riskScoring = this.initializeRiskScoring();
    }

    // Initialize emergency keywords
    initializeEmergencyKeywords() {
        return {
            immediate: [
                'chest pain', 'can\'t breathe', 'difficulty breathing', 'shortness of breath',
                'unconscious', 'unresponsive', 'severe bleeding', 'heavy bleeding',
                'heart attack', 'stroke', 'seizure', 'overdose', 'poisoning',
                'severe allergic reaction', 'anaphylaxis', 'choking',
                'suicide', 'self harm', 'want to die', 'kill myself'
            ],
            urgent: [
                'severe pain', 'high fever', 'persistent vomiting', 'severe headache',
                'confusion', 'disorientation', 'severe dizziness', 'fainting',
                'rapid heartbeat', 'chest tightness', 'severe abdominal pain',
                'difficulty swallowing', 'severe dehydration'
            ],
            warning: [
                'worsening', 'getting worse', 'not improving', 'spreading',
                'new symptoms', 'concerning', 'worried', 'scared'
            ]
        };
    }

    // Initialize critical symptoms with severity scoring
    initializeCriticalSymptoms() {
        return {
            cardiovascular: {
                symptoms: [
                    'chest pain with radiation to arm/jaw',
                    'crushing chest pain',
                    'chest pain with sweating',
                    'chest pain with nausea',
                    'severe shortness of breath',
                    'rapid irregular heartbeat'
                ],
                score: 10,
                protocol: 'cardiac_emergency'
            },
            respiratory: {
                symptoms: [
                    'cannot speak in full sentences',
                    'blue lips or face',
                    'severe wheezing',
                    'choking',
                    'stopped breathing'
                ],
                score: 10,
                protocol: 'respiratory_emergency'
            },
            neurological: {
                symptoms: [
                    'sudden severe headache',
                    'face drooping',
                    'arm weakness',
                    'speech difficulty',
                    'confusion',
                    'seizure',
                    'unconscious'
                ],
                score: 10,
                protocol: 'neurological_emergency'
            },
            trauma: {
                symptoms: [
                    'severe bleeding',
                    'head injury',
                    'broken bones',
                    'severe burns',
                    'deep cuts'
                ],
                score: 9,
                protocol: 'trauma_emergency'
            },
            poisoning: {
                symptoms: [
                    'overdose',
                    'poisoning',
                    'chemical exposure',
                    'severe nausea after eating'
                ],
                score: 9,
                protocol: 'poisoning_emergency'
            },
            mental_health: {
                symptoms: [
                    'thoughts of suicide',
                    'want to hurt myself',
                    'want to die',
                    'severe depression',
                    'psychotic episode'
                ],
                score: 10,
                protocol: 'mental_health_emergency'
            }
        };
    }

    // Initialize emergency protocols
    initializeEmergencyProtocols() {
        return {
            cardiac_emergency: {
                immediate_actions: [
                    'Call 112 immediately',
                    'If conscious, give aspirin (if not allergic)',
                    'Keep patient calm and seated',
                    'Loosen tight clothing',
                    'Be prepared for CPR if needed'
                ],
                emergency_numbers: ['112', '102'],
                hospital_requirements: ['Cardiac care unit', 'Emergency department'],
                time_critical: true
            },
            respiratory_emergency: {
                immediate_actions: [
                    'Call 112 immediately',
                    'Help patient sit upright',
                    'Remove any obstructions if choking',
                    'Use inhaler if available',
                    'Be prepared for rescue breathing'
                ],
                emergency_numbers: ['112', '102'],
                hospital_requirements: ['Emergency department', 'Respiratory care'],
                time_critical: true
            },
            neurological_emergency: {
                immediate_actions: [
                    'Call 112 immediately',
                    'Note time of symptom onset',
                    'Keep patient calm and still',
                    'Do not give food or water',
                    'Protect from injury if seizure'
                ],
                emergency_numbers: ['112', '102'],
                hospital_requirements: ['Stroke unit', 'Neurology department'],
                time_critical: true
            },
            trauma_emergency: {
                immediate_actions: [
                    'Call 112 immediately',
                    'Control bleeding with direct pressure',
                    'Do not move patient unless necessary',
                    'Keep patient warm',
                    'Monitor breathing and consciousness'
                ],
                emergency_numbers: ['112', '102', '100'],
                hospital_requirements: ['Trauma center', 'Emergency surgery'],
                time_critical: true
            },
            mental_health_emergency: {
                immediate_actions: [
                    'Stay with the person',
                    'Call mental health helpline: 1800-599-0019',
                    'Remove harmful objects',
                    'Listen without judgment',
                    'Get professional help immediately'
                ],
                emergency_numbers: ['112', '1800-599-0019'],
                hospital_requirements: ['Psychiatric emergency services'],
                time_critical: true
            }
        };
    }

    // Initialize risk scoring system
    initializeRiskScoring() {
        return {
            age_factors: {
                high_risk: [0, 5, 65, 100], // Very young and elderly
                moderate_risk: [6, 17, 50, 64]
            },
            chronic_conditions: {
                'heart disease': 3,
                'diabetes': 2,
                'hypertension': 2,
                'asthma': 2,
                'kidney disease': 3,
                'cancer': 3,
                'immunocompromised': 3
            },
            symptom_combinations: {
                'chest pain + shortness of breath': 10,
                'fever + severe headache + neck stiffness': 9,
                'abdominal pain + vomiting + fever': 7,
                'headache + vision changes + confusion': 9
            }
        };
    }

    // Main emergency detection function
    async checkEmergency(message, nlpResult = null) {
        try {
            const emergencyResult = {
                isEmergency: false,
                level: 'none',
                score: 0,
                detectedSymptoms: [],
                category: null,
                protocol: null,
                recommendations: [],
                confidence: 0
            };

            // Normalize message for analysis
            const normalizedMessage = message.toLowerCase();

            // Check for immediate emergency keywords
            const immediateEmergency = this.checkImmediateEmergency(normalizedMessage);
            if (immediateEmergency.detected) {
                emergencyResult.isEmergency = true;
                emergencyResult.level = 'immediate';
                emergencyResult.score = 10;
                emergencyResult.detectedSymptoms = immediateEmergency.symptoms;
                emergencyResult.category = immediateEmergency.category;
                emergencyResult.protocol = immediateEmergency.protocol;
                emergencyResult.confidence = 0.95;
                emergencyResult.recommendations = this.getEmergencyRecommendations(emergencyResult.protocol);
                return emergencyResult;
            }

            // Check for urgent symptoms
            const urgentSymptoms = this.checkUrgentSymptoms(normalizedMessage);
            if (urgentSymptoms.detected) {
                emergencyResult.isEmergency = true;
                emergencyResult.level = 'urgent';
                emergencyResult.score = urgentSymptoms.score;
                emergencyResult.detectedSymptoms = urgentSymptoms.symptoms;
                emergencyResult.category = urgentSymptoms.category;
                emergencyResult.confidence = 0.8;
                emergencyResult.recommendations = ['Seek medical attention within 24 hours'];
            }

            // Check symptom combinations
            const combinationRisk = this.checkSymptomCombinations(normalizedMessage);
            if (combinationRisk.score > emergencyResult.score) {
                emergencyResult.isEmergency = true;
                emergencyResult.level = combinationRisk.score >= 9 ? 'immediate' : 'urgent';
                emergencyResult.score = combinationRisk.score;
                emergencyResult.detectedSymptoms.push(...combinationRisk.symptoms);
                emergencyResult.confidence = 0.85;
            }

            // Use NLP results if available
            if (nlpResult && nlpResult.entities) {
                const nlpEmergency = this.analyzeNLPForEmergency(nlpResult);
                if (nlpEmergency.score > emergencyResult.score) {
                    Object.assign(emergencyResult, nlpEmergency);
                }
            }

            return emergencyResult;
        } catch (error) {
            console.error('Emergency detection error:', error);
            return {
                isEmergency: false,
                level: 'none',
                score: 0,
                error: error.message
            };
        }
    }

    // Check for immediate emergency keywords
    checkImmediateEmergency(message) {
        const result = {
            detected: false,
            symptoms: [],
            category: null,
            protocol: null
        };

        // Check each critical symptom category
        for (const [category, data] of Object.entries(this.criticalSymptoms)) {
            for (const symptom of data.symptoms) {
                if (message.includes(symptom.toLowerCase())) {
                    result.detected = true;
                    result.symptoms.push(symptom);
                    result.category = category;
                    result.protocol = data.protocol;
                    break;
                }
            }
            if (result.detected) break;
        }

        // Check immediate emergency keywords
        if (!result.detected) {
            for (const keyword of this.emergencyKeywords.immediate) {
                if (message.includes(keyword.toLowerCase())) {
                    result.detected = true;
                    result.symptoms.push(keyword);
                    result.category = 'general_emergency';
                    result.protocol = 'general_emergency';
                    break;
                }
            }
        }

        return result;
    }

    // Check for urgent symptoms
    checkUrgentSymptoms(message) {
        const result = {
            detected: false,
            symptoms: [],
            category: 'urgent',
            score: 0
        };

        for (const keyword of this.emergencyKeywords.urgent) {
            if (message.includes(keyword.toLowerCase())) {
                result.detected = true;
                result.symptoms.push(keyword);
                result.score = Math.max(result.score, 7);
            }
        }

        return result;
    }

    // Check symptom combinations
    checkSymptomCombinations(message) {
        const result = {
            score: 0,
            symptoms: []
        };

        for (const [combination, score] of Object.entries(this.riskScoring.symptom_combinations)) {
            const symptoms = combination.split(' + ');
            const allPresent = symptoms.every(symptom => 
                message.includes(symptom.toLowerCase())
            );

            if (allPresent) {
                result.score = Math.max(result.score, score);
                result.symptoms.push(...symptoms);
            }
        }

        return result;
    }

    // Analyze NLP results for emergency indicators
    analyzeNLPForEmergency(nlpResult) {
        const result = {
            isEmergency: false,
            level: 'none',
            score: 0,
            confidence: 0.7
        };

        // Check intent
        if (nlpResult.intent === 'emergency_help') {
            result.isEmergency = true;
            result.level = 'urgent';
            result.score = 8;
        }

        // Check entities for medical terms
        const medicalEntities = nlpResult.entities.filter(entity => 
            ['symptom', 'condition', 'body_part'].includes(entity.type)
        );

        if (medicalEntities.length >= 3) {
            result.score += 2;
        }

        // Check sentiment - very negative might indicate emergency
        if (nlpResult.sentiment === 'negative' && nlpResult.confidence > 0.8) {
            result.score += 1;
        }

        if (result.score >= 7) {
            result.isEmergency = true;
            result.level = result.score >= 9 ? 'immediate' : 'urgent';
        }

        return result;
    }

    // Get emergency recommendations based on protocol
    getEmergencyRecommendations(protocol) {
        const protocolData = this.emergencyProtocols[protocol];
        if (!protocolData) {
            return [
                'Call 112 immediately',
                'Seek immediate medical attention',
                'Do not delay emergency care'
            ];
        }

        return protocolData.immediate_actions;
    }

    // Generate emergency response message
    generateEmergencyResponse(emergencyResult, userLocation = null) {
        let response = '';

        if (emergencyResult.level === 'immediate') {
            response += '🚨 **MEDICAL EMERGENCY DETECTED** 🚨\n\n';
            response += '**CALL 112 IMMEDIATELY**\n\n';
        } else {
            response += '⚠️ **URGENT MEDICAL ATTENTION NEEDED** ⚠️\n\n';
        }

        response += `**Detected symptoms:** ${emergencyResult.detectedSymptoms.join(', ')}\n\n`;

        if (emergencyResult.recommendations.length > 0) {
            response += '**Immediate actions:**\n';
            emergencyResult.recommendations.forEach(rec => {
                response += `• ${rec}\n`;
            });
            response += '\n';
        }

        response += '**Emergency contacts:**\n';
        response += '• National Emergency: 112\n';
        response += '• Ambulance: 102\n';
        response += '• Police: 100\n';
        response += '• Fire: 101\n';
        response += '• Mental Health Helpline: 1800-599-0019\n\n';

        if (userLocation) {
            response += '**Nearest hospitals will be shared separately**\n\n';
        }

        response += '**Important:** Do not delay seeking emergency medical care. This is a potentially life-threatening situation.';

        return response;
    }

    // Calculate risk score based on user profile
    calculateRiskScore(userProfile, symptoms) {
        let riskScore = 0;

        // Age factor
        const age = userProfile.demographics?.age;
        if (age) {
            if ((age >= 0 && age <= 5) || age >= 65) {
                riskScore += 2;
            } else if ((age >= 6 && age <= 17) || (age >= 50 && age <= 64)) {
                riskScore += 1;
            }
        }

        // Chronic conditions
        if (userProfile.medicalProfile?.conditions) {
            for (const condition of userProfile.medicalProfile.conditions) {
                const conditionRisk = this.riskScoring.chronic_conditions[condition.toLowerCase()];
                if (conditionRisk) {
                    riskScore += conditionRisk;
                }
            }
        }

        // Pregnancy
        if (userProfile.demographics?.gender === 'female' && 
            userProfile.medicalProfile?.conditions?.includes('pregnancy')) {
            riskScore += 2;
        }

        return riskScore;
    }

    // Get emergency statistics
    getEmergencyStats() {
        return {
            totalEmergencyKeywords: Object.values(this.emergencyKeywords).flat().length,
            criticalSymptomCategories: Object.keys(this.criticalSymptoms).length,
            emergencyProtocols: Object.keys(this.emergencyProtocols).length,
            symptomCombinations: Object.keys(this.riskScoring.symptom_combinations).length
        };
    }
}

module.exports = EmergencyDetection;
