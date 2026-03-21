const mongoose = require('mongoose');

const labAssessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    type: {
        type: String,
        enum: ['pre-lab', 'post-lab'],
        required: true,
        index: true
    },
    semester: {
        type: Number,
        required: true,
        index: true
    },
    subjectCode: {
        type: String,
        required: true,
        index: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: [String],
        correctAnswer: String,
        explanation: String,
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        }
    }],
    documentContent: {
        type: String, // Extracted text from uploaded document
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Staff are also stored in the Student model with a different role
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for faster lookups
labAssessmentSchema.index({ type: 1, semester: 1, isActive: 1 });
labAssessmentSchema.index({ subjectCode: 1, type: 1 });

const LabAssessment = mongoose.model('LabAssessment', labAssessmentSchema);

module.exports = LabAssessment;
