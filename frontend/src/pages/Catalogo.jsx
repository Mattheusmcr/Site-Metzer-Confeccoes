import { useEffect, useState, useContext } from "react";
import { CartIcon, SearchIcon, CheckIcon, CloseIcon, ImageIcon, ShirtIcon, WarningIcon } from "../components/Icons";
import api from "../services/api";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

const t = {
  bg: "#FFFFFF", bgSecundario: "#F4F2EE", bgCard: "#FFFFFF",
  text: "#161513", textSecundario: "#8A877F",
  border: "rgba(0,0,0,0.08)", borderForte: "rgba(0,0,0,0.18)",
  accent: "#C2660A",
  btnPrimarioBg: "#161513", btnPrimarioText: "#FFFFFF",
};

const CATEGORIAS = [
  {
    id: "roupas", label: "Item de roupa",
    subcategorias: [
      { id: "gola-polo",    label: "Polos"      },
      { id: "camisa-comum", label: "Camisas"    },
      { id: "calca",        label: "Calças"     },
    ],
  },
  {
    id: "comunicacao", label: "Comunicação visual",
    subcategorias: [
      { id: "logos-acm",  label: "Logos ACM"  },
      { id: "impressoes", label: "Impressões" },
    ],
  },
];

function Sidebar({ filtro, setFiltro, mobile = false }) {
  const [abertos, setAbertos] = useState({ roupas: true, comunicacao: true });
  return (
    <aside className={mobile ? "w-full" : "w-48 shrink-0"} style={mobile ? {} : { borderRight: "1px solid " + t.border, paddingRight: "24px" }}>
      <p className="text-[10px] font-bold mb-4 uppercase" style={{ color: t.textSecundario, letterSpacing: "0.22em" }}>Categorias</p>
      <button onClick={() => setFiltro({ categoria: null, subcategoria: null })}
        className="block w-full text-left text-xs py-2 mb-3 uppercase transition hover:opacity-60"
        style={{
          color: !filtro.categoria ? t.text : t.textSecundario,
          fontWeight: !filtro.categoria ? "700" : "600",
          borderLeft: "2px solid " + (!filtro.categoria ? t.accent : "transparent"),
          paddingLeft: "10px", letterSpacing: "0.08em",
        }}>
        Todos
      </button>
      {CATEGORIAS.map(grupo => (
        <div key={grupo.id} className="mb-1">
          <button
            onClick={() => {
              setAbertos(prev => ({ ...prev, [grupo.id]: !prev[grupo.id] }));
              if (grupo.subcategorias.length === 0) setFiltro({ categoria: grupo.id, subcategoria: null });
            }}
            className="flex items-center justify-between w-full text-left text-xs font-bold py-2 uppercase transition hover:opacity-60"
            style={{ color: t.text, letterSpacing: "0.08em" }}>
            {grupo.label}
            <span style={{ fontSize: "9px", color: t.textSecundario }}>{abertos[grupo.id] ? "▲" : "▼"}</span>
          </button>
          {abertos[grupo.id] && grupo.subcategorias.length > 0 && (
            <div className="space-y-1 pb-2 pt-1">
              {grupo.subcategorias.map(sub => (
                <button key={sub.id}
                  onClick={() => setFiltro({ categoria: grupo.id, subcategoria: sub.id })}
                  className="block w-full text-left text-sm py-1.5 transition hover:opacity-60"
                  style={{
                    color: filtro.subcategoria === sub.id ? t.text : t.textSecundario,
                    fontWeight: filtro.subcategoria === sub.id ? "700" : "500",
                    borderLeft: "2px solid " + (filtro.subcategoria === sub.id ? t.accent : "transparent"),
                    paddingLeft: "10px",
                  }}>
                  {sub.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ borderBottom: "1px solid " + t.border, margin: "6px 0 10px 0" }} />
        </div>
      ))}
      {(filtro.categoria || filtro.subcategoria) && (
        <button onClick={() => setFiltro({ categoria: null, subcategoria: null })}
          className="mt-2 text-xs uppercase transition hover:opacity-60"
          style={{ color: t.accent, letterSpacing: "0.08em", fontWeight: 700 }}>
          Limpar
        </button>
      )}
    </aside>
  );
}

function Catalogo() {
  const [produtos, setProdutos] = useState([]);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState({});
  const [quantidades, setQuantidades] = useState({});
  const [indexImagem, setIndexImagem] = useState({});
  const [hoverProduto, setHoverProduto] = useState(null);
  const [alertas, setAlertas] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const [filtro, setFiltro] = useState({ categoria: null, subcategoria: null });
  const [filtroMobileAberto, setFiltroMobileAberto] = useState(false);
  const [busca, setBusca] = useState("");
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
    const matchCateg = filtro.subcategoria
      ? p.subcategoria === filtro.subcategoria
      : filtro.categoria ? p.categoria === filtro.categoria : true;
    const matchBusca = !busca.trim() ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.descricao||"").toLowerCase().includes(busca.toLowerCase());
    return matchCateg && matchBusca;
  });

  const tituloAtivo = filtro.subcategoria
    ? CATEGORIAS.flatMap(g => g.subcategorias).find(s => s.id === filtro.subcategoria)?.label
    : filtro.categoria
    ? CATEGORIAS.find(g => g.id === filtro.categoria)?.label
    : "Catálogo";

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, fontFamily: "Manrope, sans-serif" }}>
      {toastMsg && (
        <div className="fixed top-[70px] left-1/2 z-[9999] px-5 py-3 shadow-2xl text-white text-sm font-medium flex items-center gap-3"
          style={{ transform: "translateX(-50%)", backgroundColor: toastMsg.sucesso ? "#16A34A" : "#DC2626",
            whiteSpace: "nowrap", maxWidth: "90vw", borderRadius: "999px" }}>
          {toastMsg.sucesso ? <CheckIcon size={16} strokeWidth={2.2} /> : <CloseIcon size={15} strokeWidth={2.2} />} {toastMsg.msg}
        </div>
      )}

      <div style={{ borderBottom: "1px solid " + t.border, backgroundColor: t.bg, padding: "20px 20px" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontSize: "20px", fontWeight: 500, color: t.text }}>
            {tituloAtivo} <span style={{ fontFamily: "Manrope, sans-serif", fontStyle: "normal", fontSize: "12px", color: t.textSecundario, fontWeight: 600 }}>- {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}</span>
          </p>

          <div className="flex items-center gap-3">
            {/* Campo de busca - pílula */}
            <div style={{ position: "relative", flex: "1", minWidth: 0, maxWidth: "260px" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: t.textSecundario, display: "flex" }}>
                <SearchIcon size={14} strokeWidth={1.8} />
              </span>
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar produto..."
                style={{ width: "100%", paddingLeft: "36px", paddingRight: busca ? "32px" : "14px",
                  paddingTop: "9px", paddingBottom: "9px", borderRadius: "999px",
                  border: "1px solid " + t.border, backgroundColor: t.bgCard, color: t.text,
                  fontSize: "12.5px", fontFamily: "Manrope, sans-serif", outline: "none", boxSizing: "border-box" }} />
              {busca && (
                <button onClick={() => setBusca("")}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: t.textSecundario, fontSize: "18px", lineHeight: 1 }}>
                  ×
                </button>
              )}
            </div>

            {/* Botão filtros - só mobile */}
            <button
              className="cursor-pointer md:hidden shrink-0 flex items-center gap-2 text-xs uppercase px-4 py-2"
              style={{ border: "1px solid " + t.border, color: t.text, backgroundColor: t.bgCard, borderRadius: "999px", letterSpacing: "0.06em", fontWeight: 700 }}
              onClick={() => setFiltroMobileAberto(v => !v)}>
              {filtroMobileAberto ? "Fechar" : "Filtros"}
              {(filtro.categoria || filtro.subcategoria) && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL DE FILTROS MOBILE */}
      {filtroMobileAberto && (
        <div className="md:hidden px-5 py-4" style={{ backgroundColor: t.bgSecundario, borderBottom: "1px solid " + t.border }}>
          <Sidebar filtro={filtro} setFiltro={(f) => { setFiltro(f); setFiltroMobileAberto(false); }} mobile={true} />
        </div>
      )}

      <div className="flex">
        {/* SIDEBAR */}
        <div className="hidden md:block" style={{ padding: "28px 0 24px 24px" }}>
          <Sidebar filtro={filtro} setFiltro={setFiltro} />
        </div>

        {/* GRID */}
        <div className="flex-1" style={{ padding: "20px 16px 24px 16px" }}>
          {produtosFiltrados.length === 0 && (
            <p className="text-center py-20" style={{ color: t.textSecundario }}>
              Nenhum produto nesta categoria ainda.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => {
              const imagens = produto.imagens?.length > 0
                ? produto.imagens.map(i => i.imagem)
                : [produto.imagem];
              const imagemAtual = imagens[indexImagem[produto.id] || 0];
              const tamanhosComEstoque = produto.estoques?.filter(e => e.quantidade > 0).map(e => e.tamanho) || [];
              const isComunicacao = produto.categoria === "comunicacao";
              const qtd = getQtd(produto.id);
              return (
                <div key={produto.id}
                  className="group overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                  style={{ backgroundColor: t.bgCard, border: "1px solid " + t.border, borderRadius: "18px" }}
                  onMouseEnter={() => setHoverProduto(produto.id)}
                  onMouseLeave={() => {
                    setHoverProduto(null);
                    setIndexImagem(prev => ({ ...prev, [produto.id]: 0 }));
                  }}>
                  {/* IMAGEM */}
                  <Link to={`/produto/${produto.id}`}>
                    <div className="relative overflow-hidden" style={{ backgroundColor: t.bgSecundario }}>
                      {imagemAtual
                        ? <img src={imagemAtual} alt={produto.nome} className="w-full object-cover transition duration-500 group-hover:scale-105" style={{ height: "280px" }} />
                        : <div className="w-full flex items-center justify-center" style={{ height: "280px", color: t.textSecundario }}>
                            {isComunicacao ? <ImageIcon size={44} strokeWidth={1.3} /> : <ShirtIcon size={44} strokeWidth={1.3} />}
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
                  <div className="p-4 space-y-2.5">
                    <Link to={`/produto/${produto.id}`}>
                      <h2 className="text-xs font-bold uppercase tracking-wide hover:opacity-60 transition"
                        style={{ color: t.text }}>{produto.nome}</h2>
                    </Link>
                    <p style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontSize: "17px", fontWeight: 500, color: t.text }}>
                      R$ {Number(produto.preco).toFixed(2)}
                    </p>
                    {alertas[produto.id] && (
                      <div className="px-3 py-1.5 text-xs font-medium flex items-center gap-2"
                        style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "999px" }}>
                        <WarningIcon size={13} strokeWidth={1.8} /> Selecione um tamanho
                      </div>
                    )}

                    {/* Tamanhos/formatos (roupas e comunicação usam o mesmo padrão) */}
                    <div className="flex gap-1.5 flex-wrap">
                      {tamanhosComEstoque.length > 0
                        ? tamanhosComEstoque.map(tam => (
                          <button key={tam}
                            onClick={() => {
                              setTamanhosSelecionados(prev => ({ ...prev, [produto.id]: tam }));
                              setAlertas(prev => ({ ...prev, [produto.id]: false }));
                            }}
                            className="px-3 py-1 text-xs font-semibold transition-all duration-200 hover:shadow-sm"
                            style={{
                              border: "1px solid " + (tamanhosSelecionados[produto.id] === tam ? t.text : t.border),
                              backgroundColor: tamanhosSelecionados[produto.id] === tam ? t.btnPrimarioBg : "transparent",
                              color: tamanhosSelecionados[produto.id] === tam ? t.btnPrimarioText : t.text,
                              borderRadius: "999px",
                            }}>
                            {tam}
                          </button>
                        ))
                        : <p className="text-xs" style={{ color: t.textSecundario }}>Sem estoque</p>
                      }
                    </div>

                    {/* CONTROLE DE QUANTIDADE */}
                    <div className="flex items-center gap-0 overflow-hidden" style={{ border: "1px solid " + t.border, width: "fit-content", borderRadius: "999px" }}>
                      <button
                        onClick={() => setQtd(produto.id, qtd - 1)}
                        className="px-3 py-1 text-sm font-bold transition hover:opacity-70"
                        style={{ backgroundColor: t.bgSecundario, color: t.text }}>−</button>
                      <span className="px-3 py-1 text-sm font-semibold text-center"
                        style={{ minWidth: "32px", color: t.text, borderLeft: "1px solid " + t.border, borderRight: "1px solid " + t.border }}>
                        {qtd}
                      </span>
                      <button
                        onClick={() => setQtd(produto.id, qtd + 1)}
                        className="px-3 py-1 text-sm font-bold transition hover:opacity-70"
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
                      className="w-full py-2.5 text-xs font-bold uppercase tracking-wide transition-all duration-300 hover:opacity-85 mt-1"
                      style={{ backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", borderRadius: "999px", letterSpacing: "0.04em" }}>
                      <CartIcon size={15} strokeWidth={1.8} /> Adicionar
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
