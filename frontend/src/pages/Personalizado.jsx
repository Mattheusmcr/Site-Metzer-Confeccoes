import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

// ── CATEGORIAS PRINCIPAIS ──────────────────────────────────────────────────
const CATEGORIAS = [
  { id: "roupas",      label: "Item de Roupa",       emoji: "👕" },
  { id: "comunicacao", label: "Comunicação Visual",  emoji: "🖨️" },
];

// ── TIPOS POR CATEGORIA ────────────────────────────────────────────────────
const TIPOS_ROUPA = [
  { id: "camisa-comum", label: "Camisa Comum" },
  { id: "polo",         label: "Polo" },
  { id: "baby-look",   label: "Baby Look" },
  { id: "infantil",    label: "Infantil" },
  { id: "calcas",      label: "Calças" },
];

const TIPOS_COMUNICACAO = [
  { id: "logos-acm",          label: "Logos ACM" },
  { id: "impressoes-digitais", label: "Impressões Digitais" },
];

// ── TAMANHOS POR TIPO ──────────────────────────────────────────────────────
const TAMANHOS_ADULTO    = ["PP", "P", "M", "G", "GG", "EXG", "EXGG"];
const TAMANHOS_BABY_LOOK = ["PP", "P", "M", "G", "GG", "EXG", "EXGG"];
const TAMANHOS_INFANTIL  = ["4", "6", "8", "10", "12", "14"];
const TAMANHOS_CALCAS    = ["36", "38", "40", "42", "44", "46", "48", "50"];
const MATERIAL_CALCAS    = ["Jeans", "Brim"];

function getTamanhos(tipoId) {
  if (tipoId === "baby-look")  return TAMANHOS_BABY_LOOK;
  if (tipoId === "infantil")   return TAMANHOS_INFANTIL;
  if (tipoId === "calcas")     return TAMANHOS_CALCAS;
  return TAMANHOS_ADULTO;
}

