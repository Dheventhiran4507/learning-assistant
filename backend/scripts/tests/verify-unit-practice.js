const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const API_URL = 'http://localhost:5000/api';

const login = async () => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'tamiledu.student@gmail.com',
            password: 'password123'
        });
        return response.data.data.token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

const verifyUnitPractice = async () => {
    const token = await login();
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Using GE3151 from Semester 1 which matches the test user's semester
    const subjectCode = 'GE3151';
    const unit = 1;

    console.log(`\nTesting Unit-Wise Practice (Unit Only) for ${subjectCode}, Unit ${unit}...`);

    try {
        // 1. Start Practice Session (Unit Only, topic = null)
        console.log('Starting practice session...');
        const practiceRes = await axios.post(`${API_URL}/practice/start`, {
            subjectCode,
            difficulty: 'medium',
            practiceType: 'unit_based',
            unit: unit,
            topic: null
        }, config);

        if (practiceRes.data.success) {
            console.log('✅ Practice Session Started Successfully!');
            const session = practiceRes.data.data;
            console.log(`Session ID: ${session.sessionId}`);
            console.log(`Questions Generated: ${session.questions.length}`);

            if (session.questions.length > 0) {
                const firstQ = session.questions[0];
                console.log(`First Question: ${firstQ.question}`);
                console.log(`First Question Topic: ${firstQ.topic}`);
                console.log(`First Question Unit: ${firstQ.unit}`);

                if (firstQ.unit === unit) {
                    console.log('✅ Unit Filtering Verified!');
                } else {
                    console.log(`❌ Unit Filtering Mismatch! Expected ${unit}, got ${firstQ.unit}`);
                }
            } else {
                console.log('❌ No questions generated.');
            }
        } else {
            console.log('❌ Failed to start practice session');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    }
};

verifyUnitPractice();
