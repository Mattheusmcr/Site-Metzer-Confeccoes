import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Pedidos from "./pages/Pedidos";
import Infos from "./pages/Infos";
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
          <BrowserRouter basename="/Site-Metzer-Confeccoes">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/infos" element={<Infos />} />
              <Route path="/pedidos" element={<Pedidos />} />
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
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;