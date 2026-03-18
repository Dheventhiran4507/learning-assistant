/**
 * Email Service using Resend REST API (direct fetch - no SDK timeout issues)
 */

const APP_URL = process.env.FRONTEND_URL || 'https://learning-assistant-7760.onrender.com';
const FROM_ADDRESS = 'Vidal Portal <onboarding@resend.dev>';

async function sendEmail(to, subject, html) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Resend API error: ${response.status}`);
    }

    return data;
}

/**
 * Send account creation email to the student with credentials.
 */
const sendAccountCreatedEmail = async (toEmail, name, password) => {
    try {
        await sendEmail(toEmail, 'Your Vidal Account Has Been Created', `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#0f172a;padding:40px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px;">VIDAL</h1>
      <p style="color:#64748b;font-size:11px;margin:8px 0 0;letter-spacing:4px;text-transform:uppercase;">Lumina Learning Portal</p>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin:0 0 8px;">Hello, ${name}</h2>
      <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Your student account on the <strong>Vidal Lumina Portal</strong> has been successfully created by your institution. Use the credentials below to access your account.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:28px;margin-bottom:24px;">
        <p style="color:#94a3b8;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">Account Credentials</p>
        <p style="margin:0 0 12px;"><span style="color:#64748b;font-size:12px;font-weight:600;display:block;">Email Address</span><span style="color:#0f172a;font-size:15px;font-weight:700;">${toEmail}</span></p>
        <p style="margin:0;"><span style="color:#64748b;font-size:12px;font-weight:600;display:block;">Password</span><span style="color:#6366f1;font-size:22px;font-weight:900;letter-spacing:3px;">${password}</span></p>
      </div>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:28px;">
        <p style="color:#92400e;font-size:13px;font-weight:600;margin:0;">⚠️ Do not share your credentials. Change your password after first login.</p>
      </div>
      <a href="${APP_URL}/login" style="display:block;background:#0f172a;color:#fff;text-align:center;padding:18px;border-radius:14px;font-weight:800;font-size:13px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;">Login to Portal &rarr;</a>
    </div>
    <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">Vidal Lumina Portal &bull; Anna University &mdash; R2021<br><span style="color:#cbd5e1;">This is an automated message. Please do not reply.</span></p>
    </div>
  </div>
</body>
</html>`);

        console.log(`✅ Account creation email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Account creation email failed for ${toEmail}:`, error.message);
        return false;
    }
};

/**
 * Send a login notification email to the student.
 */
const sendLoginNotificationEmail = async (toEmail, name, loginTime, userAgent) => {
    try {
        const istTime = new Date(loginTime).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent || '');
        const deviceType = isMobile ? 'Mobile Device' : 'Desktop / Laptop';

        await sendEmail(toEmail, 'New Login Detected — Vidal Portal', `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#0f172a;padding:40px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px;">VIDAL</h1>
      <p style="color:#64748b;font-size:11px;margin:8px 0 0;letter-spacing:4px;text-transform:uppercase;">Security Notification</p>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin:0 0 8px;">Hello, ${name}</h2>
      <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">A new login was detected on your <strong>Vidal Portal</strong> account.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:28px;margin-bottom:24px;">
        <p style="color:#94a3b8;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">Login Details</p>
        <p style="margin:0 0 12px;"><span style="color:#64748b;font-size:12px;font-weight:600;display:block;">Date &amp; Time</span><span style="color:#0f172a;font-size:14px;font-weight:700;">${istTime} IST</span></p>
        <p style="margin:0;"><span style="color:#64748b;font-size:12px;font-weight:600;display:block;">Device</span><span style="color:#0f172a;font-size:14px;font-weight:700;">${deviceType}</span></p>
      </div>
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin-bottom:28px;">
        <p style="color:#991b1b;font-size:13px;font-weight:600;margin:0;">🚨 If this was not you, please change your password immediately and contact your administrator.</p>
      </div>
      <a href="${APP_URL}/login" style="display:block;background:#0f172a;color:#fff;text-align:center;padding:18px;border-radius:14px;font-weight:800;font-size:13px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;">Go to Portal &rarr;</a>
    </div>
    <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">Vidal Lumina Portal &bull; Anna University &mdash; R2021<br><span style="color:#cbd5e1;">This is an automated security alert. Please do not reply.</span></p>
    </div>
  </div>
</body>
</html>`);

        console.log(`✅ Login notification email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Login notification failed for ${toEmail}:`, error.message);
        return false;
    }
};

module.exports = { sendAccountCreatedEmail, sendLoginNotificationEmail };
