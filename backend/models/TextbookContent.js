const mongoose = require('mongoose');

const textbookContentSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true,
        index: true,
        uppercase: true
    },
    unitNumber: {
        type: Number,
        required: true
    },
    topicName: {
        type: String,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    keyPoints: [String],
    examples: [String],
    source: {
        type: String,
        default: 'Standard Textbook'
    }
}, {
    timestamps: true
});

// Compound index for fast retrieval of specific topic content
textbookContentSchema.index({ subjectCode: 1, unitNumber: 1, topicName: 1 });

const TextbookContent = mongoose.model('TextbookContent', textbookContentSchema);

module.exports = TextbookContent;
