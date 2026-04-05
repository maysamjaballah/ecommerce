import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Home.css';


export default function Home() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchParams]              = useSearchParams();
  const search                      = searchParams.get('search') || '';
  const { addItem }                 = useCart();
  const { user }                    = useAuth();
  const [adding, setAdding]         = useState({});
  const [success, setSuccess]       = useState({});
  const storesRef                   = useRef(null);

  useEffect(() => {
    fetchData();
  }, [search]);

  async function fetchData() {
    try {
      setLoading(true);
      if (search) {
        const res = await api.get('/products', { params: { search } });
        setProducts(res.data.data);
      } else {
        const [prodRes, catRes, storeRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/stores'),
        ]);
        setProducts(prodRes.data.data);
        setCategories(catRes.data.data);
        setStores(storeRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(productId) {
    if (!user || user.role !== 'client') return;
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

  function scrollStores(dir) {
    if (storesRef.current) {
      storesRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  }

  // Group products by category
  const productsByCategory = categories.map(cat => ({
    ...cat,
    products: products.filter(p => p.category_name === cat.name)
  })).filter(cat => cat.products.length > 0);

  return (
    <div className="home">

      {/* Hero */}
      {!search && (
        <div className="hero">
          <div className="hero-content">
            <h1>Bienvenue sur eCommerce</h1>
            <p>Découvrez des milliers de produits de qualité</p>
            <Link to="/products" className="hero-btn">
              Voir tous les produits →
            </Link>
          </div>
        </div>
      )}

      {/* Search results */}
      {search && (
        <div className="home-container">
          <div className="search-header">
            <h2>Résultats pour "{search}"</h2>
            <p>{products.length} produit(s) trouvé(s)</p>
          </div>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} user={user}
                adding={adding} success={success} onAdd={handleAddToCart} />
            ))}
          </div>
        </div>
      )}

      {!search && (
        <div className="home-container">

          {/* Stores Carousel */}
          {stores.length > 0 && (
            <section className="stores-section">
              <h2 className="section-title"> Nos Stores</h2>
              <div className="stores-carousel-wrapper">
                <button className="carousel-btn left" onClick={() => scrollStores(-1)}>‹</button>
                <div className="stores-carousel" ref={storesRef}>
                  {stores.map(store => (
                    <div key={store.id} className="store-card">
                      <div className="store-avatar">
                        {store.image
                          ? <img src={store.image} alt={store.name} />
                          : <span></span>
                        }
                      </div>
                      <p className="store-name">{store.name}</p>
                      <p className="store-category">{store.category_name}</p>
                    </div>
                  ))}
                </div>
                <button className="carousel-btn right" onClick={() => scrollStores(1)}>›</button>
              </div>
            </section>
          )}

          {/* Products by Category */}
          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-card skeleton" />
              ))}
            </div>
          ) : productsByCategory.length === 0 ? (
            <div className="empty-state">
              <p> Aucun produit trouvé.</p>
            </div>
          ) : (
            productsByCategory.map(cat => (
              <section key={cat.id} className="category-section">
                <h2 className="category-title">{cat.name}</h2>
                <div className="products-grid">
                  {cat.products.map(product => (
                    <ProductCard key={product.id} product={product} user={user}
                      adding={adding} success={success} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>
            ))
          )}

        </div>
      )}
    </div>
  );
}

function ProductCard({ product, user, adding, success, onAdd }) {
  const [activeImage, setActiveImage] = useState(product.image);
  const [activeVariant, setActiveVariant] = useState(null);

  function selectVariant(variant) {
    setActiveVariant(variant.id);
    if (variant.image) setActiveImage(variant.image);
  }

  return (
    <div className={`product-card ${product.stock === 0 && !product.variants?.length ? 'out-of-stock' : ''}`}>
      <div className="product-image">
        {activeImage
          ? <img src={activeImage} alt={product.name} />
          : <span>🛍️</span>
        }
        {product.stock === 0 && !product.variants?.length && (
          <div className="out-of-stock-overlay">Rupture de stock</div>
        )}
      </div>
      <div className="product-info">
        <p className="product-enterprise">{product.enterprise_name}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        {/* Color variants */}
        {product.variants?.length > 0 && (
          <div className="product-colors">
            {product.variants.map(variant => (
              <button
                key={variant.id}
                className={`color-btn ${activeVariant === variant.id ? 'active' : ''}`}
                style={{
                  background: variant.color_hex,
                  border: variant.color_hex === '#FFFFFF' ? '2px solid #e0e0e0' : '2px solid transparent'
                }}
                onClick={() => selectVariant(variant)}
                title={variant.color_name}
              />
            ))}
          </div>
        )}

        <div className="product-footer">
          <span className="product-price">
            {Number(product.price).toFixed(2)} TND
          </span>
        </div>
        {user?.role === 'client' && product.stock > 0 && (
          <button
            className={`add-to-cart-btn ${success[product.id] ? 'success' : ''}`}
            onClick={() => onAdd(product.id)}
            disabled={adding[product.id]}
          >
            {success[product.id] ? '✅ Ajouté !' : adding[product.id] ? 'Ajout...' : '🛒 Ajouter au panier'}
          </button>
        )}
        {!user && product.stock > 0 && (
          <p className="login-to-buy">Connectez-vous pour acheter</p>
        )}
      </div>
    </div>
  );
}