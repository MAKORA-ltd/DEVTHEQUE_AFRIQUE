// Configuration de la connexion MongoDB
const config = {
    // URI de connexion MongoDB (depuis les variables d'environnement)
    mongoURI: process.env.MONGO_URI || "mongodb+srv://username:password@cluster.mongodb.net/devtheque?retryWrites=true&w=majority",
    
    // Configuration des collections
    collections: {
        users: "users",
        documents: "documents",
        courses: "courses",
        purchases: "purchases",
        tasks: "social_tasks",
        events: "events",
        messages: "messages",
        communityFiles: "community_files",     // Nouvelle collection pour les fichiers communautaires
        questions: "questions",                // Nouvelle collection pour les questions
        answers: "answers",                    // Nouvelle collection pour les réponses
        notifications: "notifications"         // Notifications pour les modérateurs et utilisateurs
    },
    
    // Paramètres JWT pour l'authentification
    jwt: {
        secret: process.env.JWT_SECRET || "devtheque_afrique_secret_key_jwt",
        expiresIn: process.env.JWT_EXPIRE || "7d"
    }
};

// Exporter la configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} 