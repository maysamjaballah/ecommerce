import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import './Orders.css';

const STATUS_LABELS = {
  pending:    { label: 'En attente',  color: 'orange' },
  processing: { label: 'En cours',    color: 'blue'   },
  shipped:    { label: 'Expédié',     color: 'purple' },
  delivered:  { label: 'Livré',       color: 'green'  },
  cancelled:  { label: 'Annulé',      color: 'red'    },
};

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="orders-loading">Chargement...</div>;

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>📦 Mes Commandes</h1>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <p>Vous n'avez pas encore de commandes</p>
            <Link to="/" className="btn-primary-link">
              Commencer mes achats
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const status = STATUS_LABELS[order.status] || { label: order.status, color: 'gray' };
              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <h3>Commande #{order.id}</h3>
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="order-card-right">
                      <span className={`status-badge status-${status.color}`}>
                        {status.label}
                      </span>
                      <p className="order-total">
                        {Number(order.total).toFixed(2)} TND
                      </p>
                    </div>
                  </div>
                  <div className="order-card-footer">
                    <p className="order-items-count">
                      {order.item_count} article(s) · {order.address}
                    </p>
                    <Link to={`/orders/${order.id}`} className="order-detail-link">
                      Voir le détail →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}