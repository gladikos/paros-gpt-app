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
    console.log("🔐 Received token:", token); // ADD THIS
    setUser(email);
    setToken(token);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("user", email);
    storage.setItem("token", token);
  };

  const logout = () => {
    const savedAvatar = localStorage.getItem("selectedAvatar"); // backup avatar

    setUser(null);
    setToken(null);
    localStorage.clear();
    sessionStorage.clear();

    // restore avatar
    if (savedAvatar) {
      localStorage.setItem("selectedAvatar", savedAvatar);
      window.dispatchEvent(new Event("storage")); // update avatar in sidebar
    }
  };


  useEffect(() => {
    const validateSession = async () => {
      console.log("🔍 Validating session with token:", token);
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("username", data.name || data.email || "User");
          setUser(data.email || data.name || "User"); // ensure user stays set
        } else {
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
