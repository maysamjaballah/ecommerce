import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Products.css';

export default function Products() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fakeLoading, setFakeLoading] = useState(false);
  const [fakeError, setFakeError]     = useState('');
  const [searchParams]            = useSearchParams();
  const search                    = searchParams.get('search') || '';
  const { addItem }               = useCart();
  const { user }                  = useAuth();
  const [adding, setAdding]       = useState({});
  const [success, setSuccess]     = useState({});
  const navigate                  = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [search]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await api.get('/products', { params: { search } });
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(productId) {
    setAdding(prev => ({ ...prev, [productId]: true }));
    try {
      await addItem(productId, 1);
      setSuccess(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => setSuccess(prev => ({ ...prev, [productId]: false })), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(prev => ({ ...prev, [productId]: false }));
    }
  }

  function mapFakeProduct(item) {
    return {
      id: `fake-${item.id}-${Date.now()}`,
      name: item.title,
      description: item.description,
      price: item.price || 0,
      stock: 99,
      category_name: item.category || 'Fake',
      enterprise_name: 'Fake API',
      image: item.image,
    };
  }

  async function addFakeProducts() {
    setFakeError('');
    setFakeLoading(true);

    try {
      const response = await axios.get('https://fakestoreapi.com/products?limit=5');
      const fakeProducts = response.data.map(mapFakeProduct);
      setProducts((prev) => [...fakeProducts, ...prev]);
    } catch (err) {
      console.error(err);
      setFakeError('Impossible de charger les produits fake.');
    } finally {
      setFakeLoading(false);
    }
  }

  return (
    <div className="products-page">
      <div className="products-container">
        <div className="products-header">
          <h1>
            {search ? `Résultats pour "${search}"` : 'Tous les produits'}
          </h1>
          <p>{products.length} produit(s)</p>
          <div className="products-actions">
            <button
              className="fake-products-btn"
              onClick={addFakeProducts}
              disabled={fakeLoading}
            >
              {fakeLoading ? 'Chargement...' : 'Ajouter 5 produits fake'}
            </button>
          </div>
          {fakeError && <p className="fake-error">{fakeError}</p>}
        </div>

        {loading ? (
          <div className="products-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-card skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <p>😔 Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div
                  className="product-content"
                  onClick={() => navigate(`/products/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image">
                    {product.image
                      ? <img src={product.image} alt={product.name} />
                      : <span>🛍️</span>
                    }
                  </div>
                  <div className="product-info">
                    <p className="product-enterprise">{product.enterprise_name}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">
                        {Number(product.price).toFixed(2)} TND
                      </span>
                      {product.stock === 0 && (
                        <span className="product-stock out">Rupture</span>
                      )}
                    </div>
                  </div>
                </div>
                {user?.role === 'client' && product.stock > 0 && (
                  <button
                    className={`add-to-cart-btn ${success[product.id] ? 'success' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la navigation
                      handleAddToCart(product.id);
                    }}
                    disabled={adding[product.id]}
                  >
                    {success[product.id] ? '✅ Ajouté !' : adding[product.id] ? 'Ajout...' : '🛒 Ajouter au panier'}
                  </button>
                )}
                {!user && product.stock > 0 && (
                  <p className="login-to-buy">Connectez-vous pour acheter</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}