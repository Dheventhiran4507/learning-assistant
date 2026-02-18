const mongoose = require('mongoose');
const path = require('path');
const Syllabus = require('../../models/Syllabus');
const pdfService = require('../../services/pdfService');
const logger = require('../../utils/logger');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function syncSyllabus() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamiledu-ai');
        console.log('✅ Connected to MongoDB');

        // Check if URL is passed as argument
        const targetUrl = process.argv[2] || 'https://padeepz.net/anna-university-regulation-2021/cse/syllabus/';
        const isPdf = targetUrl.toLowerCase().endsWith('.pdf');

        let finalSubjects = [];

        if (isPdf) {
            console.log(`Processing PDF: ${targetUrl}`);
            const text = await pdfService.extractText(targetUrl);

            for (let sem = 1; sem <= 8; sem++) {
                const subjects = pdfService.parseSyllabus(text, sem);
                finalSubjects = [...finalSubjects, ...subjects];
            }
        } else if (targetUrl.includes('padeepz.net')) {
            console.log(`Scraping Padeepz Syllabus: ${targetUrl}`);
            const subjectList = await pdfService.scrapeSyllabusList(targetUrl);
            console.log(`Found ${subjectList.length} subjects in list. Scraping details...`);

            for (let i = 0; i < subjectList.length; i++) {
                const item = subjectList[i];
                try {
                    console.log(`[${i + 1}/${subjectList.length}] Scraping ${item.subjectCode}: ${item.subjectName}...`);
                    const details = await pdfService.scrapeSubjectFromUrl(item.url);

                    finalSubjects.push({
                        subjectCode: item.subjectCode,
                        subjectName: item.subjectName,
                        semester: item.semester,
                        units: details.units
                    });

                    // Small delay to be nice to the server
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (err) {
                    console.warn(`⚠️ Failed to scrape ${item.subjectCode}: ${err.message}`);
                }
            }
        }

        // Deduplicate subjects by code
        const uniqueSubjects = {};
        finalSubjects.forEach(s => {
            uniqueSubjects[s.subjectCode] = s;
        });

        const subjectsToUpdate = Object.values(uniqueSubjects);
        console.log(`Total subjects to sync: ${subjectsToUpdate.length}`);

        if (subjectsToUpdate.length === 0) {
            console.warn('⚠️ No subjects found to update.');
            process.exit(0);
        }

        // Update Database
        console.log('Updating database...');
        let updatedCount = 0;
        let createdCount = 0;

        for (const subjectData of subjectsToUpdate) {
            const subject = await Syllabus.findOneAndUpdate(
                { subjectCode: subjectData.subjectCode },
                {
                    $set: {
                        subjectName: subjectData.subjectName,
                        units: subjectData.units,
                        semester: subjectData.semester,
                        isActive: true,
                        lastUpdated: new Date()
                    }
                },
                { upsert: true, new: true }
            );

            // Check if it's a new document
            if (subject.createdAt && (new Date().getTime() - subject.createdAt.getTime() < 5000)) {
                createdCount++;
            } else {
                updatedCount++;
            }
        }

        console.log(`✅ Sync Complete: ${updatedCount} updated, ${createdCount} created.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncSyllabus();
