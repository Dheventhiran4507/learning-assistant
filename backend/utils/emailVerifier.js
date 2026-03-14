const nodemailer = require('nodemailer');

const verifyGmail = async (email, password) => {
    if (!email.endsWith('@gmail.com')) {
        throw new Error('Only @gmail.com addresses are supported for verification.');
    }

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL/TLS
        auth: {
            user: cleanEmail,
            pass: cleanPassword
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000
    });

    try {
        await transporter.verify();
        return true;
    } catch (error) {
        throw new Error('Gmail rejected credentials. (Use an APP PASSWORD for better reliability)');
    }
};

module.exports = { verifyGmail };
