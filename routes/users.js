// Ajout de points à un utilisateur
router.post('/:userId/points', auth, async (req, res) => {
    try {
        const { points, source, date, createNotification } = req.body;
        
        // Mise à jour de l'utilisateur avec les nouveaux points
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $inc: { points: points } },
            { new: true }
        );
        
        // Enregistrement de la transaction
        const transaction = new PointTransaction({
            user: req.params.userId,
            points,
            source,
            date: date || new Date()
        });
        
        await transaction.save();
        
        // Créer une notification si demandé
        if (createNotification) {
            await NotificationService.createPointsNotification(
                req.params.userId,
                points,
                source
            );
        }
        
        res.json({ success: true, points: user.points });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}); 