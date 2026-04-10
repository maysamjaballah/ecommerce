import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus]   = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token manquant.');
      return;
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Erreur de vérification.');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {status === 'loading' && <p>Vérification en cours...</p>}
        {status === 'success' && (
          <>
            <div className="auth-icon">✅</div>
            <h2>Email vérifié !</h2>
            <p>{message}</p>
            <Link to="/" className="btn-primary-link">
              Retour à l'accueil
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="auth-icon">❌</div>
            <h2>Erreur</h2>
            <p>{message}</p>
            <Link to="/" className="btn-primary-link">
              Retour à l'accueil
            </Link>
          </>
        )}
      </div>
    </div>
  );
}