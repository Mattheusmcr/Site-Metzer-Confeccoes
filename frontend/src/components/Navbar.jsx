import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { CartContext } from "../context/CartContext";

function Navbar() {
  const { isAdmin, logout } = useAuth();
  const { dark, setDark } = useTheme();
  const { cart, removeFromCart, increase, decrease } = useContext(CartContext);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const totalItens = cart.reduce((acc, item) => acc + item.quantidade, 0);
  const total = cart.reduce(
    (acc, item) => acc + parseFloat(item.produto?.preco || 0) * item.quantidade,
    0
  );

  return (
    <>
      <header className={`w-full border-b sticky top-0 z-50 transition-colors ${
        dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="flex items-center justify-between px-12 py-4">

          {/* ESQUERDA */}
          <div className="flex items-center gap-12">
            <Link to="/">
              <img
                src="/Site-Metzer-Confeccoes/LogoEmpresaMetzker.jpg"
                alt="Logo Metzker"
                className="h-14 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span
                style={{ display: "none" }}
                className={`text-xl font-bold tracking-widest ${dark ? "text-white" : "text-black"}`}
              >
                METZKER
              </span>
            </Link>

            <nav className={`flex gap-8 text-sm font-medium tracking-widest ${dark ? "text-gray-200" : "text-black"}`}>
              <Link to="/" className="hover:opacity-60 transition">INÍCIO</Link>
              <Link to="/catalogo" className="hover:opacity-60 transition">CATÁLOGO</Link>
              <Link to="/infos" className="hover:opacity-60 transition">INFORMAÇÕES</Link>
              <Link to="/pedidos" className="hover:opacity-60 transition">PEDIDOS</Link>
              {isAdmin && (
                <Link to="/admin" className="text-red-500 hover:opacity-70 transition">
                  ADMIN
                </Link>
              )}
            </nav>
          </div>

          {/* DIREITA */}
          <div className="flex items-center gap-5">

            {/* TOGGLE DARK MODE */}
            <button
              onClick={() => setDark(!dark)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                dark ? "bg-gray-600" : "bg-gray-200"
              }`}
              title={dark ? "Modo claro" : "Modo escuro"}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all flex items-center justify-center text-xs ${
                dark ? "left-6 bg-gray-200" : "left-0.5 bg-white"
              }`}>
                {dark ? "🌙" : "☀️"}
              </span>
            </button>

            {/* LOGIN/LOGOUT */}
            {isAdmin ? (
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:opacity-70 transition"
              >
                Sair
              </button>
            ) : (
              <Link to="/admin-login" className={`hover:opacity-60 transition text-xl ${dark ? "text-white" : ""}`}>
                👤
              </Link>
            )}

            {/* CARRINHO */}
            <button
              onClick={() => setCarrinhoAberto(true)}
              className="relative hover:opacity-70 transition text-xl"
            >
              🛒
              {totalItens > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItens}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY */}
      {carrinhoAberto && (
        <div
          onClick={() => setCarrinhoAberto(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* MINI CARRINHO LATERAL */}
      <div className={`fixed top-0 right-0 h-full w-100 z-50 shadow-2xl transform transition-transform duration-300 flex flex-col
        ${carrinhoAberto ? "translate-x-0" : "translate-x-full"}
        ${dark ? "bg-gray-900 text-white" : "bg-white text-black"}`}
      >
        {/* HEADER */}
        <div className={`flex justify-between items-center p-6 border-b ${dark ? "border-gray-700" : "border-gray-200"}`}>
          <h2 className="text-lg font-semibold">
            Carrinho{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({totalItens} {totalItens === 1 ? "item" : "itens"})
            </span>
          </h2>
          <button
            onClick={() => setCarrinhoAberto(false)}
            className="text-xl hover:opacity-60 transition"
          >
            ✕
          </button>
        </div>

        {/* ITENS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cart.length === 0 && (
            <div className="text-center mt-16">
              <p className="text-4xl mb-4">🛒</p>
              <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-400"}`}>
                Seu carrinho está vazio.
              </p>
              <Link
                to="/catalogo"
                onClick={() => setCarrinhoAberto(false)}
                className={`inline-block mt-6 text-sm underline ${dark ? "text-gray-300" : "text-gray-600"}`}
              >
                Ver catálogo →
              </Link>
            </div>
          )}

          {cart.map((item, index) => (
            <div
              key={index}
              className={`flex gap-4 pb-5 border-b ${dark ? "border-gray-700" : "border-gray-100"}`}
            >
              {/* IMAGEM */}
              <div className={`w-20 h-20 rounded overflow-hidden shrink-0 ${dark ? "bg-gray-700" : "bg-gray-100"}`}>
                {item.produto.imagens?.[0]?.imagem ? (
                  <img
                    src={item.produto.imagens[0].imagem}
                    alt={item.produto.nome}
                    className="w-full h-full object-cover"
                  />
                ) : item.produto.imagem ? (
                  <img
                    src={item.produto.imagem}
                    alt={item.produto.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>
                )}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.produto.nome}</p>
                <p className={`text-xs mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  Tamanho: {item.tamanho}
                </p>
                <p className="text-sm font-semibold mt-1">
                  R$ {(parseFloat(item.produto?.preco || 0) * item.quantidade).toFixed(2)}
                </p>

                {/* CONTROLES DE QUANTIDADE */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => decrease(item.produto.id, item.tamanho)}
                    className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold transition ${
                      dark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-black"
                    }`}
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-medium">{item.quantidade}</span>
                  <button
                    onClick={() => increase(item.produto.id, item.tamanho)}
                    className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold transition ${
                      dark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-black"
                    }`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.produto.id, item.tamanho)}
                    className="ml-auto text-red-400 hover:text-red-600 text-xs transition"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RODAPÉ */}
        {cart.length > 0 && (
          <div className={`p-6 border-t space-y-4 ${dark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Total</span>
              <span className="text-xl font-bold">R$ {total.toFixed(2)}</span>
            </div>
            <Link
              to="/pedidos"
              onClick={() => setCarrinhoAberto(false)}
              className={`block w-full text-center py-3 font-semibold transition ${
                dark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              Finalizar Pedido
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;