const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Syllabus = require('../../models/Syllabus');
const { TEXTBOOKS, SUBJECT_MAP } = require('../../utils/textbookGenerator');

async function syncTextbookContent() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        for (const [projectCode, sourceCode] of Object.entries(SUBJECT_MAP)) {
            const textbookData = TEXTBOOKS[sourceCode];
            if (!textbookData) {
                console.warn(`No textbook data found for source code: ${sourceCode}`);
                continue;
            }

            console.log(`Syncing ${projectCode} (from ${sourceCode}: ${textbookData.name})...`);

            // Find existing syllabus
            let syllabus = await Syllabus.findOne({ subjectCode: projectCode });

            if (!syllabus) {
                console.warn(`Syllabus not found for ${projectCode}. Creating new one...`);
                syllabus = new Syllabus({
                    subjectCode: projectCode,
                    subjectName: textbookData.name
                });
            }

            // Update core info
            syllabus.textbook = {
                title: textbookData.textbook,
                author: textbookData.author,
                publisher: textbookData.publisher
            };

            // Map units
            const newUnits = Object.entries(textbookData.units).map(([num, u]) => ({
                unitNumber: parseInt(num),
                unitTitle: u.title,
                topics: u.topics.map(t => ({
                    topicName: t.name,
                    keyPoints: t.keyPoints,
                    importance: 'high' // All textbook topics are considered important
                }))
            }));

            syllabus.units = newUnits;
            syllabus.totalUnits = newUnits.length;

            await syllabus.save();
            console.log(`Successfully synced ${projectCode}`);
        }

        console.log('Sync completed successfully!');
    } catch (error) {
        console.error('Error syncing textbook content:', error);
    } finally {
        await mongoose.disconnect();
    }
}

syncTextbookContent();
