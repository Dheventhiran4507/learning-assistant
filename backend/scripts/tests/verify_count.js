const mongoose = require('mongoose');
const Question = require('../../models/Question');
const Syllabus = require('../../models/Syllabus');
const questionController = require('../../controllers/questionController');
const practiceController = require('../../controllers/practiceController');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Mock Express Request/Response
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function runTest() {
    try {
        console.log('1. Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamiledu-ai');

        const TEST_SUBJECT = 'CS3451';

        // 4. Test Practice Session (Should fetch multiple questions now)
        console.log('4. Starting Practice Session for single topic...');
        const reqPractice = {
            body: {
                subjectCode: TEST_SUBJECT,
                unit: 1,
                difficulty: 'medium'
            },
            user: { id: '507f1f77bcf86cd799439011' }
        };
        const resPractice = mockRes();

        await practiceController.startSession(reqPractice, resPractice);
        let sessionData = resPractice.data || resPractice;
        if (sessionData.data) sessionData = sessionData.data;

        if (sessionData && sessionData.questions) {
            console.log(`Questions Returned: ${sessionData.questions.length}`);
            if (sessionData.questions.length > 1) {
                console.log('SUCCESS: Multiple questions returned!');
                sessionData.questions.forEach((q, i) => {
                    console.log(`Q${i + 1}: ${q.question.substring(0, 30)}... (Bank: ${q.fromBank})`);
                });
            } else {
                console.log('WARNING: Still only 1 question returned.');
            }
        } else {
            console.log('ERROR: No questions returned');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
