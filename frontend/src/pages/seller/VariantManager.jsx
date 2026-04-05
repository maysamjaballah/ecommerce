import { useState, useEffect } from 'react';
import api from '../../api';
import './VariantManager.css';

const PRESET_COLORS = [
  { name: 'Noir',    hex: '#000000' },
  { name: 'Blanc',   hex: '#FFFFFF' },
  { name: 'Rouge',   hex: '#EF4444' },
  { name: 'Bleu',    hex: '#3B82F6' },
  { name: 'Vert',    hex: '#22C55E' },
  { name: 'Jaune',   hex: '#EAB308' },
  { name: 'Rose',    hex: '#EC4899' },
  { name: 'Orange',  hex: '#F97316' },
  { name: 'Marron',  hex: '#92400E' },
  { name: 'Gris',    hex: '#6B7280' },
  { name: 'Violet',  hex: '#8B5CF6' },
  { name: 'Beige',   hex: '#D4B896' },
];

export default function VariantManager({ productId }) {
  const [variants, setVariants]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    if (!productId) return;
    api.get(`/seller/products/${productId}/variants`)
      .then(res => setVariants(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  function addColor(color) {
    if (variants.find(v => v.color_hex === color.hex)) return;
    setVariants(prev => [...prev, {
      id: null,
      color_name: color.name,
      color_hex: color.hex,
      stock: 0,
      image: null,
    }]);
  }

  function removeVariant(index) {
    setVariants(prev => prev.filter((_, i) => i !== index));
  }

  function updateStock(index, stock) {
    setVariants(prev => prev.map((v, i) =>
      i === index ? { ...v, stock: parseInt(stock) || 0 } : v
    ));
  }

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.post(`/seller/products/${productId}/variants`, { variants });
     const savedVariants = res.data.data;
setVariants(prev => prev.map(v => {
  const saved = savedVariants.find(s => s.color_hex === v.color_hex);
  return saved ? { ...saved, image: saved.image || v.image } : v;
}));
      setSuccess('Variantes sauvegardées !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(variantId, file) {
    if (!variantId) {
      setError('Sauvegardez d\'abord les variantes avant d\'ajouter des photos.');
      return;
    }
    setUploadingId(variantId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post(
        `/seller/products/${productId}/variants/${variantId}/image`,
        formData, { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setVariants(prev => prev.map(v =>
        v.id === variantId ? { ...v, image: res.data.image } : v
      ));
    } catch (err) {
      setError('Erreur upload image.');
    } finally {
      setUploadingId(null);
    }
  }

  if (loading) return <div className="vm-loading">Chargement...</div>;

  return (
    <div className="variant-manager">
      <h3>🎨 Couleurs disponibles</h3>
      <p className="vm-subtitle">Ajoutez les couleurs disponibles pour ce produit</p>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Color presets */}
      <div className="color-presets">
        {PRESET_COLORS.map(color => (
          <button
            key={color.hex}
            className={`color-preset ${variants.find(v => v.color_hex === color.hex) ? 'selected' : ''}`}
            onClick={() => addColor(color)}
            title={color.name}
          >
            <span className="color-dot" style={{ background: color.hex,
              border: color.hex === '#FFFFFF' ? '1px solid #e0e0e0' : 'none' }} />
            <span className="color-preset-name">{color.name}</span>
          </button>
        ))}
      </div>

      {/* Selected variants */}
      {variants.length > 0 && (
        <div className="variants-list">
          <h4>Couleurs sélectionnées ({variants.length})</h4>
          {variants.map((variant, index) => (
            <div key={index} className="variant-row">
              <div className="variant-color">
                <span className="color-ball" style={{ background: variant.color_hex,
                  border: variant.color_hex === '#FFFFFF' ? '1px solid #e0e0e0' : 'none' }} />
                <span className="variant-name">{variant.color_name}</span>
              </div>

              <div className="variant-stock">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={e => updateStock(index, e.target.value)}
                />
              </div>

              <div className="variant-image">
                {variant.image ? (
                  <div className="variant-img-preview">
                    <img src={variant.image} alt={variant.color_name} />
                    <label htmlFor={`img-${index}`} className="change-img">📷</label>
                  </div>
                ) : (
                  <label htmlFor={`img-${index}`} className="upload-img-btn">
                    📷 Photo
                  </label>
                )}
                <input
                  id={`img-${index}`}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={e => handleImageUpload(variant.id, e.target.files[0])}
                  disabled={!variant.id || uploadingId === variant.id}
                />
                {uploadingId === variant.id && <span className="uploading">⏳</span>}
              </div>

              <button className="variant-remove" onClick={() => removeVariant(index)}>✕</button>
            </div>
          ))}

          <button className="btn-save-variants" onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les couleurs'}
          </button>
        </div>
      )}
    </div>
  );
}