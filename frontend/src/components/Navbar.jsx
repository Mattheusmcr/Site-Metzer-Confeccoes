import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

function Navbar() {
  const { isAdmin, logout } = useAuth();
  const { cart, removeFromCart, increase, decrease } = useContext(CartContext);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const totalItens = cart.reduce((acc, item) => acc + item.quantidade, 0);
  const total = cart.reduce(
    (acc, item) => acc + parseFloat(item.produto?.preco || 0) * item.quantidade, 0
  );

  return (
    <>
      <header className="w-full sticky top-0 z-50"
        style={{ backgroundColor: t.bg, borderBottom: "2px solid " + t.borderForte }}>
        <div className="flex items-center justify-between px-8 md:px-12 py-4">

          <div className="flex items-center gap-10">
            <Link to="/">
              <img src="/LogoEmpresaMetzker.jpg" alt="Logo Metzker"
                className="h-12 object-contain"
                onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
              <span style={{ display: "none", color: t.text, fontWeight: "700", fontSize: "20px", letterSpacing: "4px" }}>
                METZKER
              </span>
            </Link>

            <nav className="hidden md:flex gap-8 text-xs font-semibold tracking-widest">
              <Link to="/" style={{ color: t.text }} className="hover:opacity-50 transition">HOME</Link>
              <Link to="/catalogo" style={{ color: t.text }} className="hover:opacity-50 transition">PORTFÓLIO</Link>
              <Link to="/infos" style={{ color: t.text }} className="hover:opacity-50 transition">CONTATO</Link>
              <Link to="/pedidos" style={{ color: t.text }} className="hover:opacity-50 transition">PEDIDOS</Link>
              {isAdmin && <Link to="/admin" style={{ color: "#dc2626" }} className="hover:opacity-70 transition">ADMIN</Link>}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            {isAdmin ? (
              <button onClick={logout} className="text-sm hover:opacity-70 transition" style={{ color: "#dc2626" }}>Sair</button>
            ) : (
              <Link to="/admin-login" className="hover:opacity-50 transition" style={{ color: t.text, fontSize: "20px" }}>👤</Link>
            )}
            <button onClick={() => setCarrinhoAberto(true)} className="relative hover:opacity-70 transition" style={{ fontSize: "20px" }}>
              🛒
              {totalItens > 0 && (
                <span className="absolute -top-2 -right-2 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText }}>
                  {totalItens}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {carrinhoAberto && <div onClick={() => setCarrinhoAberto(false)} className="fixed inset-0 bg-black/30 z-40" />}

      <div className={`fixed top-0 right-0 h-full w-96 z-50 shadow-2xl flex flex-col transition-transform duration-300 ${carrinhoAberto ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: t.bgCard, borderLeft: "2px solid " + t.borderForte }}>

        <div className="flex justify-between items-center p-6"
          style={{ borderBottom: "2px solid " + t.borderForte }}>
          <h2 className="text-base font-semibold" style={{ color: t.text }}>
            Carrinho <span style={{ color: t.textSecundario, fontWeight: 400 }}>({totalItens})</span>
          </h2>
          <button onClick={() => setCarrinhoAberto(false)} className="hover:opacity-50 transition text-xl" style={{ color: t.text }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cart.length === 0 && (
            <div className="text-center mt-16">
              <p style={{ fontSize: "40px" }} className="mb-4">🛒</p>
              <p className="text-sm" style={{ color: t.textSecundario }}>Seu carrinho está vazio.</p>
              <Link to="/catalogo" onClick={() => setCarrinhoAberto(false)}
                className="inline-block mt-6 text-sm underline" style={{ color: t.textSecundario }}>
                Ver catálogo →
              </Link>
            </div>
          )}
          {cart.map((item, index) => (
            <div key={index} className="flex gap-4 pb-5"
              style={{ borderBottom: "1px solid " + t.border }}>
              <div className="w-20 h-20 rounded overflow-hidden shrink-0" style={{ backgroundColor: t.bgSecundario }}>
                {item.produto.imagens?.[0]?.imagem
                  ? <img src={item.produto.imagens[0].imagem} alt={item.produto.nome} className="w-full h-full object-cover" />
                  : item.produto.imagem
                  ? <img src={item.produto.imagem} alt={item.produto.nome} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: t.text }}>{item.produto.nome}</p>
                <p className="text-xs mt-0.5" style={{ color: t.textSecundario }}>Tamanho: {item.tamanho}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: t.text }}>
                  R$ {(parseFloat(item.produto?.preco || 0) * item.quantidade).toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => decrease(item.produto.id, item.tamanho)}
                    className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: t.bgSecundario, color: t.text, border: "1px solid " + t.border }}>−</button>
                  <span className="w-5 text-center text-sm" style={{ color: t.text }}>{item.quantidade}</span>
                  <button onClick={() => increase(item.produto.id, item.tamanho)}
                    className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: t.bgSecundario, color: t.text, border: "1px solid " + t.border }}>+</button>
                  <button onClick={() => removeFromCart(item.produto.id, item.tamanho)}
                    className="ml-auto text-xs" style={{ color: "#dc2626" }}>Remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-6 space-y-4" style={{ borderTop: "2px solid " + t.borderForte }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: t.textSecundario }}>Total</span>
              <span className="text-xl font-bold" style={{ color: t.text }}>R$ {total.toFixed(2)}</span>
            </div>
            <Link to="/pedidos" onClick={() => setCarrinhoAberto(false)}
              className="block w-full text-center py-3 font-semibold hover:opacity-80 transition"
              style={{ backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText }}>
              Finalizar Pedido
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;