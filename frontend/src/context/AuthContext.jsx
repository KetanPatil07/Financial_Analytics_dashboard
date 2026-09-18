import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("penta_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("penta_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/profile")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("penta_user", JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("penta_token", data.token);
        localStorage.setItem("penta_user", JSON.stringify(data.user));
        setUser(data.user);
      },
      async register(name, email, password) {
        const { data } = await api.post("/auth/register", { name, email, password });
        localStorage.setItem("penta_token", data.token);
        localStorage.setItem("penta_user", JSON.stringify(data.user));
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem("penta_token");
        localStorage.removeItem("penta_user");
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
