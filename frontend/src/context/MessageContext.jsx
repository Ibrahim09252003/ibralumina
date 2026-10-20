import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const MessageContext = createContext();
const STORAGE_KEY = "ecom_messages_v1";

export function MessageProvider({ children }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setMessages(raw ? JSON.parse(raw) : []);
    } catch {
      setMessages([]);
    }
  }, []);

  const persist = (list) => {
    setMessages(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

const sendMessage = ({ toId, body }) => {
  if (!user) return { success: false, error: "Not signed in." };
  if (!toId) return { success: false, error: "Please pick a recipient." };
  if (!body || !body.trim())
    return { success: false, error: "Message can't be empty." };

  const newMsg = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    fromId: user.id,
    toId: Number(toId),
    body: body.trim(),
    createdAt: new Date().toISOString(),
    readBy: [user.id],
  };
  persist([...messages, newMsg]);

  // Fire-and-forget — do NOT block the sync return
  api.post("/activity", {
    action: "message.send",
    category: "message",
    description: `Sent a message to user #${toId}`,
  }).catch(() => { /* ignore */ });

  return { success: true, message: newMsg };
};

  const markRead = (otherId) => {
    if (!user) return;
    let changed = false;
    const updated = messages.map((m) => {
      if (
        m.toId === user.id &&
        m.fromId === otherId &&
        !(m.readBy || []).includes(user.id)
      ) {
        changed = true;
        return { ...m, readBy: [...(m.readBy || []), user.id] };
      }
      return m;
    });
    if (changed) persist(updated);
  };

  const deleteMessage = (id) =>
    persist(messages.filter((m) => m.id !== id));

  const unreadCount = user
    ? messages.filter(
        (m) => m.toId === user.id && !(m.readBy || []).includes(user.id)
      ).length
    : 0;

  return (
    <MessageContext.Provider
      value={{ messages, sendMessage, markRead, deleteMessage, unreadCount }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  return useContext(MessageContext);
}