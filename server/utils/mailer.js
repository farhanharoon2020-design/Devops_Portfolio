/**
 * utils/mailer.js
 * Email sending via Resend API (production) or Gmail SMTP (local fallback).
 */

const nodemailer = require('nodemailer');
const dns = require('dns');
const { Resend } = require('resend');

// Force Node.js to resolve DNS to IPv4 addresses first for local SMTP fallback.
dns.setDefaultResultOrder('ipv4first');

// ─── Initialize Providers ─────────────────────────────────────────────────────
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:   587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

const FROM_SMTP = `"Farhan Haroon" <${process.env.SMTP_USER}>`;
const TO_EMAIL  = process.env.RECEIVER_EMAIL || process.env.SMTP_USER || 'farhanharoon2020@gmail.com';

const isConfigured = () => !!(process.env.RESEND_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS));

// ─── Shared email shell ───────────────────────────────────────────────────────
const shell = (content) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#06090f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:580px;margin:40px auto;background:#0d1422;border-radius:16px;overflow:hidden;border:1px solid rgba(0,102,255,0.2);box-shadow:0 20px 60px rgba(0,0,0,0.5);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0033aa,#0066ff,#00aaff);padding:28px 36px;text-align:center;">
      <p style="margin:0;font-size:1.1rem;font-weight:700;color:#fff;letter-spacing:0.08em;text-transform:uppercase;">Farhan Haroon</p>
      <p style="margin:4px 0 0;font-size:0.8rem;color:rgba(255,255,255,0.75);letter-spacing:0.12em;">SOFTWARE &amp; DEVOPS ENGINEER</p>
    </div>

    <!-- Body -->
    <div style="padding:36px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="background:rgba(0,0,0,0.3);padding:20px 36px;border-top:1px solid rgba(0,102,255,0.1);text-align:center;">
      <p style="margin:0 0 8px;font-size:0.78rem;color:rgba(255,255,255,0.3);">
        📍 Islamabad, Pakistan &nbsp;·&nbsp; COMSATS University
      </p>
      <p style="margin:0;font-size:0.72rem;color:rgba(255,255,255,0.2);">
        This is an automated message from Farhan Haroon's portfolio contact system.
      </p>
    </div>

  </div>
</body>
</html>`;

// ─── 1. Contact notification + auto-reply ─────────────────────────────────────
async function sendContactEmails({ name, email, message }) {
  if (!isConfigured()) {
    console.log('📨 [MAILER] Mailer not configured — skipping email.');
    return;
  }

  const notificationHtml = shell(`
    <h2 style="color:#00aaff;margin:0 0 20px;font-size:1.3rem;">🚀 New Contact Form Submission</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:10px 14px;background:rgba(0,102,255,0.08);border-radius:8px 8px 0 0;border-bottom:1px solid rgba(0,102,255,0.1);">
          <span style="color:#60a5fa;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Name</span><br>
          <span style="color:#e2e8f0;font-size:1rem;">${name}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:rgba(0,102,255,0.05);border-radius:0 0 8px 8px;">
          <span style="color:#60a5fa;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Email</span><br>
          <a href="mailto:${email}" style="color:#00aaff;font-size:1rem;text-decoration:none;">${email}</a>
        </td>
      </tr>
    </table>
    <div style="background:rgba(0,0,0,0.3);border-left:3px solid #0066ff;border-radius:0 8px 8px 0;padding:16px 18px;margin-bottom:20px;">
      <p style="color:#60a5fa;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Message</p>
      <p style="color:#94a3b8;font-size:0.95rem;line-height:1.7;margin:0;">${message.replace(/\n/g, '<br>')}</p>
    </div>
    <a href="mailto:${email}?subject=Re: Your message to Farhan Haroon"
       style="display:inline-block;background:linear-gradient(135deg,#0066ff,#00aaff);color:#fff;padding:12px 28px;border-radius:30px;text-decoration:none;font-weight:700;font-size:0.9rem;">
      ↩ Reply to ${name}
    </a>
  `);

  const visitorHtml = shell(`
    <h2 style="color:#e2e8f0;margin:0 0 8px;font-size:1.4rem;">Hey ${name}! 👋</h2>
    <p style="color:#60a5fa;margin:0 0 24px;font-size:0.9rem;">Thanks for reaching out through my portfolio.</p>

    <p style="color:#94a3b8;line-height:1.8;margin:0 0 20px;">
      I've received your message and will get back to you as soon as possible —
      usually within <strong style="color:#e2e8f0;">24–48 hours</strong>.
    </p>

    <div style="background:rgba(0,0,0,0.3);border-left:3px solid #0066ff;border-radius:0 8px 8px 0;padding:16px 18px;margin-bottom:28px;">
      <p style="color:#60a5fa;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Your message</p>
      <p style="color:#64748b;font-size:0.9rem;line-height:1.7;font-style:italic;margin:0;">"${message.replace(/\n/g, '<br>')}"</p>
    </div>

    <div style="background:rgba(0,102,255,0.06);border:1px solid rgba(0,102,255,0.15);border-radius:10px;padding:18px 20px;margin-bottom:24px;">
      <p style="color:#60a5fa;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px;">While you wait</p>
      <p style="color:#94a3b8;font-size:0.88rem;margin:0 0 6px;">🐙 Check out my work on <a href="https://github.com/farhanharoon2020-design" style="color:#00aaff;text-decoration:none;">GitHub</a></p>
      <p style="color:#94a3b8;font-size:0.88rem;margin:0 0 6px;">💼 Connect with me on <a href="https://www.linkedin.com/in/farhan-haroon-8a1047379/" style="color:#00aaff;text-decoration:none;">LinkedIn</a></p>
      <p style="color:#94a3b8;font-size:0.88rem;margin:0;">🚀 Explore my <a href="http://localhost:5173/#projects" style="color:#00aaff;text-decoration:none;">Projects</a></p>
    </div>

    <p style="color:#475569;font-size:0.85rem;margin:0;">
      Talk soon,<br>
      <strong style="color:#e2e8f0;">Farhan Haroon</strong><br>
      <span style="color:#60a5fa;font-size:0.8rem;">Software &amp; DevOps Engineer</span>
    </p>
  `);

  if (resendClient) {
    // 1. Send admin notification to you
    try {
      await resendClient.emails.send({
        from: 'onboarding@resend.dev',
        to: TO_EMAIL,
        subject: `📬 New message from ${name} — Portfolio`,
        html: notificationHtml,
      });
      console.log('📨 [MAILER] Resend admin notification email sent successfully.');
    } catch (err) {
      console.error('📨 [MAILER] Resend admin notification email failed:', err.message);
      throw err; // throw to register fail in routes if needed, but let's throw only on critical
    }

    // 2. Send visitor auto-reply (Note: Resend free tier only allows sending to your own email address)
    try {
      await resendClient.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `Got your message, ${name}! I'll be in touch soon 👋`,
        html: visitorHtml,
      });
      console.log('📨 [MAILER] Resend visitor auto-reply sent successfully.');
    } catch (err) {
      console.log(`📨 [MAILER] Resend visitor auto-reply skipped/failed (expected on free tier without verified domain): ${err.message}`);
    }
  } else {
    // Fallback: Nodemailer SMTP
    await transporter.sendMail({
      from:    FROM_SMTP,
      to:      TO_EMAIL,
      replyTo: email,
      subject: `📬 New message from ${name} — Portfolio`,
      html:    notificationHtml,
    });

    await transporter.sendMail({
      from:    FROM_SMTP,
      to:      email,
      subject: `Got your message, ${name}! I'll be in touch soon 👋`,
      html:    visitorHtml,
    });
  }
}

