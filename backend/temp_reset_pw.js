const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Student = require('./models/Student');

const checkUser = async () => {
    const email = 'sivadevandren@gmail.com';
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await Student.findOne({ email: email });
        
        if (!user) {
            console.log(`USER_NOT_FOUND: ${email}`);
            // Also list ALL users just to be sure
            const allUsers = await Student.find({}, 'email role');
            console.log('--- ALL USERS IN DB ---');
            allUsers.forEach(u => console.log(`${u.email} (${u.role})`));
        } else {
            console.log(`USER_FOUND: ${user.email} (Role: ${user.role})`);
            // Reset password to "123456" for them to login
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('123456', salt);
            await user.save();
            console.log('PASSWORD_RESET_SUCCESS: New password is "123456"');
        }
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
};

checkUser();
