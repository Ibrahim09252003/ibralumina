import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Portal-based modal. Renders into document.body so no ancestor
 * stacking context (transform/opacity/filter from page animations)
 * can trap it — footer stays behind, always.
 */
export default function Modal({ onClose, children, maxWidth = 540 }) {
  // Lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}