// ─── 2. Newsletter welcome email ──────────────────────────────────────────────
async function sendWelcomeEmail({ email }) {
  if (!isConfigured()) {
    console.log('📨 [MAILER] Mailer not configured — skipping welcome email.');
    return;
  }

  const welcomeHtml = shell(`
    <h2 style="color:#e2e8f0;margin:0 0 8px;font-size:1.4rem;">Welcome aboard! 🚀</h2>
    <p style="color:#60a5fa;margin:0 0 24px;font-size:0.9rem;">You're now subscribed to updates from my DevOps portfolio.</p>

    <p style="color:#94a3b8;line-height:1.8;margin:0 0 20px;">You'll receive occasional posts and updates on:</p>

    <div style="background:rgba(0,102,255,0.06);border:1px solid rgba(0,102,255,0.15);border-radius:10px;padding:18px 20px;margin-bottom:24px;">
      <p style="color:#94a3b8;font-size:0.92rem;margin:0 0 8px;">🐳 <strong style="color:#e2e8f0;">Docker &amp; Kubernetes</strong> — containers, orchestration, best practices</p>
      <p style="color:#94a3b8;font-size:0.92rem;margin:0 0 8px;">⚙️ <strong style="color:#e2e8f0;">CI/CD Pipelines</strong> — GitHub Actions, Jenkins, automation</p>
      <p style="color:#94a3b8;font-size:0.92rem;margin:0 0 8px;">☁️ <strong style="color:#e2e8f0;">Cloud &amp; Infrastructure</strong> — AWS, Terraform, Nginx</p>
      <p style="color:#94a3b8;font-size:0.92rem;margin:0;">🔧 <strong style="color:#e2e8f0;">Bash &amp; Scripting</strong> — automation tricks and tips</p>
    </div>

    <p style="color:#475569;font-size:0.85rem;margin:0;">
      — <strong style="color:#e2e8f0;">Farhan Haroon</strong><br>
      <span style="color:#60a5fa;font-size:0.8rem;">Software &amp; DevOps Engineer</span>
    </p>
  `);

  if (resendClient) {
    try {
      await resendClient.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: "You're subscribed to Farhan's DevOps Newsletter 🚀",
        html: welcomeHtml,
      });
      console.log('📨 [MAILER] Resend welcome newsletter email sent.');
    } catch (err) {
      console.error('📨 [MAILER] Resend welcome newsletter email failed:', err.message);
    }
  } else {
    await transporter.sendMail({
      from:    FROM_SMTP,
      to:      email,
      subject: "You're subscribed to Farhan's DevOps Newsletter 🚀",
      html:    welcomeHtml,
    });
  }
}

module.exports = { sendContactEmails, sendWelcomeEmail, isConfigured };
