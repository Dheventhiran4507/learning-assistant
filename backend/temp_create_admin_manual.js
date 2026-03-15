const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Student = require('./models/Student');

const createAdmin = async () => {
    const email = 'sivadevandren@gmail.com';
    const password = 'deva4507';
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Remove existing if any (just in case)
        await Student.deleteOne({ email: email });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const adminUser = new Student({
            studentId: 'ADMIN_MANUAL_1',
            name: 'Sivadevandren Admin',
            email: email,
            password: hashedPassword,
            phone: '0000000000',
            department: 'Management',
            semester: 1,
            batch: 'STAFF',
            college: 'Anna University',
            role: 'admin',
            isActive: true
        });

        await adminUser.save();
        console.log('ADMIN_CREATED_SUCCESSFULLY');
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
};

createAdmin();
