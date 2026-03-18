import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

const links = [
  { to: "/",             label: "HOME" },
  { to: "/catalogo",     label: "PORTFÓLIO" },
  { to: "/infos",        label: "INFORMAÇÕES" },
  { to: "/pedidos",      label: "PEDIDOS" },
  { to: "/personalizado", label: "✦ PERSONALIZADO", cor: "#b45309" },
];

function Navbar() {
  const { isAdmin, logout } = useAuth();
  const { cart, removeFromCart, increase, decrease } = useContext(CartContext);
  const location = useLocation();
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const totalItens = cart.reduce((acc, item) => acc + item.quantidade, 0);
  const total = cart.reduce((acc, item) => acc + parseFloat(item.produto?.preco || 0) * item.quantidade, 0);

  function fecharTudo() {
    setMenuAberto(false);
    setCarrinhoAberto(false);
  }

  return (
    <>
      <header className="w-full sticky top-0 z-50"
        style={{ backgroundColor: t.bg, borderBottom: "2px solid " + t.borderForte }}>
        <div className="flex items-center justify-between px-5 md:px-12 py-4">

          {/* LOGO + NAV — esquerda */}
          <div className="flex items-center gap-10">
            <Link to="/" onClick={fecharTudo}>
              <img src="/LogoEmpresaMetzker.jpg" alt="Logo Metzker"
                className="h-10 md:h-12 object-contain"
                onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
              <span style={{ display: "none", color: t.text, fontWeight: "700", fontSize: "18px", letterSpacing: "3px" }}>METZKER</span>
            </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex gap-8 text-xs font-semibold tracking-widest">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                style={{ color: l.cor || t.text, fontWeight: location.pathname === l.to ? "700" : "600" }}
                className="hover:opacity-50 transition">
                {l.label}
              </Link>
            ))}
            {isAdmin && <Link to="/admin" style={{ color: "#dc2626" }} className="hover:opacity-70 transition">ADMIN</Link>}
          </nav>
          </div>

          {/* DIREITA */}
          <div className="flex items-center gap-4">
            {/* Login — só desktop */}
            <div className="hidden md:flex items-center gap-4">
              {isAdmin
                ? <button onClick={logout} className="text-sm hover:opacity-70 transition" style={{ color: "#dc2626" }}>Sair</button>
                : <Link to="/admin-login" className="hover:opacity-50 transition" style={{ color: t.text, fontSize: "20px" }}>👤</Link>
              }
            </div>

            {/* Carrinho */}
            <button onClick={() => { setCarrinhoAberto(true); setMenuAberto(false); }}
              className="relative hover:opacity-70 transition" style={{ fontSize: "20px" }}>
              🛒
              {totalItens > 0 && (
                <span className="absolute -top-2 -right-2 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText }}>
                  {totalItens}
                </span>
              )}
            </button>

            {/* Hamburguer — só mobile */}
            <button
              className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
              onClick={() => { setMenuAberto(v => !v); setCarrinhoAberto(false); }}
              aria-label="Menu">
              <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: t.text, transition: "all 0.3s",
                transform: menuAberto ? "rotate(45deg) translateY(7px)" : "none" }} />
              <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: t.text, transition: "all 0.3s",
                opacity: menuAberto ? 0 : 1 }} />
              <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: t.text, transition: "all 0.3s",
                transform: menuAberto ? "rotate(-45deg) translateY(-7px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* MENU MOBILE — dropdown */}
        <div style={{
          overflow: "hidden", transition: "max-height 0.35s ease",
          maxHeight: menuAberto ? "400px" : "0",
          borderTop: menuAberto ? "1px solid " + t.border : "none",
          backgroundColor: t.bg,
        }}>
          <nav className="flex flex-col px-5 py-4 gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                onClick={fecharTudo}
                className="py-3 text-sm font-semibold tracking-widest border-b hover:opacity-50 transition"
                style={{ color: l.cor || t.text, borderColor: t.border }}>
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={fecharTudo}
                className="py-3 text-sm font-semibold tracking-widest border-b hover:opacity-70 transition"
                style={{ color: "#dc2626", borderColor: t.border }}>
                ADMIN
              </Link>
            )}
            {/* Login mobile */}
            <div className="pt-3">
              {isAdmin
                ? <button onClick={() => { logout(); fecharTudo(); }} className="text-sm" style={{ color: "#dc2626" }}>Sair da conta</button>
                : <Link to="/admin-login" onClick={fecharTudo} className="text-sm" style={{ color: t.textSecundario }}>👤 Área admin</Link>
              }
            </div>
          </nav>
        </div>
      </header>

      {/* OVERLAY */}
      {(carrinhoAberto || menuAberto) && (
        <div onClick={fecharTudo} className="fixed inset-0 bg-black/30 z-40" />
      )}

      {/* MINI CARRINHO */}
      <div className={`fixed top-0 right-0 h-full z-50 shadow-2xl flex flex-col transition-transform duration-300 ${carrinhoAberto ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(384px, 100vw)", backgroundColor: t.bgCard, borderLeft: "2px solid " + t.borderForte }}>

        <div className="flex justify-between items-center p-5 md:p-6"
          style={{ borderBottom: "2px solid " + t.borderForte }}>
          <h2 className="text-base font-semibold" style={{ color: t.text }}>
            Carrinho <span style={{ color: t.textSecundario, fontWeight: 400 }}>({totalItens})</span>
          </h2>
          <button onClick={() => setCarrinhoAberto(false)} className="hover:opacity-50 transition text-xl" style={{ color: t.text }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
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
            <div key={index} className="flex gap-4 pb-5" style={{ borderBottom: "1px solid " + t.border }}>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden shrink-0" style={{ backgroundColor: t.bgSecundario }}>
                {item.produto.imagens?.[0]?.imagem
                  ? <img src={item.produto.imagens[0].imagem} alt={item.produto.nome} className="w-full h-full object-cover" />
                  : item.produto.imagem
                  ? <img src={item.produto.imagem} alt={item.produto.nome} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">👕</div>}
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
          <div className="p-5 md:p-6 space-y-4" style={{ borderTop: "2px solid " + t.borderForte }}>
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