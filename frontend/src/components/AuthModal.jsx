import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData]   = useState({ email: '', password: '' });
  const [regData, setRegData]       = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'client' });
  const [loginError, setLoginError] = useState('');
  const [regError, setRegError]     = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingReg, setLoadingReg]     = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);
    try {
      const user = await login(loginData.email, loginData.password);
      onClose();
      if (user.role === 'seller') navigate('/seller');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/products');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Erreur de connexion.');
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setLoadingReg(true);
    try {
      const res = await register(regData);
      setRegSuccess(res.message);
      setRegData({ name: '', email: '', password: '', password_confirmation: '', role: 'client' });
    } catch (err) {
      setRegError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoadingReg(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-forms">

          {/* LOGIN — Left side */}
          <div className="modal-section">
            <h2>Connexion</h2>
            <p className="modal-subtitle">Accédez à votre compte</p>

            {loginError && <div className="alert alert-error">{loginError}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={loginData.email}
                  onChange={e => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-forgot">
                <a href="/forgot-password" onClick={onClose}>Mot de passe oublié ?</a>
              </div>
              <button type="submit" className="btn-primary" disabled={loadingLogin}>
                {loadingLogin ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>

          <div className="modal-divider"></div>

          {/* REGISTER — Right side */}
          <div className="modal-section">
            <h2>Créer un compte</h2>
            <p className="modal-subtitle">Rejoignez-nous gratuitement</p>

            {regError   && <div className="alert alert-error">{regError}</div>}
            {regSuccess && <div className="alert alert-success">{regSuccess}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={regData.name}
                  onChange={e => setRegData({...regData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={regData.email}
                  onChange={e => setRegData({...regData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="Min. 8 caractères"
                  value={regData.password}
                  onChange={e => setRegData({...regData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regData.password_confirmation}
                  onChange={e => setRegData({...regData, password_confirmation: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Je suis</label>
                <div className="role-select">
                  <label className={`role-option ${regData.role === 'client' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={regData.role === 'client'}
                      onChange={() => setRegData({...regData, role: 'client'})}
                    />
                     Client
                  </label>
                  <label className={`role-option ${regData.role === 'seller' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="seller"
                      checked={regData.role === 'seller'}
                      onChange={() => setRegData({...regData, role: 'seller'})}
                    />
                     Vendeur
                  </label>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loadingReg}>
                {loadingReg ? 'Inscription...' : 'Créer mon compte'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}