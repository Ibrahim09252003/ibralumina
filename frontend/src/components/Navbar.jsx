import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useMessages } from "../context/MessageContext";
import { useContactInbox } from "../context/ContactInboxContext";
import { askConfirm, infoToast } from "../utils/alerts";

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { unreadCount } = useMessages();

  const inbox = useContactInbox();
  const contactUnread = inbox?.unreadCount ?? 0;

  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = async () => {
    const ok = await askConfirm({
      title: "Log out?",
      text: "You can sign back in anytime.",
      confirmText: "Log out",
      icon: "question",
    });
    if (!ok) return;
    logout();
    infoToast("Signed out. See you soon!");
    navigate("/");
  };

  const isAdminRole = user?.role === "admin";
  const isManager   = user?.role === "manager";
  const isBuyer     = user?.role === "buyer";
  const isStaff     = isAdminRole || isManager;

  const MessagesLink = (
    <NavLink to="/messages" className="cart-link">
      Messages
      {unreadCount > 0 && (
        <span className="cart-badge" key={`m-${unreadCount}`}>{unreadCount}</span>
      )}
    </NavLink>
  );

  const InboxLink = isAdminRole && (
    <NavLink to="/inbox" className="cart-link">
      Inbox
      {contactUnread > 0 && (
        <span className="cart-badge" key={`i-${contactUnread}`}>{contactUnread}</span>
      )}
    </NavLink>
  );

  return (
    <header className="navbar-wrap">
      <nav className="navbar">
        <NavLink to="/" className="logo">
          <span className="logo-mark">◆</span>
          <span className="logo-text">
            IbraLumina
            {isBuyer && <em className="logo-tag">shop</em>}
            {isStaff && <em className="logo-tag">{isAdminRole ? "admin" : "manager"}</em>}
          </span>
        </NavLink>

        <button
          className={`nav-burger ${open ? "is-open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>

        <div className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end>Home</NavLink>

          {!user && (
            <>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              <NavLink to="/register">Register</NavLink>
              <NavLink to="/login" className="login-link">Login</NavLink>
            </>
          )}

          {isStaff && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/products">Products</NavLink>
              {isAdminRole && <NavLink to="/accounts">Accounts</NavLink>}
              {InboxLink}
              {MessagesLink}
              <NavLink to="/about">About</NavLink>
              {isManager && <NavLink to="/contact">Contact</NavLink>}
              <NavLink to="/activity">Activity</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <button className="logout-btn" onClick={handleLogout}>
                Logout · {user.name.split(" ")[0]}
              </button>
            </>
          )}

          {isBuyer && (
            <>
              <NavLink to="/buyer">Dashboard</NavLink>
              <NavLink to="/shop">Shop</NavLink>
              <NavLink to="/cart" className="cart-link">
                Cart
                {cartCount > 0 && (
                  <span className="cart-badge" key={cartCount}>{cartCount}</span>
                )}
              </NavLink>
              <NavLink to="/orders">My Orders</NavLink>
              {MessagesLink}
              <NavLink to="/activity">Activity</NavLink>   {/* ← the missing link */}
              <NavLink to="/profile">Profile</NavLink>
              <button className="logout-btn" onClick={handleLogout}>
                Logout · {user.name.split(" ")[0]}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;