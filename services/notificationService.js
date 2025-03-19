const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Service de gestion des notifications
 */
class NotificationService {
    /**
     * Crée une notification pour un utilisateur
     * @param {string} userId - ID de l'utilisateur destinataire
     * @param {string} type - Type de notification (account, points, mention, etc.)
     * @param {string} title - Titre de la notification
     * @param {string} message - Contenu de la notification
     * @param {Object} options - Options supplémentaires (sourceUrl, sourceId, sourceModel)
     * @returns {Promise<Object>} La notification créée
     */
    static async create(userId, type, title, message, options = {}) {
        try {
            const notification = new Notification({
                recipient: userId,
                type,
                title,
                message,
                sourceUrl: options.sourceUrl || null,
                sourceId: options.sourceId || null,
                sourceModel: options.sourceModel || null
            });
            
            await notification.save();
            
            // Si WebSocket est configuré, envoyer la notification en temps réel
            this.sendRealtimeNotification(userId, notification);
            
            // Envoyer un email si c'est configuré pour ce type de notification
            if (options.sendEmail) {
                await this.sendEmailNotification(userId, type, title, message);
            }
            
            return notification;
        } catch (error) {
            console.error('Erreur lors de la création de la notification:', error);
            throw error;
        }
    }
    
    /**
     * Envoie une notification en temps réel via WebSocket
     * @param {string} userId - ID de l'utilisateur destinataire
     * @param {Object} notification - Objet notification
     */
    static sendRealtimeNotification(userId, notification) {
        // Vérifier si le module WebSocket est disponible
        if (global.io) {
            global.io.to(`user-${userId}`).emit('new-notification', notification);
        }
    }
    
    /**
     * Envoie un email de notification
     * @param {string} userId - ID de l'utilisateur destinataire
     * @param {string} type - Type de notification
     * @param {string} title - Titre de la notification
     * @param {string} message - Contenu de la notification
     */
    static async sendEmailNotification(userId, type, title, message) {
        try {
            const user = await User.findById(userId);
            
            if (!user || !user.email) {
                throw new Error('Utilisateur ou email non trouvé');
            }
            
            // Vérifier les préférences d'email de l'utilisateur
            if (user.notificationPreferences && 
                user.notificationPreferences.email && 
                user.notificationPreferences.email[type] === false) {
                // L'utilisateur ne souhaite pas recevoir d'emails pour ce type
                return;
            }
            
            // Implémentation d'envoi d'email ici avec nodemailer ou autre
            // Cette partie dépend de votre configuration d'email
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de notification:', error);
        }
    }
    
    /**
     * Crée une notification de points
     * @param {string} userId - ID de l'utilisateur
     * @param {number} points - Nombre de points
     * @param {string} source - Source des points
     * @returns {Promise<Object>} La notification créée
     */
    static async createPointsNotification(userId, points, source) {
        const sign = points >= 0 ? '+' : '';
        const title = `${sign}${points} points`;
        const message = `Vous avez reçu ${sign}${points} points pour: ${source}`;
        
        return this.create(userId, 'points', title, message, {
            sendEmail: false // Les notifications de points sont fréquentes, pas besoin d'email
        });
    }
    
    /**
     * Crée une notification de mention
     * @param {string} mentionedUserId - ID de l'utilisateur mentionné
     * @param {string} mentioningUserId - ID de l'utilisateur qui mentionne
     * @param {string} text - Texte contenant la mention
     * @param {Object} source - Informations sur la source (id, model, url)
     * @returns {Promise<Object>} La notification créée
     */
    static async createMentionNotification(mentionedUserId, mentioningUserId, text, source) {
        try {
            const mentioningUser = await User.findById(mentioningUserId);
            const title = `${mentioningUser.name} vous a mentionné`;
            const message = text.length > 100 ? text.substring(0, 97) + '...' : text;
            
            return this.create(mentionedUserId, 'mention', title, message, {
                sourceId: source.id,
                sourceModel: source.model,
                sourceUrl: source.url,
                sendEmail: true
            });
        } catch (error) {
            console.error('Erreur lors de la création de la notification de mention:', error);
            throw error;
        }
    }
    
    /**
     * Crée une notification de problème de compte
     * @param {string} userId - ID de l'utilisateur
     * @param {string} issue - Description du problème
     * @param {string} severity - Gravité (warning, error, info)
     * @returns {Promise<Object>} La notification créée
     */
    static async createAccountIssueNotification(userId, issue, severity = 'warning') {
        const title = severity === 'error' ? 
            'Problème critique sur votre compte' : 
            'Information sur votre compte';
            
        return this.create(userId, 'account', title, issue, {
            sendEmail: true
        });
    }
}

module.exports = NotificationService; 