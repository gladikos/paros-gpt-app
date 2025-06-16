// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const getStorage = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");

    return {
      token: token && token !== "null" ? token : null,
      user: user && user !== "null" ? user : null,
    };
  };

  const stored = getStorage();
  const [user, setUser] = useState(stored.user && stored.token ? stored.user : null);
  const [token, setToken] = useState(stored.user && stored.token ? stored.token : null);

  const login = (email, token, remember) => {
    setUser(email);
    setToken(token);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("user", email);
    storage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  useEffect(() => {
    const validateSession = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          logout();
        }
      } catch (err) {
        console.error("Session validation failed:", err);
        logout();
      }
    };

    validateSession();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
