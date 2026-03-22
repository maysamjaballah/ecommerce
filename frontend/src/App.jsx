import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar       from './components/Navbar';
import Home         from './pages/Home';
import VerifyEmail  from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Profile      from './pages/Profile';

import ClientProducts from './pages/client/Products';
import Cart           from './pages/client/Cart';
import Checkout       from './pages/client/Checkout';
import Orders         from './pages/client/Orders';
import OrderDetail    from './pages/client/OrderDetail';

import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts  from './pages/seller/Products';
import ProductForm     from './pages/seller/ProductForm';

import AdminDashboard from './pages/admin/Dashboard';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Chargement...</div>;
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"                element={<Home />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Profile (any logged in) */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Client */}
        <Route path="/products" element={<ClientProducts />} />
        <Route path="/cart" element={
          <ProtectedRoute roles={['client']}>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute roles={['client']}>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute roles={['client']}>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute roles={['client']}>
            <OrderDetail />
          </ProtectedRoute>
        } />

        {/* Seller */}
        <Route path="/seller" element={
          <ProtectedRoute roles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/seller/products" element={
          <ProtectedRoute roles={['seller']}>
            <SellerProducts />
          </ProtectedRoute>
        } />
        <Route path="/seller/products/create" element={
          <ProtectedRoute roles={['seller']}>
            <ProductForm />
          </ProtectedRoute>
        } />
        <Route path="/seller/products/edit/:id" element={
          <ProtectedRoute roles={['seller']}>
            <ProductForm />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}