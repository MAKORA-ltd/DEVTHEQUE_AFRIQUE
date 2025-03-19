const mongoose = require('mongoose');

const opportuniteSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: [true, 'Le titre est requis']
    },
    description: {
        type: String,
        required: [true, 'La description est requise']
    },
    type: {
        type: String,
        enum: ['emploi', 'stage', 'freelance'],
        required: true
    },
    entreprise: {
        type: String,
        required: [true, 'Le nom de l\'entreprise est requis']
    },
    lieu: String,
    remote: {
        type: Boolean,
        default: false
    },
    salaire: {
        min: Number,
        max: Number,
        devise: {
            type: String,
            default: 'EUR'
        }
    },
    competencesRequises: [String],
    dateExpiration: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Opportunite', opportuniteSchema); 