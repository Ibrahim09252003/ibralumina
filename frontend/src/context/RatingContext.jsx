import { createContext, useContext, useState, useEffect } from "react";

const RatingContext = createContext();
const STORAGE_KEY = "ecom_ratings_v1";

export function RatingProvider({ children }) {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRatings(raw ? JSON.parse(raw) : []);
    } catch { setRatings([]); }
  }, []);

  const persist = (list) => {
    setRatings(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const submitRating = (productId, userId, stars, comment = "") => {
    if (!productId || !userId) return { success: false, error: "Missing data." };
    if (!stars || stars < 1 || stars > 5)
      return { success: false, error: "Please pick between 1 and 5 stars." };

    const idx = ratings.findIndex(
      (r) => r.productId === productId && r.userId === userId
    );

    if (idx >= 0) {
      persist(ratings.map((r, i) =>
        i === idx
          ? { ...r, stars, comment, updatedAt: new Date().toISOString() }
          : r
      ));
    } else {
      persist([
        ...ratings,
        {
          id: Date.now(),
          productId, userId, stars, comment,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    return { success: true };
  };

  const getRating = (productId, userId) =>
    ratings.find((r) => r.productId === productId && r.userId === userId);

  const getProductRatings = (productId) =>
    ratings.filter((r) => r.productId === productId);

  return (
    <RatingContext.Provider value={{ ratings, submitRating, getRating, getProductRatings }}>
      {children}
    </RatingContext.Provider>
  );
}

export function useRatings() {
  return useContext(RatingContext);
}