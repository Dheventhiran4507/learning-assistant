const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SYSTEM_EMAIL,
        pass: process.env.SYSTEM_EMAIL_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

/**
 * Send account creation email to the student with their credentials.
 */
const sendAccountCreatedEmail = async (toEmail, name, password) => {
    try {
        const loginUrl = process.env.FRONTEND_URL || 'https://your-app.onrender.com';

        await transporter.sendMail({
            from: `"Vidal - Lumina Portal" <${process.env.SYSTEM_EMAIL}>`,
            to: toEmail,
            subject: '🎓 Vidal - உங்கள் Account Ready!',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#0f172a;padding:40px 40px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px;">VIDAL</h1>
      <p style="color:#64748b;font-size:12px;margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">Lumina Learning Portal</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 8px;">வணக்கம், ${name}! 👋</h2>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 32px;">
        உங்கள் account Staff-ஆல் create செய்யப்பட்டது. கீழே உள்ள credentials பயன்படுத்தி login பண்ணுங்கள்.
      </p>

      <!-- Credentials Box -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:28px;">
        <p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">உங்கள் Login Details</p>
        
        <div style="margin-bottom:12px;">
          <span style="color:#64748b;font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Email Address</span>
          <span style="color:#0f172a;font-size:16px;font-weight:700;">${toEmail}</span>
        </div>
        
        <div>
          <span style="color:#64748b;font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Password</span>
          <span style="color:#6366f1;font-size:20px;font-weight:900;letter-spacing:2px;">${password}</span>
        </div>
      </div>

      <!-- Warning -->
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:16px;margin-bottom:28px;">
        <p style="color:#92400e;font-size:13px;font-weight:600;margin:0;">
          ⚠️ இந்த password-ஐ யாரிடமும் share பண்ணாதீர்கள். Login ஆனவுடன் மாற்றிக்கொள்ளுங்கள்.
        </p>
      </div>

      <!-- CTA Button -->
      <a href="${loginUrl}/login" style="display:block;background:#0f172a;color:#fff;text-align:center;padding:18px;border-radius:14px;font-weight:800;font-size:14px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;">
        Login Now →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">Vidal Lumina Portal &nbsp;•&nbsp; Anna University R2021</p>
    </div>
  </div>
</body>
</html>`
        });

        console.log(`✅ Account creation email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send account creation email to ${toEmail}:`, error.message);
        return false;
    }
};

/**
 * Send a login notification email to the student.
 */
const sendLoginNotificationEmail = async (toEmail, name, loginTime, userAgent) => {
    try {
        const loginUrl = process.env.FRONTEND_URL || 'https://your-app.onrender.com';

        // Format login time in IST
        const istTime = new Date(loginTime).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'short'
        });

        // Detect device from UA
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent || '');
        const deviceType = isMobile ? '📱 Mobile' : '💻 Desktop/Laptop';

        await transporter.sendMail({
            from: `"Vidal - Lumina Portal" <${process.env.SYSTEM_EMAIL}>`,
            to: toEmail,
            subject: '🔔 Vidal - புதிய Login Detected',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#0f172a;padding:40px 40px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px;">VIDAL</h1>
      <p style="color:#64748b;font-size:12px;margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">Login Alert</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 8px;">வணக்கம், ${name}!</h2>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;">
        உங்கள் Vidal account-ல் ஒரு புதிய login detect ஆனது.
      </p>

      <!-- Login Details -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:28px;">
        <p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Login Information</p>
        
        <div style="margin-bottom:12px;">
          <span style="color:#64748b;font-size:12px;font-weight:600;display:block;margin-bottom:4px;">📅 Login Time</span>
          <span style="color:#0f172a;font-size:14px;font-weight:700;">${istTime} IST</span>
        </div>
        
        <div>
          <span style="color:#64748b;font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Device</span>
          <span style="color:#0f172a;font-size:14px;font-weight:700;">${deviceType}</span>
        </div>
      </div>

      <!-- Warning -->
      <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin-bottom:28px;">
        <p style="color:#991b1b;font-size:13px;font-weight:600;margin:0;">
          🚨 நீங்கள் login பண்ணவில்லை என்றால், உடனடியாக உங்கள் password மாற்றவும்.
        </p>
      </div>

      <a href="${loginUrl}/login" style="display:block;background:#0f172a;color:#fff;text-align:center;padding:18px;border-radius:14px;font-weight:800;font-size:14px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;">
        Portal திறக்கவும் →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">Vidal Lumina Portal &nbsp;•&nbsp; Anna University R2021</p>
    </div>
  </div>
</body>
</html>`
        });

        console.log(`✅ Login notification email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send login notification to ${toEmail}:`, error.message);
        return false;
    }
};

module.exports = { sendAccountCreatedEmail, sendLoginNotificationEmail };
