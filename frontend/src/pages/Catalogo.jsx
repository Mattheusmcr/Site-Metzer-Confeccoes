import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Catalogo() {
  const { dark } = useTheme();
  const [produtos, setProdutos] = useState([]);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState({});
  const [indexImagem, setIndexImagem] = useState({});
  const [hoverProduto, setHoverProduto] = useState(null);
  const [alertas, setAlertas] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api.get("produtos/")
      .then(res => setProdutos(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!hoverProduto) return;
    const produto = produtos.find(p => p.id === hoverProduto);
    if (!produto) return;
    const imagens = produto.imagens?.length > 0
      ? produto.imagens.map(i => i.imagem)
      : [produto.imagem];
    if (imagens.length <= 1) return;

    const intervalo = setInterval(() => {
      setIndexImagem(prev => ({
        ...prev,
        [hoverProduto]: ((prev[hoverProduto] || 0) + 1) % imagens.length
      }));
    }, 900);
    return () => clearInterval(intervalo);
  }, [hoverProduto, produtos]);

  function mostrarToast(msg, sucesso) {
    setToastMsg({ msg, sucesso });
    setTimeout(() => setToastMsg(null), 2500);
  }

  function handleSelecionarTamanho(produtoId, tamanho) {
    setTamanhosSelecionados(prev => ({ ...prev, [produtoId]: tamanho }));
    setAlertas(prev => ({ ...prev, [produtoId]: false }));
  }

  function handleAdicionar(produto) {
    const tamanho = tamanhosSelecionados[produto.id];
    if (!tamanho) {
      setAlertas(prev => ({ ...prev, [produto.id]: true }));
      setTimeout(() => setAlertas(prev => ({ ...prev, [produto.id]: false })), 3000);
      return;
    }
    addToCart(produto, tamanho, 1);
    mostrarToast(`"${produto.nome}" adicionado ao carrinho!`, true);
  }

  const bg = dark ? "#111827" : "#ffffff";
  const text = dark ? "#ffffff" : "#000000";
  const subtext = dark ? "#9ca3af" : "#6b7280";
  const btnBg = dark ? "#1f2937" : "#ffffff";
  const btnBorder = dark ? "#4b5563" : "#d1d5db";

  return (
    <div style={{ backgroundColor: bg, color: text, minHeight: "100vh" }}>

      {/* TOAST */}
      {toastMsg && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-3"
          style={{ backgroundColor: toastMsg.sucesso ? "#16a34a" : "#dc2626" }}
        >
          <span>{toastMsg.sucesso ? "✅" : "❌"}</span>
          {toastMsg.msg}
        </div>
      )}

      <div className="px-6 md:px-16 py-12">
        <h1 className="text-3xl md:text-4xl font-light mb-12 text-center tracking-wide">
          Nosso Catálogo
        </h1>

        {produtos.length === 0 && (
          <p className="text-center" style={{ color: subtext }}>
            Nenhum produto disponível no momento.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {produtos.map(produto => {
            const imagens = produto.imagens?.length > 0
              ? produto.imagens.map(i => i.imagem)
              : [produto.imagem];
            const imagemAtual = imagens[indexImagem[produto.id] || 0];
            const temAlerta = alertas[produto.id];

            return (
              <div
                key={produto.id}
                className="group relative"
                onMouseEnter={() => setHoverProduto(produto.id)}
                onMouseLeave={() => {
                  setHoverProduto(null);
                  setIndexImagem(prev => ({ ...prev, [produto.id]: 0 }));
                }}
              >
                <Link to={`/produto/${produto.id}`}>
                  <div className="relative overflow-hidden" style={{ backgroundColor: "#f3f4f6" }}>
                    <img
                      src={imagemAtual}
                      alt={produto.nome}
                      className="w-full object-cover transition duration-500"
                      style={{ height: "520px" }}
                    />
                    {imagens.length > 1 && (
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {imagens.map((_, i) => (
                          <span key={i} style={{
                            width: "6px", height: "6px", borderRadius: "50%",
                            backgroundColor: (indexImagem[produto.id] || 0) === i
                              ? "white" : "rgba(255,255,255,0.5)",
                            display: "inline-block",
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="mt-4 space-y-2">
                  <Link to={`/produto/${produto.id}`}>
                    <h2 className="text-base font-medium hover:underline">{produto.nome}</h2>
                  </Link>
                  <p className="text-lg font-semibold">
                    R$ {Number(produto.preco).toFixed(2)}
                  </p>

                  {/* ALERTA DE TAMANHO */}
                  {temAlerta && (
                    <div className="rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2"
                      style={{ backgroundColor: dark ? "#3b1f1f" : "#fef2f2", color: "#ef4444", border: "1px solid #ef4444" }}>
                      ⚠️ Selecione um tamanho antes de adicionar
                    </div>
                  )}

                  {/* TAMANHOS */}
                  <div className="flex gap-2 mt-2">
                    {["P", "M", "G", "GG"].map(tamanho => (
                      <button
                        key={tamanho}
                        onClick={() => handleSelecionarTamanho(produto.id, tamanho)}
                        className="px-3 py-1 text-sm transition"
                        style={{
                          border: "1px solid " + (tamanhosSelecionados[produto.id] === tamanho ? "#000000" : btnBorder),
                          backgroundColor: tamanhosSelecionados[produto.id] === tamanho ? "#000000" : btnBg,
                          color: tamanhosSelecionados[produto.id] === tamanho ? "#ffffff" : text,
                        }}
                      >
                        {tamanho}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAdicionar(produto)}
                    className="w-full mt-4 py-2 font-medium transition hover:opacity-80"
                    style={{ backgroundColor: "#000000", color: "#ffffff" }}
                  >
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Catalogo;