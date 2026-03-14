const aiService = require('../services/geminiAIService');

async function testSmartQuestions() {
    console.log('=== Testing Subject-Type Smart Question Generation ===\n');

    // Test 1: Maths Subject
    console.log('📐 TEST 1: Maths Subject (MA3351) - Expected: Formula identification questions');
    const mathContext = { subjectCode: 'MA3351', subjectName: 'Statistics & Numerical Methods', unitTitle: 'Matrices' };
    const mathQ = await aiService.generateBulkQuestions('Eigenvalues and Eigenvectors', 'medium', 2, mathContext);
    if (mathQ && mathQ.length > 0) {
        console.log('✅ Math Questions Generated:');
        mathQ.forEach((q, i) => console.log(`  Q${i+1}: ${q.question.substring(0, 100)}...`));
    } else {
        console.log('❌ Math questions failed or returned empty');
    }

    console.log('\n💻 TEST 2: Programming Subject (CS3401) - Expected: Code output questions');
    const csContext = { subjectCode: 'CS3401', subjectName: 'Operating Systems', unitTitle: 'Process Management' };
    const csQ = await aiService.generateBulkQuestions('Process Scheduling', 'medium', 2, csContext);
    if (csQ && csQ.length > 0) {
        console.log('✅ CS Questions Generated:');
        csQ.forEach((q, i) => console.log(`  Q${i+1}: ${q.question.substring(0, 120)}...`));
    } else {
        console.log('❌ CS questions failed or returned empty');
    }

    console.log('\n✅ Done!');
}

testSmartQuestions().catch(console.error);
