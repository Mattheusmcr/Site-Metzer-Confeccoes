import { createContext, useContext, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(
    () => localStorage.getItem("tema") === "dark"
  );

  function toggleTheme() {
    const novo = !dark;
    setDark(novo);
    localStorage.setItem("tema", novo ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ dark, setDark: toggleTheme }}>
      <div style={{
        backgroundColor: dark ? "#111827" : "#ffffff",
        color: dark ? "#ffffff" : "#000000",
        minHeight: "100vh",
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}