import { useState } from 'react';
import { FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
import './RecommendationCard.css';

export default function RecommendationCard({ product, onAddToCart }) {
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await onAddToCart(product.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      console.error('Erreur ajout panier:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // Ici on pourrait sauvegarder la préférence utilisateur
  };

  const getRecommendationLabel = () => {
    switch (product.recommendation_type) {
      case 'based_on_your_interests':
        return 'Pour vous';
      case 'popular':
        return 'Populaire';
      case 'similar':
        return 'Similaire';
      case 'trending':
        return 'Tendance';
      default:
        return 'Recommandé';
    }
  };

  return (
    <div className="recommendation-card">
      <div className="recommendation-badge">
        {getRecommendationLabel()}
      </div>

      <div className="recommendation-image-container">
        <img
          src={product.image || '/placeholder-product.png'}
          alt={product.name}
          className="recommendation-image"
          onError={(e) => {
            e.target.src = '/placeholder-product.png';
          }}
        />
        <button
          className={`like-button ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          title="Ajouter aux favoris"
        >
          <FaHeart />
        </button>
      </div>

      <div className="recommendation-content">
        <h4 className="recommendation-title">{product.name}</h4>
        <p className="recommendation-enterprise">{product.enterprise_name}</p>
        <p className="recommendation-category">{product.category_name}</p>

        <div className="recommendation-price-section">
          <span className="recommendation-price">{product.price} DT</span>
          {product.original_price && product.original_price > product.price && (
            <span className="recommendation-original-price">
              {product.original_price} DT
            </span>
          )}
        </div>

        <div className="recommendation-rating">
          <FaStar className="star-icon" />
          <span>4.5</span> {/* On pourrait calculer la vraie note plus tard */}
        </div>

        <button
          className={`recommendation-add-btn ${success ? 'success' : ''}`}
          onClick={handleAddToCart}
          disabled={adding}
        >
          {success ? (
            <>✓ Ajouté !</>
          ) : adding ? (
            <>Ajout...</>
          ) : (
            <>
              <FaShoppingCart style={{ marginRight: '6px' }} />
              Ajouter
            </>
          )}
        </button>
      </div>
    </div>
  );
}