// ── HELPERS ────────────────────────────────────────────────────────────────
function emailValido(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validarTel(v) {
  const n = v.replace(/\D/g, "");
  if (!n) return "Obrigatório";
  if (n.length < 10) return "Mínimo 10 dígitos";
  if (n.length > 11) return "Máximo 11 dígitos";
  return "";
}

const FORM_INICIAL = {
  categoria: "",        // "roupas" | "comunicacao"
  // Roupas
  tiposRoupa: [],       // ids dos tipos selecionados
  quantidades: {},      // { "camisa-comum": { P: 2, M: 3 }, ... }
  materialCalca: "",    // "Jeans" | "Brim"
  // Comunicação visual
  tipoComunicacao: "",  // id do tipo
  dimensoes: "",        // tamanho/dimensões do logo
  // Comuns
  descricao: "",
  fotos: [],
  // Finalização
  nomeCliente: "", telefone: "", email: "",
  cep: "", cidade: "", estado: "",
  observacoes: "",
};

export default function Personalizado() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1 = detalhes, 2 = finalizar
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [modalTamanhos, setModalTamanhos] = useState(null); // tipoId aberto

  // ── styles ──
  const inputStyle = {
    width: "100%", padding: "12px 14px", outline: "none",
    border: "1px solid " + t.border, backgroundColor: t.bgCard,
    color: t.text, fontSize: "14px", boxSizing: "border-box", fontFamily: "system-ui",
  };
  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: "600", color: t.textSecundario,
    marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "system-ui",
  };
  const btnPrimary = (ativo) => ({
    padding: "14px", fontWeight: "700", fontSize: "14px", fontFamily: "system-ui",
    cursor: ativo ? "pointer" : "not-allowed", border: "none",
    backgroundColor: ativo ? t.btnPrimarioBg : t.border,
    color: ativo ? t.btnPrimarioText : t.textSecundario,
  });

  // ── quantidade por tamanho ──
  function setQtd(tipoId, tamanho, valor) {
    const num = Math.max(0, parseInt(valor) || 0);
    setForm(prev => ({
      ...prev,
      quantidades: {
        ...prev.quantidades,
        [tipoId]: { ...(prev.quantidades[tipoId] || {}), [tamanho]: num },
      },
    }));
  }
  function totalTipo(tipoId) {
    return Object.values(form.quantidades[tipoId] || {}).reduce((a, b) => a + b, 0);
  }

  function toggleTipoRoupa(id) {
    setForm(prev => {
      const existe = prev.tiposRoupa.includes(id);
      const novosTipos = existe ? prev.tiposRoupa.filter(t => t !== id) : [...prev.tiposRoupa, id];
      const novasQtds = existe
        ? Object.fromEntries(Object.entries(prev.quantidades).filter(([k]) => k !== id))
        : prev.quantidades;
      return { ...prev, tiposRoupa: novosTipos, quantidades: novasQtds,
               materialCalca: novosTipos.includes("calcas") ? prev.materialCalca : "" };
    });
  }

  // ── validações ──
  const etapa1Valida = (() => {
    if (!form.categoria) return false;
    if (form.categoria === "roupas") return form.tiposRoupa.length > 0;
    if (form.categoria === "comunicacao") return !!form.tipoComunicacao;
    return false;
  })();

  const finalizacaoValida = (
    form.nomeCliente.trim() &&
    !validarTel(form.telefone) &&
    emailValido(form.email)
  );

  // ── salvar ──
  async function salvarNoBanco() {
    setSalvando(true); setErro("");
    try {
      let resumo = "";
      if (form.categoria === "roupas") {
        resumo = form.tiposRoupa.map(id => {
          const tipo = TIPOS_ROUPA.find(t => t.id === id);
          const qtds = form.quantidades[id] || {};
          const det = Object.entries(qtds).filter(([, v]) => v > 0).map(([t, v]) => `${t}:${v}`).join(" ");
          const mat = id === "calcas" && form.materialCalca ? ` [${form.materialCalca}]` : "";
          return `${tipo.label}${mat}${det ? " (" + det + ")" : ""}`;
        }).join(" | ");
      } else {
        const tipo = TIPOS_COMUNICACAO.find(t => t.id === form.tipoComunicacao);
        resumo = `${tipo?.label}${form.dimensoes ? " — " + form.dimensoes : ""}`;
      }

      await api.post("pedidos-personalizados/", {
        nome_empresa:  form.nomeCliente,
        slogan:        form.categoria === "comunicacao" ? form.dimensoes : "",
        ramo:          resumo,
        quantidade:    form.categoria === "roupas" ? form.tiposRoupa.length : 1,
        estilo:        form.categoria,
        paleta:        form.materialCalca,
        aplicacoes:    form.categoria === "roupas" ? form.tiposRoupa : [form.tipoComunicacao],
        referencia:    form.descricao,
        observacoes:   form.observacoes,
        nome_cliente:  form.nomeCliente,
        telefone:      form.telefone,
        email:         form.email,
      });
      setEnviado(true);
    } catch (e) {
      setErro("Erro ao salvar. Tente novamente ou use o WhatsApp.");
    } finally { setSalvando(false); }
  }

  function enviarWhatsApp() {
    let resumo = "";
    if (form.categoria === "roupas") {
      resumo = form.tiposRoupa.map(id => {
        const tipo = TIPOS_ROUPA.find(t => t.id === id);
        const qtds = form.quantidades[id] || {};
        const det = Object.entries(qtds).filter(([, v]) => v > 0).map(([t, v]) => `${t}: ${v}`).join(", ");
        const mat = id === "calcas" && form.materialCalca ? ` [Material: ${form.materialCalca}]` : "";
        return `${tipo.label}${mat}${det ? " — " + det : ""}`;
      }).join("\n");
    } else {
      const tipo = TIPOS_COMUNICACAO.find(t => t.id === form.tipoComunicacao);
      resumo = `${tipo?.label}${form.dimensoes ? "\nDimensões: " + form.dimensoes : ""}`;
    }

    const msg = `
🎨 *PEDIDO PERSONALIZADO — METZKER*

📦 *Categoria:* ${form.categoria === "roupas" ? "Item de Roupa" : "Comunicação Visual"}

📋 *Detalhes:*
${resumo}

📝 *Descrição:* ${form.descricao || "Não informado"}
📝 *Observações:* ${form.observacoes || "Nenhuma"}

👤 *Contato:* ${form.nomeCliente}
📱 ${form.telefone}
📧 ${form.email}
    `.trim();

    window.open(`https://wa.me/5527997878391?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function finalizarComWhatsApp() {
    await salvarNoBanco();
    enviarWhatsApp();
  }

  // ── SUCESSO ──
  if (enviado) return (
    <div style={{ backgroundColor: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center px-6" style={{ maxWidth: "480px" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
        <h2 style={{ fontSize: "2rem", fontWeight: "300", color: t.text, marginBottom: "16px", fontFamily: "Georgia, serif" }}>Pedido recebido!</h2>
        <p style={{ color: t.textSecundario, lineHeight: 1.8, marginBottom: "32px", fontFamily: "system-ui" }}>
          Seu pedido foi registrado. Nossa equipe entrará em contato em breve.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => navigate("/")} style={{ padding: "12px 24px", border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg, cursor: "pointer", fontFamily: "system-ui" }}>
            Voltar ao início
          </button>
          <button onClick={() => { setEnviado(false); setEtapa(1); setForm(FORM_INICIAL); }}
            style={{ padding: "12px 24px", backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, border: "none", cursor: "pointer", fontFamily: "system-ui" }}>
            Novo pedido
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 20px" }}>

        {/* HEADER */}
        <div className="text-center" style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.25em", color: t.textSecundario, marginBottom: "8px", fontFamily: "system-ui" }}>
            Comunicação Visual
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: "300", color: t.text, fontFamily: "Georgia, serif" }}>
            Faça o Seu <em style={{ fontStyle: "italic" }}>Personalizado</em>
          </h1>
          <p style={{ color: t.textSecundario, marginTop: "12px", fontFamily: "system-ui", lineHeight: 1.7 }}>
            Crie sua logo ou identidade visual do zero com a gente.
          </p>
        </div>

        {/* PROGRESSO */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            {["Detalhes do pedido", "Finalizar pedido"].map((label, i) => (
              <span key={i} style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "system-ui",
                color: etapa > i ? t.text : t.textSecundario, fontWeight: etapa === i + 1 ? "700" : "400" }}>{label}</span>
            ))}
          </div>
          <div style={{ height: "2px", backgroundColor: t.border }}>
            <div style={{ height: "100%", width: etapa === 1 ? "50%" : "100%", backgroundColor: t.text, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* ══ ETAPA 1 — DETALHES ══ */}
        {etapa === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif" }}>
              Detalhes do Pedido
            </h2>

            {/* ESCOLHA DA CATEGORIA */}
            <div>
              <label style={labelStyle}>O que você precisa? *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {CATEGORIAS.map(cat => (
                  <button key={cat.id} onClick={() => setForm(prev => ({ ...prev, categoria: cat.id, tiposRoupa: [], quantidades: {}, tipoComunicacao: "", dimensoes: "", materialCalca: "" }))}
                    style={{
                      padding: "20px 16px", cursor: "pointer", textAlign: "center", fontFamily: "system-ui",
                      border: "2px solid " + (form.categoria === cat.id ? t.text : t.border),
                      backgroundColor: form.categoria === cat.id ? t.text : t.bgCard,
                      color: form.categoria === cat.id ? t.btnPrimarioText : t.text,
                    }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{cat.emoji}</div>
                    <div style={{ fontWeight: "600", fontSize: "13px" }}>{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ══ CAMPOS DE ROUPA ══ */}
            {form.categoria === "roupas" && (
              <>
                {/* Tipos de roupa */}
                <div>
                  <label style={labelStyle}>Tipos de produto * (selecione um ou mais)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {TIPOS_ROUPA.map(tipo => {
                      const sel = form.tiposRoupa.includes(tipo.id);
                      const total = totalTipo(tipo.id);
                      const qtds = form.quantidades[tipo.id] || {};
                      const tamSel = Object.entries(qtds).filter(([, v]) => v > 0);
                      return (
                        <div key={tipo.id}>
                          <button onClick={() => toggleTipoRoupa(tipo.id)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              width: "100%", padding: "14px 16px", cursor: "pointer", textAlign: "left",
                              fontFamily: "system-ui", fontSize: "14px",
                              border: "2px solid " + (sel ? t.text : t.border),
                              backgroundColor: sel ? t.bgSecundario : t.bgCard, color: t.text,
                            }}>
                            <span style={{ fontWeight: sel ? "600" : "400" }}>{tipo.label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {sel && total > 0 && (
                                <span style={{ fontSize: "12px", color: t.textSecundario }}>{total} un</span>
                              )}
                              <span style={{ fontSize: "18px", color: sel ? t.text : t.border }}>{sel ? "✓" : "+"}</span>
                            </div>
                          </button>

                          {/* Botão tamanhos + resumo */}
                          {sel && (
                            <div style={{ padding: "10px 16px", backgroundColor: t.bgSecundario, border: "1px solid " + t.border, borderTop: "none" }}>

                              {/* Material — só para calças */}
                              {tipo.id === "calcas" && (
                                <div style={{ marginBottom: "12px" }}>
                                  <label style={{ ...labelStyle, marginBottom: "8px" }}>Material da calça *</label>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    {MATERIAL_CALCAS.map(mat => (
                                      <button key={mat} onClick={() => setForm(prev => ({ ...prev, materialCalca: mat }))}
                                        style={{
                                          padding: "8px 20px", cursor: "pointer", fontFamily: "system-ui", fontSize: "13px",
                                          border: "2px solid " + (form.materialCalca === mat ? t.text : t.border),
                                          backgroundColor: form.materialCalca === mat ? t.text : t.bgCard,
                                          color: form.materialCalca === mat ? t.btnPrimarioText : t.text,
                                        }}>
                                        {mat}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <button onClick={() => setModalTamanhos(tipo.id)}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: "8px",
                                  padding: "8px 14px", border: "1px solid " + t.borderForte,
                                  backgroundColor: t.bgCard, color: t.text, cursor: "pointer",
                                  fontSize: "12px", fontFamily: "system-ui",
                                }}>
                                📐 {tamSel.length > 0 ? "Editar tamanhos" : "Selecionar tamanhos e quantidades"}
                              </button>

                              {tamSel.length > 0 && (
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                                  {tamSel.map(([tam, qtd]) => (
                                    <span key={tam} style={{ fontSize: "11px", padding: "3px 8px", backgroundColor: t.bgCard, border: "1px solid " + t.border, fontFamily: "system-ui" }}>
                                      {tam}: {qtd}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ══ CAMPOS DE COMUNICAÇÃO VISUAL ══ */}
            {form.categoria === "comunicacao" && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de serviço *</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {TIPOS_COMUNICACAO.map(tipo => (
                      <button key={tipo.id} onClick={() => setForm(prev => ({ ...prev, tipoComunicacao: tipo.id }))}
                        style={{
                          display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
                          cursor: "pointer", textAlign: "left", fontFamily: "system-ui", fontSize: "14px",
                          border: "2px solid " + (form.tipoComunicacao === tipo.id ? t.text : t.border),
                          backgroundColor: form.tipoComunicacao === tipo.id ? t.bgSecundario : t.bgCard,
                          color: t.text, fontWeight: form.tipoComunicacao === tipo.id ? "600" : "400",
                        }}>
                        {form.tipoComunicacao === tipo.id ? "✓" : "○"} {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensões — só aparece quando tipo escolhido */}
                {form.tipoComunicacao && (
                  <div>
                    <label style={labelStyle}>Dimensões / Tamanho *</label>
                    <input value={form.dimensoes}
                      onChange={e => setForm(prev => ({ ...prev, dimensoes: e.target.value }))}
                      placeholder={form.tipoComunicacao === "logos-acm" ? "Ex: 1,2m x 0,8m ou A4, A3..." : "Ex: 50cm x 30cm, A4, Bandeira..."}
                      style={inputStyle} />
                    <p style={{ fontSize: "11px", color: t.textSecundario, marginTop: "4px", fontFamily: "system-ui" }}>
                      Informe as dimensões desejadas ou o formato (A4, A3, banner, etc.)
                    </p>
                  </div>
                )}
              </>
            )}

            {/* DESCRIÇÃO — aparece sempre que categoria escolhida */}
            {form.categoria && (
              <>
                <div>
                  <label style={labelStyle}>
                    {form.categoria === "roupas" ? "Descrição do pedido (estampa, cores, modelo...)" : "Descrição do projeto (o que você precisa?)"}
                  </label>
                  <textarea value={form.descricao}
                    onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={4}
                    placeholder={form.categoria === "roupas"
                      ? "Descreva a estampa, cores preferidas, estilo do modelo..."
                      : "Descreva o logo, cores da empresa, estilo desejado, referências..."}
                    style={{ ...inputStyle, resize: "none" }} />
                </div>

                {/* Upload */}
                <div>
                  <label style={labelStyle}>
                    {form.categoria === "roupas" ? "Artes e estampas (opcional — até 5 imagens)" : "Arquivos de referência (logo, imagens, exemplos — até 5)"}
                  </label>
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "28px", cursor: "pointer",
                    border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard,
                  }}>
                    <span style={{ fontSize: "28px", marginBottom: "8px" }}>📎</span>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: t.text, fontFamily: "system-ui" }}>
                      Clique para selecionar arquivos
                    </span>
                    <span style={{ fontSize: "11px", color: t.textSecundario, marginTop: "4px", fontFamily: "system-ui" }}>
                      PNG, JPG, PDF — até 5 arquivos
                    </span>
                    <input type="file" multiple accept="image/*,.pdf" style={{ display: "none" }}
                      onChange={e => {
                        const files = Array.from(e.target.files).slice(0, 5);
                        setForm(prev => ({ ...prev, fotos: files.map(f => ({ file: f, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null, name: f.name })) }));
                      }} />
                  </label>
                  {form.fotos.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                      {form.fotos.map((foto, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          {foto.url
                            ? <img src={foto.url} alt="" style={{ width: "72px", height: "72px", objectFit: "cover", border: "1px solid " + t.border }} />
                            : <div style={{ width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bgSecundario, border: "1px solid " + t.border, fontSize: "11px", color: t.textSecundario, textAlign: "center", padding: "4px" }}>📄 {foto.name.split(".").pop().toUpperCase()}</div>
                          }
                          <button onClick={() => setForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, j) => j !== i) }))}
                            style={{ position: "absolute", top: "-5px", right: "-5px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#ef4444", color: "white", border: "none", cursor: "pointer", fontSize: "10px" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.fotos.length > 0 && (
                    <p style={{ fontSize: "11px", color: t.textSecundario, marginTop: "6px", fontFamily: "system-ui" }}>
                      💡 Envie os arquivos pelo WhatsApp após finalizar o pedido.
                    </p>
                  )}
                </div>
              </>
            )}

            <button onClick={() => { if (etapa1Valida) setEtapa(2); }}
              disabled={!etapa1Valida} style={{ ...btnPrimary(etapa1Valida), width: "100%" }}>
              Próximo →
            </button>
          </div>
        )}

        {/* ══ ETAPA 2 — FINALIZAR ══ */}
        {etapa === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif" }}>
              Finalizar Pedido
            </h2>

            {/* REVISÃO */}
            <div style={{ border: "1px solid " + t.border, padding: "20px", backgroundColor: t.bgCard }}>
              <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: t.textSecundario, fontFamily: "system-ui", marginBottom: "14px" }}>
                Resumo do pedido
              </p>

              <div style={{ padding: "8px 0", borderBottom: "1px solid " + t.border }}>
                <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase" }}>Categoria</span>
                <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui", marginTop: "4px" }}>
                  {form.categoria === "roupas" ? "👕 Item de Roupa" : "🖨️ Comunicação Visual"}
                </p>
              </div>

              {/* Resumo roupas */}
              {form.categoria === "roupas" && form.tiposRoupa.map(id => {
                const tipo = TIPOS_ROUPA.find(t => t.id === id);
                const qtds = form.quantidades[id] || {};
                const tamSel = Object.entries(qtds).filter(([, v]) => v > 0);
                const total = tamSel.reduce((a, [, v]) => a + v, 0);
                return (
                  <div key={id} style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui" }}>{tipo.label}</span>
                      {total > 0 && <span style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui" }}>{total} un</span>}
                    </div>
                    {id === "calcas" && form.materialCalca && (
                      <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui", marginTop: "2px" }}>Material: {form.materialCalca}</p>
                    )}
                    {tamSel.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                        {tamSel.map(([tam, qtd]) => (
                          <span key={tam} style={{ fontSize: "11px", padding: "2px 8px", backgroundColor: t.bgSecundario, border: "1px solid " + t.border, fontFamily: "system-ui" }}>
                            {tam}: {qtd}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Resumo comunicação */}
              {form.categoria === "comunicacao" && (
                <>
                  <div style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                    <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase" }}>Serviço</span>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui", marginTop: "4px" }}>
                      {TIPOS_COMUNICACAO.find(t => t.id === form.tipoComunicacao)?.label}
                    </p>
                  </div>
                  {form.dimensoes && (
                    <div style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                      <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase" }}>Dimensões</span>
                      <p style={{ fontSize: "13px", color: t.text, fontFamily: "system-ui", marginTop: "4px" }}>{form.dimensoes}</p>
                    </div>
                  )}
                </>
              )}

              {form.descricao && (
                <div style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase" }}>Descrição</span>
                  <p style={{ fontSize: "13px", color: t.text, fontFamily: "system-ui", marginTop: "4px" }}>{form.descricao}</p>
                </div>
              )}

              {form.fotos.length > 0 && (
                <div style={{ paddingTop: "10px" }}>
                  <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase" }}>
                    Arquivos ({form.fotos.length})
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {form.fotos.map((foto, i) => (
                      foto.url
                        ? <img key={i} src={foto.url} alt="" style={{ width: "56px", height: "56px", objectFit: "cover", border: "1px solid " + t.border }} />
                        : <div key={i} style={{ width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bgSecundario, border: "1px solid " + t.border, fontSize: "10px", color: t.textSecundario }}>📄</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DADOS DE CONTATO */}
            <div style={{ borderTop: "2px solid " + t.borderForte, paddingTop: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui", marginBottom: "16px" }}>
                Seus dados para contato *
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Nome completo *</label>
                  <input value={form.nomeCliente} onChange={e => setForm(prev => ({ ...prev, nomeCliente: e.target.value }))}
                    placeholder="Ex: João Silva" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Telefone / WhatsApp *</label>
                  <input value={form.telefone}
                    onChange={e => setForm(prev => ({ ...prev, telefone: e.target.value.replace(/[^0-9()\-\s+]/g, "") }))}
                    placeholder="(27) 99999-9999" maxLength={15} inputMode="tel"
                    style={{ ...inputStyle, borderColor: form.telefone && validarTel(form.telefone) ? "#ef4444" : t.border }} />
                  {form.telefone && validarTel(form.telefone) && (
                    <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", fontFamily: "system-ui" }}>⚠️ {validarTel(form.telefone)}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>E-mail *</label>
                  <input value={form.email} type="email"
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Ex: joao@email.com"
                    style={{ ...inputStyle, borderColor: form.email && !emailValido(form.email) ? "#ef4444" : t.border }} />
                  {form.email && !emailValido(form.email) && (
                    <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", fontFamily: "system-ui" }}>⚠️ E-mail inválido</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Observações finais (opcional)</label>
                  <textarea value={form.observacoes} onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={3} placeholder="Alguma informação extra..." style={{ ...inputStyle, resize: "none" }} />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: t.bgSecundario, border: "1px solid " + t.border, padding: "14px" }}>
              <p style={{ fontSize: "13px", color: t.textSecundario, lineHeight: 1.7, fontFamily: "system-ui" }}>
                ℹ️ <strong style={{ color: t.text }}>Finalizar pelo site</strong> registra o pedido no painel.
                <strong style={{ color: t.text }}> Enviar pelo WhatsApp</strong> salva e abre o WhatsApp com tudo preenchido.
                {form.fotos.length > 0 && " Envie os arquivos na conversa do WhatsApp."}
              </p>
            </div>

            {erro && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", color: "#dc2626", fontSize: "13px", fontFamily: "system-ui" }}>
                ⚠️ {erro}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEtapa(1)} style={{ flex: 1, padding: "14px", border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg, cursor: "pointer", fontFamily: "system-ui", fontWeight: "600" }}>
                ← Voltar
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={salvarNoBanco} disabled={salvando || !finalizacaoValida}
                style={{ ...btnPrimary(!salvando && finalizacaoValida), width: "100%", padding: "16px" }}>
                {salvando ? "Salvando..." : "✅ Finalizar pedido pelo site"}
              </button>
              <button onClick={finalizarComWhatsApp} disabled={salvando || !finalizacaoValida}
                style={{ width: "100%", padding: "16px", fontWeight: "600", fontSize: "14px", fontFamily: "system-ui",
                  cursor: salvando || !finalizacaoValida ? "not-allowed" : "pointer",
                  backgroundColor: salvando || !finalizacaoValida ? "#86efac" : "#22c55e",
                  color: "white", border: "none" }}>
                💬 Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL TAMANHOS ══ */}
      {modalTamanhos && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setModalTamanhos(null); }}>
          <div style={{ backgroundColor: t.bgCard, width: "100%", maxWidth: "480px", maxHeight: "80vh", overflowY: "auto", borderTop: "2px solid " + t.borderForte }}>
            {(() => {
              const tipo = TIPOS_ROUPA.find(t => t.id === modalTamanhos);
              const tamanhos = getTamanhos(modalTamanhos);
              const qtds = form.quantidades[modalTamanhos] || {};
              const total = Object.values(qtds).reduce((a, b) => a + b, 0);
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif" }}>{tipo?.label}</h3>
                      <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui", marginTop: "2px" }}>
                        Total: {total} unidade{total !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button onClick={() => setModalTamanhos(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: t.text }}>✕</button>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui", marginBottom: "16px" }}>
                      Informe a quantidade por tamanho:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      {tamanhos.map(tam => (
                        <div key={tam} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid " + t.border, backgroundColor: (qtds[tam] || 0) > 0 ? t.bgSecundario : t.bgCard }}>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: t.text, fontFamily: "system-ui", minWidth: "36px" }}>{tam}</span>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <button onClick={() => setQtd(modalTamanhos, tam, (qtds[tam] || 0) - 1)}
                              style={{ width: "28px", height: "28px", border: "1px solid " + t.border, backgroundColor: t.bg, color: t.text, cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <span style={{ width: "36px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: t.text, fontFamily: "system-ui", borderTop: "1px solid " + t.border, borderBottom: "1px solid " + t.border, padding: "4px 0", lineHeight: "20px" }}>
                              {qtds[tam] || 0}
                            </span>
                            <button onClick={() => setQtd(modalTamanhos, tam, (qtds[tam] || 0) + 1)}
                              style={{ width: "28px", height: "28px", border: "1px solid " + t.border, backgroundColor: t.bg, color: t.text, cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "12px 16px 20px", borderTop: "1px solid " + t.border }}>
                    <button onClick={() => setModalTamanhos(null)}
                      style={{ width: "100%", padding: "14px", backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, border: "none", cursor: "pointer", fontWeight: "700", fontFamily: "system-ui", fontSize: "14px" }}>
                      Confirmar tamanhos
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}