import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import './ProductForm.css';

export default function ProductForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);

  const [form, setForm]         = useState({ name: '', description: '', price: '', stock: '' });
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(`/seller/products`).then(res => {
        const product = res.data.data.find(p => p.id === parseInt(id));
        if (product) {
          setForm({
            name:        product.name,
            description: product.description || '',
            price:       product.price,
            stock:       product.stock,
          });
          if (product.image) setCurrentImage(product.image);
        }
      }).catch(console.error)
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setPreview(null);
    setCurrentImage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name',        form.name);
      formData.append('description', form.description);
      formData.append('price',       form.price);
      formData.append('stock',       form.stock);
      if (image) formData.append('image', image);

      if (isEdit) {
        await api.put(`/seller/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/seller/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) return <div className="product-form-loading">Chargement...</div>;

  return (
    <div className="product-form-page">
      <div className="product-form-container">
        <div className="product-form-header">
          <button className="btn-back" onClick={() => navigate('/seller/products')}>
            ← Retour
          </button>
          <h1>{isEdit ? '✏️ Modifier le produit' : '➕ Nouveau produit'}</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="product-form-card">
          <form onSubmit={handleSubmit}>

            {/* Image upload */}
            <div className="form-group">
              <label>Photo du produit</label>
              <div className="image-upload-area">
                {(preview || currentImage) ? (
                  <div className="image-preview">
                    <img src={preview || currentImage} alt="Aperçu" />
                    <button type="button" className="image-remove" onClick={removeImage}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="image-upload-label" htmlFor="image-input">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">Cliquer pour ajouter une photo</span>
                    <span className="upload-hint">JPG, PNG ou WEBP · Max 5MB</span>
                  </label>
                )}
                <input
                  id="image-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Name */}
            <div className="form-group">
              <label>Nom du produit *</label>
              <input
                type="text"
                placeholder="Ex: iPhone 15 Pro"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Décrivez votre produit..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                rows={4}
              />
            </div>

            {/* Price & Stock */}
            <div className="form-row">
              <div className="form-group">
                <label>Prix (TND) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm({...form, stock: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-cancel"
                onClick={() => navigate('/seller/products')}>
                Annuler
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Enregistrement...' : isEdit ? '💾 Modifier' : '➕ Créer le produit'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}