const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Student = require('../../models/Student');

async function findUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const student = await Student.findOne({ 
            $or: [
                { email: /kishore123/i },
                { studentId: /kishore123/i }
            ]
        });
        
        if (student) {
            console.log('User found:');
            console.log(` - Student ID: ${student.studentId}`);
            console.log(` - Email: ${student.email}`);
            console.log(` - Name: ${student.name}`);
        } else {
            console.log('User not found starting with kishore123');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

findUser();
