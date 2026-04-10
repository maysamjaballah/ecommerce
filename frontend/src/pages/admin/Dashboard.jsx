import { useState, useEffect } from 'react';
import api from '../../api';
import './Dashboard.css';

const STATUS_LABELS = {
  pending:    { label: 'En attente',  color: 'orange' },
  processing: { label: 'En cours',    color: 'blue'   },
  shipped:    { label: 'Expédié',     color: 'purple' },
  delivered:  { label: 'Livré',       color: 'green'  },
  cancelled:  { label: 'Annulé',      color: 'red'    },
};

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [stores, setStores]   = useState([]);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/stores'),
      api.get('/admin/orders'),
    ]).then(([statsRes, usersRes, storesRes, ordersRes]) => {
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setStores(storesRes.data.data);
      setOrders(ordersRes.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    setDeleting(prev => ({ ...prev, [`user-${id}`]: true }));
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression.');
    } finally {
      setDeleting(prev => ({ ...prev, [`user-${id}`]: false }));
    }
  }

  async function handleDeleteStore(id) {
    if (!confirm('Supprimer ce store et tous ses produits ?')) return;
    setDeleting(prev => ({ ...prev, [`store-${id}`]: true }));
    try {
      await api.delete(`/admin/stores/${id}`);
      setStores(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression.');
    } finally {
      setDeleting(prev => ({ ...prev, [`store-${id}`]: false }));
    }
  }

  if (loading) return <div className="admin-loading">Chargement...</div>;

  return (
    <div className="admin-page">
      <div className="admin-container">

        <div className="admin-header">
          <h1>⚙️ Dashboard Admin</h1>
          <p>Gérez la plateforme</p>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'stats'  ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            📊 Statistiques
          </button>
          <button className={`admin-tab ${activeTab === 'users'  ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            👥 Utilisateurs ({users.length})
          </button>
          <button className={`admin-tab ${activeTab === 'stores' ? 'active' : ''}`} onClick={() => setActiveTab('stores')}>
            🏪 Stores ({stores.length})
          </button>
          <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            📦 Commandes ({orders.length})
          </button>
        </div>

        {/* Stats */}
        {activeTab === 'stats' && stats && (
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <p className="stat-value">{stats.total_users}</p>
                <p className="stat-label">Utilisateurs</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛍️</div>
              <div className="stat-info">
                <p className="stat-value">{stats.total_clients}</p>
                <p className="stat-label">Clients</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏪</div>
              <div className="stat-info">
                <p className="stat-value">{stats.total_sellers}</p>
                <p className="stat-label">Vendeurs</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <p className="stat-value">{stats.total_products}</p>
                <p className="stat-label">Produits</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <p className="stat-value">{stats.total_orders}</p>
                <p className="stat-label">Commandes</p>
              </div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <p className="stat-value">{Number(stats.total_revenue || 0).toFixed(2)} TND</p>
                <p className="stat-label">Chiffre d'affaires</p>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="user-name">{user.name}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role === 'seller' ? '🏪 Vendeur' : '🛍️ Client'}
                      </span>
                    </td>
                    <td>
                      <span className={`verified-badge ${user.email_verified_at ? 'verified' : 'unverified'}`}>
                        {user.email_verified_at ? '✅ Vérifié' : '⏳ En attente'}
                      </span>
                    </td>
                    <td className="user-date">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <button className="btn-delete-user"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleting[`user-${user.id}`]}>
                        {deleting[`user-${user.id}`] ? '...' : '🗑️ Supprimer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stores */}
        {activeTab === 'stores' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Vendeur</th>
                  <th>Catégorie</th>
                  <th>Produits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>
                      <div className="store-cell">
                        <div className="store-avatar-sm">
                          {store.image
                            ? <img src={store.image} alt={store.name} />
                            : <span>🏪</span>
                          }
                        </div>
                        <p className="store-name-cell">{store.name}</p>
                      </div>
                    </td>
                    <td>
                      <p className="user-name">{store.seller_name}</p>
                      <p className="user-email">{store.seller_email}</p>
                    </td>
                    <td>
                      <span className="category-badge">{store.category_name}</span>
                    </td>
                    <td>
                      <span className="product-count">{store.product_count} produit(s)</span>
                    </td>
                    <td>
                      <button className="btn-delete-user"
                        onClick={() => handleDeleteStore(store.id)}
                        disabled={deleting[`store-${store.id}`]}>
                        {deleting[`store-${store.id}`] ? '...' : '🗑️ Supprimer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const status = STATUS_LABELS[order.status] || { label: order.status, color: 'gray' };
                  return (
                    <tr key={order.id}>
                      <td>
                        <p className="user-name">#{order.id}</p>
                        <p className="user-email">{order.item_count} article(s)</p>
                      </td>
                      <td>
                        <p className="user-name">{order.client_name}</p>
                        <p className="user-email">{order.client_email}</p>
                      </td>
                      <td>
                        <p className="order-total-cell">{Number(order.total).toFixed(2)} TND</p>
                      </td>
                      <td>
                        <span className={`status-badge status-${status.color}`}>{status.label}</span>
                      </td>
                      <td className="user-date">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}