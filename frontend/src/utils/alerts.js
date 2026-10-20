import Swal from "sweetalert2";

const BRAND = "#7c3aed";
const CANCEL = "#9aa0b5";

const base = {
  confirmButtonColor: BRAND,
  cancelButtonColor: CANCEL,
  reverseButtons: true,
  customClass: { popup: "swal-pop" },
};

/* ── Toast (top-right, auto-dismiss) ── */
export const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2400,
  timerProgressBar: true,
  customClass: { popup: "swal-toast" },
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const successToast = (title) => toast.fire({ icon: "success", title });
export const errorToast = (title) => toast.fire({ icon: "error", title });
export const infoToast = (title) => toast.fire({ icon: "info", title });

/* ── Confirm dialog ── */
export const askConfirm = async ({
  title = "Are you sure?",
  text = "",
  html,
  confirmText = "Yes, continue",
  cancelText = "Cancel",
  icon = "warning",
} = {}) => {
  const res = await Swal.fire({
    ...base,
    title,
    text,
    html,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: true,
  });
  return res.isConfirmed;
};

/* ── Modal popups ── */
export const popSuccess = (title, text = "") =>
  Swal.fire({
    ...base, icon: "success", title, text,
    timer: 2200, timerProgressBar: true, showConfirmButton: false,
  });

export const popError = (title, text = "") =>
  Swal.fire({ ...base, icon: "error", title, text, confirmButtonText: "Got it" });

export const popInfo = (title, text = "") =>
  Swal.fire({ ...base, icon: "info", title, text, confirmButtonText: "OK" });

export default Swal;