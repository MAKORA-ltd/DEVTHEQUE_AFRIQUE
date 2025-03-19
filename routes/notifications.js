const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Récupérer toutes les notifications de l'utilisateur connecté
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            recipient: req.user.id 
        })
        .sort({ createdAt: -1 })
        .limit(50);

        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Marquer une notification comme lue
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }
        
        // Vérifier que la notification appartient bien à l'utilisateur
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Non autorisé' });
        }
        
        notification.isRead = true;
        await notification.save();
        
        res.json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Marquer toutes les notifications comme lues
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        
        res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Supprimer une notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }
        
        // Vérifier que la notification appartient bien à l'utilisateur
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Non autorisé' });
        }
        
        await notification.remove();
        
        res.json({ message: 'Notification supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 