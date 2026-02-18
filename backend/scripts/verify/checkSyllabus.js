const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkSyllabus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Syllabus = mongoose.model('Syllabus', new mongoose.Schema({
            subjectCode: String,
            subjectName: String,
            units: Array
        }, { collection: 'syllabuses' })); // Use the correct collection name

        const codes = ['CS3391', 'CS3492', 'CS3451', 'CS3301'];
        for (const code of codes) {
            const s = await Syllabus.findOne({ subjectCode: code });
            console.log(`${code}: ${s ? s.subjectName : 'Not found'} | Units: ${s ? s.units.length : 'N/A'}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSyllabus();
