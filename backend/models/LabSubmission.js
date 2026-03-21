const mongoose = require('mongoose');

const labSubmissionSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabAssessment',
        required: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    answers: [{
        questionIndex: Number,
        selectedAnswer: String,
        isCorrect: Boolean,
        timeTaken: Number // in seconds
    }],
    score: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    aiFeedback: {
        summary: String,
        strengths: [String],
        weaknesses: [String]
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index to quickly find a student's submission for a specific assessment
labSubmissionSchema.index({ assessment: 1, student: 1 }, { unique: true });

const LabSubmission = mongoose.model('LabSubmission', labSubmissionSchema);

module.exports = LabSubmission;
