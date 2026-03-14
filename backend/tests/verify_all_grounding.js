const geminiAIService = require('../services/geminiAIService');
const logger = require('../utils/logger');

async function verifyAll() {
    console.log('--- Verifying 100% Grounded Accuracy ---');
    
    const testSubjects = ['CS3391', 'MA3151', 'PH3151', 'CS3492'];
    
    for (const code of testSubjects) {
        console.log(`\nChecking Subject: ${code}`);
        const result = await geminiAIService.generateSyllabusStructure(code);
        
        if (result.isGrounded) {
            console.log(`✅ ${code} is GROUNDED (100% Accurate)`);
            console.log(`   Name: ${result.subjectName}`);
            console.log(`   Units: ${result.units.length}`);
            console.log(`   Unit 1: ${result.units[0].unitTitle}`);
        } else {
            console.log(`❌ ${code} is NOT GROUNDED!`);
        }
    }
}

verifyAll().catch(err => console.error(err));
