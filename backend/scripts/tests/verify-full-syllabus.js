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

const verifyFullSyllabus = async () => {
    const token = await login();
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Testing with a subject that has multiple units (e.g. from seed data)
    // CS3353: C Programming (Sem 3) - usually has 5 units in full syllabus, but seed data might be partial.
    // Let's use GE3151 (Sem 1) or check syllabus first.

    try {
        // 1. Fetch Syllabus to see what's available
        console.log('Fetching syllabus for Sem 3...');
        const syllabusRes = await axios.get(`${API_URL}/syllabus/semester/3`, config);

        if (!syllabusRes.data.data || syllabusRes.data.data.length === 0) {
            throw new Error('No subjects found for Semester 3');
        }

        const subject = syllabusRes.data.data[0];
        const subjectCode = subject.subjectCode;
        console.log(`Using Subject: ${subjectCode} (${subject.subjectName})`);

        const totalTopics = subject.units.reduce((acc, u) => acc + u.topics.length, 0);
        console.log(`Subject: ${subjectCode}, Total Topics in Data: ${totalTopics}`);

        // 2. Start Full Syllabus Practice (unit = null, topic = null)
        console.log('\nStarting Full Syllabus Practice Session...');
        const practiceRes = await axios.post(`${API_URL}/practice/start`, {
            subjectCode,
            difficulty: 'medium',
            practiceType: 'unit_based',
            unit: null,
            topic: null
        }, config);

        if (practiceRes.data.success) {
            const session = practiceRes.data.data;
            console.log('✅ Practice Session Started Successfully!');
            console.log(`Session ID: ${session.sessionId}`);
            console.log(`Questions Generated: ${session.questions.length}`);

            // Check if questions cover multiple units
            const unitsCovered = new Set(session.questions.map(q => q.unit));
            console.log(`Units Covered: ${Array.from(unitsCovered).join(', ')}`);

            if (session.questions.length > 5) {
                console.log('✅ More than 5 questions generated (Limit Removed Verified!)');
            } else if (session.questions.length === totalTopics) {
                console.log('✅ All available topics included!');
            } else {
                console.log(`⚠️ Generated ${session.questions.length} questions. (Total Topics: ${totalTopics})`);
            }
        } else {
            console.log('❌ Failed to start practice session');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    }
};

verifyFullSyllabus();
