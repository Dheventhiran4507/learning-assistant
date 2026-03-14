const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Require Student model (Ensure the path is correct based on where this script is located)
const Student = require('./models/Student');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Check if admin already exists
        const adminEmail = 'admin@tamiledu.com';
        const existingAdmin = await Student.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists. You can login with this email: ' + adminEmail);
            process.exit(0);
        }

        // Create new Admin record
        // Role is set to 'admin' so they can manage staff/students
        const adminUser = new Student({
            studentId: 'ADMIN_ROOT',
            name: 'Principal / Admin',
            email: adminEmail,
            password: 'AdminPassword123!', // You MUST change this after first login
            phone: '9876543210',
            department: 'Management',
            semester: 1,         // Dummy value as it is required in schema
            batch: 'STAFF',      // Indicates staff/admin
            college: 'Anna University', // Default college
            role: 'admin',       // HOD or Admin role (has access to create others)
            isActive: true
        });

        await adminUser.save();
        
        console.log('✅ Success! Initial Admin user has been created.');
        console.log('--------------------------------------------------');
        console.log(`Email:    ${adminEmail}`);
        console.log(`Password: AdminPassword123!`);
        console.log(`Role:     admin`);
        console.log('--------------------------------------------------');
        console.log('Note: Please login and change this password immediately!');

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
