const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    tags: [String],
    imageUrl: {
        type: String,
        default: null
    },
    relatedFile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityFile',
        default: null
    },
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    solved: {
        type: Boolean,
        default: false
    },
    solutionAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer',
        default: null
    },
    views: {
        type: Number,
        default: 0
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
questionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Méthode virtuelle pour calculer le score de vote
questionSchema.virtual('voteScore').get(function() {
    return this.votes.up.length - this.votes.down.length;
});

module.exports = mongoose.model('Question', questionSchema); 