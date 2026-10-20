import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart]     = useState([]);
  const [orders, setOrders] = useState([]);

  /* ── Load cart from localStorage (per user) ── */
  useEffect(() => {
    if (user) {
      const raw = localStorage.getItem(`ecom_cart_${user.id}`);
      setCart(raw ? JSON.parse(raw) : []);
    } else {
      setCart([]);
      setOrders([]);
    }
  }, [user]);

  /* ── Load orders from API ── */
  useEffect(() => {
    if (!user) return;
    api.get("/orders").then(setOrders).catch(() => setOrders([]));
  }, [user]);

  const persistCart = (list) => {
    setCart(list);
    if (user) localStorage.setItem(`ecom_cart_${user.id}`, JSON.stringify(list));
  };

  /* ── Cart CRUD ── */
  const addToCart = (product, quantity = 1) => {
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      persistCart(cart.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      ));
    } else {
      persistCart([
        ...cart,
        { id: product.id, name: product.name, price: product.price, image: product.image, quantity },
      ]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) persistCart(cart.filter((i) => i.id !== id));
    else persistCart(cart.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const removeFromCart = (id) => persistCart(cart.filter((i) => i.id !== id));
  const clearCart = () => persistCart([]);

  /* ── Orders (server-side) ── */
  const checkout = async () => {
    if (cart.length === 0) return null;
    const order = await api.post("/orders", {
      items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
    });
    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  const updateOrderStatus = async (orderId, status) => {
    const updated = await api.put(`/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const deleteOrder = async (orderId) => {
    await api.delete(`/orders/${orderId}`);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart, orders, addToCart, updateQuantity, removeFromCart, clearCart,
        checkout, updateOrderStatus, deleteOrder, cartCount, cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}