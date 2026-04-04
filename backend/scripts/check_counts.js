const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Syllabus = require('../models/Syllabus');

async function checkSyllabusCounts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const subjects = await Syllabus.find({});
        console.log(`Total subjects in DB: ${subjects.length}`);
        
        const counts = {};
        subjects.forEach(s => {
            const unitCount = s.units ? s.units.length : 0;
            counts[unitCount] = (counts[unitCount] || 0) + 1;
            if (unitCount < 5) {
                console.log(`Subject with < 5 units: ${s.subjectCode} (${unitCount} units)`);
            }
        });
        
        console.log('Unit Count Distribution:', counts);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkSyllabusCounts();
