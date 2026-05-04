import { createContext, useContext, useState, useCallback } from 'react';
import { calcCartTotal } from '../utils/helpers.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const total     = calcCartTotal(items);

  const addItem = useCallback((menuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...menuItem, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getItemQty = useCallback(
    (id) => items.find((i) => i.id === id)?.qty ?? 0,
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, removeItem, updateQty, clearCart, getItemQty }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
