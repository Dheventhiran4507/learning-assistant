const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.SYSTEM_EMAIL,
        pass: process.env.SYSTEM_EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});

/**
 * Send account creation email to the student with their credentials.
 */
const sendAccountCreatedEmail = async (toEmail, name, password) => {
    const loginUrl = process.env.FRONTEND_URL || 'https://your-app.onrender.com';

    await transporter.sendMail({
        from: `"Vidal - Lumina Portal" <${process.env.SYSTEM_EMAIL}>`,
        to: toEmail,
        subject: 'Your Vidal Account Has Been Created',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0f172a;padding:40px;text-align:center;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px;">VIDAL</h1>
      <p style="color:#64748b;font-size:11px;margin:8px 0 0;letter-spacing:4px;text-transform:uppercase;">Lumina Learning Portal</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin:0 0 8px;">Hello, ${name}</h2>
      <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 32px;">
        Your student account on the <strong>Vidal Lumina Portal</strong> has been successfully created by your institution. Please use the credentials below to access your account.
      </p>

      <!-- Credentials Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:28px;margin-bottom:28px;">
        <p style="color:#94a3b8;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px;">Account Credentials</p>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#64748b;font-size:12px;font-weight:600;display:block;">Email Address</span>
              <span style="color:#0f172a;font-size:15px;font-weight:700;">${toEmail}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;">
              <span style="color:#64748b;font-size:12px;font-weight:600;display:block;">Password</span>
              <span style="color:#6366f1;font-size:22px;font-weight:900;letter-spacing:3px;">${password}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Warning -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:32px;">
        <p style="color:#92400e;font-size:13px;font-weight:600;margin:0;">
          ⚠️ Do not share your credentials with anyone. You are advised to change your password after your first login.
        </p>
      </div>

      <!-- CTA Button -->
      <a href="${loginUrl}/login"
         style="display:block;background:#0f172a;color:#ffffff;text-align:center;padding:18px 24px;border-radius:14px;font-weight:800;font-size:13px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;">
        Login to Portal &rarr;
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        Vidal Lumina Portal &nbsp;&bull;&nbsp; Anna University &mdash; R2021 Regulation<br>
        <span style="color:#cbd5e1;">This is an automated message. Please do not reply to this email.</span>
      </p>
    </div>

  </div>
</body>
</html>`
    });

    console.log(`✅ Account creation email sent to ${toEmail}`);
    return true;
};

/**
 * Send a login notification email to the student.
 */
const sendLoginNotificationEmail = async (toEmail, name, loginTime, userAgent) => {
    try {
        const loginUrl = process.env.FRONTEND_URL || 'https://your-app.onrender.com';

        const istTime = new Date(loginTime).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent || '');
        const deviceType = isMobile ? 'Mobile Device' : 'Desktop / Laptop';

        await transporter.sendMail({
            from: `"Vidal - Lumina Portal" <${process.env.SYSTEM_EMAIL}>`,
            to: toEmail,
            subject: 'New Login Detected — Vidal Portal',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0f172a;padding:40px;text-align:center;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px;">VIDAL</h1>
      <p style="color:#64748b;font-size:11px;margin:8px 0 0;letter-spacing:4px;text-transform:uppercase;">Security Notification</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin:0 0 8px;">Hello, ${name}</h2>
      <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 28px;">
        A new login was detected on your <strong>Vidal Lumina Portal</strong> account. Here are the details:
      </p>

      <!-- Login Details Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:28px;margin-bottom:28px;">
        <p style="color:#94a3b8;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px;">Login Information</p>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#64748b;font-size:12px;font-weight:600;display:block;">Date &amp; Time</span>
              <span style="color:#0f172a;font-size:14px;font-weight:700;">${istTime} IST</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;">
              <span style="color:#64748b;font-size:12px;font-weight:600;display:block;">Device Type</span>
              <span style="color:#0f172a;font-size:14px;font-weight:700;">${deviceType}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Warning -->
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin-bottom:32px;">
        <p style="color:#991b1b;font-size:13px;font-weight:600;margin:0;">
          🚨 If this was not you, please change your password immediately and contact your institution's administrator.
        </p>
      </div>

      <!-- CTA Button -->
      <a href="${loginUrl}/login"
         style="display:block;background:#0f172a;color:#ffffff;text-align:center;padding:18px 24px;border-radius:14px;font-weight:800;font-size:13px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;">
        Go to Portal &rarr;
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        Vidal Lumina Portal &nbsp;&bull;&nbsp; Anna University &mdash; R2021 Regulation<br>
        <span style="color:#cbd5e1;">This is an automated security alert. Please do not reply to this email.</span>
      </p>
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
