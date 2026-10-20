// Blend a product's seeded historical rating with live buyer ratings.
export const computeRating = (product, userRatings = []) => {
  const base = Number(product.rating) || 0;
  const baseCount = product.ratingCount ?? (base > 0 ? 20 : 0);
  const sum = userRatings.reduce((s, r) => s + r.stars, 0);
  const totalCount = baseCount + userRatings.length;
  if (totalCount === 0) return { avg: 0, count: 0 };
  const avg = (base * baseCount + sum) / totalCount;
  return { avg: Number(avg.toFixed(1)), count: totalCount };
};