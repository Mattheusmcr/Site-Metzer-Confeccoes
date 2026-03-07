import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { dark } = useTheme();

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
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const bg = dark ? "#111827" : "#ffffff";
  const text = dark ? "#ffffff" : "#000000";
  const subtext = dark ? "#9ca3af" : "#6b7280";
  const cardBg = dark ? "#1f2937" : "#f9fafb";
  const border = dark ? "#374151" : "#e5e7eb";
  const drawerBg = dark ? "#1f2937" : "#ffffff";

  const medidas = {
    P:  { comprimento: "72 cm", largura: "54 cm", manga: "22 cm" },
    M:  { comprimento: "75 cm", largura: "58 cm", manga: "23,5 cm" },
    G:  { comprimento: "77 cm", largura: "60 cm", manga: "24 cm" },
    GG: { comprimento: "79 cm", largura: "63 cm", manga: "25 cm" },
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: bg, color: text, minHeight: "100vh" }}
        className="flex items-center justify-center">
        <p style={{ color: subtext }}>Carregando produto...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div style={{ backgroundColor: bg, color: text, minHeight: "100vh" }}
        className="flex items-center justify-center">
        <p style={{ color: subtext }}>Produto não encontrado.</p>
      </div>
    );
  }

  const imagens = produto.imagens?.length > 0
    ? produto.imagens.map(i => i.imagem)
    : produto.imagem ? [produto.imagem] : [];

  const estoqueDoTamanho = (tam) =>
    produto.estoques?.find(e => e.tamanho === tam)?.quantidade || 0;

  function handleAdicionar() {
    if (!tamanhoSelecionado) {
      setAlerta(true);
      setTimeout(() => setAlerta(false), 3000);
      return;
    }
    addToCart(produto, tamanhoSelecionado, quantidade);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  }

  function handleComprar() {
    if (!tamanhoSelecionado) {
      setAlerta(true);
      setTimeout(() => setAlerta(false), 3000);
      return;
    }
    addToCart(produto, tamanhoSelecionado, quantidade);
    navigate("/pedidos");
  }

  return (
    <div style={{ backgroundColor: bg, color: text, minHeight: "100vh" }}>

      {/* TOAST SUCESSO */}
      {adicionado && (
        <div className="fixed top-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2"
          style={{ backgroundColor: "#16a34a" }}>
          ✅ Produto adicionado ao carrinho!
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 md:p-10">

        {/* BREADCRUMB */}
        <p className="text-sm mb-8" style={{ color: subtext }}>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/catalogo")}>
            Catálogo
          </span>
          {" › "}
          <span>{produto.nome}</span>
        </p>

        <div className="grid md:grid-cols-2 gap-12">

          {/* GALERIA */}
          <div>
            {/* IMAGEM PRINCIPAL */}
            <div className="relative overflow-hidden rounded-xl mb-3"
              style={{ backgroundColor: cardBg }}>
              {imagens.length > 0 ? (
                <img
                  src={imagens[imagemIndex]}
                  alt={produto.nome}
                  className="w-full object-cover"
                  style={{ height: "540px" }}
                />
              ) : (
                <div className="w-full flex items-center justify-center text-6xl"
                  style={{ height: "540px" }}>👕</div>
              )}

              {imagens.length > 1 && (
                <>
                  <button
                    onClick={() => setImagemIndex(i => i > 0 ? i - 1 : imagens.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow transition hover:opacity-90"
                    style={{ backgroundColor: bg, color: text }}>
                    &#8249;
                  </button>
                  <button
                    onClick={() => setImagemIndex(i => i < imagens.length - 1 ? i + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow transition hover:opacity-90"
                    style={{ backgroundColor: bg, color: text }}>
                    &#8250;
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS */}
            {imagens.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {imagens.map((src, i) => (
                  <button key={i} onClick={() => setImagemIndex(i)}
                    className="rounded-lg overflow-hidden transition"
                    style={{
                      width: "72px", height: "72px",
                      border: i === imagemIndex ? "2px solid #000000" : "2px solid " + border,
                      opacity: i === imagemIndex ? 1 : 0.6,
                    }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES */}
          <div className="flex flex-col">

            <h1 className="text-3xl font-bold mb-2">{produto.nome}</h1>

            {produto.descricao && (
              <p className="text-sm mb-4 leading-relaxed" style={{ color: subtext }}>
                {produto.descricao}
              </p>
            )}

            <p className="text-3xl font-bold mb-6">
              R$ {Number(produto.preco).toFixed(2)}
            </p>

            {/* TAMANHOS */}
            <div className="mb-2">
              <p className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: subtext }}>
                Tamanho {tamanhoSelecionado ? "— " + tamanhoSelecionado : ""}
              </p>

              {alerta && (
                <div className="rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 mb-3"
                  style={{ backgroundColor: dark ? "#3b1f1f" : "#fef2f2", color: "#ef4444", border: "1px solid #ef4444" }}>
                  ⚠️ Selecione um tamanho antes de continuar
                </div>
              )}

              <div className="flex gap-2 mb-2">
                {["P", "M", "G", "GG"].map(tam => {
                  const qtd = estoqueDoTamanho(tam);
                  const semEstoque = qtd === 0;
                  const selecionado = tamanhoSelecionado === tam;
                  return (
                    <button key={tam}
                      onClick={() => { if (!semEstoque) { setTamanhoSelecionado(tam); setAlerta(false); } }}
                      disabled={semEstoque}
                      className="relative px-4 py-2 text-sm font-medium transition"
                      style={{
                        border: "1px solid " + (selecionado ? "#000000" : border),
                        backgroundColor: semEstoque ? (dark ? "#374151" : "#f3f4f6")
                          : selecionado ? "#000000" : bg,
                        color: semEstoque ? (dark ? "#6b7280" : "#9ca3af")
                          : selecionado ? "#ffffff" : text,
                        cursor: semEstoque ? "not-allowed" : "pointer",
                        textDecoration: semEstoque ? "line-through" : "none",
                      }}>
                      {tam}
                      {semEstoque && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                          style={{ backgroundColor: "#ef4444" }} />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs" style={{ color: subtext }}>
                Tamanhos riscados estão sem estoque
              </p>
            </div>

            {/* QUANTIDADE */}
            <div className="flex items-center gap-4 my-6">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: subtext }}>
                Quantidade
              </p>
              <div className="flex items-center rounded-lg overflow-hidden"
                style={{ border: "1px solid " + border }}>
                <button onClick={() => setQuantidade(q => q > 1 ? q - 1 : 1)}
                  className="px-4 py-2 font-bold transition hover:opacity-70"
                  style={{ backgroundColor: cardBg, color: text }}>−</button>
                <span className="px-4 py-2 font-semibold min-w-10 text-center">{quantidade}</span>
                <button onClick={() => setQuantidade(q => q + 1)}
                  className="px-4 py-2 font-bold transition hover:opacity-70"
                  style={{ backgroundColor: cardBg, color: text }}>+</button>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex flex-col gap-3 mb-6">
              <button onClick={handleComprar}
                className="w-full py-4 font-semibold text-white rounded-xl transition hover:opacity-90"
                style={{ backgroundColor: "#000000" }}>
                Comprar agora
              </button>
              <button onClick={handleAdicionar}
                className="w-full py-4 font-semibold rounded-xl transition hover:opacity-80"
                style={{ backgroundColor: cardBg, color: text, border: "1px solid " + border }}>
                Adicionar ao carrinho
              </button>
            </div>

            {/* BOTÃO MEDIDAS */}
            <button
              onClick={() => setDrawerAberto(true)}
              className="text-sm underline text-left transition hover:opacity-70"
              style={{ color: subtext }}>
              📏 Ver tabela de medidas
            </button>

            {/* INFO ENTREGA */}
            <div className="mt-6 rounded-xl p-4 space-y-2"
              style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
              <p className="text-sm flex items-center gap-2">
                <span>🚚</span>
                <span style={{ color: subtext }}>Entrega para todo o Brasil</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <span>🔄</span>
                <span style={{ color: subtext }}>Trocas em até 7 dias</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <span>💬</span>
                <span style={{ color: subtext }}>Dúvidas? Fale pelo WhatsApp</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {drawerAberto && (
        <div onClick={() => setDrawerAberto(false)}
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
      )}

      {/* DRAWER - TABELA COMPLETA DE MEDIDAS */}
      <div className="fixed top-0 right-0 h-full z-50 shadow-2xl overflow-y-auto transition-transform duration-300"
        style={{
          width: "420px",
          backgroundColor: drawerBg,
          transform: drawerAberto ? "translateX(0)" : "translateX(100%)",
        }}>
        <div className="p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: text }}>
              📏 Tabela de Medidas
            </h2>
            <button onClick={() => setDrawerAberto(false)}
              className="text-xl hover:opacity-60 transition" style={{ color: text }}>✕</button>
          </div>

          <p className="text-sm mb-6" style={{ color: subtext }}>
            Medidas em centímetros (cm) da peça plana.
          </p>

          {/* TABELA COMPLETA */}
          <div className="rounded-xl overflow-hidden mb-6"
            style={{ border: "1px solid " + border }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: dark ? "#374151" : "#f3f4f6" }}>
                  <th className="p-3 text-left font-semibold" style={{ color: text }}>Medida</th>
                  {["P", "M", "G", "GG"].map(t => (
                    <th key={t} className="p-3 text-center font-semibold"
                      style={{
                        color: tamanhoSelecionado === t ? "#ffffff" : text,
                        backgroundColor: tamanhoSelecionado === t ? "#000000" : "transparent",
                      }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Comprimento", key: "comprimento" },
                  { label: "Largura", key: "largura" },
                  { label: "Manga", key: "manga" },
                ].map((linha, i) => (
                  <tr key={linha.key}
                    style={{ backgroundColor: i % 2 === 0 ? (dark ? "#1f2937" : "#ffffff") : (dark ? "#111827" : "#f9fafb") }}>
                    <td className="p-3 font-medium" style={{ color: text }}>{linha.label}</td>
                    {["P", "M", "G", "GG"].map(t => (
                      <td key={t} className="p-3 text-center"
                        style={{
                          color: tamanhoSelecionado === t ? (dark ? "#60a5fa" : "#2563eb") : subtext,
                          fontWeight: tamanhoSelecionado === t ? "600" : "400",
                        }}>
                        {medidas[t][linha.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LEGENDA */}
          {tamanhoSelecionado && (
            <div className="rounded-xl p-4 mb-6"
              style={{ backgroundColor: dark ? "#1e3a5f" : "#eff6ff", border: "1px solid " + (dark ? "#3b82f6" : "#bfdbfe") }}>
              <p className="text-sm font-semibold mb-2" style={{ color: dark ? "#60a5fa" : "#2563eb" }}>
                Tamanho selecionado: {tamanhoSelecionado}
              </p>
              {Object.entries({ Comprimento: "comprimento", Largura: "largura", Manga: "manga" }).map(([label, key]) => (
                <p key={key} className="text-sm" style={{ color: text }}>
                  {label}: <strong>{medidas[tamanhoSelecionado][key]}</strong>
                </p>
              ))}
            </div>
          )}

          {/* IMAGEM GUIA */}
          <p className="text-sm font-semibold mb-3" style={{ color: text }}>Como medir:</p>
          <img
            src="https://hering.myvtex.com/api/dataentities/ET/documents/127a694a-63e5-11f0-b37f-f86067021982/image/attachments/3M9P-1ASN-T.jpg"
            alt="Guia de medidas"
            className="w-full rounded-xl mb-4"
          />

          <p className="text-xs" style={{ color: subtext }}>
            As medidas podem variar ±2 cm dependendo do processo de fabricação.
          </p>
        </div>
      </div>
    </div>
  );
}