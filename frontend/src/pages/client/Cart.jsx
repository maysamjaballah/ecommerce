import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

export default function Cart() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="cart-loading">Chargement...</div>;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>🛒 Mon Panier</h1>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <p>Votre panier est vide</p>
            <Link to="/" className="btn-primary-link">Continuer mes achats</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item.product_id} className="cart-item">
                  <div className="cart-item-image">🛍️</div>
                  <div className="cart-item-info">
                    <p className="cart-item-enterprise">{item.enterprise_name}</p>
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">{Number(item.price).toFixed(2)} TND</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button onClick={() => updateItem(item.product_id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}>+</button>
                    </div>
                    <p className="cart-item-subtotal">{Number(item.subtotal).toFixed(2)} TND</p>
                    <button className="cart-remove" onClick={() => removeItem(item.product_id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-total">
                <span>Total</span>
                <span className="total-amount">{Number(cart.total).toFixed(2)} TND</span>
              </div>
              <div className="cart-buttons">
                <button className="btn-clear" onClick={clearCart}>
                  Vider le panier
                </button>
                <button className="btn-checkout" onClick={() => navigate('/checkout')}>
                  Passer la commande →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}