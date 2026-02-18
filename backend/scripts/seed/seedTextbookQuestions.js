const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Question = require('../../models/Question');
const { generateTextbookQuestions, SUBJECT_MAP, TEXTBOOKS } = require('../../utils/textbookGenerator');

async function seedTextbookQuestions() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        for (const [projectCode, sourceCode] of Object.entries(SUBJECT_MAP)) {
            const textbookData = TEXTBOOKS[sourceCode];
            if (!textbookData) continue;

            console.log(`\nProcessing ${projectCode} (${textbookData.name})...`);

            // Clear existing non-AI generated questions for this subject to avoid duplicates
            const deleteResult = await Question.deleteMany({
                subjectCode: projectCode,
                aiGenerated: false
            });
            console.log(`Removed ${deleteResult.deletedCount} existing textbook questions.`);

            let totalInserted = 0;

            for (const unitNumber of Object.keys(textbookData.units)) {
                const unitInt = parseInt(unitNumber);
                console.log(`  Generating questions for Unit ${unitInt}...`);

                const questions = generateTextbookQuestions(projectCode, unitInt);

                if (questions.length > 0) {
                    await Question.insertMany(questions);
                    totalInserted += questions.length;
                    console.log(`    Inserted ${questions.length} questions.`);
                }
            }

            console.log(`Finished ${projectCode}. Total questions seeded: ${totalInserted}`);
        }

        console.log('\nSeeding completed successfully!');
    } catch (error) {
        console.error('Error seeding questions:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedTextbookQuestions();
