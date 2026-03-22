import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [enterprise, setEnterprise] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState({ name: '', category_id: '', description: '' });
  const [image, setImage]           = useState(null);
  const [preview, setPreview]       = useState(null);
  const [error, setError]           = useState('');
  const [creating, setCreating]     = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/enterprise'),
      api.get('/categories'),
    ]).then(([entRes, catRes]) => {
      setEnterprise(entRes.data.data);
      setCategories(catRes.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleCreateEnterprise(e) {
    e.preventDefault();
    setError(''); setCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category_id', form.category_id);
      formData.append('description', form.description);
      if (image) formData.append('image', image);
      const res = await api.post('/enterprise', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEnterprise(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="seller-loading">Chargement...</div>;

  return (
    <div className="seller-page">
      <div className="seller-container">

        {enterprise ? (
          <>
            <div className="seller-welcome">
              <div>
                <h1>Bienvenue, {user.name} 👋</h1>
                <p>Gérez vos produits et suivez vos ventes</p>
              </div>
              <div className="enterprise-badge">
                {enterprise.image && (
                  <img src={enterprise.image} alt={enterprise.name} className="enterprise-logo" />
                )}
                <div>
                  <p className="enterprise-name">{enterprise.name}</p>
                  <p className="enterprise-category">{enterprise.category_name}</p>
                </div>
              </div>
            </div>

            <div className="seller-cards">
              <Link to="/seller/products" className="seller-card">
                <div className="seller-card-icon">📦</div>
                <h3>Mes Produits</h3>
                <p>Ajouter, modifier ou supprimer vos produits</p>
                <span className="seller-card-link">Gérer →</span>
              </Link>
              <Link to="/seller/products/create" className="seller-card">
                <div className="seller-card-icon">➕</div>
                <h3>Nouveau Produit</h3>
                <p>Ajouter un nouveau produit à votre store</p>
                <span className="seller-card-link">Créer →</span>
              </Link>
              <Link to="/profile" className="seller-card">
                <div className="seller-card-icon">👤</div>
                <h3>Mon Profil</h3>
                <p>Modifier vos informations personnelles</p>
                <span className="seller-card-link">Modifier →</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="create-enterprise">
            <h1>Créer votre Store</h1>
            <p>Vous devez créer votre store avant de pouvoir vendre des produits.</p>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="create-enterprise-form">
              <form onSubmit={handleCreateEnterprise}>

                {/* Image upload */}
                <div className="form-group">
                  <label>Logo du store</label>
                  <div className="image-upload-area">
                    {preview ? (
                      <div className="image-preview">
                        <img src={preview} alt="Logo" />
                        <button type="button" className="image-remove"
                          onClick={() => { setImage(null); setPreview(null); }}>✕</button>
                      </div>
                    ) : (
                      <label className="image-upload-label" htmlFor="store-image">
                        <span className="upload-icon">🏪</span>
                        <span className="upload-text">Ajouter un logo</span>
                        <span className="upload-hint">JPG, PNG ou WEBP · Max 5MB</span>
                      </label>
                    )}
                    <input id="store-image" type="file" accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange} style={{ display: 'none' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nom du store *</label>
                  <input type="text" placeholder="Ex: Mon Store"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required />
                </div>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select value={form.category_id}
                    onChange={e => setForm({...form, category_id: e.target.value})}
                    required>
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Décrivez votre store..."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    rows={3} />
                </div>
                <button type="submit" className="btn-create" disabled={creating}>
                  {creating ? 'Création...' : '🏪 Créer mon store'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}