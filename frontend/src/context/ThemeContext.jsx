import { createContext, useContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const TEMAS = {
  light: {
    bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
    text: "#1a1a1a", textSecundario: "#7a7065", border: "#E8E0D5",
    borderForte: "#C4B5A5", btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
    navBg: "#FAF8F5", navBorder: "#E8E0D5",
  },
  dark: {
    bg: "#0f0f0f", bgSecundario: "#1a1a1a", bgCard: "#1e1e1e",
    text: "#f5f0ea", textSecundario: "#9c9085", border: "#2e2e2e",
    borderForte: "#3a3a3a", btnPrimarioBg: "#f5f0ea", btnPrimarioText: "#0f0f0f",
    navBg: "#0f0f0f", navBorder: "#2e2e2e",
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("metzker_dark") === "true"; } catch { return false; }
  });

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? "#0f0f0f" : "#FAF8F5";
    document.body.style.color = isDark ? "#f5f0ea" : "#1a1a1a";
    try { localStorage.setItem("metzker_dark", isDark); } catch {}
  }, [isDark]);

  const tema = isDark ? TEMAS.dark : TEMAS.light;

  return (
    <ThemeContext.Provider value={{ tema, dark: isDark, toggleDark: () => setIsDark(d => !d) }}>
      <div style={{ backgroundColor: tema.bg, color: tema.text, minHeight: "100vh", transition: "background 0.3s, color 0.3s" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Compatibilidade retroativa
export const tema = TEMAS.light;