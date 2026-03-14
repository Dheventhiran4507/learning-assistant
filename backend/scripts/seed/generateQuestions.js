const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Syllabus = require('../../models/Syllabus');
const Question = require('../../models/Question');
const aiService = require('../../services/geminiAIService');

const generateQuestions = async () => {
    const args = process.argv.slice(2);
    const subjectCode = args[0];
    const targetUnit = args[1] ? parseInt(args[1]) : null;

    if (!subjectCode) {
        console.error('Usage: node backend/scripts/seed/generateQuestions.js <subjectCode> [unitNumber]');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Fetch Syllabus
        const syllabus = await Syllabus.findOne({ subjectCode: subjectCode.toUpperCase() });
        if (!syllabus) {
            console.error(`Syllabus not found for subject: ${subjectCode}`);
            process.exit(1);
        }

        // 2. Identify Topics
        let topicsToProcess = [];
        syllabus.units.forEach(unit => {
            if (!targetUnit || unit.unitNumber === targetUnit) {
                unit.topics.forEach(topic => {
                    topicsToProcess.push({
                        name: topic.topicName,
                        unit: unit.unitNumber,
                        unitTitle: unit.unitTitle,
                        subjectName: syllabus.subjectName,
                        subjectCode: syllabus.subjectCode
                    });
                });
            }
        });

        console.log(`Found ${topicsToProcess.length} topics to process for ${subjectCode} (Unit: ${targetUnit || 'All'})`);

        const batchSize = 1; // Process one by one to avoid RPM limits
        for (let i = 0; i < topicsToProcess.length; i += batchSize) {
            const batch = topicsToProcess.slice(i, i + batchSize);
            console.log(`\n>>> Processing [${i + 1}/${topicsToProcess.length}]: ${batch[0].name}...`);

            try {
                const topic = batch[0];
                const questions = await aiService.generateBulkQuestions(topic.name, 'medium', 5, {
                    subjectName: topic.subjectName,
                    unitTitle: topic.unitTitle,
                    subjectCode: topic.subjectCode
                });

                if (questions && questions.length > 0) {
                    // Filter out mock questions to prevent repetitive garbage in DB
                    const qualityQuestions = questions.filter(q => !q.isMock);

                    if (qualityQuestions.length === 0) {
                        console.warn(`   ⚠️ All generated questions for "${topic.name}" were mocks. Skipping save.`);
                        continue;
                    }

                    const questionDocs = qualityQuestions.map(q => ({
                        subjectCode: subjectCode.toUpperCase(),
                        unit: topic.unit,
                        topic: topic.name,
                        type: 'mcq',
                        difficulty: 'medium',
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        aiGenerated: true
                    }));

                    await Question.insertMany(questionDocs);
                    console.log(`   ✅ Saved ${questionDocs.length} questions.`);
                } else {
                    console.warn(`   ⚠️ No questions generated.`);
                }
            } catch (err) {
                console.error(`   ❌ Failed:`, err.message);
                if (err.message.includes('429')) {
                    console.log('   🛑 Quota exceeded. Waiting 60 seconds...');
                    await new Promise(r => setTimeout(r, 60000));
                }
            }

            // Rate limit delay: 15 RPM means ~4s per request
            if (i + batchSize < topicsToProcess.length) {
                console.log('   --- Waiting 4s for API Quota (15 RPM limit) ---');
                await new Promise(r => setTimeout(r, 4000));
            }
        }

        console.log('\n--- Generation Job Completed ---');

    } catch (error) {
        console.error('General Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

generateQuestions();
