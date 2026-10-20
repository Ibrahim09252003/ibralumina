import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const refresh = async () => {
    try {
      const list = await api.get("/products");
      setProducts(list);
    } catch (err) {
      console.error("Failed to load products:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const addProduct = async (data) => {
    const created = await api.post("/products", data);
    setProducts((prev) => [...prev, created]);
    return created;
  };

  const updateProduct = async (id, data) => {
    const updated = await api.put(`/products/${id}`, data);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    return updated;
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== Number(id)));
  };

  const getProduct = (id) => products.find((p) => p.id === Number(id));

  /* Kept for backward compat — bulk stock adjustments now happen server-side
     inside createOrder and updateOrderStatus, so this is rarely called. */
  const reduceStock = async (items) => {
    const updates = items.map(({ id, quantity }) => ({ id, delta: -quantity }));
    await api.post("/products/bulk-stock", { updates });
    await refresh();
  };

  return (
    <ProductContext.Provider
      value={{ products, loading, addProduct, updateProduct, deleteProduct, reduceStock, getProduct, refresh }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}