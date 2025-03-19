const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configuration de Cloudinary pour le stockage des images
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dev-theque-afrique',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

const upload = multer({ storage: storage });

// Routes d'authentification
router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);
        res.status(201).json({ success: true, token });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Identifiants invalides' });
        }
        const token = generateToken(user._id);
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Routes pour les projets
router.post('/projects', protect, upload.single('image'), async (req, res) => {
    try {
        const project = await Project.create({
            ...req.body,
            image: req.file.path,
            creator: req.user.id
        });
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find().populate('creator', 'name');
        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Routes pour les formations
router.post('/formations', protect, upload.single('image'), async (req, res) => {
    try {
        const formation = await Formation.create({
            ...req.body,
            image: req.file ? req.file.path : null,
            formateur: req.user.id
        });
        res.status(201).json({ success: true, data: formation });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/formations', async (req, res) => {
    try {
        const formations = await Formation.find().populate('formateur', 'name');
        res.status(200).json({ success: true, data: formations });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Routes pour les événements
router.post('/evenements', protect, upload.single('image'), async (req, res) => {
    try {
        const evenement = await Evenement.create({
            ...req.body,
            image: req.file ? req.file.path : null,
            organisateur: req.user.id
        });
        res.status(201).json({ success: true, data: evenement });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/evenements', async (req, res) => {
    try {
        const evenements = await Evenement.find()
            .populate('organisateur', 'name')
            .sort('date');
        res.status(200).json({ success: true, data: evenements });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Routes pour les opportunités
router.post('/opportunites', protect, async (req, res) => {
    try {
        const opportunite = await Opportunite.create(req.body);
        res.status(201).json({ success: true, data: opportunite });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/opportunites', async (req, res) => {
    try {
        const opportunites = await Opportunite.find()
            .sort('-createdAt');
        res.status(200).json({ success: true, data: opportunites });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Exemple d'une route complète pour les téléchargements utilisant MongoDB
router.post('/documents/download/:id', auth, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }
        
        // Vérifier si l'utilisateur a suffisamment de points
        const user = await User.findById(req.user.id);
        
        if (user.points < document.points) {
            return res.status(402).json({ 
                message: 'Points insuffisants',
                required: document.points,
                available: user.points
            });
        }
        
        // Déduire les points
        user.points -= document.points;
        user.pointsHistory.push({
            amount: -document.points,
            reason: `Téléchargement du document: ${document.title}`
        });
        
        // Ajouter à l'historique de téléchargement
        user.downloads.push({
            file: document._id,
            documentModel: 'Document',
            date: Date.now()
        });
        
        await user.save();
        
        // Incrémenter le compteur de téléchargements
        document.downloads += 1;
        await document.save();
        
        res.json({
            success: true,
            fileUrl: document.fileUrl,
            newBalance: user.points
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 