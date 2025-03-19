const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: [true, 'Le titre est requis']
    },
    description: {
        type: String,
        required: [true, 'La description est requise']
    },
    niveau: {
        type: String,
        enum: ['débutant', 'intermédiaire', 'avancé'],
        required: true
    },
    technologies: [String],
    duree: String,
    prix: Number,
    image: String,
    formateur: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Formation', formationSchema); 