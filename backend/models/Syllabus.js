const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    // Course Information
    subjectCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    subjectName: {
        type: String,
        required: true
    },
    
    // Academic Details
    regulation: {
        type: String,
        default: 'R2021'
    },
    semester: {
        type: Number,
        required: false,
        min: 0,
        max: 8
    },
    subjectType: {
        type: String,
        enum: ['CORE', 'ELECTIVE'],
        default: 'CORE'
    },
    credits: Number,
    
    // Syllabus Structure
    units: [{
        unitNumber: {
            type: Number,
            required: true
        },
        unitTitle: {
            type: String,
            required: true
        },
        topics: [{
            topicName: {
                type: String,
                required: true
            },
            subtopics: [String],
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard'],
                default: 'medium'
            },
            estimatedHours: Number,
            keyPoints: [String],
            examples: [String],
            references: [String]
        }],
        hours: Number
    }],
    
    // Learning Outcomes
    courseObjectives: [String],
    courseOutcomes: [String],
    
    // Reference Materials
    textbooks: [{
        title: String,
        author: String,
        edition: String,
        publisher: String,
        isbn: String
    }],
    references: [{
        title: String,
        author: String,
        type: {
            type: String,
            enum: ['book', 'paper', 'website', 'video']
        },
        url: String
    }],
    
    // Exam Pattern
    examPattern: {
        internal: {
            marks: Number,
            components: [{
                name: String,
                marks: Number
            }]
        },
        external: {
            marks: Number,
            duration: String,
            questionPattern: String
        }
    },
    
    // Important Topics (for weak area detection)
    importantTopics: [{
        topic: String,
        weightage: Number, // percentage
        frequency: String // how often it appears in exams
    }],
    
    // Previous Year Questions
    previousYearQuestions: [{
        year: Number,
        month: String,
        questions: [{
            question: String,
            unit: Number,
            marks: Number,
            difficulty: String
        }]
    }],
    
    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    dataSource: {
        type: String,
        default: 'unknown'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient searches
syllabusSchema.index({ subjectCode: 1, regulation: 1 });
syllabusSchema.index({ semester: 1 });

// Static method to get all topics for a subject
syllabusSchema.statics.getAllTopics = async function(subjectCode) {
    const syllabus = await this.findOne({ subjectCode });
    if (!syllabus) return [];
    
    const topics = [];
    syllabus.units.forEach(unit => {
        unit.topics.forEach(topic => {
            topics.push({
                unit: unit.unitNumber,
                unitTitle: unit.unitTitle,
                topic: topic.topicName,
                subtopics: topic.subtopics,
                difficulty: topic.difficulty
            });
        });
    });
    
    return topics;
};

// Static method to get important topics
syllabusSchema.statics.getImportantTopics = async function(subjectCode) {
    const syllabus = await this.findOne({ subjectCode });
    return syllabus ? syllabus.importantTopics : [];
};

const Syllabus = mongoose.model('Syllabus', syllabusSchema);

module.exports = Syllabus;
