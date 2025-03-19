const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../js/config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    points: {
        type: Number,
        default: 500  // Points de bienvenue
    },
    pointsHistory: [{
        amount: Number,
        reason: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    purchases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase'
    }],
    downloads: [{
        file: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'documentModel'
        },
        documentModel: {
            type: String,
            enum: ['Document', 'CommunityFile']
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    communityFiles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityFile'
    }],
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    favoriteFiles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityFile'
    }],
    favoriteQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    socialTasks: {
        youtube: { type: Boolean, default: false },
        twitter: { type: Boolean, default: false },
        instagram: { type: Boolean, default: false },
        telegram: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: false }
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

// Middleware pour hashage du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
    this.updatedAt = Date.now();
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Méthode pour générer un JWT
userSchema.methods.generateToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role }, 
        config.jwt.secret, 
        { expiresIn: config.jwt.expiresIn }
    );
};

module.exports = mongoose.model('User', userSchema); 