import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import './OrderDetail.css';

const STATUS_LABELS = {
  pending:    { label: 'En attente',  color: 'orange' },
  processing: { label: 'En cours',    color: 'blue'   },
  shipped:    { label: 'Expédié',     color: 'purple' },
  delivered:  { label: 'Livré',       color: 'green'  },
  cancelled:  { label: 'Annulé',      color: 'red'    },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(() => setError('Commande introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="order-detail-loading">Chargement...</div>;
  if (error)   return <div className="order-detail-error">{error}</div>;

  const status = STATUS_LABELS[order.status] || { label: order.status, color: 'gray' };

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">

        {/* Success banner */}
        <div className="order-success-banner">
          <span>✅</span>
          <div>
            <h2>Commande confirmée !</h2>
            <p>Merci pour votre commande. Nous la traitons dès que possible.</p>
          </div>
        </div>

        <div className="order-detail-grid">

          {/* Order Info */}
          <div className="order-detail-card">
            <h3>Informations commande</h3>
            <div className="info-row">
              <span>Numéro</span>
              <span className="info-value">#{order.id}</span>
            </div>
            <div className="info-row">
              <span>Date</span>
              <span className="info-value">
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <div className="info-row">
              <span>Statut</span>
              <span className={`status-badge status-${status.color}`}>{status.label}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="order-detail-card">
            <h3>Livraison</h3>
            <div className="info-row">
              <span>Adresse</span>
              <span className="info-value">{order.address}</span>
            </div>
            <div className="info-row">
              <span>Téléphone</span>
              <span className="info-value">{order.phone}</span>
            </div>
            {order.notes && (
              <div className="info-row">
                <span>Notes</span>
                <span className="info-value">{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="order-detail-card">
          <h3>Articles commandés</h3>
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td>
                    <p className="item-name">{item.product_name}</p>
                    <p className="item-enterprise">{item.enterprise_name}</p>
                  </td>
                  <td>{Number(item.price).toFixed(2)} TND</td>
                  <td>{item.quantity}</td>
                  <td className="item-subtotal">
                    {(Number(item.price) * item.quantity).toFixed(2)} TND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="order-items-total">
            <span>Total</span>
            <span>{Number(order.total).toFixed(2)} TND</span>
          </div>
        </div>

        {/* Actions */}
        <div className="order-detail-actions">
          <Link to="/orders" className="btn-back-orders">
            ← Mes commandes
          </Link>
          <Link to="/" className="btn-continue">
            Continuer mes achats
          </Link>
        </div>

      </div>
    </div>
  );
}