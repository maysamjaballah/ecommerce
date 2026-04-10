import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaRobot } from 'react-icons/fa';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RecommendationCard from './RecommendationCard';
import './RecommendationsSection.css';

export default function RecommendationsSection({
  title = "Recommandations pour vous",
  type = "personalized",
  limit = 8,
  showControls = true
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadRecommendations();
  }, [type, user]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint;
      switch (type) {
        case 'personalized':
          endpoint = user ? '/recommendations/personalized' : '/recommendations/popular';
          break;
        case 'popular':
          endpoint = '/recommendations/popular';
          break;
        case 'trending':
          endpoint = '/recommendations/trending';
          break;
        default:
          endpoint = '/recommendations/popular';
      }

      const response = await api.get(endpoint, {
        params: { limit }
      });

      setRecommendations(response.data.data || []);
    } catch (err) {
      console.error('Erreur chargement recommandations:', err);
      setError('Impossible de charger les recommandations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    await addItem(productId, 1);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + 4 >= recommendations.length ? 0 : prev + 4
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - 4 < 0 ? Math.max(0, recommendations.length - 4) : prev - 4
    );
  };

  const visibleRecommendations = recommendations.slice(currentIndex, currentIndex + 4);

  if (loading) {
    return (
      <div className="recommendations-section">
        <div className="recommendations-header">
          <h3>
            <FaRobot style={{ marginRight: '8px' }} />
            {title}
          </h3>
        </div>
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Analysant vos préférences...</p>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Ne pas afficher la section si pas de recommandations
  }

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h3>
          <FaRobot style={{ marginRight: '8px' }} />
          {title}
        </h3>
        {showControls && recommendations.length > 4 && (
          <div className="recommendations-controls">
            <button
              className="control-btn"
              onClick={prevSlide}
              disabled={currentIndex === 0}
            >
              <FaChevronLeft />
            </button>
            <button
              className="control-btn"
              onClick={nextSlide}
              disabled={currentIndex + 4 >= recommendations.length}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      <div className="recommendations-grid">
        {visibleRecommendations.map((product) => (
          <RecommendationCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {recommendations.length > 4 && (
        <div className="recommendations-indicators">
          {Array.from({ length: Math.ceil(recommendations.length / 4) }, (_, i) => (
            <button
              key={i}
              className={`indicator ${Math.floor(currentIndex / 4) === i ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i * 4)}
            />
          ))}
        </div>
      )}
    </div>
  );
}