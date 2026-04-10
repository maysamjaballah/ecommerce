import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Mot de passe oublié</h2>
        <p className="auth-subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error   && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
        <Link to="/" className="auth-back">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}