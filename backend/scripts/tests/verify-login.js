const axios = require('axios');

async function verifySyllabusCompleteness() {
    try {
        console.log('Attempting login with rajesh@annauniv.edu...');
        const loginResponse = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: 'rajesh@annauniv.edu',
            password: 'password123'
        });

        console.log('Login Successful!');
        const token = loginResponse.data.data.token;
        console.log('Token received');

        console.log('\nVerifying Syllabus Coverage (Semesters 1-8):');
        console.log('------------------------------------------------');

        for (let i = 1; i <= 8; i++) {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/api/syllabus/semester/${i}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    console.log(`Semester ${i}: ${response.data.count} subjects found.`);
                    if (response.data.count < 5 && i < 8) console.warn(`  ⚠️  Warning: Low subject count for Semester ${i}`);

                    // List first few to verify
                    if (response.data.data.length > 0) {
                        const first = response.data.data[0];
                        const last = response.data.data[response.data.data.length - 1];
                        console.log(`  - Sample: ${first.subjectCode} ... ${last.subjectCode}`);
                    }
                }
            } catch (err) {
                console.error(`Semester ${i}: Failed to fetch (${err.message})`);
            }
        }
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('Test Failed!', error.message);
    }
}

verifySyllabusCompleteness();
