import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const ContactInboxContext = createContext();

export function ContactInboxProvider({ children }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);

  const refresh = async () => {
    if (!user || user.role !== "admin") { setMessages([]); return; }
    setLoading(true);
    try {
      setMessages(await api.get("/contact"));
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const markRead = async (id, read = true) => {
    const updated = await api.put(`/contact/${id}/read`, { read });
    setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

  const removeOne = async (id) => {
    await api.delete(`/contact/${id}`);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAll = async () => {
    await api.delete("/contact");
    setMessages([]);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <ContactInboxContext.Provider
      value={{ messages, loading, unreadCount, refresh, markRead, removeOne, clearAll }}
    >
      {children}
    </ContactInboxContext.Provider>
  );
}

export function useContactInbox() {
  return useContext(ContactInboxContext);
}