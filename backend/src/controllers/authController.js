const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/mailer');
require('dotenv').config();

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
    if (!['client', 'seller'].includes(role))
      return res.status(400).json({ success: false, message: 'Rôle invalide.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' });

    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length)
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken    = uuidv4();

    await pool.query(
      'INSERT INTO users (name, email, password, role, verify_token) VALUES (?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), hashedPassword, role, verifyToken]
    );

    try {
      await sendVerificationEmail(email, name, verifyToken);
    } catch (mailErr) {
      console.error('Mail error:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Compte créé ! Vérifiez votre email pour activer votre compte.',
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function verifyEmail(req, res) {
  try {
    const token = req.query.token || req.body.token;
    if (!token)
      return res.status(400).json({ success: false, message: 'Token manquant.' });

    // Cherche par token OU par email déjà vérifié avec ce token
    const [rows] = await pool.query(
      'SELECT id, email_verified_at FROM users WHERE verify_token = ? OR (verify_token IS NULL AND id IN (SELECT id FROM users WHERE email_verified_at IS NOT NULL))',
      [token]
    );

    // Vérifie d'abord si token existe encore
    const [tokenRows] = await pool.query(
      'SELECT id, email_verified_at FROM users WHERE verify_token = ?',
      [token]
    );

    if (!tokenRows.length) {
      // Token consommé — vérifie si c'est Gmail qui l'a fait (vérif récente < 10 secondes)
      const [recentRows] = await pool.query(
        'SELECT id FROM users WHERE email_verified_at > DATE_SUB(NOW(), INTERVAL 10 SECOND) AND verify_token IS NULL',
        []
      );
      if (recentRows.length) {
        return res.json({ success: true, message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' });
      }
      return res.status(400).json({ success: false, message: 'Token invalide ou déjà utilisé.' });
    }

    await pool.query(
      'UPDATE users SET email_verified_at = NOW(), verify_token = NULL WHERE verify_token = ?',
      [token]
    );

    return res.json({ success: true, message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });

    if (!user.email_verified_at)
      return res.status(403).json({ success: false, message: 'Veuillez vérifier votre email avant de vous connecter.' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function getMe(req, res) {
  return res.json({ success: true, user: req.user });
}

async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ success: false, message: 'Nom et email requis.' });

    const [exists] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );
    if (exists.length)
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });

    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email.toLowerCase(), req.user.id]);

    const [updated] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Profil mis à jour.', user: updated[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function updatePassword(req, res) {
  try {
    const { current_password, password, password_confirmation } = req.body;
    if (!current_password || !password || !password_confirmation)
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    if (password !== password_confirmation)
      return res.status(400).json({ success: false, message: 'Les mots de passe ne correspondent pas.' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' });

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const valid  = await bcrypt.compare(current_password, rows[0].password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect.' });

    const hashed = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    return res.json({ success: true, message: 'Mot de passe mis à jour.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const valid  = await bcrypt.compare(password, rows[0].password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });
    await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Compte supprimé.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email requis.' });

    const [rows] = await pool.query(
      'SELECT id, name FROM users WHERE email = ?', [email.toLowerCase()]);

    if (rows.length) {
      const token = uuidv4();
      await pool.query(
        'INSERT INTO password_reset_tokens (email, token, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE token = ?, created_at = NOW()',
        [email.toLowerCase(), token, token]
      );
      try {
        await sendPasswordResetEmail(email, rows[0].name, token);
      } catch (mailErr) {
        console.error('Mail error:', mailErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password, password_confirmation } = req.body;
    if (!token || !password)
      return res.status(400).json({ success: false, message: 'Token et mot de passe requis.' });
    if (password !== password_confirmation)
      return res.status(400).json({ success: false, message: 'Les mots de passe ne correspondent pas.' });

    const [rows] = await pool.query(
      'SELECT email FROM password_reset_tokens WHERE token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      [token]
    );
    if (!rows.length)
      return res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });

    const hashed = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashed, rows[0].email]);
    await pool.query('DELETE FROM password_reset_tokens WHERE email = ?', [rows[0].email]);

    return res.json({ success: true, message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

module.exports = {
  register, verifyEmail, login, getMe,
  updateProfile, updatePassword, deleteAccount,
  forgotPassword, resetPassword,
};