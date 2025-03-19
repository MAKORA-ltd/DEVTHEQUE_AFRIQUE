const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Importer les modèles
const CommunityFile = require('../models/CommunityFile');
const Question = require('../models/Question');
const User = require('../models/User');
const Tag = require('../models/Tag');

// Configuration de Cloudinary pour les uploads
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dev-theque-afrique/community',
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'rar', 'txt', 'md', 'jpg', 'jpeg', 'png']
    }
});
const upload = multer({ storage: storage });

// Route pour récupérer les statistiques de la communauté
router.get('/stats', auth, async (req, res) => {
    try {
        const uploadsCount = await CommunityFile.countDocuments();
        const downloadsCount = await CommunityFile.aggregate([
            { $group: { _id: null, total: { $sum: "$downloads" } } }
        ]);
        const questionsCount = await Question.countDocuments();
        const activeUsersCount = await User.countDocuments({ 
            $or: [
                { "communityFiles.0": { $exists: true } },
                { "questions.0": { $exists: true } }
            ]
        });
        
        res.json({
            uploads: uploadsCount,
            downloads: downloadsCount.length > 0 ? downloadsCount[0].total : 0,
            questions: questionsCount,
            activeUsers: activeUsersCount
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
});

// Route pour récupérer les contributions (fichiers et questions)
router.get('/contributions', auth, async (req, res) => {
    try {
        const { filter = 'popular', limit = 6, tag } = req.query;
        
        // Préparer les filtres de recherche
        const fileFilter = {};
        const questionFilter = {};
        
        // Filtre par tag si spécifié
        if (tag) {
            fileFilter.tags = tag;
            questionFilter.tags = tag;
        }
        
        // Récupérer les fichiers
        let filesQuery = CommunityFile.find(fileFilter)
            .populate('author', 'name')
            .select('title author category fileUrl fileExtension downloads rating points createdAt');
            
        // Trier selon le filtre
        if (filter === 'popular') {
            filesQuery = filesQuery.sort({ downloads: -1 });
        } else if (filter === 'recent') {
            filesQuery = filesQuery.sort({ createdAt: -1 });
        } else if (filter === 'downloads') {
            filesQuery = filesQuery.sort({ downloads: -1 });
        }
        
        // Récupérer les questions
        let questionsQuery = Question.find(questionFilter)
            .populate('author', 'name')
            .populate('answers')
            .select('title author category answers solved createdAt');
            
        // Trier selon le filtre
        if (filter === 'popular') {
            questionsQuery = questionsQuery.sort({ 'answers.length': -1 });
        } else if (filter === 'recent') {
            questionsQuery = questionsQuery.sort({ createdAt: -1 });
        }
        
        // Exécuter les requêtes
        const [files, questions] = await Promise.all([
            filesQuery.limit(Math.ceil(limit * 0.7)).exec(),
            questionsQuery.limit(Math.ceil(limit * 0.3)).exec()
        ]);
        
        // Formater les résultats
        const formattedFiles = files.map(file => ({
            _id: file._id,
            title: file.title,
            author: file.author.name,
            category: file.category,
            type: 'file',
            fileExtension: file.fileExtension,
            downloads: file.downloads,
            rating: file.rating,
            points: file.points,
            createdAt: file.createdAt
        }));
        
        const formattedQuestions = questions.map(question => ({
            _id: question._id,
            title: question.title,
            author: question.author.name,
            category: question.category,
            type: 'question',
            responseCount: question.answers.length,
            solved: question.solved,
            createdAt: question.createdAt
        }));
        
        // Combiner et trier les résultats
        let combinedResults = [...formattedFiles, ...formattedQuestions];
        
        if (filter === 'popular') {
            combinedResults.sort((a, b) => {
                if (a.type === 'file' && b.type === 'file') {
                    return b.downloads - a.downloads;
                } else if (a.type === 'question' && b.type === 'question') {
                    return b.responseCount - a.responseCount;
                } else if (a.type === 'file' && b.type === 'question') {
                    return b.responseCount * 5 - a.downloads;
                } else {
                    return a.downloads - b.responseCount * 5;
                }
            });
        } else if (filter === 'recent') {
            combinedResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        // Limiter le nombre total de résultats
        combinedResults = combinedResults.slice(0, limit);
        
        res.json(combinedResults);
    } catch (error) {
        console.error('Erreur lors de la récupération des contributions:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des contributions' });
    }
});

// Route pour récupérer les tags tendances
router.get('/trending-tags', auth, async (req, res) => {
    try {
        const tags = await Tag.aggregate([
            { $project: { name: 1, count: { $size: "$files" } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);
        
        res.json(tags);
    } catch (error) {
        console.error('Erreur lors de la récupération des tags:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tags' });
    }
});

// Route pour uploader un fichier
router.post('/files/upload', auth, upload.single('file'), async (req, res) => {
    try {
        const { title, description, category, points, tags } = req.body;
        const fileUrl = req.file.path;
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        
        // Créer un nouveau fichier communautaire
        const newFile = new CommunityFile({
            title,
            description,
            author: req.user.id,
            category,
            fileUrl,
            fileExtension,
            points: parseInt(points),
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status: 'pending' // En attente de validation
        });
        
        await newFile.save();
        
        // Mettre à jour les tags
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            for (const tagName of tagArray) {
                await Tag.findOneAndUpdate(
                    { name: tagName },
                    { $addToSet: { files: newFile._id } },
                    { upsert: true, new: true }
                );
            }
        }
        
        // Mettre à jour l'utilisateur
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { communityFiles: newFile._id } }
        );
        
        res.status(201).json({ 
            message: 'Fichier uploadé avec succès',
            file: newFile
        });
    } catch (error) {
        console.error('Erreur lors de l\'upload du fichier:', error);
        res.status(500).json({ message: 'Erreur lors de l\'upload du fichier' });
    }
});

// Route pour obtenir un fichier spécifique
router.get('/files/:id', auth, async (req, res) => {
    try {
        const file = await CommunityFile.findById(req.params.id)
            .populate('author', 'name avatar')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'name avatar'
                }
            });
        
        if (!file) {
            return res.status(404).json({ message: 'Fichier non trouvé' });
        }
        
        res.json(file);
    } catch (error) {
        console.error('Erreur lors de la récupération du fichier:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du fichier' });
    }
});

