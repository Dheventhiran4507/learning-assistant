const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Student = require('./models/Student');

const findAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admins = await Student.find({ role: { $in: ['admin', 'hod', 'advisor'] } });
        
        if (admins.length === 0) {
            console.log('--- NO ADMINS FOUND ---');
        } else {
            console.log('--- ADMIN USERS FOUND ---');
            admins.forEach(admin => {
                console.log(`Email: ${admin.email} (Role: ${admin.role})`);
            });
            console.log('---------------------------');
        }
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
};

findAdmin();
