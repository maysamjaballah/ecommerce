import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import './Products.css';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState({});
  const [error, setError]       = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await api.get('/seller/products');
      setProducts(res.data.data);
    } catch (err) {
      setError('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    setDeleting(prev => ({ ...prev, [id]: true }));
    try {
      await api.delete(`/seller/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression.');
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }));
    }
  }

  if (loading) return <div className="seller-products-loading">Chargement...</div>;

  return (
    <div className="seller-products-page">
      <div className="seller-products-container">

        <div className="seller-products-header">
          <div>
            <h1>📦 Mes Produits</h1>
            <p>{products.length} produit(s)</p>
          </div>
          <Link to="/seller/products/create" className="btn-add">
            ➕ Nouveau produit
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {products.length === 0 ? (
          <div className="seller-products-empty">
            <p>Vous n'avez pas encore de produits</p>
            <Link to="/seller/products/create" className="btn-add">
              Ajouter mon premier produit
            </Link>
          </div>
        ) : (
          <div className="seller-products-table-wrap">
            <table className="seller-products-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-cell-icon">🛍️</div>
                        <div>
                          <p className="product-cell-name">{product.name}</p>
                          <p className="product-cell-desc">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="product-price">
                        {Number(product.price).toFixed(2)} TND
                      </span>
                    </td>
                    <td>
                      <span className={`stock-badge ${product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : 'ok'}`}>
                        {product.stock === 0 ? 'Rupture' : `${product.stock} unités`}
                      </span>
                    </td>
                    <td>
                      <div className="product-actions">
                        <Link
                          to={`/seller/products/edit/${product.id}`}
                          className="btn-edit"
                        >
                          ✏️ Modifier
                        </Link>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting[product.id]}
                        >
                          {deleting[product.id] ? '...' : '🗑️ Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}