import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../services/api";
import { WhatsAppIcon, CartIcon, CheckIcon, WarningIcon, TruckIcon, RulerIcon, CloseIcon } from "../components/Icons";

const t = {
  bg: "#FFFFFF", bgSecundario: "#F4F2EE", bgCard: "#FFFFFF",
  text: "#161513", textSecundario: "#8A877F",
  border: "rgba(0,0,0,0.08)", borderForte: "rgba(0,0,0,0.18)",
  accent: "#C2660A",
};

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [imagemIndex, setImagemIndex] = useState(0);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [alerta, setAlerta] = useState(false);
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    api.get("produtos/" + id + "/")
      .then(res => setProduto(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ backgroundColor: t.bg, minHeight: "50vh" }} className="flex items-center justify-center">
      <p style={{ color: t.textSecundario }}>Carregando produto...</p>
    </div>
  );

  if (!produto) return (
    <div style={{ backgroundColor: t.bg, minHeight: "50vh" }} className="flex items-center justify-center">
      <p style={{ color: t.textSecundario }}>Produto não encontrado.</p>
    </div>
  );

  const isComunicacao = produto.categoria === "comunicacao";
  const todosTamanhos = produto.estoques || [];

  const imagens = produto.imagens?.length > 0
    ? produto.imagens.map(i => i.imagem)
    : produto.imagem ? [produto.imagem] : [];

  function handleAdicionar() {
    if (!isComunicacao && !tamanhoSelecionado) {
      setAlerta(true); setTimeout(() => setAlerta(false), 3000); return;
    }
    if (isComunicacao && todosTamanhos.length > 0 && !tamanhoSelecionado) {
      setAlerta(true); setTimeout(() => setAlerta(false), 3000); return;
    }
    addToCart(produto, tamanhoSelecionado || "Único", quantidade);
    setAdicionado(true); setTimeout(() => setAdicionado(false), 2000);
  }

  function handleComprar() {
    if (!isComunicacao && !tamanhoSelecionado) {
      setAlerta(true); setTimeout(() => setAlerta(false), 3000); return;
    }
    if (isComunicacao && todosTamanhos.length > 0 && !tamanhoSelecionado) {
      setAlerta(true); setTimeout(() => setAlerta(false), 3000); return;
    }
    addToCart(produto, tamanhoSelecionado || "Único", quantidade);
    navigate("/pedidos");
  }

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, fontFamily: "Manrope, sans-serif" }}>

      {adicionado && (
        <div className="fixed top-[70px] left-1/2 z-[9999] px-5 py-3.5 shadow-2xl text-white text-sm font-semibold flex items-center gap-2"
          style={{ backgroundColor: "#16A34A", transform: "translateX(-50%)", whiteSpace: "nowrap", borderRadius: "999px" }}>
          <CheckIcon size={16} strokeWidth={2.2} /> Produto adicionado ao carrinho!
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-10">

        {/* BREADCRUMB */}
        <p className="text-sm mb-8" style={{ color: t.textSecundario }}>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/catalogo")}>Catálogo</span>
          {produto.categoria && (
            <> {" › "} <span>{isComunicacao ? "Comunicação Visual" : "Item de Roupa"}</span></>
          )}
          {produto.subcategoria && (
            <> {" › "} <span>
              { produto.subcategoria === "gola-polo" ? "Gola Polo"
              : produto.subcategoria === "camisa-comum" ? "Camisa Comum"
              : produto.subcategoria === "calca" ? "Calça"
              : produto.subcategoria === "logos" ? "Logos"
              : produto.subcategoria === "impressoes" ? "Impressões"
              : produto.subcategoria }
            </span></>
          )}
          {" › "}<span style={{ color: t.text, fontWeight: 600 }}>{produto.nome}</span>
        </p>

        <div className="grid md:grid-cols-2 gap-12">

          {/* GALERIA */}
          <div>
            <div className="relative overflow-hidden"
              style={{ backgroundColor: t.bgSecundario, borderRadius: "18px" }}>
              {imagens.length > 0
                ? <img src={imagens[imagemIndex]} alt={produto.nome} className="w-full object-contain" style={{ height: "clamp(300px, 50vw, 540px)" }} />
                : <div className="w-full flex items-center justify-center text-6xl" style={{ height: "clamp(300px, 50vw, 540px)" }}>
                    {isComunicacao ? "🖼️" : "👕"}
                  </div>
              }
              {imagens.length > 1 && (
                <>
                  <button onClick={() => setImagemIndex(i => i > 0 ? i - 1 : imagens.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow"
                    style={{ backgroundColor: t.bgCard, color: t.text }}>&#8249;</button>
                  <button onClick={() => setImagemIndex(i => i < imagens.length - 1 ? i + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow"
                    style={{ backgroundColor: t.bgCard, color: t.text }}>&#8250;</button>
                </>
              )}
            </div>
            {imagens.length > 1 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {imagens.map((src, i) => (
                  <button key={i} onClick={() => setImagemIndex(i)} className="overflow-hidden transition"
                    style={{ width: "72px", height: "72px", borderRadius: "10px",
                      border: i === imagemIndex ? "2px solid " + t.accent : "2px solid " + t.border,
                      opacity: i === imagemIndex ? 1 : 0.55 }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES */}
          <div className="flex flex-col">
            <h1 style={{ fontFamily: "Newsreader, serif", fontSize: "32px", fontWeight: 500, color: t.text, marginBottom: "8px" }}>{produto.nome}</h1>

            {produto.descricao && (
              <p className="text-xs mb-4 leading-relaxed uppercase" style={{ color: t.textSecundario, letterSpacing: "0.08em", fontWeight: 600 }}>
                {produto.descricao}
              </p>
            )}

            <p style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontSize: "30px", fontWeight: 500, color: t.text, marginBottom: "24px" }}>
              R$ {Number(produto.preco).toFixed(2)}
            </p>

            <div style={{ borderTop: "1px solid " + t.border, marginBottom: "24px" }} />

            {/* TAMANHOS - ROUPA */}
            {!isComunicacao && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase mb-3" style={{ color: t.textSecundario, letterSpacing: "0.1em" }}>
                  Tamanho {tamanhoSelecionado ? "- " + tamanhoSelecionado : ""}
                </p>
                {alerta && (
                  <div className="px-3 py-2 text-sm font-medium flex items-center gap-2 mb-3"
                    style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "999px" }}>
                    <WarningIcon size={15} strokeWidth={1.8} /> Selecione um tamanho antes de continuar
                  </div>
                )}
                <div className="flex gap-2 mb-2 flex-wrap">
                  {todosTamanhos.length > 0 ? todosTamanhos.map(est => {
                    const semEstoque = est.quantidade === 0;
                    const selecionado = tamanhoSelecionado === est.tamanho;
                    return (
                      <button key={est.tamanho}
                        onClick={() => { if (!semEstoque) { setTamanhoSelecionado(est.tamanho); setAlerta(false); } }}
                        disabled={semEstoque}
                        className="relative px-4 py-2 text-sm font-semibold transition"
                        style={{
                          borderRadius: "999px",
                          border: "1px solid " + (selecionado ? t.text : t.border),
                          backgroundColor: semEstoque ? t.bgSecundario : selecionado ? t.text : t.bgCard,
                          color: semEstoque ? t.textSecundario : selecionado ? "#ffffff" : t.text,
                          cursor: semEstoque ? "not-allowed" : "pointer",
                          textDecoration: semEstoque ? "line-through" : "none",
                        }}>
                        {est.tamanho}
                        {semEstoque && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "#DC2626" }} />}
                      </button>
                    );
                  }) : <p className="text-sm" style={{ color: t.textSecundario }}>Sem estoque disponível</p>}
                </div>
                <p className="text-xs" style={{ color: t.textSecundario }}>Tamanhos riscados estão sem estoque</p>
              </div>
            )}

            {/* TAMANHOS - COMUNICAÇÃO VISUAL */}
            {isComunicacao && todosTamanhos.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase mb-3" style={{ color: t.textSecundario, letterSpacing: "0.1em" }}>
                  Formato / Dimensões
                </p>
                {alerta && (
                  <div className="px-3 py-2 text-sm font-medium flex items-center gap-2 mb-3"
                    style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "999px" }}>
                    <WarningIcon size={15} strokeWidth={1.8} /> Selecione um formato antes de continuar
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {todosTamanhos.map(est => {
                    const semEstoque = est.quantidade === 0;
                    const selecionado = tamanhoSelecionado === est.tamanho;
                    return (
                      <button key={est.tamanho}
                        onClick={() => { if (!semEstoque) { setTamanhoSelecionado(est.tamanho); setAlerta(false); } }}
                        disabled={semEstoque}
                        className="px-4 py-2 text-sm font-semibold transition"
                        style={{
                          borderRadius: "999px",
                          border: "1px solid " + (selecionado ? t.text : t.border),
                          backgroundColor: semEstoque ? t.bgSecundario : selecionado ? t.text : t.bgCard,
                          color: semEstoque ? t.textSecundario : selecionado ? "#ffffff" : t.text,
                          cursor: semEstoque ? "not-allowed" : "pointer",
                          opacity: semEstoque ? 0.45 : 1,
                        }}>
                        {est.tamanho}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs mt-2" style={{ color: t.textSecundario }}>Selecione o formato / dimensão desejado</p>
              </div>
            )}

            {/* QUANTIDADE */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-xs font-bold uppercase" style={{ color: t.textSecundario, letterSpacing: "0.1em" }}>Quantidade</p>
              <div className="flex items-center overflow-hidden" style={{ border: "1px solid " + t.border, borderRadius: "999px" }}>
                <button onClick={() => setQuantidade(q => q > 1 ? q - 1 : 1)}
                  className="px-4 py-2 font-bold transition hover:opacity-70"
                  style={{ backgroundColor: t.bgSecundario, color: t.text, cursor: "pointer" }}>−</button>
                <span className="px-4 py-2 font-semibold min-w-10 text-center" style={{ color: t.text }}>{quantidade}</span>
                <button onClick={() => setQuantidade(q => q + 1)}
                  className="px-4 py-2 font-bold transition hover:opacity-70"
                  style={{ backgroundColor: t.bgSecundario, color: t.text, cursor: "pointer" }}>+</button>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex flex-col gap-3 mb-6">
              <button onClick={handleComprar}
                className="cursor-pointer w-full py-4 font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: t.text, cursor: "pointer", borderRadius: "999px" }}>Comprar agora</button>
              <button onClick={handleAdicionar}
                className="cursor-pointer w-full py-4 font-bold transition hover:opacity-80"
                style={{ backgroundColor: "transparent", color: t.text, border: "1.5px solid " + t.borderForte, cursor: "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", borderRadius: "999px" }}>
                <CartIcon size={16} strokeWidth={1.7} /> Adicionar ao carrinho
              </button>
            </div>

            {/* Tabela de medidas só para ROUPAS */}
            {!isComunicacao && (
              <button onClick={() => setDrawerAberto(true)}
                className="text-sm underline text-left transition hover:opacity-70 mb-6 inline-flex items-center gap-1.5 w-fit"
                style={{ color: t.accent, fontWeight: 600 }}>
                <RulerIcon size={15} strokeWidth={1.8} /> Ver tabela de medidas
              </button>
            )}

            {/* INFO ENTREGA */}
            <div className="p-4 space-y-2.5" style={{ backgroundColor: t.bgSecundario, borderRadius: "14px" }}>
              <p className="text-sm flex items-center gap-2.5"><span style={{ color: t.text }}><TruckIcon size={16} strokeWidth={1.7} /></span><span style={{ color: t.textSecundario }}>Entrega para todo o Brasil</span></p>
              <p className="text-sm flex items-center gap-2.5"><span style={{ color: "#25D366" }}><WhatsAppIcon size={16} strokeWidth={1.6} /></span><span style={{ color: t.textSecundario }}>Dúvidas? Fale pelo WhatsApp</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* DRAWER TABELA DE MEDIDAS - só para roupas */}
      {!isComunicacao && (
        <>
          {drawerAberto && (
            <div onClick={() => setDrawerAberto(false)} className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }} />
          )}
          <div className="fixed top-0 right-0 h-full z-50 shadow-2xl overflow-y-auto transition-transform duration-300"
            style={{ width: "min(420px, 95vw)", backgroundColor: t.bgCard, borderLeft: "1px solid " + t.border,
              transform: drawerAberto ? "translateX(0)" : "translateX(100%)" }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontSize: "22px", fontWeight: 500, color: t.text }}>Tabela de Medidas</h2>
                <button onClick={() => setDrawerAberto(false)} className="hover:opacity-60 transition" style={{ color: t.text }}><CloseIcon size={20} strokeWidth={1.8} /></button>
              </div>
              <p className="text-sm mb-6" style={{ color: t.textSecundario }}>Medidas em centímetros (cm) da peça plana.</p>
              {/* TABELA TRADICIONAL */}
              <p className="text-xs font-bold uppercase mb-2" style={{ color: t.text, letterSpacing: "0.08em" }}>Tradicional</p>
              <div className="overflow-x-auto mb-6" style={{ border: "1px solid " + t.border, borderRadius: "12px" }}>
                <table className="text-sm" style={{ minWidth: "400px", width: "100%" }}>
                  <thead>
                    <tr style={{ backgroundColor: t.bgSecundario }}>
                      {["TAM","Comprimento","Manga","Largura"].map(h => (
                        <th key={h} className="p-2 text-center font-bold text-xs" style={{ color: t.text, borderRight: "1px solid " + t.border }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tam:"PP",  comp:"64", manga:"19", larg:"44" },
                      { tam:"P",   comp:"68", manga:"21", larg:"50" },
                      { tam:"M",   comp:"71", manga:"22", larg:"52" },
                      { tam:"G",   comp:"73", manga:"23", larg:"55" },
                      { tam:"GG",  comp:"75", manga:"24.5", larg:"58" },
                      { tam:"EXG", comp:"77", manga:"26", larg:"61" },
                      { tam:"EXGG",comp:"79", manga:"27", larg:"64" },
                    ].map((row, i) => (
                      <tr key={row.tam} style={{ backgroundColor: i % 2 === 0 ? t.bgCard : t.bgSecundario }}>
                        <td className="p-2 text-center font-bold text-xs" style={{ color: t.text, borderRight: "1px solid " + t.border }}>{row.tam}</td>
                        <td className="p-2 text-center text-xs" style={{ color: t.textSecundario, borderRight: "1px solid " + t.border }}>{row.comp} cm</td>
                        <td className="p-2 text-center text-xs" style={{ color: t.textSecundario, borderRight: "1px solid " + t.border }}>{row.manga} cm</td>
                        <td className="p-2 text-center text-xs" style={{ color: t.textSecundario }}>{row.larg} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/*TABELA BABY LOOK*/}
              <p className="text-xs font-bold uppercase mb-2" style={{ color: t.text, letterSpacing: "0.08em" }}>Baby Look</p>
              <div className="overflow-x-auto mb-6" style={{ border: "1px solid " + t.border, borderRadius: "12px" }}>
                <table className="text-sm" style={{ minWidth: "300px", width: "100%" }}>
                  <thead>
                    <tr style={{ backgroundColor: t.bgSecundario }}>
                      {["TAM","Larg. Peito","Altura"].map(h => (
                        <th key={h} className="p-2 text-center font-bold text-xs" style={{ color: t.text, borderRight: "1px solid " + t.border }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tam:"PP",  larg:"45", alt:"61" },
                      { tam:"P",   larg:"47", alt:"62" },
                      { tam:"M",   larg:"49", alt:"64" },
                      { tam:"G",   larg:"51", alt:"66" },
                      { tam:"GG",  larg:"53.5", alt:"67" },
                      { tam:"EXG", larg:"55.5", alt:"69" },
                    ].map((row, i) => (
                      <tr key={row.tam} style={{ backgroundColor: i % 2 === 0 ? t.bgCard : t.bgSecundario }}>
                        <td className="p-2 text-center font-bold text-xs" style={{ color: t.text, borderRight: "1px solid " + t.border }}>{row.tam}</td>
                        <td className="p-2 text-center text-xs" style={{ color: t.textSecundario, borderRight: "1px solid " + t.border }}>{row.larg} cm</td>
                        <td className="p-2 text-center text-xs" style={{ color: t.textSecundario }}>{row.alt} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm font-semibold mb-3" style={{ color: t.text }}>Como medir:</p>
              <img src="https://hering.myvtex.com/api/dataentities/ET/documents/127a694a-63e5-11f0-b37f-f86067021982/image/attachments/3M9P-1ASN-T.jpg"
                alt="Guia de medidas" className="w-full mb-4" style={{ borderRadius: "10px" }} />
              <p className="text-xs" style={{ color: t.textSecundario }}>As medidas podem variar ±2 cm dependendo do processo de fabricação.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
