const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Syllabus = require('../models/Syllabus');
const aiService = require('../services/geminiAIService');
const logger = require('../utils/logger');

async function repairSyllabus() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const subjects = await Syllabus.find({
            $or: [
                { units: { $exists: false } },
                { units: { $size: 0 } },
                { units: { $size: 1 } },
                { units: { $size: 2 } },
                { units: { $size: 3 } },
                { units: { $size: 4 } }
            ]
        });

        console.log(`Found ${subjects.length} subjects with incomplete units (< 5).`);

        for (let i = 0; i < subjects.length; i++) {
            const subject = subjects[i];
            console.log(`[${i+1}/${subjects.length}] Repairing: ${subject.subjectCode} - ${subject.subjectName}...`);
            
            try {
                const { subjectName: aiName, units } = await aiService.generateSyllabusStructure(subject.subjectCode, subject.subjectName);
                
                if (units && units.length >= 5) {
                    subject.units = units;
                    subject.lastUpdated = new Date();
                    await subject.save();
                    console.log(`✅ Success: ${subject.subjectCode} now has ${units.length} units.`);
                } else {
                    console.log(`⚠️ Warning: AI returned only ${units ? units.length : 0} units for ${subject.subjectCode}. Using structural fallback.`);
                    const fallback = aiService.getStructuralFallback(subject.subjectCode, subject.subjectName);
                    subject.units = fallback.units;
                    subject.lastUpdated = new Date();
                    await subject.save();
                    console.log(`✅ Fallback applied for ${subject.subjectCode}.`);
                }
            } catch (err) {
                console.error(`❌ Error repairing ${subject.subjectCode}:`, err.message);
            }
        }

        console.log('Syllabus repair completed.');
        process.exit(0);
    } catch (error) {
        console.error('Critical error in repair script:', error);
        process.exit(1);
    }
}

repairSyllabus();
