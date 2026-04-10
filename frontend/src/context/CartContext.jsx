import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart]       = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'client') {
      fetchCart();
    } else {
      setCart({ items: [], total: 0 });
    }
  }, [user]);

  async function fetchCart() {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(product_id, quantity = 1) {
    const res = await api.post('/cart/add', { product_id, quantity });
    setCart(res.data.data);
  }

  async function updateItem(product_id, quantity) {
    const res = await api.patch(`/cart/update/${product_id}`, { quantity });
    setCart(res.data.data);
  }

  async function removeItem(product_id) {
    const res = await api.delete(`/cart/remove/${product_id}`);
    setCart(res.data.data);
  }

  async function clearCart() {
    const res = await api.delete('/cart/clear');
    setCart(res.data.data);
  }

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, cartCount, fetchCart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}