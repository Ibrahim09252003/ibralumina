import { createContext, useContext, useState, useEffect } from "react";
import api, { setToken, clearToken, getToken } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [accounts, setAccounts] = useState([]);     // admin list
  const [loading, setLoading] = useState(true);

  /* ── Boot: if a token exists, fetch /auth/me ── */
  useEffect(() => {
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const { user } = await api.get("/auth/me");
        setUser(user);
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Refresh admin account list when an admin is signed in ── */
  /* ── Load the signed-in user's messaging contacts ── */
/* Admins get the full user list (also powers ManageAccounts). */
/* Buyers/managers get the filtered contacts endpoint. */
useEffect(() => {
  if (!user) { setAccounts([]); return; }

  const path = user.role === "admin" ? "/users" : "/users/contacts";
  api.get(path)
    .then(setAccounts)
    .catch(() => setAccounts([]));
}, [user]);

  /* ── AUTH ── */

  const login = async (username, password) => {
    try {
      const { token, user } = await api.post("/auth/login", { username, password });
      setToken(token);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (data) => {
    try {
      const { token, user } = await api.post("/auth/register", data);
      setToken(token);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

const logout = () => {
  // Fire-and-forget: log before we lose the token
  api.post("/activity", {
    action: "auth.logout",
    category: "auth",
    description: "Signed out",
  }).catch(() => { /* ignore */ });

  clearToken();
  setUser(null);
  setAccounts([]);
};

  /* ── ADMIN: ACCOUNT MANAGEMENT ── */

  const refreshAccounts = async () => {
    try { setAccounts(await api.get("/users")); } catch { /* silent */ }
  };

  const createAccount = async (data) => {
    try {
      await api.post("/users", data);
      await refreshAccounts();
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  const updateAccount = async (id, patch) => {
    try {
      await api.put(`/users/${id}`, patch);
      await refreshAccounts();
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  const resetPassword = async (id, newPassword) => {
    try {
      await api.put(`/users/${id}/password`, { password: newPassword });
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  const deleteAccount = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      await refreshAccounts();
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  /* ── USER SELF-SERVICE ── */

  const updateProfile = async (patch) => {
    try {
      const { user } = await api.put("/auth/me", patch);
      setUser(user);
      return { success: true, user };
    } catch (err) { return { success: false, error: err.message }; }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put("/auth/me/password", { currentPassword, newPassword });
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  const deleteOwnAccount = async (currentPassword) => {
    try {
      await api.delete("/auth/me", { password: currentPassword });
      logout();
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading,
        accounts,
        login, register, logout,
        createAccount, updateAccount, resetPassword, deleteAccount,
        updateProfile, changePassword, deleteOwnAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}