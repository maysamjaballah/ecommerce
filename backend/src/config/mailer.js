const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST || 'smtp.gmail.com',
  port:   process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendVerificationEmail(email, name, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from:    `"eCommerce" <${process.env.MAIL_FROM}>`,
    to:      email,
    subject: 'Vérifiez votre adresse email',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
        <h2 style="color:#2563eb;">Bienvenue, ${name} !</h2>
        <p>Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour vérifier votre email.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
          Vérifier mon email
        </a>
        <p style="margin-top:24px;color:#999;font-size:13px;">Ce lien expire dans 24h.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from:    `"eCommerce" <${process.env.MAIL_FROM}>`,
    to:      email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
        <h2 style="color:#2563eb;">Réinitialiser votre mot de passe</h2>
        <p>Bonjour ${name}, cliquez ci-dessous pour réinitialiser votre mot de passe.</p>
        <a href="${resetUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
          Réinitialiser mon mot de passe
        </a>
        <p style="margin-top:24px;color:#999;font-size:13px;">Ce lien expire dans 1h.</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };