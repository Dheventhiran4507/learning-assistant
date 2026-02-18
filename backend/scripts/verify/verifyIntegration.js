const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Syllabus = require('../../models/Syllabus');
const Question = require('../../models/Question');
const { SUBJECT_MAP } = require('../../utils/textbookGenerator');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- Verification Report ---\n');

        for (const projectCode of Object.keys(SUBJECT_MAP)) {
            const syllabus = await Syllabus.findOne({ subjectCode: projectCode });
            const qCount = await Question.countDocuments({ subjectCode: projectCode });
            const textbookQCount = await Question.countDocuments({ subjectCode: projectCode, aiGenerated: false });

            console.log(`Subject: ${projectCode}`);
            console.log(`  Syllabus Found: ${!!syllabus}`);
            if (syllabus) {
                console.log(`  Subject Name: ${syllabus.subjectName}`);
                console.log(`  Textbook: ${syllabus.textbook ? syllabus.textbook.title : 'N/A'}`);
                console.log(`  Units count: ${syllabus.units.length}`);
            }
            console.log(`  Total Questions: ${qCount}`);
            console.log(`  Textbook Questions: ${textbookQCount}`);
            console.log('---------------------------');
        }

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
