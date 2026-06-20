import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function FooterGate() {
  const { pathname } = useLocation();
  // Rodapé completo só na Home; nas demais páginas, versão compacta (só créditos)
  return <Footer compacto={pathname !== "/"} />;
}

import Personalizado from "./pages/Personalizado";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Pedidos from "./pages/Pedidos";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import RotaAdmin from "./components/RotaAdmin";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter basename="/">
            <div style={{ overflowX: "hidden", maxWidth: "100vw", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <ScrollToTop />
            <Navbar />
            <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalogo />} />
                            <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/personalizado" element={<Personalizado />} />
              <Route path="/produto/:id" element={<ProdutoDetalhe />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <RotaAdmin>
                    <Admin />
                  </RotaAdmin>
                }
              />
            </Routes>
            </div>
            <FooterGate />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;