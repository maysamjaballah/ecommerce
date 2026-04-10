import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaDollarSign, FaShoppingCart, FaCreditCard, FaUsers, FaBox, FaChartLine, FaTrophy, FaClipboardList } from 'react-icons/fa';
import api from '../../api';
import './Dashboard.css';

const STATUS_COLORS = {
  pending: '#FFA500',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444'
};

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month');

  useEffect(() => {
    loadData();
  }, [dateFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const params = { dateFilter };

      const [statsRes, trendRes, productsRes, statusRes] = await Promise.all([
        api.get('/seller/bi/stats', { params }),
        api.get('/seller/bi/revenue-trend', { params }),
        api.get('/seller/bi/top-products', { params }),
        api.get('/seller/bi/order-status', { params })
      ]);

      setStats(statsRes.data.data);
      setRevenueTrend(trendRes.data.data);
      setTopProducts(productsRes.data.data);
      setOrderStatus(statusRes.data.data);
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
          <h1><FaChartLine style={{marginRight: '12px'}} />Dashboard Seller - BI</h1>
          <p>Analysez vos ventes et performances</p>
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
                <p className="stat-label">Commandes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaCreditCard />
              </div>
              <div className="stat-info">
                <p className="stat-value">{stats.avgOrderValue.toFixed(2)} DT</p>
                <p className="stat-label">Panier moyen</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <p className="stat-value">{stats.customers}</p>
                <p className="stat-label">Clients uniques</p>
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
          </div>
        )}

        {/* Charts */}
        <div className="bi-section">
          <h2><FaChartLine style={{marginRight: '8px'}} />Tendance des ventes</h2>
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Chiffre d'affaires (DT)" />
                <Line type="monotone" dataKey="orders" stroke="#10B981" name="Commandes" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Aucune donnée disponible</p>
          )}
        </div>

        <div className="bi-section">
          <h2><FaTrophy style={{marginRight: '8px'}} />Top 10 Produits</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8B5CF6" name="Quantité vendue" />
                <Bar dataKey="revenue" fill="#F59E0B" name="Chiffre d'affaires (DT)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>Aucun produit vendu</p>
          )}
        </div>

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
      </div>
    </div>
  );
}
