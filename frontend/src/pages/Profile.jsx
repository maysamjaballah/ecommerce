import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passForm, setPassForm]       = useState({ current_password: '', password: '', password_confirmation: '' });
  const [deletePass, setDeletePass]   = useState('');

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg]       = useState({ type: '', text: '' });
  const [deleteMsg, setDeleteMsg]   = useState({ type: '', text: '' });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass]       = useState(false);
  const [loadingDelete, setLoadingDelete]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleProfileUpdate(e) {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setLoadingProfile(true);
    try {
      await updateProfile(profileForm);
      setProfileMsg({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });
    setLoadingPass(true);
    try {
      await api.put('/auth/password', passForm);
      setPassMsg({ type: 'success', text: 'Mot de passe mis à jour.' });
      setPassForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setLoadingPass(false);
    }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleteMsg({ type: '', text: '' });
    setLoadingDelete(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePass } });
      logout();
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Mon Profil</h1>

        {/* Profile Info */}
        <div className="profile-card">
          <h2>Informations personnelles</h2>
          <p className="profile-role">Rôle : <span>{user?.role}</span></p>

          {profileMsg.text && (
            <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Nom complet</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-save" disabled={loadingProfile}>
              {loadingProfile ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="profile-card">
          <h2>Changer le mot de passe</h2>

          {passMsg.text && (
            <div className={`alert alert-${passMsg.type}`}>{passMsg.text}</div>
          )}

          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <input
                type="password"
                value={passForm.current_password}
                onChange={e => setPassForm({...passForm, current_password: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Min. 8 caractères"
                value={passForm.password}
                onChange={e => setPassForm({...passForm, password: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={passForm.password_confirmation}
                onChange={e => setPassForm({...passForm, password_confirmation: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-save" disabled={loadingPass}>
              {loadingPass ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </form>
        </div>

        {/* Delete Account */}
        <div className="profile-card danger-card">
          <h2>Supprimer le compte</h2>
          <p>Cette action est irréversible. Toutes vos données seront supprimées.</p>

          {deleteMsg.text && (
            <div className={`alert alert-${deleteMsg.type}`}>{deleteMsg.text}</div>
          )}

          {!showDeleteConfirm ? (
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              Supprimer mon compte
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount}>
              <div className="form-group">
                <label>Confirmez votre mot de passe</label>
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={deletePass}
                  onChange={e => setDeletePass(e.target.value)}
                  required
                />
              </div>
              <div className="btn-row">
                <button type="button" className="btn-cancel"
                  onClick={() => setShowDeleteConfirm(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-danger" disabled={loadingDelete}>
                  {loadingDelete ? 'Suppression...' : 'Confirmer la suppression'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}