// Route pour télécharger un fichier
router.post('/files/:id/download', auth, async (req, res) => {
    try {
        const file = await CommunityFile.findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ message: 'Fichier non trouvé' });
        }
        
        // Vérifier si le fichier est approuvé
        if (file.status !== 'approved') {
            return res.status(403).json({ message: 'Ce fichier n\'est pas encore approuvé pour le téléchargement' });
        }
        
        // Vérifier si l'utilisateur a déjà téléchargé ce fichier
        const user = await User.findById(req.user.id);
        const alreadyDownloaded = user.downloads.some(
            d => d.file.toString() === file._id.toString() && d.documentModel === 'CommunityFile'
        );
        
        // Si l'utilisateur n'est pas l'auteur et n'a pas déjà téléchargé, vérifier les points
        if (file.author.toString() !== user._id.toString() && !alreadyDownloaded) {
            // Vérifier si l'utilisateur a suffisamment de points
            if (user.points < file.points) {
                return res.status(402).json({ 
                    message: 'Points insuffisants',
                    required: file.points,
                    available: user.points
                });
            }
            
            // Déduire les points
            user.points -= file.points;
            user.pointsHistory.push({
                amount: -file.points,
                reason: `Téléchargement du fichier: ${file.title}`
            });
            
            // Ajouter des points à l'auteur
            const author = await User.findById(file.author);
            if (author) {
                const pointsToAdd = Math.floor(file.points * 0.8); // 80% des points vont à l'auteur
                author.points += pointsToAdd;
                author.pointsHistory.push({
                    amount: pointsToAdd,
                    reason: `Quelqu'un a téléchargé votre fichier: ${file.title}`
                });
                await author.save();
            }
        }
        
        // Enregistrer le téléchargement si ce n'est pas déjà fait
        if (!alreadyDownloaded) {
            // Ajouter à l'historique de téléchargement de l'utilisateur
            user.downloads.push({
                file: file._id,
                documentModel: 'CommunityFile',
                date: Date.now()
            });
            
            // Incrémenter le compteur de téléchargements du fichier
            file.downloads += 1;
            await file.save();
        }
        
        await user.save();
        
        res.json({
            success: true,
            fileUrl: file.fileUrl,
            message: 'Téléchargement réussi'
        });
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error);
        res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
    }
});

