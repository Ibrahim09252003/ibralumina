// src/utils/format.js
// Currency + number formatting helpers.

/**
 * Format a number as Philippine Peso with thousands separators.
 */
export const peso = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "₱0.00";
  return `₱${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Same, but without the currency symbol — for tight table cells. */
export const money = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0.00";
  return num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/* ─────────────────────────────────────────────
   Privacy helpers — for public-facing reviews.
   Keeps the first and last character, replaces the
   middle with asterisks.
       ibrahim   → i*****m
       juan      → j**n
       ab        → ab   (too short to censor safely)
   ───────────────────────────────────────────── */
export const censor = (str) => {
  if (!str) return "";
  const s = String(str).trim();
  if (s.length <= 2) return s;
  return s[0] + "*".repeat(s.length - 2) + s[s.length - 1];
};

/** Censor each word of a full name: "Juan Dela Cruz" → "J**n D**a C**z" */
export const censorName = (name) => {
  if (!name) return "Anonymous";
  return String(name).trim().split(/\s+/).map(censor).join(" ");
};

/** Usernames censor the same way: "juandelacruz" → "j**********z" */
export const censorUsername = censor;