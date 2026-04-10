import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import './ProductForm.css';

const PRESET_COLORS = [
  // Neutres
  { name: 'Noir',          hex: '#000000' },
  { name: 'Blanc',         hex: '#FFFFFF' },
  { name: 'Gris foncé',    hex: '#374151' },
  { name: 'Gris',          hex: '#6B7280' },
  { name: 'Gris clair',    hex: '#D1D5DB' },
  { name: 'Crème',         hex: '#FFFBEB' },
  { name: 'Beige',         hex: '#D4B896' },
  { name: 'Beige foncé',   hex: '#A8956B' },
  // Rouges
  { name: 'Rouge foncé',   hex: '#7F1D1D' },
  { name: 'Rouge',         hex: '#EF4444' },
  { name: 'Rouge clair',   hex: '#FCA5A5' },
  { name: 'Bordeaux',      hex: '#881337' },
  { name: 'Framboise',     hex: '#BE185D' },
  // Roses
  { name: 'Rose foncé',    hex: '#9D174D' },
  { name: 'Rose',          hex: '#EC4899' },
  { name: 'Rose clair',    hex: '#FBCFE8' },
  { name: 'Saumon',        hex: '#FDA4AF' },
  { name: 'Pêche',         hex: '#FDBA74' },
  // Oranges
  { name: 'Orange foncé',  hex: '#C2410C' },
  { name: 'Orange',        hex: '#F97316' },
  { name: 'Orange clair',  hex: '#FED7AA' },
  { name: 'Corail',        hex: '#FB7185' },
  { name: 'Terracotta',    hex: '#C2683F' },
  // Jaunes
  { name: 'Jaune foncé',   hex: '#92400E' },
  { name: 'Jaune',         hex: '#EAB308' },
  { name: 'Jaune clair',   hex: '#FEF08A' },
  { name: 'Or',            hex: '#D97706' },
  { name: 'Caramel',       hex: '#B45309' },
  // Verts
  { name: 'Vert foncé',    hex: '#14532D' },
  { name: 'Vert',          hex: '#22C55E' },
  { name: 'Vert clair',    hex: '#86EFAC' },
  { name: 'Olive',         hex: '#65A30D' },
  { name: 'Kaki',          hex: '#4D7C0F' },
  { name: 'Menthe',        hex: '#6EE7B7' },
  { name: 'Turquoise',     hex: '#0D9488' },
  { name: 'Émeraude',      hex: '#059669' },
  // Bleus
  { name: 'Bleu marine',   hex: '#1E3A5F' },
  { name: 'Bleu foncé',    hex: '#1D4ED8' },
  { name: 'Bleu',          hex: '#3B82F6' },
  { name: 'Bleu clair',    hex: '#93C5FD' },
  { name: 'Ciel',          hex: '#BAE6FD' },
  { name: 'Cyan',          hex: '#06B6D4' },
  { name: 'Indigo',        hex: '#4338CA' },
  { name: 'Cobalt',        hex: '#2563EB' },
  // Violets
  { name: 'Violet foncé',  hex: '#4C1D95' },
  { name: 'Violet',        hex: '#8B5CF6' },
  { name: 'Violet clair',  hex: '#C4B5FD' },
  { name: 'Lavande',       hex: '#DDD6FE' },
  { name: 'Mauve',         hex: '#A78BFA' },
  { name: 'Prune',         hex: '#6B21A8' },
  { name: 'Lilas',         hex: '#D8B4FE' },
  // Marrons
  { name: 'Marron foncé',  hex: '#451A03' },
  { name: 'Marron',        hex: '#92400E' },
  { name: 'Marron clair',  hex: '#D97706' },
  { name: 'Chocolat',      hex: '#78350F' },
  { name: 'Noisette',      hex: '#A16207' },
  { name: 'Taupe',         hex: '#8B7355' },
  { name: 'Chameau',       hex: '#C19A6B' },
];
export default function ProductForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form, setForm]         = useState({ name: '', description: '', price: '', stock: '', category_id: '' });
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [categories, setCategories]     = useState([]);
  const [variants, setVariants]         = useState([]);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [loadingData, setLoadingData]   = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, entRes] = await Promise.all([
          api.get('/categories'),
          api.get('/enterprise'),
        ]);
        const storeCatIds = entRes.data.data?.category_ids || [];
        const allCats = catRes.data.data;
        const filtered = storeCatIds.length > 0
          ? allCats.filter(c => storeCatIds.includes(c.id))
          : allCats;
        setCategories(filtered);

        if (isEdit) {
          const res = await api.get('/seller/products');
          const product = res.data.data.find(p => p.id === parseInt(id));
          if (product) {
            setForm({
              name:        product.name,
              description: product.description || '',
              price:       product.price,
              stock:       product.stock,
              category_id: product.category_id || '',
            });
            if (product.image) setCurrentImage(product.image);
          }
          // Load existing variants
          const varRes = await api.get(`/seller/products/${id}/variants`);
          setVariants(varRes.data.data.map(v => ({
            ...v,
            imageFile: null,
            imagePreview: v.image,
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function toggleColor(color) {
    const exists = variants.find(v => v.color_hex === color.hex);
    if (exists) {
      setVariants(prev => prev.filter(v => v.color_hex !== color.hex));
    } else {
      setVariants(prev => [...prev, {
        id: null,
        color_name: color.name,
        color_hex: color.hex,
        stock: 0,
        imageFile: null,
        imagePreview: null,
      }]);
    }
  }

  function updateVariantStock(hex, stock) {
    setVariants(prev => prev.map(v =>
      v.color_hex === hex ? { ...v, stock: parseInt(stock) || 0 } : v
    ));
  }

  function updateVariantImage(hex, file) {
    setVariants(prev => prev.map(v =>
      v.color_hex === hex ? {
        ...v,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      } : v
    ));
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
      if (form.category_id) formData.append('category_id', form.category_id);
      if (image) formData.append('image', image);

      let productId = id;

      if (isEdit) {
        await api.put(`/seller/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const res = await api.post('/seller/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        productId = res.data.data.id;
      }

      // Save variants
      if (variants.length > 0) {
        await api.post(`/seller/products/${productId}/variants`, {
          variants: variants.map(v => ({
            color_name: v.color_name,
            color_hex:  v.color_hex,
            stock:      v.stock,
          }))
        });

        // Upload variant images
        const varRes = await api.get(`/seller/products/${productId}/variants`);
        const savedVariants = varRes.data.data;

        for (const variant of variants) {
          if (variant.imageFile) {
            const saved = savedVariants.find(s => s.color_hex === variant.color_hex);
            if (saved) {
              const imgData = new FormData();
              imgData.append('image', variant.imageFile);
              await api.post(
                `/seller/products/${productId}/variants/${saved.id}/image`,
                imgData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
            }
          }
        }
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
          <button className="btn-back" onClick={() => navigate('/seller/products')}>← Retour</button>
          <h1>{isEdit ? '✏️ Modifier le produit' : '➕ Nouveau produit'}</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="product-form-card">
          <form onSubmit={handleSubmit}>

            {/* Photo principale */}
            <div className="form-group">
              <label>Photo principale du produit</label>
              <div className="image-upload-area">
                {(preview || currentImage) ? (
                  <div className="image-preview">
                    <img src={preview || currentImage} alt="Aperçu" />
                    <button type="button" className="image-remove"
                      onClick={() => { setImage(null); setPreview(null); setCurrentImage(null); }}>✕</button>
                  </div>
                ) : (
                  <label className="image-upload-label" htmlFor="image-input">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">Cliquer pour ajouter une photo</span>
                    <span className="upload-hint">JPG, PNG ou WEBP · Max 5MB</span>
                  </label>
                )}
                <input id="image-input" type="file" accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageChange} style={{ display: 'none' }} />
              </div>
            </div>

            {/* Nom */}
            <div className="form-group">
              <label>Nom du produit *</label>
              <input type="text" placeholder="Ex: Nike Air Force 1"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Décrivez votre produit..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                rows={3} />
            </div>

            {/* Catégorie */}
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

            {/* Prix & Stock */}
            <div className="form-row">
              <div className="form-group">
                <label>Prix (TND) *</label>
                <input type="number" placeholder="0.00" min="0" step="0.01"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  required />
              </div>
              <div className="form-group">
                <label>Stock total *</label>
                <input type="number" placeholder="0" min="0"
                  value={form.stock}
                  onChange={e => setForm({...form, stock: e.target.value})}
                  required />
              </div>
            </div>

            {/* Couleurs */}
            <div className="form-group">
              <label>Couleurs disponibles <span className="label-hint">(optionnel)</span></label>
              <div className="color-picker-grid">
                {PRESET_COLORS.map(color => (
                  <button key={color.hex} type="button"
                    className={`color-pick-btn ${variants.find(v => v.color_hex === color.hex) ? 'selected' : ''}`}
                    onClick={() => toggleColor(color)}
                    title={color.name}>
                    <span className="color-dot-lg" style={{
                      background: color.hex,
                      border: color.hex === '#FFFFFF' ? '2px solid #e0e0e0' : '2px solid transparent'
                    }} />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Variants selected */}
            {variants.length > 0 && (
              <div className="variants-selected">
                <p className="variants-title">📦 Détails par couleur</p>
                {variants.map((variant, i) => (
                  <div key={variant.color_hex} className="variant-item">
                    <div className="variant-left">
                      <span className="variant-ball" style={{
                        background: variant.color_hex,
                        border: variant.color_hex === '#FFFFFF' ? '2px solid #e0e0e0' : 'none'
                      }} />
                      <span className="variant-label">{variant.color_name}</span>
                    </div>
                    <div className="variant-middle">
                      <label>Stock</label>
                      <input type="number" min="0" value={variant.stock}
                        onChange={e => updateVariantStock(variant.color_hex, e.target.value)} />
                    </div>
                    <div className="variant-right">
                      {variant.imagePreview ? (
                        <div className="variant-img-wrap">
                          <img src={variant.imagePreview} alt={variant.color_name} />
                          <label htmlFor={`vimg-${i}`} className="change-vimg">📷</label>
                        </div>
                      ) : (
                        <label htmlFor={`vimg-${i}`} className="add-vimg-btn">📷 Photo</label>
                      )}
                      <input id={`vimg-${i}`} type="file" accept=".jpg,.jpeg,.png,.webp"
                        style={{ display: 'none' }}
                        onChange={e => updateVariantImage(variant.color_hex, e.target.files[0])} />
                    </div>
                    <button type="button" className="variant-del"
                      onClick={() => setVariants(prev => prev.filter(v => v.color_hex !== variant.color_hex))}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-buttons">
              <button type="button" className="btn-cancel"
                onClick={() => navigate('/seller/products')}>Annuler</button>
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