// Route pour évaluer un fichier
router.post('/files/:id/review', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Une note entre 1 et 5 est requise' });
        }
        
        const file = await CommunityFile.findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ message: 'Fichier non trouvé' });
        }
        
        // Vérifier si l'utilisateur a déjà évalué ce fichier
        const existingReviewIndex = file.reviews.findIndex(
            review => review.user.toString() === req.user.id
        );
        
        if (existingReviewIndex !== -1) {
            // Mettre à jour l'évaluation existante
            file.reviews[existingReviewIndex].rating = rating;
            file.reviews[existingReviewIndex].comment = comment || '';
        } else {
            // Ajouter une nouvelle évaluation
            file.reviews.push({
                user: req.user.id,
                rating,
                comment: comment || ''
            });
        }
        
        // Recalculer la note moyenne
        const totalRating = file.reviews.reduce((sum, review) => sum + review.rating, 0);
        file.rating = totalRating / file.reviews.length;
        
        await file.save();
        
        res.json({
            success: true,
            message: 'Évaluation enregistrée avec succès',
            newRating: file.rating
        });
    } catch (error) {
        console.error('Erreur lors de l\'évaluation du fichier:', error);
        res.status(500).json({ message: 'Erreur lors de l\'évaluation du fichier' });
    }
});

// Route pour les modérateurs - approuver un fichier
router.patch('/files/:id/moderate', auth, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        
        // Vérifier si l'utilisateur est modérateur ou admin
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
            return res.status(403).json({ message: 'Accès refusé' });
        }
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }
        
        const file = await CommunityFile.findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ message: 'Fichier non trouvé' });
        }
        
        file.status = status;
        
        // Enregistrement du motif de rejet si applicable
        if (status === 'rejected' && rejectionReason) {
            file.rejectionReason = rejectionReason;
        }
        
        await file.save();
        
        // Notifier l'auteur du fichier
        const author = await User.findById(file.author);
        if (author) {
            // Ici, vous pourriez implémenter un système de notification
            // par exemple en ajoutant une entrée dans une collection "notifications"
        }
        
        res.json({
            success: true,
            message: `Fichier ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`
        });
    } catch (error) {
        console.error('Erreur lors de la modération du fichier:', error);
        res.status(500).json({ message: 'Erreur lors de la modération du fichier' });
    }
});

// Route pour poser une question
router.post('/questions', auth, upload.single('image'), async (req, res) => {
    try {
        const { title, content, category, tags, relatedFileId } = req.body;
        
        // Créer une nouvelle question
        const newQuestion = new Question({
            title,
            content,
            author: req.user.id,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            relatedFile: relatedFileId || null,
            imageUrl: req.file ? req.file.path : null
        });
        
        await newQuestion.save();
        
        // Mettre à jour les tags
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            for (const tagName of tagArray) {
                await Tag.findOneAndUpdate(
                    { name: tagName },
                    { $addToSet: { questions: newQuestion._id } },
                    { upsert: true, new: true }
                );
            }
        }
        
        // Mettre à jour l'utilisateur
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { questions: newQuestion._id } }
        );
        
        res.status(201).json({ 
            message: 'Question posée avec succès',
            question: newQuestion
        });
    } catch (error) {
        console.error('Erreur lors de la création de la question:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la question' });
    }
});

// Route pour répondre à une question
router.post('/questions/:id/answer', auth, async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Le contenu de la réponse est requis' });
        }
        
        const question = await Question.findById(req.params.id);
        
        if (!question) {
            return res.status(404).json({ message: 'Question non trouvée' });
        }
        
        // Créer une nouvelle réponse
        const newAnswer = new Answer({
            content,
            author: req.user.id,
            question: question._id
        });
        
        await newAnswer.save();
        
        // Mettre à jour la question avec la nouvelle réponse
        question.answers.push(newAnswer._id);
        await question.save();
        
        // Mettre à jour l'utilisateur
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { answers: newAnswer._id } }
        );
        
        res.status(201).json({ 
            message: 'Réponse publiée avec succès',
            answer: newAnswer
        });
    } catch (error) {
        console.error('Erreur lors de la publication de la réponse:', error);
        res.status(500).json({ message: 'Erreur lors de la publication de la réponse' });
    }
});

