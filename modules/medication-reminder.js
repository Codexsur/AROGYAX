/**
 * Medication Reminder System for HealthBot
 * Handles medication scheduling, reminders, and adherence tracking
 */

const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

class MedicationReminderSystem {
    constructor(messagingService, userService, knowledgeBase) {
        this.messagingService = messagingService;
        this.userService = userService;
        this.knowledgeBase = knowledgeBase;
        this.activeReminders = new Map();
        this.medicationSchedules = new Map();
        this.adherenceTracking = new Map();
        
        // Initialize reminder scheduler
        this.initializeScheduler();
    }

    /**
     * Initialize the cron scheduler for medication reminders
     */
    initializeScheduler() {
        // Check for due reminders every minute
        cron.schedule('* * * * *', () => {
            this.checkDueReminders();
        });

        // Daily adherence report at 8 PM
        cron.schedule('0 20 * * *', () => {
            this.sendDailyAdherenceReport();
        });

        // Weekly medication review on Sundays at 10 AM
        cron.schedule('0 10 * * 0', () => {
            this.sendWeeklyMedicationReview();
        });
    }

    /**
     * Add a new medication reminder for a user
     */
    async addMedicationReminder(userId, medicationData) {
        try {
            const reminderId = uuidv4();
            const medication = {
                id: reminderId,
                userId: userId,
                name: medicationData.name,
                dosage: medicationData.dosage,
                frequency: medicationData.frequency, // daily, twice_daily, thrice_daily, weekly, etc.
                times: medicationData.times, // Array of times like ['08:00', '20:00']
                startDate: new Date(medicationData.startDate),
                endDate: medicationData.endDate ? new Date(medicationData.endDate) : null,
                instructions: medicationData.instructions || '',
                foodInstructions: medicationData.foodInstructions || 'no_specific', // before_food, after_food, with_food, no_specific
                sideEffects: medicationData.sideEffects || [],
                interactions: medicationData.interactions || [],
                isActive: true,
                createdAt: new Date(),
                adherenceScore: 100
            };

            // Store medication schedule
            if (!this.medicationSchedules.has(userId)) {
                this.medicationSchedules.set(userId, []);
            }
            this.medicationSchedules.get(userId).push(medication);

            // Initialize adherence tracking
            this.initializeAdherenceTracking(userId, reminderId);

            // Schedule reminders
            this.scheduleReminders(medication);

            // Send confirmation message
            await this.sendMedicationAddedConfirmation(userId, medication);

            return {
                success: true,
                reminderId: reminderId,
                message: 'Medication reminder added successfully'
            };

        } catch (error) {
            console.error('Error adding medication reminder:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Schedule reminders for a medication
     */
    scheduleReminders(medication) {
        medication.times.forEach(time => {
            const [hours, minutes] = time.split(':');
            const cronExpression = `${minutes} ${hours} * * *`;
            
            const task = cron.schedule(cronExpression, () => {
                this.sendMedicationReminder(medication);
            }, {
                scheduled: false
            });

            task.start();
            
            if (!this.activeReminders.has(medication.id)) {
                this.activeReminders.set(medication.id, []);
            }
            this.activeReminders.get(medication.id).push(task);
        });
    }

    /**
     * Send medication reminder to user
     */
    async sendMedicationReminder(medication) {
        try {
            const user = await this.userService.getUserById(medication.userId);
            if (!user || !medication.isActive) return;

            // Check if medication period has ended
            if (medication.endDate && new Date() > medication.endDate) {
                await this.deactivateMedication(medication.id);
                return;
            }

            const reminderMessage = this.generateReminderMessage(medication);
            
            await this.messagingService.sendMessage(user.phoneNumber, reminderMessage, user.platform);

            // Log reminder sent
            this.logReminderSent(medication.userId, medication.id);

        } catch (error) {
            console.error('Error sending medication reminder:', error);
        }
    }

    /**
     * Generate reminder message based on medication details
     */
    generateReminderMessage(medication) {
        const currentTime = new Date().toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        });

        let message = `💊 *Medication Reminder* 💊\n\n`;
        message += `⏰ Time: ${currentTime}\n`;
        message += `💉 Medicine: ${medication.name}\n`;
        message += `📏 Dosage: ${medication.dosage}\n`;

        if (medication.foodInstructions !== 'no_specific') {
            const foodInstruction = this.getFoodInstructionText(medication.foodInstructions);
            message += `🍽️ ${foodInstruction}\n`;
        }

        if (medication.instructions) {
            message += `📝 Instructions: ${medication.instructions}\n`;
        }

        message += `\n*Reply with:*\n`;
        message += `✅ "TAKEN" - If you've taken the medicine\n`;
        message += `⏰ "SNOOZE" - To remind again in 15 minutes\n`;
        message += `❌ "SKIP" - If you're skipping this dose\n`;
        message += `❓ "INFO" - For medicine information\n`;

        if (medication.sideEffects.length > 0) {
            message += `\n⚠️ *Watch for side effects:* ${medication.sideEffects.join(', ')}`;
        }

        return message;
    }

    /**
     * Get food instruction text
     */
    getFoodInstructionText(instruction) {
        const instructions = {
            'before_food': 'Take 30 minutes before meals',
            'after_food': 'Take after meals',
            'with_food': 'Take with food',
            'empty_stomach': 'Take on empty stomach'
        };
        return instructions[instruction] || '';
    }

    /**
     * Handle user response to medication reminder
     */
    async handleReminderResponse(userId, response, messageText) {
        const userMedications = this.medicationSchedules.get(userId) || [];
        const currentTime = new Date();
        
        // Find the most recent active medication that should have been taken
        const recentMedication = this.findRecentMedication(userMedications, currentTime);
        
        if (!recentMedication) {
            return "No recent medication reminders found.";
        }

        switch (response.toUpperCase()) {
            case 'TAKEN':
                return await this.handleMedicationTaken(userId, recentMedication.id);
            
            case 'SNOOZE':
                return await this.handleMedicationSnooze(userId, recentMedication.id);
            
            case 'SKIP':
                return await this.handleMedicationSkip(userId, recentMedication.id);
            
            case 'INFO':
                return await this.getMedicationInfo(recentMedication);
            
            default:
                return this.getHelpMessage();
        }
    }

    /**
     * Handle when user confirms taking medication
     */
    async handleMedicationTaken(userId, medicationId) {
        this.recordAdherence(userId, medicationId, 'taken');
        
        const medication = this.findMedicationById(userId, medicationId);
        let response = `✅ Great! Recorded that you've taken ${medication.name}.\n\n`;
        
        // Check for potential side effects monitoring
        if (medication.sideEffects.length > 0) {
            response += `Please monitor for any side effects and contact your doctor if you experience:\n`;
            response += medication.sideEffects.map(effect => `• ${effect}`).join('\n');
            response += `\n\nReply "SIDE EFFECT" if you experience any unusual symptoms.`;
        }

        return response;
    }

    /**
     * Handle medication snooze request
     */
    async handleMedicationSnooze(userId, medicationId) {
        const medication = this.findMedicationById(userId, medicationId);
        
        // Schedule reminder in 15 minutes
        setTimeout(() => {
            this.sendMedicationReminder(medication);
        }, 15 * 60 * 1000);

        return `⏰ Reminder snoozed for 15 minutes. I'll remind you again about ${medication.name}.`;
    }

    /**
     * Handle medication skip
     */
    async handleMedicationSkip(userId, medicationId) {
        this.recordAdherence(userId, medicationId, 'skipped');
        
        const medication = this.findMedicationById(userId, medicationId);
        let response = `⚠️ Recorded that you've skipped ${medication.name}.\n\n`;
        
        response += `*Important:* Skipping medications can affect your treatment. `;
        response += `If you're experiencing side effects or have concerns, please consult your doctor.\n\n`;
        response += `Would you like me to:\n`;
        response += `1. Schedule a doctor consultation reminder\n`;
        response += `2. Provide information about this medication\n`;
        response += `3. Set up a different reminder time`;

        return response;
    }

    /**
     * Get detailed medication information
     */
    async getMedicationInfo(medication) {
        let info = `💊 *${medication.name} Information*\n\n`;
        info += `📏 **Dosage:** ${medication.dosage}\n`;
        info += `⏰ **Frequency:** ${this.getFrequencyText(medication.frequency)}\n`;
        info += `🕐 **Times:** ${medication.times.join(', ')}\n`;
        
        if (medication.instructions) {
            info += `📝 **Instructions:** ${medication.instructions}\n`;
        }
        
        if (medication.foodInstructions !== 'no_specific') {
            info += `🍽️ **Food:** ${this.getFoodInstructionText(medication.foodInstructions)}\n`;
        }

        if (medication.sideEffects.length > 0) {
            info += `⚠️ **Possible Side Effects:**\n`;
            info += medication.sideEffects.map(effect => `• ${effect}`).join('\n');
            info += '\n';
        }

        if (medication.interactions.length > 0) {
            info += `🚫 **Drug Interactions:**\n`;
            info += medication.interactions.map(interaction => `• ${interaction}`).join('\n');
            info += '\n';
        }

        // Get adherence score
        const adherenceScore = this.calculateAdherenceScore(medication.userId, medication.id);
        info += `📊 **Adherence Score:** ${adherenceScore}%\n`;

        info += `\n*Always consult your doctor before making changes to your medication.*`;

        return info;
    }

    /**
     * Record medication adherence
     */
    recordAdherence(userId, medicationId, status) {
        const key = `${userId}-${medicationId}`;
        if (!this.adherenceTracking.has(key)) {
            this.adherenceTracking.set(key, []);
        }

        this.adherenceTracking.get(key).push({
            timestamp: new Date(),
            status: status, // 'taken', 'skipped', 'late'
            date: new Date().toDateString()
        });

        // Update adherence score
        this.updateAdherenceScore(userId, medicationId);
    }

    /**
     * Calculate adherence score for a medication
     */
    calculateAdherenceScore(userId, medicationId) {
        const key = `${userId}-${medicationId}`;
        const records = this.adherenceTracking.get(key) || [];
        
        if (records.length === 0) return 100;

        const takenCount = records.filter(record => record.status === 'taken').length;
        return Math.round((takenCount / records.length) * 100);
    }

    /**
     * Update adherence score for a medication
     */
    updateAdherenceScore(userId, medicationId) {
        const medication = this.findMedicationById(userId, medicationId);
        if (medication) {
            medication.adherenceScore = this.calculateAdherenceScore(userId, medicationId);
        }
    }

    /**
     * Send daily adherence report
     */
    async sendDailyAdherenceReport() {
        for (const [userId, medications] of this.medicationSchedules) {
            try {
                const activeMedications = medications.filter(med => med.isActive);
                if (activeMedications.length === 0) continue;

                const report = this.generateDailyReport(userId, activeMedications);
                const user = await this.userService.getUserById(userId);
                
                if (user) {
                    await this.messagingService.sendMessage(user.phoneNumber, report, user.platform);
                }
            } catch (error) {
                console.error('Error sending daily adherence report:', error);
            }
        }
    }

    /**
     * Generate daily adherence report
     */
    generateDailyReport(userId, medications) {
        let report = `📊 *Daily Medication Report*\n\n`;
        
        const today = new Date().toDateString();
        let totalDoses = 0;
        let takenDoses = 0;

        medications.forEach(medication => {
            const key = `${userId}-${medication.id}`;
            const todayRecords = (this.adherenceTracking.get(key) || [])
                .filter(record => record.date === today);
            
            const expectedDoses = medication.times.length;
            const actualTaken = todayRecords.filter(record => record.status === 'taken').length;
            
            totalDoses += expectedDoses;
            takenDoses += actualTaken;

            const status = actualTaken === expectedDoses ? '✅' : 
                         actualTaken > 0 ? '⚠️' : '❌';
            
            report += `${status} ${medication.name}: ${actualTaken}/${expectedDoses} doses\n`;
        });

        const adherencePercentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
        
        report += `\n📈 **Today's Adherence:** ${adherencePercentage}%\n`;
        
        if (adherencePercentage < 80) {
            report += `\n⚠️ *Your adherence is below 80%. Please try to take your medications as prescribed for better health outcomes.*`;
        } else if (adherencePercentage === 100) {
            report += `\n🎉 *Excellent! You've taken all your medications today.*`;
        }

        return report;
    }

    /**
     * Send weekly medication review
     */
    async sendWeeklyMedicationReview() {
        for (const [userId, medications] of this.medicationSchedules) {
            try {
                const activeMedications = medications.filter(med => med.isActive);
                if (activeMedications.length === 0) continue;

                const review = this.generateWeeklyReview(userId, activeMedications);
                const user = await this.userService.getUserById(userId);
                
                if (user) {
                    await this.messagingService.sendMessage(user.phoneNumber, review, user.platform);
                }
            } catch (error) {
                console.error('Error sending weekly medication review:', error);
            }
        }
    }

    /**
     * Generate weekly medication review
     */
    generateWeeklyReview(userId, medications) {
        let review = `📅 *Weekly Medication Review*\n\n`;
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        let overallAdherence = 0;
        let medicationCount = 0;

        medications.forEach(medication => {
            const adherenceScore = this.calculateAdherenceScore(userId, medication.id);
            overallAdherence += adherenceScore;
            medicationCount++;

            const trend = this.getAdherenceTrend(userId, medication.id);
            const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️';
            
            review += `💊 **${medication.name}**\n`;
            review += `   Adherence: ${adherenceScore}% ${trendIcon}\n\n`;
        });

        const avgAdherence = medicationCount > 0 ? Math.round(overallAdherence / medicationCount) : 100;
        
        review += `📊 **Overall Adherence:** ${avgAdherence}%\n\n`;
        
        if (avgAdherence >= 90) {
            review += `🌟 *Excellent adherence! Keep up the great work.*\n\n`;
        } else if (avgAdherence >= 80) {
            review += `👍 *Good adherence, but there's room for improvement.*\n\n`;
        } else {
            review += `⚠️ *Your adherence needs attention. Consider setting more reminders or consulting your doctor.*\n\n`;
        }

        review += `*Tips for better adherence:*\n`;
        review += `• Set multiple reminder times\n`;
        review += `• Use a pill organizer\n`;
        review += `• Link medication to daily routines\n`;
        review += `• Discuss concerns with your doctor`;

        return review;
    }

    /**
     * Get adherence trend (positive, negative, or stable)
     */
    getAdherenceTrend(userId, medicationId) {
        const key = `${userId}-${medicationId}`;
        const records = this.adherenceTracking.get(key) || [];
        
        if (records.length < 7) return 0;

        const recentWeek = records.slice(-7);
        const previousWeek = records.slice(-14, -7);
        
        if (previousWeek.length === 0) return 0;

        const recentAdherence = recentWeek.filter(r => r.status === 'taken').length / recentWeek.length;
        const previousAdherence = previousWeek.filter(r => r.status === 'taken').length / previousWeek.length;
        
        const difference = recentAdherence - previousAdherence;
        
        if (difference > 0.1) return 1; // Improving
        if (difference < -0.1) return -1; // Declining
        return 0; // Stable
    }

    /**
     * Deactivate a medication
     */
    async deactivateMedication(medicationId) {
        for (const [userId, medications] of this.medicationSchedules) {
            const medication = medications.find(med => med.id === medicationId);
            if (medication) {
                medication.isActive = false;
                
                // Stop scheduled reminders
                const reminders = this.activeReminders.get(medicationId) || [];
                reminders.forEach(task => task.destroy());
                this.activeReminders.delete(medicationId);
                
                // Send completion message
                const user = await this.userService.getUserById(userId);
                if (user) {
                    const message = `✅ *Medication Course Completed*\n\n` +
                                  `You have completed your course of ${medication.name}. ` +
                                  `If you need to continue this medication, please consult your doctor.`;
                    
                    await this.messagingService.sendMessage(user.phoneNumber, message, user.platform);
                }
                break;
            }
        }
    }

    /**
     * Get help message for medication reminders
     */
    getHelpMessage() {
        return `💊 *Medication Reminder Help*\n\n` +
               `*Available Commands:*\n` +
               `✅ "TAKEN" - Mark medication as taken\n` +
               `⏰ "SNOOZE" - Remind again in 15 minutes\n` +
               `❌ "SKIP" - Skip this dose\n` +
               `❓ "INFO" - Get medication information\n` +
               `📊 "REPORT" - Get adherence report\n` +
               `➕ "ADD MED" - Add new medication\n` +
               `📝 "LIST MEDS" - View all medications\n\n` +
               `*Need help?* Reply "HELP" for more options.`;
    }

    /**
     * Utility functions
     */
    findMedicationById(userId, medicationId) {
        const medications = this.medicationSchedules.get(userId) || [];
        return medications.find(med => med.id === medicationId);
    }

    findRecentMedication(medications, currentTime) {
        // Find medication that should have been taken in the last 30 minutes
        const thirtyMinutesAgo = new Date(currentTime.getTime() - 30 * 60 * 1000);
        
        return medications.find(medication => {
            if (!medication.isActive) return false;
            
            return medication.times.some(time => {
                const [hours, minutes] = time.split(':');
                const medicationTime = new Date(currentTime);
                medicationTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                return medicationTime >= thirtyMinutesAgo && medicationTime <= currentTime;
            });
        });
    }

    getFrequencyText(frequency) {
        const frequencies = {
            'daily': 'Once daily',
            'twice_daily': 'Twice daily',
            'thrice_daily': 'Three times daily',
            'weekly': 'Once weekly',
            'as_needed': 'As needed'
        };
        return frequencies[frequency] || frequency;
    }

    initializeAdherenceTracking(userId, medicationId) {
        const key = `${userId}-${medicationId}`;
        if (!this.adherenceTracking.has(key)) {
            this.adherenceTracking.set(key, []);
        }
    }

    logReminderSent(userId, medicationId) {
        // Log that reminder was sent (for analytics)
        console.log(`Medication reminder sent - User: ${userId}, Medication: ${medicationId}, Time: ${new Date()}`);
    }

    checkDueReminders() {
        // This method is called every minute to check for any missed reminders
        // Implementation would check for any reminders that should have been sent
        // but weren't due to system downtime, etc.
    }
}

module.exports = MedicationReminderSystem;
