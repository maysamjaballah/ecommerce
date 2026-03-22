import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm]       = useState({ password: '', password_confirmation: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, ...form });
      navigate('/?reset=success');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Nouveau mot de passe</h2>
        <p className="auth-subtitle">Choisissez un nouveau mot de passe sécurisé</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="Min. 8 caractères"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={e => setForm({...form, password_confirmation: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Réinitialisation...' : 'Réinitialiser'}
          </button>
        </form>
      </div>
    </div>
  );
}