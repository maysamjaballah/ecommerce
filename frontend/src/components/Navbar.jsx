import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';
import './Navbar.css';

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { cartCount }     = useCart();
  const navigate          = useNavigate();

  const [search, setSearch]         = useState('');
  const [showAuth, setShowAuth]     = useState(false);
  const [showDropdown, setDropdown] = useState(false);
  const dropdownRef                 = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  }

  function handleLogout() {
    logout();
    setDropdown(false);
    navigate('/');
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
             eCommerce
          </Link>

          {/* Dashboard link — seller & admin only */}
          {user?.role === 'seller' && (
            <Link to="/seller" className="navbar-dashboard">
               Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar-dashboard">
               Dashboard
            </Link>
          )}
          {user?.role === 'seller' && (
            <Link to="/seller/bi" className="navbar-dashboard">
               📊 BI
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/bi" className="navbar-dashboard">
               📊 BI
            </Link>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} className="navbar-search">
            <input
              type="text"
              placeholder="Rechercher des produits..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>

          {/* Right side */}
          <div className="navbar-right">

            {/* Cart — client only */}
            {user?.role === 'client' && (
              <Link to="/cart" className="navbar-cart">
                🛒
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
            )}

            {/* Profile */}
            {user ? (
              <div className="navbar-profile" ref={dropdownRef}>
                <button
                  className="profile-btn"
                  onClick={() => setDropdown(!showDropdown)}
                >
                  👤 {user.name}
                </button>
                {showDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                      <span className="dropdown-role">{user.role}</span>
                    </div>
                    <Link to="/profile" onClick={() => setDropdown(false)}>
                      👤 Mon profil
                    </Link>
                    {user.role === 'client' && (
                      <Link to="/orders" onClick={() => setDropdown(false)}>
                         Mes commandes
                      </Link>
                    )}
                    {user.role === 'seller' && (
                      <>
                        <Link to="/seller" onClick={() => setDropdown(false)}>
                           Dashboard
                        </Link>
                        <Link to="/seller/bi" onClick={() => setDropdown(false)}>
                           📊 Analytics BI
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin" onClick={() => setDropdown(false)}>
                           Dashboard
                        </Link>
                        <Link to="/admin/bi" onClick={() => setDropdown(false)}>
                           📊 Analytics BI
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="logout-btn">
                       Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="navbar-login-btn"
                onClick={() => setShowAuth(true)}
              >
                 Connexion
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}