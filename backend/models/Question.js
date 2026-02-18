const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true,
        index: true,
        uppercase: true,
        trim: true
    },
    unit: {
        type: Number,
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['mcq', 'descriptive'],
        default: 'mcq'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String // Feedback/Reasoning for the answer
    },
    aiGenerated: {
        type: Boolean,
        default: true
    },
    generationId: {
        type: String // To group questions generated in the same batch
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Composite index for efficient random fetching
questionSchema.index({ subjectCode: 1, unit: 1, topic: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
