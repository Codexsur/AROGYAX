// Symptom Assessment Decision Trees for HealthBot
// AI-powered symptom checker with decision tree logic

class SymptomAssessment {
    constructor() {
        this.assessmentFlows = this.initializeAssessmentFlows();
        this.riskFactors = this.initializeRiskFactors();
        this.emergencySymptoms = this.initializeEmergencySymptoms();
        this.symptomCategories = this.initializeSymptomCategories();
    }

    // Initialize assessment flows for different symptom categories
    initializeAssessmentFlows() {
        return {
            general: {
                questions: [
                    {
                        id: 'primary_concern',
                        type: 'multiple_choice',
                        question: 'What is your main health concern today?',
                        options: [
                            'Fever or feeling hot',
                            'Pain (headache, body ache, etc.)',
                            'Breathing problems',
                            'Stomach/digestive issues',
                            'Skin problems',
                            'Mental health concerns',
                            'Other symptoms'
                        ],
                        next: (answer) => {
                            const mapping = {
                                'Fever or feeling hot': 'fever_assessment',
                                'Pain (headache, body ache, etc.)': 'pain_assessment',
                                'Breathing problems': 'respiratory_assessment',
                                'Stomach/digestive issues': 'digestive_assessment',
                                'Skin problems': 'skin_assessment',
                                'Mental health concerns': 'mental_health_assessment',
                                'Other symptoms': 'general_symptoms'
                            };
                            return mapping[answer] || 'general_symptoms';
                        }
                    },
                    {
                        id: 'symptom_duration',
                        type: 'multiple_choice',
                        question: 'How long have you been experiencing these symptoms?',
                        options: [
                            'Less than 24 hours',
                            '1-3 days',
                            '4-7 days',
                            '1-2 weeks',
                            'More than 2 weeks',
                            'Comes and goes'
                        ]
                    },
                    {
                        id: 'severity_level',
                        type: 'scale',
                        question: 'On a scale of 1-10, how severe are your symptoms? (1 = very mild, 10 = unbearable)',
                        scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                    },
                    {
                        id: 'impact_activities',
                        type: 'multiple_choice',
                        question: 'How are these symptoms affecting your daily activities?',
                        options: [
                            'No impact - I can do everything normally',
                            'Slight difficulty with some activities',
                            'Moderate difficulty - some activities are hard',
                            'Significant impact - hard to work/study',
                            'Unable to do normal activities',
                            'Need to stay in bed/rest'
                        ]
                    }
                ]
            },
            fever_assessment: {
                questions: [
                    {
                        id: 'fever_temperature',
                        type: 'multiple_choice',
                        question: 'What is your temperature or how do you feel?',
                        options: [
                            'Normal temperature but feeling hot',
                            '99-100°F (37.2-37.8°C)',
                            '101-102°F (38.3-38.9°C)',
                            '103°F (39.4°C) or higher',
                            'Haven\'t measured but feeling very hot',
                            'Chills and shivering'
                        ]
                    },
                    {
                        id: 'fever_symptoms',
                        type: 'multiple_select',
                        question: 'What other symptoms do you have with the fever?',
                        options: [
                            'Headache',
                            'Body aches',
                            'Cough',
                            'Sore throat',
                            'Runny nose',
                            'Nausea or vomiting',
                            'Diarrhea',
                            'Rash',
                            'Difficulty breathing',
                            'Confusion',
                            'None of these'
                        ]
                    },
                    {
                        id: 'fever_exposure',
                        type: 'multiple_choice',
                        question: 'Have you been exposed to any of these recently?',
                        options: [
                            'Someone with cold/flu',
                            'Mosquito bites (possible dengue/malaria area)',
                            'Contaminated food/water',
                            'Travel to different city/country',
                            'Crowded places',
                            'None of these'
                        ]
                    }
                ]
            },
            pain_assessment: {
                questions: [
                    {
                        id: 'pain_location',
                        type: 'multiple_choice',
                        question: 'Where is the pain located?',
                        options: [
                            'Head (headache)',
                            'Chest',
                            'Stomach/abdomen',
                            'Back',
                            'Arms or legs',
                            'Joints',
                            'All over body',
                            'Other location'
                        ]
                    },
                    {
                        id: 'pain_type',
                        type: 'multiple_choice',
                        question: 'How would you describe the pain?',
                        options: [
                            'Sharp/stabbing',
                            'Dull/aching',
                            'Burning',
                            'Throbbing/pulsing',
                            'Cramping',
                            'Pressure/squeezing'
                        ]
                    },
                    {
                        id: 'pain_triggers',
                        type: 'multiple_select',
                        question: 'What makes the pain worse?',
                        options: [
                            'Movement',
                            'Deep breathing',
                            'Eating',
                            'Stress',
                            'Light or noise',
                            'Touch/pressure',
                            'Nothing specific',
                            'Gets worse on its own'
                        ]
                    }
                ]
            },
            respiratory_assessment: {
                questions: [
                    {
                        id: 'breathing_difficulty',
                        type: 'multiple_choice',
                        question: 'How would you describe your breathing problem?',
                        options: [
                            'Shortness of breath with activity',
                            'Shortness of breath at rest',
                            'Wheezing or whistling sound',
                            'Cough with phlegm',
                            'Dry cough',
                            'Chest tightness',
                            'Cannot speak full sentences'
                        ]
                    },
                    {
                        id: 'respiratory_triggers',
                        type: 'multiple_select',
                        question: 'What triggers or worsens your breathing problems?',
                        options: [
                            'Physical activity',
                            'Lying down',
                            'Cold air',
                            'Dust or allergens',
                            'Stress',
                            'Nothing specific',
                            'Gets worse on its own'
                        ]
                    }
                ]
            }
        };
    }

