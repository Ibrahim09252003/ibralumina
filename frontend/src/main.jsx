import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "sweetalert2/dist/sweetalert2.min.css";
import "./index.css";
import "./App.css";
import App from "./App.jsx";

/* ─────────────────────────────────────────────
   Global image fallback.
   Any <img> that fails to load is swapped for a
   branded gradient placeholder so the layout
   never breaks on a dead URL.
   ───────────────────────────────────────────── */
const FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ede9fe"/>
      <stop offset="1" stop-color="#fce7f3"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <g fill="none" stroke="#a78bfa" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
    <path d="M195 235h210l30 215H165z"/>
    <path d="M240 235v-32a60 60 0 0 1 120 0v32"/>
  </g>
</svg>`)}`;

document.addEventListener(
  "error",
  (e) => {
    const el = e.target;
    if (el?.tagName === "IMG" && !el.dataset.fallbackApplied) {
      el.dataset.fallbackApplied = "1";
      el.src = FALLBACK;
    }
  },
  true // capture phase — img errors don't bubble
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);