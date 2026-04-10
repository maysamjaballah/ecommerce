import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaBolt, FaDollarSign, FaShoppingCart, FaUsers, FaBox, FaStore, FaUser, FaChartLine, FaTrophy, FaBuilding, FaClipboardList, FaUserFriends } from 'react-icons/fa';
import api from '../../api';
import './Dashboard.css';

const STATUS_COLORS = {
  pending: '#FFA500',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444'
};

const ROLE_COLORS = {
  client: '#3B82F6',
  seller: '#10B981'
};

export default function AdminBIDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [dateFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const params = { dateFilter };

      const [statsRes, trendRes, productsRes, storesRes, statusRes, usersRes] = await Promise.all([
        api.get('/admin/bi/stats', { params }),
        api.get('/admin/bi/revenue-trend', { params }),
        api.get('/admin/bi/top-products', { params }),
        api.get('/admin/bi/top-stores', { params }),
        api.get('/admin/bi/order-status', { params }),
        api.get('/admin/bi/user-stats', { params })
      ]);

      setStats(statsRes.data.data);
      setRevenueTrend(trendRes.data.data);
      setTopProducts(productsRes.data.data);
      setTopStores(storesRes.data.data);
      setOrderStatus(statusRes.data.data);
      setUserStats(usersRes.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des données BI:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="admin-loading">Chargement des données BI...</div>;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1><FaBolt style={{marginRight: '12px'}} />Dashboard Admin - BI Complète</h1>
          <p>Analysez la plateforme en temps réel</p>
        </div>

        {/* Date Filter */}
        <div className="bi-filters">
          <button
            className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
            onClick={() => setDateFilter('today')}
          >
            Aujourd'hui
          </button>
          <button
            className={`filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
            onClick={() => setDateFilter('week')}
          >
            Cette semaine
          </button>
          <button
            className={`filter-btn ${dateFilter === 'month' ? 'active' : ''}`}
            onClick={() => setDateFilter('month')}
          >
            Ce mois
          </button>
          <button
            className={`filter-btn ${dateFilter === 'year' ? 'active' : ''}`}
            onClick={() => setDateFilter('year')}
          >
            Cette année
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine style={{marginRight: '6px'}} />Aperçu
          </button>
          <button
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBox style={{marginRight: '6px'}} />Produits
          </button>
          <button
            className={`admin-tab ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            <FaBuilding style={{marginRight: '6px'}} />Stores
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUserFriends style={{marginRight: '6px'}} />Utilisateurs
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            {stats && (
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaDollarSign />
                  </div>
                  <div className="stat-info">
                      <p className="stat-value">{stats.revenue.toFixed(2)} DT</p>
                    <p className="stat-label">Chiffre d'affaires</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaShoppingCart />
                  </div>
                  <div className="stat-info">
                    <p className="stat-value">{stats.orders}</p>
                    <p className="stat-label">Commandes totales</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUserFriends />
                  </div>
                  <div className="stat-info">
                    <p className="stat-value">{stats.users}</p>
                    <p className="stat-label">Utilisateurs</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaBox />
                  </div>
                  <div className="stat-info">
                    <p className="stat-value">{stats.products}</p>
                    <p className="stat-label">Produits actifs</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaBuilding />
                  </div>
                  <div className="stat-info">
                    <p className="stat-value">{stats.sellers}</p>
                    <p className="stat-label">Sellers</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUser />
                  </div>
                  <div className="stat-info">
                    <p className="stat-value">{stats.clients}</p>
                    <p className="stat-label">Clients</p>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Trend */}
            <div className="bi-section">
              <h2><FaChartLine style={{marginRight: '8px'}} />Tendance des revenus</h2>
              {revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Chiffre d'affaires (DT)" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="#10B981" name="Commandes" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>Aucune donnée disponible</p>
              )}
            </div>

            {/* Order Status */}
            <div className="bi-section">
              <h2><FaClipboardList style={{marginRight: '8px'}} />Statut des commandes</h2>
              {orderStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      label
                    >
                      {orderStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#999'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>Aucune commande</p>
              )}
            </div>

            {/* User Distribution */}
            <div className="bi-section">
              <h2><FaUserFriends style={{marginRight: '8px'}} />Distribution des utilisateurs</h2>
              {userStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userStats}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      label
                    >
                      {userStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role] || '#999'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>Aucun utilisateur</p>
              )}
            </div>
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bi-section">
            <h2><FaTrophy style={{marginRight: '8px'}} />Top 10 Produits</h2>
            {topProducts.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="quantity" fill="#8B5CF6" name="Quantité vendue" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#F59E0B" name="Chiffre d'affaires (DT)" />
                  </BarChart>
                </ResponsiveContainer>
                <table className="bi-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Store</th>
                      <th>Quantité</th>
                      <th>Chiffre d'affaires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.store}</td>
                        <td>{p.quantity}</td>
                        <td>{p.revenue.toFixed(2)} DT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>Aucun produit vendu</p>
            )}
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <div className="bi-section">
            <h2><FaBuilding style={{marginRight: '8px'}} />Top 10 Stores</h2>
            {topStores.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topStores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" fill="#10B981" name="Commandes" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#F59E0B" name="Chiffre d'affaires (DT)" />
                  </BarChart>
                </ResponsiveContainer>
                <table className="bi-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Propriétaire</th>
                      <th>Commandes</th>
                      <th>Chiffre d'affaires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStores.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.owner}</td>
                        <td>{s.orders}</td>
                        <td>{s.revenue.toFixed(2)} DT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>Aucun store</p>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bi-section">
            <h2><FaUserFriends style={{marginRight: '8px'}} />Statistiques utilisateurs</h2>
            {userStats.length > 0 ? (
              <table className="bi-table">
                <thead>
                  <tr>
                    <th>Rôle</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map((u) => (
                    <tr key={u.role}>
                      <td>{u.role}</td>
                      <td>{u.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun utilisateur</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
