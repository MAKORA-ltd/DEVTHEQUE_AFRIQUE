// Module de connexion et gestion de la base de données MongoDB
class Database {
    constructor() {
        // Importation dynamique de MongoDB en fonction de l'environnement
        this.mongodb = null;
        this.client = null;
        this.db = null;
        this.connected = false;
        this.collections = {};
        
        // Initialiser la connexion
        this.init();
    }
    
    async init() {
        try {
            // En environnement navigateur, utiliser l'API MongoDB
            if (typeof window !== 'undefined') {
                this.baseUrl = '/api'; // URL de base pour les requêtes API
                console.log("Mode client: Utilisation de l'API REST pour MongoDB");
                return true;
            } 
            // En environnement Node.js (pour le backend)
            else {
                const { MongoClient } = require('mongodb');
                const config = require('./config');
                
                this.client = new MongoClient(config.mongoURI);
                await this.client.connect();
                this.db = this.client.db();
                
                // Initialiser les collections
                Object.keys(config.collections).forEach(key => {
                    this.collections[key] = this.db.collection(config.collections[key]);
                });
                
                console.log("Mode serveur: Connexion MongoDB établie");
                return true;
            }
        } catch (err) {
            console.error("Erreur de connexion à MongoDB:", err);
            return false;
        }
    }
    
    // Méthodes d'accès aux données (côté client)
    
    // Utilisateurs
    async getUser(email) {
        try {
            const response = await fetch(`${this.baseUrl}/users?email=${email}`);
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la récupération de l'utilisateur:", err);
            return null;
        }
    }
    
    async createUser(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la création de l'utilisateur:", err);
            return null;
        }
    }
    
    async updateUser(id, updates) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
            return null;
        }
    }
    
    // Documents
    async getDocuments(filter = {}) {
        try {
            const queryParams = new URLSearchParams(filter).toString();
            const response = await fetch(`${this.baseUrl}/documents?${queryParams}`);
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la récupération des documents:", err);
            return [];
        }
    }
    
    async getDocument(id) {
        try {
            const response = await fetch(`${this.baseUrl}/documents/${id}`);
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la récupération du document:", err);
            return null;
        }
    }
    
    // Formations
    async getCourses(filter = {}) {
        try {
            const queryParams = new URLSearchParams(filter).toString();
            const response = await fetch(`${this.baseUrl}/courses?${queryParams}`);
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la récupération des formations:", err);
            return [];
        }
    }
    
    async getCourse(id) {
        try {
            const response = await fetch(`${this.baseUrl}/courses/${id}`);
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la récupération de la formation:", err);
            return null;
        }
    }
    
    // Achats et points
    async processPurchase(userId, itemDetails) {
        try {
            const response = await fetch(`${this.baseUrl}/purchases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId,
                    ...itemDetails,
                    date: new Date().toISOString()
                })
            });
            return await response.json();
        } catch (err) {
            console.error("Erreur lors du traitement de l'achat:", err);
            return { success: false, error: err.message };
        }
    }
    
    async getUserPurchases(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/purchases?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la récupération des achats:", err);
            return [];
        }
    }
    
    async addPoints(userId, points, source) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}/points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    points,
                    source,
                    date: new Date().toISOString()
                })
            });
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de l'ajout de points:", err);
            return { success: false, error: err.message };
        }
    }
    
    // Tâches sociales
    async getSocialTasks(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/tasks?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la récupération des tâches sociales:", err);
            return [];
        }
    }
    
    async completeSocialTask(userId, task) {
        try {
            const response = await fetch(`${this.baseUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId,
                    task,
                    completedAt: new Date().toISOString()
                })
            });
            return await response.json();
        } catch (err) {
            console.error("Erreur lors de la complétion de la tâche sociale:", err);
            return { success: false, error: err.message };
        }
    }
}

// Créer une instance unique
const db = new Database();

// Exporter la base de données
if (typeof module !== 'undefined' && module.exports) {
    module.exports = db;
} 