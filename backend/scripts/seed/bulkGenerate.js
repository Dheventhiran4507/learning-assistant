const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Syllabus = require('../../models/Syllabus');
const Question = require('../../models/Question');
const { spawn } = require('child_process');

async function bulkGenerate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const syllabuses = await Syllabus.find({});
        const subjectsToProcess = [];

        console.log('Analyzing missing coverage...');

        for (const s of syllabuses) {
            let needsProcessing = false;
            for (const unit of s.units) {
                const count = await Question.countDocuments({
                    subjectCode: s.subjectCode,
                    unit: unit.unitNumber
                });
                if (count < 50) {
                    needsProcessing = true;
                    break;
                }
            }
            if (needsProcessing) {
                subjectsToProcess.push(s.subjectCode);
            } else {
                console.log(`   - ${s.subjectCode} already has sufficient coverage.`);
            }
        }

        console.log(`\nFound ${subjectsToProcess.length} subjects with missing units: ${subjectsToProcess.join(', ')}`);

        if (subjectsToProcess.length === 0) {
            console.log('All subjects have at least some questions.');
            return;
        }

        const subjectBatchSize = 3;
        for (let i = 0; i < subjectsToProcess.length; i += subjectBatchSize) {
            const batch = subjectsToProcess.slice(i, i + subjectBatchSize);
            console.log(`\n>>> Starting parallel generation for subjects: ${batch.join(', ')}...`);

            await Promise.all(batch.map(code =>
                runProcess('node', [path.join(__dirname, 'generateQuestions.js'), code])
                    .catch(err => console.error(`Error processing ${code}:`, err.message))
            ));
        }

        console.log('\n--- Bulk Generation Job Completed ---');

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

function runProcess(command, args) {
    return new Promise((resolve, reject) => {
        const p = spawn(command, args, { stdio: 'inherit' });
        p.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Process exited with code ${code}`));
        });
    });
}

bulkGenerate();
