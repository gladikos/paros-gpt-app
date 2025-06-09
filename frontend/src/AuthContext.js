// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const getStorage = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    return { token, user };
  };

  const [user, setUser] = useState(getStorage().user);
  const [token, setToken] = useState(getStorage().token);

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

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