// Route pour marquer une réponse comme solution
router.patch('/questions/:questionId/solution/:answerId', auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        
        if (!question) {
            return res.status(404).json({ message: 'Question non trouvée' });
        }
        
        // Vérifier que l'utilisateur est l'auteur de la question
        if (question.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à marquer la solution' });
        }
        
        const answer = await Answer.findById(req.params.answerId);
        
        if (!answer) {
            return res.status(404).json({ message: 'Réponse non trouvée' });
        }
        
        // Vérifier que la réponse appartient bien à cette question
        if (answer.question.toString() !== question._id.toString()) {
            return res.status(400).json({ message: 'Cette réponse n\'appartient pas à cette question' });
        }
        
        // Marquer la question comme résolue et définir la réponse comme solution
        question.solved = true;
        question.solutionAnswer = answer._id;
        await question.save();
        
        // Mettre à jour la réponse
        answer.isSolution = true;
        await answer.save();
        
        // Récompenser l'auteur de la réponse avec des points
        const pointsReward = 50; // Nombre de points de récompense
        
        const answerAuthor = await User.findById(answer.author);
        if (answerAuthor) {
            answerAuthor.points += pointsReward;
            answerAuthor.pointsHistory.push({
                amount: pointsReward,
                reason: `Votre réponse a été marquée comme solution à la question: ${question.title.substring(0, 30)}...`
            });
            await answerAuthor.save();
        }
        
        res.json({ 
            success: true,
            message: 'Réponse marquée comme solution'
        });
    } catch (error) {
        console.error('Erreur lors du marquage de la solution:', error);
        res.status(500).json({ message: 'Erreur lors du marquage de la solution' });
    }
});

// Route pour obtenir les fichiers d'un utilisateur
router.get('/user/files', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        const files = await CommunityFile.find({ author: user._id })
            .select('title category status downloads rating points createdAt');
        
        res.json(files);
    } catch (error) {
        console.error('Erreur lors de la récupération des fichiers de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers' });
    }
});

// Route pour obtenir les questions d'un utilisateur
router.get('/user/questions', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        const questions = await Question.find({ author: user._id })
            .select('title category solved answers createdAt');
        
        res.json(questions);
    } catch (error) {
        console.error('Erreur lors de la récupération des questions de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des questions' });
    }
});

// Route pour obtenir les statistiques personnelles
router.get('/user/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Compter les téléchargements des fichiers de l'utilisateur
        const filesStats = await CommunityFile.aggregate([
            { $match: { author: user._id } },
            { $group: { 
                _id: null, 
                totalFiles: { $sum: 1 },
                totalDownloads: { $sum: '$downloads' },
                averageRating: { $avg: '$rating' }
            }}
        ]);
        
        // Compter les questions et réponses
        const questionsCount = await Question.countDocuments({ author: user._id });
        const answersCount = await Answer.countDocuments({ author: user._id });
        
        // Compter les réponses marquées comme solutions
        const solutionsCount = await Answer.countDocuments({ 
            author: user._id,
            isSolution: true
        });
        
        // Points gagnés grâce aux contributions
        let pointsEarned = 0;
        user.pointsHistory.forEach(entry => {
            if (entry.amount > 0 && (
                entry.reason.includes('téléchargé votre fichier') || 
                entry.reason.includes('réponse a été marquée comme solution')
            )) {
                pointsEarned += entry.amount;
            }
        });
        
        res.json({
            totalFiles: filesStats.length > 0 ? filesStats[0].totalFiles : 0,
            totalDownloads: filesStats.length > 0 ? filesStats[0].totalDownloads : 0,
            averageRating: filesStats.length > 0 ? filesStats[0].averageRating || 0 : 0,
            questionsCount,
            answersCount,
            solutionsCount,
            pointsEarned
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
});

module.exports = router; 