    // Initialize risk factors
    initializeRiskFactors() {
        return {
            age: {
                high_risk: [0, 5, 65, 100], // 0-5 years and 65+ years
                moderate_risk: [6, 17, 50, 64] // 6-17 and 50-64 years
            },
            chronic_conditions: [
                'diabetes', 'hypertension', 'heart disease', 'asthma', 
                'kidney disease', 'liver disease', 'cancer', 'immunocompromised'
            ],
            pregnancy: true,
            medications: [
                'blood thinners', 'immunosuppressants', 'steroids'
            ]
        };
    }

    // Initialize emergency symptoms
    initializeEmergencySymptoms() {
        return {
            immediate_emergency: [
                'chest pain with shortness of breath',
                'difficulty breathing at rest',
                'unconscious or unresponsive',
                'severe bleeding',
                'signs of stroke',
                'severe allergic reaction',
                'temperature above 104°F',
                'severe dehydration',
                'thoughts of self-harm'
            ],
            urgent_care: [
                'high fever with severe headache',
                'persistent vomiting',
                'severe abdominal pain',
                'difficulty swallowing',
                'severe dizziness',
                'rapid heartbeat with chest discomfort'
            ]
        };
    }

    // Initialize symptom categories
    initializeSymptomCategories() {
        return {
            respiratory: ['cough', 'shortness of breath', 'wheezing', 'chest tightness'],
            gastrointestinal: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'constipation'],
            neurological: ['headache', 'dizziness', 'confusion', 'memory problems'],
            cardiovascular: ['chest pain', 'palpitations', 'swelling', 'fatigue'],
            musculoskeletal: ['joint pain', 'muscle pain', 'back pain', 'stiffness'],
            dermatological: ['rash', 'itching', 'swelling', 'changes in skin'],
            psychological: ['anxiety', 'depression', 'mood changes', 'sleep problems']
        };
    }

    // Get first question for assessment
    getFirstQuestion(language = 'english') {
        const firstQuestion = this.assessmentFlows.general.questions[0];
        return this.formatQuestion(firstQuestion, language);
    }

    // Process user response and get next question
    async processResponse(userResponse, flowData, language = 'english') {
        try {
            const currentStep = flowData.step || 0;
            const currentFlow = flowData.currentFlow || 'general';
            
            // Store the response
            if (!flowData.responses) {
                flowData.responses = {};
            }
            
            const currentQuestion = this.getCurrentQuestion(currentFlow, currentStep);
            if (currentQuestion) {
                flowData.responses[currentQuestion.id] = userResponse;
            }

            // Check for emergency symptoms in response
            const emergencyCheck = this.checkEmergencySymptoms(userResponse, flowData.responses);
            if (emergencyCheck.isEmergency) {
                return {
                    completed: true,
                    text: await this.generateEmergencyResponse(emergencyCheck, language),
                    assessment: {
                        type: 'emergency',
                        urgency: 'immediate',
                        recommendations: emergencyCheck.recommendations
                    },
                    urgency: 'high'
                };
            }

            // Determine next step
            const nextStep = await this.getNextStep(currentFlow, currentStep, userResponse, flowData);
            
            if (nextStep.completed) {
                // Assessment completed
                const assessment = await this.generateAssessment(flowData.responses, language);
                return {
                    completed: true,
                    text: await this.formatAssessmentResult(assessment, language),
                    assessment,
                    urgency: assessment.urgency
                };
            } else {
                // Continue with next question
                flowData.step = nextStep.step;
                flowData.currentFlow = nextStep.flow;
                
                const nextQuestion = this.getCurrentQuestion(nextStep.flow, nextStep.step);
                return {
                    completed: false,
                    text: this.formatQuestion(nextQuestion, language),
                    flowData
                };
            }
        } catch (error) {
            console.error('Error processing symptom assessment response:', error);
            return {
                completed: true,
                text: 'I apologize, but there was an error processing your response. Please consult with a healthcare professional for proper evaluation.',
                assessment: {
                    type: 'error',
                    urgency: 'moderate'
                }
            };
        }
    }

    // Get current question based on flow and step
    getCurrentQuestion(flowName, step) {
        const flow = this.assessmentFlows[flowName];
        if (!flow || !flow.questions || step >= flow.questions.length) {
            return null;
        }
        return flow.questions[step];
    }

    // Determine next step in assessment
    async getNextStep(currentFlow, currentStep, userResponse, flowData) {
        const currentQuestion = this.getCurrentQuestion(currentFlow, currentStep);
        
        // Check if we need to switch flows based on response
        if (currentQuestion && currentQuestion.next) {
            const nextFlow = currentQuestion.next(userResponse);
            if (nextFlow !== currentFlow) {
                return {
                    completed: false,
                    flow: nextFlow,
                    step: 0
                };
            }
        }

        // Continue in current flow
        const nextStep = currentStep + 1;
        const flow = this.assessmentFlows[currentFlow];
        
        if (!flow || nextStep >= flow.questions.length) {
            // Flow completed
            return { completed: true };
        }

        return {
            completed: false,
            flow: currentFlow,
            step: nextStep
        };
    }

    // Check for emergency symptoms
    checkEmergencySymptoms(userResponse, allResponses) {
        const response = userResponse.toLowerCase();
        const isEmergency = {
            isEmergency: false,
            level: 'none',
            symptoms: [],
            recommendations: []
        };

        // Check immediate emergency symptoms
        for (const symptom of this.emergencySymptoms.immediate_emergency) {
            if (response.includes(symptom.toLowerCase())) {
                isEmergency.isEmergency = true;
                isEmergency.level = 'immediate';
                isEmergency.symptoms.push(symptom);
                isEmergency.recommendations.push('Call 112 immediately');
                isEmergency.recommendations.push('Go to nearest emergency room');
            }
        }

        // Check urgent care symptoms
        if (!isEmergency.isEmergency) {
            for (const symptom of this.emergencySymptoms.urgent_care) {
                if (response.includes(symptom.toLowerCase())) {
                    isEmergency.isEmergency = true;
                    isEmergency.level = 'urgent';
                    isEmergency.symptoms.push(symptom);
                    isEmergency.recommendations.push('Seek medical attention within 24 hours');
                }
            }
        }

        // Check severity level from responses
        if (allResponses.severity_level && parseInt(allResponses.severity_level) >= 8) {
            isEmergency.isEmergency = true;
            isEmergency.level = isEmergency.level || 'urgent';
            isEmergency.recommendations.push('High severity symptoms require medical evaluation');
        }

        // Check temperature for fever
        if (allResponses.fever_temperature && 
            (allResponses.fever_temperature.includes('103°F') || 
             allResponses.fever_temperature.includes('very hot'))) {
            isEmergency.isEmergency = true;
            isEmergency.level = 'urgent';
            isEmergency.symptoms.push('high fever');
            isEmergency.recommendations.push('High fever requires immediate medical attention');
        }

        return isEmergency;
    }

    // Generate emergency response
    async generateEmergencyResponse(emergencyCheck, language) {
        let response = '🚨 EMERGENCY DETECTED 🚨\n\n';
        
        if (emergencyCheck.level === 'immediate') {
            response += 'Your symptoms suggest you need IMMEDIATE medical attention.\n\n';
            response += '⚡ CALL 112 NOW ⚡\n\n';
        } else {
            response += 'Your symptoms require urgent medical attention.\n\n';
        }

        response += 'Detected symptoms:\n';
        emergencyCheck.symptoms.forEach(symptom => {
            response += `• ${symptom}\n`;
        });

        response += '\nImmediate actions:\n';
        emergencyCheck.recommendations.forEach(rec => {
            response += `• ${rec}\n`;
        });

        response += '\nEmergency numbers:\n';
        response += '• National Emergency: 112\n';
        response += '• Ambulance: 102\n';
        response += '• Police: 100\n';

        return response;
    }

    // Generate assessment result
    async generateAssessment(responses, language) {
        const assessment = {
            type: 'general',
            urgency: 'low',
            severity: this.calculateSeverity(responses),
            recommendations: [],
            possibleConditions: [],
            selfCareAdvice: [],
            whenToSeekHelp: []
        };

        // Analyze responses
        const primaryConcern = responses.primary_concern;
        const duration = responses.symptom_duration;
        const severityLevel = parseInt(responses.severity_level) || 1;
        const impact = responses.impact_activities;

        // Determine urgency
        if (severityLevel >= 7 || impact?.includes('Unable to do normal activities')) {
            assessment.urgency = 'high';
        } else if (severityLevel >= 5 || impact?.includes('Significant impact')) {
            assessment.urgency = 'moderate';
        }

        // Generate recommendations based on primary concern
        if (primaryConcern?.includes('Fever')) {
            assessment.recommendations.push('Monitor temperature regularly');
            assessment.recommendations.push('Stay hydrated');
            assessment.recommendations.push('Rest and avoid strenuous activities');
            assessment.selfCareAdvice.push('Take paracetamol as needed for fever');
            assessment.whenToSeekHelp.push('If fever persists >3 days or exceeds 103°F');
        }

        if (primaryConcern?.includes('Pain')) {
            assessment.recommendations.push('Apply appropriate hot/cold therapy');
            assessment.recommendations.push('Avoid activities that worsen pain');
            assessment.selfCareAdvice.push('Over-the-counter pain relievers may help');
            assessment.whenToSeekHelp.push('If pain is severe or worsening');
        }

        // Duration-based recommendations
        if (duration?.includes('More than 2 weeks')) {
            assessment.urgency = Math.max(assessment.urgency === 'low' ? 1 : assessment.urgency === 'moderate' ? 2 : 3, 2);
            assessment.recommendations.push('Chronic symptoms require medical evaluation');
        }

        // General recommendations
        assessment.recommendations.push('Monitor symptoms and track changes');
        assessment.recommendations.push('Maintain good hygiene and rest');
        assessment.whenToSeekHelp.push('If symptoms worsen or new symptoms develop');
        assessment.whenToSeekHelp.push('If you have concerns about your health');

        return assessment;
    }

    // Calculate severity score
    calculateSeverity(responses) {
        let score = 0;
        
        // Severity level (0-10 scale)
        const severityLevel = parseInt(responses.severity_level) || 1;
        score += severityLevel;

        // Duration factor
        const duration = responses.symptom_duration;
        if (duration?.includes('More than 2 weeks')) score += 3;
        else if (duration?.includes('1-2 weeks')) score += 2;
        else if (duration?.includes('4-7 days')) score += 1;

        // Impact factor
        const impact = responses.impact_activities;
        if (impact?.includes('Unable to do normal activities')) score += 4;
        else if (impact?.includes('Significant impact')) score += 3;
        else if (impact?.includes('Moderate difficulty')) score += 2;
        else if (impact?.includes('Slight difficulty')) score += 1;

        // Normalize to 1-10 scale
        return Math.min(Math.max(Math.round(score / 2), 1), 10);
    }

    // Format question for display
    formatQuestion(question, language) {
        if (!question) return 'Assessment completed.';

        let formatted = `**${question.question}**\n\n`;

        if (question.type === 'multiple_choice') {
            question.options.forEach((option, index) => {
                formatted += `${index + 1}. ${option}\n`;
            });
            formatted += '\nPlease reply with the number of your choice.';
        } else if (question.type === 'multiple_select') {
            question.options.forEach((option, index) => {
                formatted += `${index + 1}. ${option}\n`;
            });
            formatted += '\nYou can select multiple options. Reply with numbers separated by commas (e.g., 1,3,5).';
        } else if (question.type === 'scale') {
            formatted += 'Please reply with a number from 1 to 10.';
        } else {
            formatted += 'Please describe your symptoms.';
        }

        return formatted;
    }

    // Format assessment result
    async formatAssessmentResult(assessment, language) {
        let result = '📋 **Symptom Assessment Complete**\n\n';
        
        result += `**Severity Level:** ${assessment.severity}/10\n`;
        result += `**Urgency:** ${assessment.urgency.toUpperCase()}\n\n`;

        if (assessment.recommendations.length > 0) {
            result += '**Recommendations:**\n';
            assessment.recommendations.forEach(rec => {
                result += `• ${rec}\n`;
            });
            result += '\n';
        }

        if (assessment.selfCareAdvice.length > 0) {
            result += '**Self-Care Advice:**\n';
            assessment.selfCareAdvice.forEach(advice => {
                result += `• ${advice}\n`;
            });
            result += '\n';
        }

        if (assessment.whenToSeekHelp.length > 0) {
            result += '**When to Seek Medical Help:**\n';
            assessment.whenToSeekHelp.forEach(help => {
                result += `• ${help}\n`;
            });
            result += '\n';
        }

        result += '**Important:** This assessment is for informational purposes only and does not replace professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.\n\n';
        
        if (assessment.urgency === 'high') {
            result += '⚠️ **Your symptoms suggest you should seek medical attention soon.**';
        } else if (assessment.urgency === 'moderate') {
            result += '💡 **Consider consulting a healthcare provider if symptoms persist or worsen.**';
        } else {
            result += '✅ **Continue monitoring your symptoms and practice self-care.**';
        }

        return result;
    }

    // Get assessment statistics
    getAssessmentStats() {
        return {
            totalFlows: Object.keys(this.assessmentFlows).length,
            totalQuestions: Object.values(this.assessmentFlows).reduce((sum, flow) => sum + flow.questions.length, 0),
            emergencySymptoms: this.emergencySymptoms.immediate_emergency.length + this.emergencySymptoms.urgent_care.length
        };
    }
}

module.exports = SymptomAssessment;
