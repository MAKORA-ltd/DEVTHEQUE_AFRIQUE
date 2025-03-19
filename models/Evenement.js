const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
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
        enum: ['hackathon', 'webinaire', 'workshop', 'conference'],
        required: true
    },
    date: {
        type: Date,
        required: [true, 'La date est requise']
    },
    lieu: {
        type: String,
        default: 'En ligne'
    },
    image: String,
    organisateur: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    maxParticipants: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Evenement', evenementSchema); 