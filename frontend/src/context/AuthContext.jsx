import { createContext, useState, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("admin_token") || null
  );

  function login(newToken) {
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken(null);
  }

  const isAdmin = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}