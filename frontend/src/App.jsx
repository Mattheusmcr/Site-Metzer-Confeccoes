import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Pedidos from "./pages/Pedidos";
import Infos from "./pages/Infos";
import { CartProvider } from "./context/CartContext";
import AdminProduto from "./pages/AdminProduto";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/infos" element={<Infos />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/admin-produto" element={<AdminProduto />} />
          <Route path="/produto/:id" element={<ProdutoDetalhe />} />
        </Routes>

      </BrowserRouter>
    </CartProvider>
  );
}

export default App;