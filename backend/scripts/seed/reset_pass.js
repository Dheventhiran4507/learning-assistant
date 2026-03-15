const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Student = require('../../models/Student');

async function resetPass() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const student = await Student.findOne({ email: 'kishore123@gmail.com' });
        
        if (student) {
            student.password = '123456';
            await student.save();
            console.log('✅ Password reset to 123456 for kishore123@gmail.com');
        } else {
            console.log('❌ User not found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

resetPass();
