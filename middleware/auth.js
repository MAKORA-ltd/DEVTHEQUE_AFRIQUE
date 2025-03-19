const jwt = require('jsonwebtoken');
const config = require('../js/config');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Extraire le token du header
        const tokenHeader = req.header('Authorization');
        
        if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentification requise' });
        }
        
        const token = tokenHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Token manquant, authentification requise' });
        }
        
        // Vérifier le token
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Trouver l'utilisateur
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Ajouter l'utilisateur à la requête
        req.user = {
            id: user._id,
            role: user.role
        };
        
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré, veuillez vous reconnecter' });
        }
        res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
    }
}; 