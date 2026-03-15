const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Student = require('../../models/Student');
const bcrypt = require('bcryptjs');

async function verifyLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'kishore123@gmail.com';
        const testPassword = '123456';

        // 1. Fetch user with password
        const student = await Student.findOne({ email }).select('+password');
        
        if (!student) {
            console.log('❌ User not found');
            return;
        }

        console.log(`Found User: ${student.email} (Role: ${student.role})`);
        console.log(`Stored Password Hash: ${student.password}`);

        // 2. Test bcrypt directly
        const isMatch = await bcrypt.compare(testPassword, student.password);
        console.log(`Bcrypt Match Result: ${isMatch}`);

        // 3. Test model method
        const isMatchMethod = await student.comparePassword(testPassword);
        console.log(`Model Method Match Result: ${isMatchMethod}`);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

verifyLogin();
