const nodemailer = require('nodemailer');

const verifyGmail = async (email, password) => {
    const isYahoo = email.toLowerCase().endsWith('@yahoo.com');
    const isGmail = email.toLowerCase().endsWith('@gmail.com');

    if (!isGmail && !isYahoo) {
        throw new Error('Only @gmail.com or @yahoo.com addresses are supported for verification.');
    }

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Determine SMTP host based on domain
    const smtpHost = isYahoo ? 'smtp.mail.yahoo.com' : 'smtp.gmail.com';

    const transporter = nodemailer.createTransport({
        host: smtpHost,
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
        const domain = isYahoo ? 'Yahoo' : 'Gmail';
        throw new Error(`${domain} rejected credentials. (Note: Many providers require an APP PASSWORD for reliable SMTP access)`);
    }
};

module.exports = { verifyGmail };
