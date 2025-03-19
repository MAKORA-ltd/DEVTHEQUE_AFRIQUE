const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['account', 'points', 'mention', 'comment', 'search', 'document', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sourceUrl: {
        type: String,
        default: null
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'sourceModel',
        default: null
    },
    sourceModel: {
        type: String,
        enum: ['User', 'CommunityFile', 'Comment', 'Question', 'Answer', null],
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexation pour accélérer les requêtes
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema); 