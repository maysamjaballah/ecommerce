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
  const [form, setForm]             = useState({ name: '', category_ids: [], description: '' });
  const [image, setImage]           = useState(null);
  const [preview, setPreview]       = useState(null);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [creating, setCreating]     = useState(false);
  const [editing, setEditing]       = useState(false);
  const [showEdit, setShowEdit]     = useState(false);

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

  function toggleCategory(id) {
    setForm(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter(c => c !== id)
        : [...prev.category_ids, id]
    }));
  }

  function openEdit() {
    setForm({
      name: enterprise.name,
      category_ids: enterprise.category_ids || [],
      description: enterprise.description || '',
    });
    setPreview(enterprise.image || null);
    setImage(null);
    setError('');
    setSuccess('');
    setShowEdit(true);
  }

  async function handleCreateEnterprise(e) {
    e.preventDefault();
    if (form.category_ids.length === 0) {
      setError('Veuillez sélectionner au moins une catégorie.');
      return;
    }
    setError(''); setCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      form.category_ids.forEach(id => formData.append('category_ids[]', id));
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

  async function handleUpdateEnterprise(e) {
    e.preventDefault();
    if (form.category_ids.length === 0) {
      setError('Veuillez sélectionner au moins une catégorie.');
      return;
    }
    setError(''); setEditing(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      form.category_ids.forEach(id => formData.append('category_ids[]', id));
      if (image) formData.append('image', image);
      const res = await api.put('/enterprise', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEnterprise(res.data.data);
      setSuccess('Store mis à jour avec succès !');
      setShowEdit(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    } finally {
      setEditing(false);
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
                  <p className="enterprise-category">{enterprise.category_names}</p>
                </div>
                <button className="btn-edit-store" onClick={openEdit}>✏️</button>
              </div>
            </div>

            {success && <div className="alert alert-success">{success}</div>}

            {/* Edit Store Form */}
            {showEdit && (
              <div className="edit-store-form">
                <div className="edit-store-header">
                  <h2>Modifier le store</h2>
                  <button className="btn-close-edit" onClick={() => setShowEdit(false)}>✕</button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleUpdateEnterprise}>
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
                        <label className="image-upload-label" htmlFor="store-image-edit">
                          <span className="upload-icon">🏪</span>
                          <span className="upload-text">Changer le logo</span>
                          <span className="upload-hint">JPG, PNG ou WEBP · Max 5MB</span>
                        </label>
                      )}
                      <input id="store-image-edit" type="file" accept=".jpg,.jpeg,.png,.webp"
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
                    <label>Catégories * <span className="label-hint">(sélectionnez une ou plusieurs)</span></label>
                    <div className="categories-checkboxes">
                      {categories.map(cat => (
                        <label key={cat.id} className={`category-checkbox ${form.category_ids.includes(cat.id) ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={form.category_ids.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                          />
                          {cat.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Décrivez votre store..."
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      rows={3} />
                  </div>

                  <div className="edit-store-buttons">
                    <button type="button" className="btn-cancel-edit" onClick={() => setShowEdit(false)}>
                      Annuler
                    </button>
                    <button type="submit" className="btn-save-store" disabled={editing}>
                      {editing ? 'Enregistrement...' : '💾 Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                  <label>Catégories * <span className="label-hint">(sélectionnez une ou plusieurs)</span></label>
                  <div className="categories-checkboxes">
                    {categories.map(cat => (
                      <label key={cat.id} className={`category-checkbox ${form.category_ids.includes(cat.id) ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.category_ids.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
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