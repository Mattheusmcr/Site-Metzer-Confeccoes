import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

const CATEGORIAS = [
  {
    id: "roupas", label: "ITEM DE ROUPA",
    subcategorias: [
      { id: "gola-polo",    label: "Polos"   },
      { id: "camisa-comum", label: "Camisas" },
      { id: "calca",        label: "Calças"  },
    ],
  },
  {
    id: "comunicacao", label: "COMUNICAÇÃO VISUAL",
    subcategorias: [
      { id: "logos",      label: "Logos"      },
      { id: "logos-acm",  label: "Logos ACM"  },
      { id: "impressoes", label: "Impressões" },
    ],
  },
];

function Sidebar({ filtro, setFiltro }) {
  const [abertos, setAbertos] = useState({ roupas: true, comunicacao: true });

  return (
    <aside className="w-44 shrink-0 hidden md:block" style={{ borderRight: "2px solid " + t.borderForte, paddingRight: "24px" }}>
      <p className="text-xs font-bold tracking-widest mb-4 uppercase" style={{ color: t.textSecundario }}>Categorias</p>

      <button onClick={() => setFiltro({ categoria: null, subcategoria: null })}
        className="block w-full text-left text-xs py-2 mb-2 uppercase tracking-wider transition hover:opacity-50"
        style={{
          color: !filtro.categoria ? t.text : t.textSecundario,
          fontWeight: !filtro.categoria ? "700" : "400",
          borderBottom: "1px solid " + t.border, paddingBottom: "8px"
        }}>
        TODOS
      </button>

      {CATEGORIAS.map(grupo => (
        <div key={grupo.id} className="mb-1">
          <button
            onClick={() => {
              setAbertos(prev => ({ ...prev, [grupo.id]: !prev[grupo.id] }));
              if (grupo.subcategorias.length === 0) setFiltro({ categoria: grupo.id, subcategoria: null });
            }}
            className="flex items-center justify-between w-full text-left text-xs font-bold tracking-wider py-2 uppercase transition hover:opacity-50"
            style={{ color: t.text }}>
            {grupo.label}
            <span style={{ fontSize: "9px", color: t.textSecundario }}>{abertos[grupo.id] ? "▲" : "▼"}</span>
          </button>

          {abertos[grupo.id] && grupo.subcategorias.length > 0 && (
            <div className="pl-3 space-y-1 pb-2">
              {grupo.subcategorias.map(sub => (
                <button key={sub.id}
                  onClick={() => setFiltro({ categoria: grupo.id, subcategoria: sub.id })}
                  className="block w-full text-left text-sm py-1 transition hover:opacity-50"
                  style={{
                    color: filtro.subcategoria === sub.id ? t.text : t.textSecundario,
                    fontWeight: filtro.subcategoria === sub.id ? "600" : "400",
                    borderLeft: "2px solid " + (filtro.subcategoria === sub.id ? t.borderForte : "transparent"),
                    paddingLeft: "8px",
                  }}>
                  {sub.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ borderBottom: "2px solid " + t.borderForte, margin: "4px 0 8px 0" }} />
        </div>
      ))}

      {(filtro.categoria || filtro.subcategoria) && (
        <button onClick={() => setFiltro({ categoria: null, subcategoria: null })}
          className="mt-2 text-xs uppercase tracking-wider transition hover:opacity-50"
          style={{ color: t.textSecundario }}>
          Limpar
        </button>
      )}
    </aside>
  );
}

function Catalogo() {
  const [produtos, setProdutos] = useState([]);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState({});
  // quantidade por produto: { [produtoId]: number }
  const [quantidades, setQuantidades] = useState({});
  const [indexImagem, setIndexImagem] = useState({});
  const [hoverProduto, setHoverProduto] = useState(null);
  const [alertas, setAlertas] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const [filtro, setFiltro] = useState({ categoria: null, subcategoria: null });
  const [filtroMobileAberto, setFiltroMobileAberto] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api.get("produtos/").then(res => setProdutos(res.data)).catch(console.error);
  }, []);

  // carrossel ao hover
  useEffect(() => {
    if (!hoverProduto) return;
    const produto = produtos.find(p => p.id === hoverProduto);
    if (!produto) return;
    const imgs = produto.imagens?.length > 0
      ? produto.imagens.map(i => i.imagem)
      : [produto.imagem];
    if (imgs.length <= 1) return;
    const iv = setInterval(() => {
      setIndexImagem(prev => ({ ...prev, [hoverProduto]: ((prev[hoverProduto] || 0) + 1) % imgs.length }));
    }, 900);
    return () => clearInterval(iv);
  }, [hoverProduto, produtos]);

  function mostrarToast(msg, sucesso) {
    setToastMsg({ msg, sucesso });
    setTimeout(() => setToastMsg(null), 2500);
  }

  function getQtd(id) { return quantidades[id] || 1; }
  function setQtd(id, val) {
    setQuantidades(prev => ({ ...prev, [id]: Math.max(1, val) }));
  }

  const produtosFiltrados = produtos.filter(p => {
    if (filtro.subcategoria) return p.subcategoria === filtro.subcategoria;
    if (filtro.categoria) return p.categoria === filtro.categoria;
    return true;
  });

  const tituloAtivo = filtro.subcategoria
    ? CATEGORIAS.flatMap(g => g.subcategorias).find(s => s.id === filtro.subcategoria)?.label
    : filtro.categoria
    ? CATEGORIAS.find(g => g.id === filtro.categoria)?.label
    : "Catálogo";

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: "100vh" }}>

      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-5 py-4 shadow-xl text-white text-sm font-medium flex items-center gap-3"
          style={{ backgroundColor: toastMsg.sucesso ? "#16a34a" : "#dc2626" }}>
          {toastMsg.sucesso ? "✅" : "❌"} {toastMsg.msg}
        </div>
      )}

      <div style={{ borderBottom: "2px solid " + t.borderForte, backgroundColor: t.bg, padding: "16px 20px" }}
        className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest" style={{ color: t.textSecundario }}>
          {tituloAtivo} — {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
        </p>
        {/* Botão filtros — só mobile */}
        <button
          className="md:hidden flex items-center gap-2 text-xs uppercase tracking-wider px-3 py-1.5"
          style={{ border: "1px solid " + t.borderForte, color: t.text, backgroundColor: t.bg }}
          onClick={() => setFiltroMobileAberto(v => !v)}>
          ☰ {filtroMobileAberto ? "Fechar" : "Filtros"}
          {(filtro.categoria || filtro.subcategoria) && (
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.text }} />
          )}
        </button>
      </div>

      {/* PAINEL DE FILTROS MOBILE */}
      {filtroMobileAberto && (
        <div className="md:hidden px-5 py-4" style={{ backgroundColor: t.bgSecundario, borderBottom: "2px solid " + t.borderForte }}>
          <Sidebar filtro={filtro} setFiltro={(f) => { setFiltro(f); setFiltroMobileAberto(false); }} />
        </div>
      )}

      <div className="flex" style={{ minHeight: "calc(100vh - 100px)" }}>
        {/* SIDEBAR */}
        <div className="hidden md:block" style={{ padding: "24px 0 24px 24px" }}>
          <Sidebar filtro={filtro} setFiltro={setFiltro} />
        </div>

        {/* GRID */}
        <div className="flex-1" style={{ padding: "16px 16px 24px 16px", flex: 1 }}>
          {produtosFiltrados.length === 0 && (
            <p className="text-center py-20" style={{ color: t.textSecundario }}>
              Nenhum produto nesta categoria ainda.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
            {produtosFiltrados.map((produto, idx) => {
              const imagens = produto.imagens?.length > 0
                ? produto.imagens.map(i => i.imagem)
                : [produto.imagem];
              const imagemAtual = imagens[indexImagem[produto.id] || 0];
              const tamanhosComEstoque = produto.estoques?.filter(e => e.quantidade > 0).map(e => e.tamanho) || [];
              const isComunicacao = produto.categoria === "comunicacao";
              const col = idx % 4;
              const qtd = getQtd(produto.id);

              return (
                <div key={produto.id}
                  style={{
                    borderRight: col < 3 ? "2px solid " + t.borderForte : "none",
                    borderBottom: "2px solid " + t.borderForte,
                    padding: "0 16px 24px 0",
                    marginRight: col < 3 ? "16px" : "0"
                  }}
                  onMouseEnter={() => setHoverProduto(produto.id)}
                  onMouseLeave={() => {
                    setHoverProduto(null);
                    setIndexImagem(prev => ({ ...prev, [produto.id]: 0 }));
                  }}>

                  {/* IMAGEM */}
                  <Link to={`/produto/${produto.id}`}>
                    <div className="relative overflow-hidden" style={{ backgroundColor: t.bgSecundario }}>
                      {imagemAtual
                        ? <img src={imagemAtual} alt={produto.nome} className="w-full object-contain transition duration-500"
                            style={{ height: "280px" }} />
                        : <div className="w-full flex items-center justify-center text-5xl"
                            style={{ height: "360px" }}>
                            {isComunicacao ? "🖼️" : "👕"}
                          </div>
                      }
                      {imagens.length > 1 && (
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                          {imagens.map((_, i) => (
                            <span key={i} style={{
                              width: "5px", height: "5px", borderRadius: "50%", display: "inline-block",
                              backgroundColor: (indexImagem[produto.id] || 0) === i ? "white" : "rgba(255,255,255,0.4)"
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* INFO */}
                  <div className="mt-3 space-y-2">
                    <Link to={`/produto/${produto.id}`}>
                      <h2 className="text-xs font-semibold uppercase tracking-wide hover:opacity-50 transition"
                        style={{ color: t.text }}>{produto.nome}</h2>
                    </Link>
                    <p className="text-sm font-semibold" style={{ color: t.text }}>
                      R$ {Number(produto.preco).toFixed(2)}
                    </p>

                    {alertas[produto.id] && (
                      <div className="px-3 py-1.5 text-xs font-medium flex items-center gap-2"
                        style={{ backgroundColor: "#fff5f5", color: "#dc2626", border: "1px solid #fecaca" }}>
                        ⚠️ Selecione um tamanho
                      </div>
                    )}

                    {/* Comunicação visual — mostra descrição */}
                    {isComunicacao ? (
                      produto.descricao && (
                        <p className="text-xs uppercase tracking-wide" style={{ color: t.textSecundario }}>
                          {produto.descricao}
                        </p>
                      )
                    ) : (
                      // Roupas — botões de tamanho
                      <div className="flex gap-1.5 flex-wrap">
                        {tamanhosComEstoque.length > 0
                          ? tamanhosComEstoque.map(tam => (
                            <button key={tam}
                              onClick={() => {
                                setTamanhosSelecionados(prev => ({ ...prev, [produto.id]: tam }));
                                setAlertas(prev => ({ ...prev, [produto.id]: false }));
                              }}
                              className="px-2.5 py-1 text-xs transition hover:opacity-70"
                              style={{
                                border: "1px solid " + (tamanhosSelecionados[produto.id] === tam ? t.text : t.border),
                                backgroundColor: tamanhosSelecionados[produto.id] === tam ? t.btnPrimarioBg : "transparent",
                                color: tamanhosSelecionados[produto.id] === tam ? t.btnPrimarioText : t.text,
                              }}>
                              {tam}
                            </button>
                          ))
                          : <p className="text-xs" style={{ color: t.textSecundario }}>Sem estoque</p>
                        }
                      </div>
                    )}

                    {/* CONTROLE DE QUANTIDADE */}
                    <div className="flex items-center gap-0" style={{ border: "1px solid " + t.border, width: "fit-content" }}>
                      <button
                        onClick={() => setQtd(produto.id, qtd - 1)}
                        className="px-2.5 py-1 text-sm font-bold transition hover:opacity-70"
                        style={{ backgroundColor: t.bgSecundario, color: t.text }}>−</button>
                      <span className="px-3 py-1 text-sm font-semibold text-center"
                        style={{ minWidth: "32px", color: t.text, borderLeft: "1px solid " + t.border, borderRight: "1px solid " + t.border }}>
                        {qtd}
                      </span>
                      <button
                        onClick={() => setQtd(produto.id, qtd + 1)}
                        className="px-2.5 py-1 text-sm font-bold transition hover:opacity-70"
                        style={{ backgroundColor: t.bgSecundario, color: t.text }}>+</button>
                    </div>

                    {/* BOTÃO ADICIONAR */}
                    <button
                      onClick={() => {
                        if (!isComunicacao) {
                          const tamanho = tamanhosSelecionados[produto.id];
                          if (!tamanho) {
                            setAlertas(prev => ({ ...prev, [produto.id]: true }));
                            setTimeout(() => setAlertas(prev => ({ ...prev, [produto.id]: false })), 3000);
                            return;
                          }
                          addToCart(produto, tamanho, qtd);
                        } else {
                          addToCart(produto, produto.descricao || "Único", qtd);
                        }
                        mostrarToast(`"${produto.nome}" (x${qtd}) adicionado!`, true);
                      }}
                      className="w-full py-2 text-xs font-semibold uppercase tracking-wide transition hover:opacity-70 mt-1"
                      style={{ backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText }}>
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catalogo;