import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RecommendationsSection from '../components/RecommendationsSection';
import { FaArrowLeft, FaShoppingCart, FaHeart, FaStar, FaTruck, FaShieldAlt } from 'react-icons/fa';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [liked, setLiked] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      const productData = res.data.data;
      setProduct(productData);
      setActiveImage(productData.image);
    } catch (err) {
      console.error('Erreur chargement produit:', err);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = async () => {
    if (!user || user.role !== 'client') {
      navigate('/auth/login');
      return;
    }

    setAdding(true);
    try {
      const productId = selectedVariant || product.id;
      await addItem(productId, 1);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      console.error('Erreur ajout panier:', err);
    } finally {
      setAdding(false);
    }
  };

  const selectVariant = (variant) => {
    setSelectedVariant(variant.id);
    if (variant.image) {
      setActiveImage(variant.image);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // Ici on pourrait sauvegarder la préférence utilisateur
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-loading">
          <div className="loading-spinner"></div>
          <p>Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="product-not-found">
          <h2>Produit non trouvé</h2>
          <button onClick={() => navigate('/products')} className="back-btn">
            <FaArrowLeft style={{ marginRight: '8px' }} />
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ?
    product.variants.find(v => v.id === selectedVariant)?.price || product.price :
    product.price;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">

        {/* Back Button */}
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Retour
        </button>

        <div className="product-detail-content">

          {/* Product Images */}
          <div className="product-images-section">
            <div className="main-image-container">
              <img
                src={activeImage || '/placeholder-product.png'}
                alt={product.name}
                className="main-image"
                onError={(e) => {
                  e.target.src = '/placeholder-product.png';
                }}
              />
              <button
                className={`like-button ${liked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <FaHeart />
              </button>
            </div>

            {/* Variant Images */}
            {product.variants && product.variants.length > 0 && (
              <div className="variant-images">
                <button
                  className={`variant-image-btn ${!selectedVariant ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedVariant(null);
                    setActiveImage(product.image);
                  }}
                >
                  <img
                    src={product.image || '/placeholder-product.png'}
                    alt="Produit principal"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.png';
                    }}
                  />
                </button>
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    className={`variant-image-btn ${selectedVariant === variant.id ? 'active' : ''}`}
                    onClick={() => selectVariant(variant)}
                  >
                    <img
                      src={variant.image || '/placeholder-product.png'}
                      alt={variant.color_name || `Variante ${variant.id}`}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <p className="product-enterprise">{product.enterprise_name}</p>
            </div>

            <div className="product-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <FaStar key={i} className="star" />
                ))}
              </div>
              <span className="rating-text">(4.5) • 127 avis</span>
            </div>

            <div className="product-price">
              <span className="current-price">{currentPrice} DT</span>
              {product.original_price && product.original_price > currentPrice && (
                <span className="original-price">{product.original_price} DT</span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="product-variants">
                <h3>Couleurs disponibles</h3>
                <div className="variant-buttons">
                  {product.variants.map(variant => (
                    <button
                      key={variant.id}
                      className={`variant-btn ${selectedVariant === variant.id ? 'active' : ''}`}
                      onClick={() => selectVariant(variant)}
                      style={{
                        backgroundColor: variant.color_hex,
                        border: variant.color_hex === '#FFFFFF' ? '2px solid #e0e0e0' : '2px solid transparent'
                      }}
                      title={variant.color_name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">
                  <FaTruck style={{ marginRight: '6px' }} />
                  En stock ({product.stock} disponible{product.stock > 1 ? 's' : ''})
                </span>
              ) : (
                <span className="out-of-stock">Rupture de stock</span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              className={`add-to-cart-btn ${success ? 'success' : ''}`}
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
            >
              {success ? (
                <>✓ Ajouté au panier !</>
              ) : adding ? (
                <>Ajout en cours...</>
              ) : (
                <>
                  <FaShoppingCart style={{ marginRight: '8px' }} />
                  Ajouter au panier
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <FaTruck />
                <span>Livraison gratuite</span>
              </div>
              <div className="trust-badge">
                <FaShieldAlt />
                <span>Garantie qualité</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="product-description-section">
          <h2>Description du produit</h2>
          <p className="product-description">{product.description}</p>
        </div>

        {/* AI Recommendations */}
        <div className="product-recommendations">
          <RecommendationsSection
            title="Produits similaires que vous pourriez aimer"
            type="similar"
            limit={6}
            showControls={false}
          />
        </div>

      </div>
    </div>
  );
}