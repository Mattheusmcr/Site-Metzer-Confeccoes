import { createContext, useContext } from "react";

export const ThemeContext = createContext();

export const tema = {
  bg: "#FFFFFF",
  bgSecundario: "#F2F2F2",
  bgCard: "#FFFFFF",
  text: "#1a1a1a",
  textSecundario: "#6b6b6b",
  border: "#E0E0E0",
  borderForte: "#B0B0B0",
  btnPrimarioBg: "#1a1a1a",
  btnPrimarioText: "#FFFFFF",
  navBg: "#FFFFFF",
  navBorder: "#E0E0E0",
};

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ tema, dark: false }}>
      <div style={{ backgroundColor: tema.bg, color: tema.text, minHeight: "100vh" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}