import { createContext, useContext } from "react";

export const ThemeContext = createContext();

export const tema = {
  bg: "#FAF8F5",
  bgSecundario: "#F2EDE6",
  bgCard: "#FFFFFF",
  text: "#1a1a1a",
  textSecundario: "#7a7065",
  border: "#E8E0D5",
  btnPrimarioBg: "#1a1a1a",
  btnPrimarioText: "#FAF8F5",
  navBg: "#FAF8F5",
  navBorder: "#E8E0D5",
};

// dark = false fixo para compatibilidade com código antigo
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