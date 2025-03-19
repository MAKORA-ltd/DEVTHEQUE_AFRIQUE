const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    votes: {
        up: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        down: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    isSolution: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pour mettre à jour le champ updatedAt avant la sauvegarde
answerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Méthode virtuelle pour calculer le score de vote
answerSchema.virtual('voteScore').get(function() {
    return this.votes.up.length - this.votes.down.length;
});

module.exports = mongoose.model('Answer', answerSchema); 