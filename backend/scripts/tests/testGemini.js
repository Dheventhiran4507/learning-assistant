const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing Gemini API with Key:', apiKey ? 'FOUND (starts with ' + apiKey.substring(0, 5) + '...)' : 'NOT FOUND');

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
        console.error('❌ Error: GEMINI_API_KEY is missing or is the placeholder value.');
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        console.log('\n--- Listing Available Models ---');

        // Manual fetch to list models since SDK might hide details
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);

        console.log('Available Models:');
        response.data.models.forEach(m => {
            console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
        });

    } catch (error) {
        console.error('❌ Failed to list models:', error.response ? error.response.data : error.message);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-1.5-flash as it is most likely to work with modern keys
        const modelsToTry = ["gemma-3-12b-it", "gemma-3-4b-it", "gemini-flash-latest"];

        for (const modelName of modelsToTry) {
            try {
                console.log(`\n--- Trying model: ${modelName} ---`);
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = "Hello, are you functional? Respond with a short 'Yes, I am working!' if you are.";
                console.log(`Sending prompt: "${prompt}"`);

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                console.log('\n--- Response ---');
                console.log(text);
                console.log('----------------\n');
                console.log(`✅ Gemini API is working with model: ${modelName}!`);
                return; // Exit if one works
            } catch (error) {
                console.error(`❌ Model ${modelName} failed:`, error.message);
            }
        }
        console.error('\n❌ All attempted models failed.');
    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        if (error.message.includes('API_KEY_INVALID')) {
            console.error('👉 The API Key provided is invalid.');
        } else if (error.message.includes('MODEL_NOT_FOUND')) {
            console.error('👉 The model name might be incorrect or not accessible with this key.');
        }
    }
}

testGemini();
