import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../services/api";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
};

const medidas = {
  P:  { comprimento: "72 cm", largura: "54 cm", manga: "22 cm" },
  M:  { comprimento: "75 cm", largura: "58 cm", manga: "23,5 cm" },
  G:  { comprimento: "77 cm", largura: "60 cm", manga: "24 cm" },
  GG: { comprimento: "79 cm", largura: "63 cm", manga: "25 cm" },
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
    <div style={{ backgroundColor: t.bg, minHeight: "100vh" }} className="flex items-center justify-center">
      <p style={{ color: t.textSecundario }}>Carregando produto...</p>
    </div>
  );

  if (!produto) return (
    <div style={{ backgroundColor: t.bg, minHeight: "100vh" }} className="flex items-center justify-center">
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
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: "100vh" }}>

      {adicionado && (
        <div className="fixed top-6 right-6 z-50 px-5 py-4 shadow-2xl text-white text-sm font-medium"
          style={{ backgroundColor: "#16a34a" }}>
          ✅ Produto adicionado ao carrinho!
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 md:p-10">

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
          {" › "}<span style={{ color: t.text }}>{produto.nome}</span>
        </p>

        <div className="grid md:grid-cols-2 gap-12">

          {/* GALERIA */}
          <div>
            <div className="relative overflow-hidden"
              style={{ backgroundColor: t.bgSecundario, borderBottom: "2px solid " + t.borderForte }}>
              {imagens.length > 0
                ? <img src={imagens[imagemIndex]} alt={produto.nome} className="w-full object-contain" style={{ height: "540px" }} />
                : <div className="w-full flex items-center justify-center text-6xl" style={{ height: "540px" }}>
                    {isComunicacao ? "🖼️" : "👕"}
                  </div>
              }
              {imagens.length > 1 && (
                <>
                  <button onClick={() => setImagemIndex(i => i > 0 ? i - 1 : imagens.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow"
                    style={{ backgroundColor: t.bg, color: t.text }}>&#8249;</button>
                  <button onClick={() => setImagemIndex(i => i < imagens.length - 1 ? i + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow"
                    style={{ backgroundColor: t.bg, color: t.text }}>&#8250;</button>
                </>
              )}
            </div>
            {imagens.length > 1 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {imagens.map((src, i) => (
                  <button key={i} onClick={() => setImagemIndex(i)} className="overflow-hidden transition"
                    style={{ width: "72px", height: "72px",
                      border: i === imagemIndex ? "2px solid " + t.borderForte : "2px solid " + t.border,
                      opacity: i === imagemIndex ? 1 : 0.55 }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2" style={{ color: t.text }}>{produto.nome}</h1>

            {produto.descricao && (
              <p className="text-sm mb-4 leading-relaxed uppercase tracking-wider" style={{ color: t.textSecundario }}>
                {produto.descricao}
              </p>
            )}

            <p className="text-3xl font-bold mb-6" style={{ color: t.text }}>
              R$ {Number(produto.preco).toFixed(2)}
            </p>

            <div style={{ borderTop: "2px solid " + t.borderForte, marginBottom: "24px" }} />

            {/* ══ TAMANHOS — ROUPA ══ */}
            {!isComunicacao && (
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: t.textSecundario }}>
                  Tamanho {tamanhoSelecionado ? "— " + tamanhoSelecionado : ""}
                </p>
                {alerta && (
                  <div className="px-3 py-2 text-sm font-medium flex items-center gap-2 mb-3"
                    style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                    ⚠️ Selecione um tamanho antes de continuar
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
                        className="relative px-4 py-2 text-sm font-medium transition"
                        style={{
                          border: "1px solid " + (selecionado ? t.text : t.border),
                          backgroundColor: semEstoque ? t.bgSecundario : selecionado ? t.text : t.bg,
                          color: semEstoque ? t.textSecundario : selecionado ? "#ffffff" : t.text,
                          cursor: semEstoque ? "not-allowed" : "pointer",
                          textDecoration: semEstoque ? "line-through" : "none",
                        }}>
                        {est.tamanho}
                        {semEstoque && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />}
                      </button>
                    );
                  }) : <p className="text-sm" style={{ color: t.textSecundario }}>Sem estoque disponível</p>}
                </div>
                <p className="text-xs" style={{ color: t.textSecundario }}>Tamanhos riscados estão sem estoque</p>
              </div>
            )}

            {/* ══ TAMANHOS — COMUNICAÇÃO VISUAL ══ */}
            {isComunicacao && todosTamanhos.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: t.textSecundario }}>
                  Formato / Dimensões
                </p>
                {alerta && (
                  <div className="px-3 py-2 text-sm font-medium flex items-center gap-2 mb-3"
                    style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                    ⚠️ Selecione um formato antes de continuar
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
                        className="px-4 py-2 text-sm font-medium transition"
                        style={{
                          border: "1px solid " + (selecionado ? t.text : t.border),
                          backgroundColor: semEstoque ? t.bgSecundario : selecionado ? t.text : t.bg,
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

            {/* ══ QUANTIDADE ══ */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: t.textSecundario }}>Quantidade</p>
              <div className="flex items-center" style={{ border: "1px solid " + t.border }}>
                <button onClick={() => setQuantidade(q => q > 1 ? q - 1 : 1)}
                  className="px-4 py-2 font-bold transition hover:opacity-70"
                  style={{ backgroundColor: t.bgSecundario, color: t.text }}>−</button>
                <span className="px-4 py-2 font-semibold min-w-10 text-center" style={{ color: t.text }}>{quantidade}</span>
                <button onClick={() => setQuantidade(q => q + 1)}
                  className="px-4 py-2 font-bold transition hover:opacity-70"
                  style={{ backgroundColor: t.bgSecundario, color: t.text }}>+</button>
              </div>
            </div>

            {/* ══ BOTÕES ══ */}
            <div className="flex flex-col gap-3 mb-6">
              <button onClick={handleComprar}
                className="w-full py-4 font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: t.text }}>Comprar agora</button>
              <button onClick={handleAdicionar}
                className="w-full py-4 font-semibold transition hover:opacity-80"
                style={{ backgroundColor: t.bgSecundario, color: t.text, border: "1px solid " + t.border }}>
                Adicionar ao carrinho
              </button>
            </div>

            {/* Tabela de medidas só para ROUPAS */}
            {!isComunicacao && (
              <button onClick={() => setDrawerAberto(true)}
                className="text-sm underline text-left transition hover:opacity-70 mb-6"
                style={{ color: t.textSecundario }}>
                📏 Ver tabela de medidas
              </button>
            )}

            {/* INFO ENTREGA */}
            <div className="p-4 space-y-2" style={{ backgroundColor: t.bgSecundario, border: "1px solid " + t.border }}>
              <p className="text-sm flex items-center gap-2"><span>🚚</span><span style={{ color: t.textSecundario }}>Entrega para todo o Brasil</span></p>
              <p className="text-sm flex items-center gap-2"><span>🔄</span><span style={{ color: t.textSecundario }}>Trocas em até 7 dias</span></p>
              <p className="text-sm flex items-center gap-2"><span>💬</span><span style={{ color: t.textSecundario }}>Dúvidas? Fale pelo WhatsApp</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* DRAWER TABELA DE MEDIDAS — só para roupas */}
      {!isComunicacao && (
        <>
          {drawerAberto && (
            <div onClick={() => setDrawerAberto(false)} className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }} />
          )}
          <div className="fixed top-0 right-0 h-full z-50 shadow-2xl overflow-y-auto transition-transform duration-300"
            style={{ width: "420px", backgroundColor: t.bgCard, borderLeft: "2px solid " + t.borderForte,
              transform: drawerAberto ? "translateX(0)" : "translateX(100%)" }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold" style={{ color: t.text }}>📏 Tabela de Medidas</h2>
                <button onClick={() => setDrawerAberto(false)} className="text-xl hover:opacity-60 transition" style={{ color: t.text }}>✕</button>
              </div>
              <p className="text-sm mb-6" style={{ color: t.textSecundario }}>Medidas em centímetros (cm) da peça plana.</p>
              <div className="overflow-hidden mb-6" style={{ border: "1px solid " + t.border }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: t.bgSecundario }}>
                      <th className="p-3 text-left font-semibold" style={{ color: t.text }}>Medida</th>
                      {["P","M","G","GG"].map(tam => (
                        <th key={tam} className="p-3 text-center font-semibold"
                          style={{ color: tamanhoSelecionado === tam ? "#ffffff" : t.text,
                            backgroundColor: tamanhoSelecionado === tam ? t.text : "transparent" }}>
                          {tam}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[{ label: "Comprimento", key: "comprimento" }, { label: "Largura", key: "largura" }, { label: "Manga", key: "manga" }]
                      .map((linha, i) => (
                        <tr key={linha.key} style={{ backgroundColor: i % 2 === 0 ? t.bgCard : t.bgSecundario }}>
                          <td className="p-3 font-medium" style={{ color: t.text }}>{linha.label}</td>
                          {["P","M","G","GG"].map(tam => (
                            <td key={tam} className="p-3 text-center"
                              style={{ color: tamanhoSelecionado === tam ? "#2563eb" : t.textSecundario,
                                fontWeight: tamanhoSelecionado === tam ? "600" : "400" }}>
                              {medidas[tam][linha.key]}
                            </td>
                          ))}
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tamanhoSelecionado && medidas[tamanhoSelecionado] && (
                <div className="p-4 mb-6" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#2563eb" }}>Tamanho selecionado: {tamanhoSelecionado}</p>
                  {Object.entries({ Comprimento: "comprimento", Largura: "largura", Manga: "manga" }).map(([label, key]) => (
                    <p key={key} className="text-sm" style={{ color: t.text }}>{label}: <strong>{medidas[tamanhoSelecionado][key]}</strong></p>
                  ))}
                </div>
              )}
              <p className="text-sm font-semibold mb-3" style={{ color: t.text }}>Como medir:</p>
              <img src="https://hering.myvtex.com/api/dataentities/ET/documents/127a694a-63e5-11f0-b37f-f86067021982/image/attachments/3M9P-1ASN-T.jpg"
                alt="Guia de medidas" className="w-full mb-4" />
              <p className="text-xs" style={{ color: t.textSecundario }}>As medidas podem variar ±2 cm dependendo do processo de fabricação.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}