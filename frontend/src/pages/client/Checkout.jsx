import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ address: '', phone: '', notes: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { cart, clearCart } = useCart();

async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await api.post('/orders', form);
    await clearCart(); // ← vide le panier dans le context
    navigate(`/orders/${res.data.data.id}`);
  } catch (err) {
    setError(err.response?.data?.message || 'Erreur lors de la commande.');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Finaliser la commande</h1>

        <div className="checkout-grid">

          {/* Form */}
          <div className="checkout-form-section">
            <div className="checkout-card">
              <h2>Informations de livraison</h2>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Adresse de livraison *</label>
                  <textarea
                    placeholder="Numéro, rue, ville, code postal..."
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    rows={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notes (optionnel)</label>
                  <textarea
                    placeholder="Instructions spéciales pour la livraison..."
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="checkout-buttons">
                  <button type="button" className="btn-back"
                    onClick={() => navigate('/cart')}>
                    ← Retour au panier
                  </button>
                  <button type="submit" className="btn-order" disabled={loading}>
                    {loading ? 'Commande en cours...' : '✅ Confirmer la commande'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary-section">
            <div className="checkout-card">
              <h2>Récapitulatif</h2>
              <div className="summary-items">
                {cart.items.map(item => (
                  <div key={item.product_id} className="summary-item">
                    <div className="summary-item-info">
                      <p className="summary-item-name">{item.name}</p>
                      <p className="summary-item-qty">x{item.quantity}</p>
                    </div>
                    <p className="summary-item-price">
                      {Number(item.subtotal).toFixed(2)} TND
                    </p>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Livraison</span>
                <span className="free">Gratuite</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{Number(cart.total).toFixed(2)} TND</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}