import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const ActivityContext = createContext();

export function ActivityProvider({ children }) {
  const { user } = useAuth();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setLogs([]); return; }
    setLoading(true);
    try {
      setLogs(await api.get("/activity"));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const clearAll = async () => {
    await api.delete("/activity");
    setLogs([]);
  };

  const removeOne = async (id) => {
    await api.delete(`/activity/${id}`);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <ActivityContext.Provider value={{ logs, loading, refresh, clearAll, removeOne }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  return useContext(ActivityContext);
}