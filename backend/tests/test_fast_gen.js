const aiService = require('../services/geminiAIService');
const logger = require('../utils/logger');

async function testFastGen() {
    const topic = "Memory Management in Operating Systems";
    const context = {
        subjectCode: "CS3401",
        subjectName: "Operating Systems",
        unitTitle: "Process Management"
    };

    console.log(`🚀 Testing fast question generation for topic: ${topic}`);
    const start = Date.now();
    
    try {
        const questions = await aiService.generateBulkQuestions(topic, "medium", 5, context);
        const duration = Date.now() - start;
        
        if (questions && questions.length > 0) {
            console.log(`✅ Success! Generated ${questions.length} questions in ${duration}ms.`);
            console.log(`Used Model: ${aiService.modelName}`);
            console.log('Sample Question:', questions[0].question);
        } else {
            console.log('❌ Failed to generate questions.');
        }
    } catch (error) {
        console.error('❌ Error during test:', error.message);
    }
}

testFastGen();
