const mongoose = require('mongoose');
const Syllabus = require('../models/Syllabus');
require('dotenv').config({ path: '../backend/.env' });

async function verify() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tamiledu-ai');
        console.log('Connected to MongoDB');

        const subjects = await Syllabus.find({});
        console.log(`Found ${subjects.length} subjects.`);

        subjects.forEach(s => {
            const unitCount = s.units ? s.units.length : 0;
            const topicCount = s.units ? s.units.reduce((acc, u) => acc + (u.topics ? u.topics.length : 0), 0) : 0;
            console.log(`- ${s.subjectCode}: ${s.subjectName} (${unitCount} units, ${topicCount} topics)`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
