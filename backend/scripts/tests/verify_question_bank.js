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
        console.log('Connected.');

        const TEST_SUBJECT = 'CS3451';

        // Ensure dummy syllabus exists
        const syllabus = await Syllabus.findOne({ subjectCode: TEST_SUBJECT });
        if (!syllabus) {
            console.log('Creating dummy syllabus...');
            await Syllabus.create({
                subjectCode: TEST_SUBJECT,
                subjectName: 'Test Subject',
                semester: 4,
                units: [{
                    unitNumber: 1,
                    unitTitle: 'Test Unit',
                    topics: [{ topicName: 'Test Topic', subtopics: [] }]
                }]
            });
        }

        // 2. Clear existing questions
        await Question.deleteMany({ subjectCode: TEST_SUBJECT });
        console.log('Cleared existing questions.');

        // 3. Test Bulk Generation (Controller Direct Call)
        console.log('3. Generating questions via Controller...');
        const reqGen = {
            body: {
                subjectCode: TEST_SUBJECT,
                unit: 1,
                count: 2, // Generate just a few
                difficulty: 'medium'
            },
            query: { async: 'false' }
        };
        const resGen = mockRes();

        await questionController.generateBulkQuestions(reqGen, resGen);
        console.log('Generation Response:', resGen.data);

        // Verify DB
        const count = await Question.countDocuments({ subjectCode: TEST_SUBJECT });
        console.log(`DB Count after generation: ${count}`);

        if (count === 0) {
            throw new Error('No questions saved to DB');
        }

        const dbQs = await Question.find({ subjectCode: TEST_SUBJECT });
        console.log('DB Questions Preview:', JSON.stringify(dbQs.map(q => ({ topic: q.topic, diff: q.difficulty, unit: q.unit })), null, 2));

        // 4. Test Practice Session (Should fetch from Bank)
        console.log('4. Starting Practice Session...');
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
        const sessionData = resPractice.data || resPractice; // Handle case where json() wasn't called or mocked differently

        console.log('Session Response Data:', JSON.stringify(sessionData, null, 2));

        if (sessionData && sessionData.questions && sessionData.questions.length > 0) {
            const firstQ = sessionData.questions[0];
            console.log('Session Question:', {
                id: firstQ.questionId,
                fromBank: firstQ.fromBank,
                text: firstQ.question.substring(0, 50) + '...'
            });

            if (firstQ.fromBank) {
                console.log('SUCCESS: Question fetched from Bank!');
            } else {
                console.log('WARNING: Question NOT fetched from Bank (Fallback used?)');
            }
        } else {
            console.log('ERROR: No questions returned in session');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        // Cleanup
        // await Question.deleteMany({ subjectCode: 'CSTEST101' });
        await mongoose.disconnect();
    }
}

runTest();
