const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    
    // Conversation metadata
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    
    // Message details
    userMessage: {
        type: String,
        required: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    
    // Language detection
    detectedLanguage: {
        type: String,
        enum: ['en', 'ta', 'mixed'],
        default: 'mixed'
    },
    
    // Input method
    inputMethod: {
        type: String,
        enum: ['text', 'voice'],
        default: 'text'
    },
    
    // Intent classification
    intent: {
        type: String,
        enum: ['doubt', 'explanation', 'practice', 'exam_prep', 'general'],
        default: 'doubt'
    },
    
    // Subject classification
    subject: {
        subjectCode: String,
        subjectName: String,
        topic: String
    },
    
    // AI processing metadata
    aiMetadata: {
        model: {
            type: String,
            default: 'claude-sonnet-4-20250514'
        },
        responseTime: Number, // in milliseconds
        tokensUsed: Number,
        confidence: Number
    },
    
    // User feedback
    feedback: {
        helpful: Boolean,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        timestamp: Date
    },
    
    // Flags
    isResolved: {
        type: Boolean,
        default: false
    },
    markedForReview: {
        type: Boolean,
        default: false
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
chatSchema.index({ student: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1, createdAt: -1 });
chatSchema.index({ 'subject.subjectCode': 1 });

// Static method to get conversation history
chatSchema.statics.getConversationHistory = async function(studentId, limit = 50) {
    return await this.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-aiMetadata');
};

// Static method to get subject-specific chats
chatSchema.statics.getSubjectChats = async function(studentId, subjectCode) {
    return await this.find({
        student: studentId,
        'subject.subjectCode': subjectCode
    })
    .sort({ createdAt: -1 })
    .limit(100);
};

// Method to calculate average response time
chatSchema.statics.getAverageResponseTime = async function(studentId) {
    const result = await this.aggregate([
        { $match: { student: mongoose.Types.ObjectId(studentId) } },
        {
            $group: {
                _id: null,
                avgResponseTime: { $avg: '$aiMetadata.responseTime' }
            }
        }
    ]);
    
    return result.length > 0 ? result[0].avgResponseTime : 0;
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
