import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

const CATEGORIAS = [
  { id: "roupas",      label: "Item de Roupa",      emoji: "👕" },
  { id: "comunicacao", label: "Comunicação Visual", emoji: "🖨️" },
];

// Tipos de roupa — apenas 3
const TIPOS_ROUPA = [
  { id: "camisa-comum", label: "Camisa Comum", temCor: true, temMaterial: true },
  { id: "polo",         label: "Polo",         temCor: true, temMaterial: true },
  { id: "calcas",       label: "Calças",        temCor: true,  temMaterial: false }, // material próprio (jeans/brim)
];

const TIPOS_COMUNICACAO = [
  { id: "logos-acm",           label: "Logos ACM" },
  { id: "impressoes-digitais", label: "Impressões Digitais" },
];

// Grupos de tamanho para camisa/polo
const GRUPOS_TAMANHO = [
  { id: "adulto",   label: "Adulto",   tamanhos: ["PP", "P", "M", "G", "GG", "EXG", "EXGG"] },
  { id: "baby",     label: "Baby Look", tamanhos: ["PP", "P", "M", "G", "GG", "EXG", "EXGG"] },
  { id: "infantil", label: "Infantil",  tamanhos: ["4", "6", "8", "10", "12", "14"] },
];

const TAMANHOS_CALCAS = ["36", "38", "40", "42", "44", "46", "48", "50"];
const MATERIAL_CALCAS = ["Jeans", "Brim"];

const CORES_OPCOES = [
  { id: "branco",        label: "Branco",            hex: "#FFFFFF" },
  { id: "preto",         label: "Preto",             hex: "#1a1a1a" },
  { id: "cinza",         label: "Cinza",             hex: "#9ca3af" },
  { id: "azul-marinho",  label: "Azul Marinho",      hex: "#1e3a8a" },
  { id: "azul-royal",    label: "Azul Royal",        hex: "#2563eb" },
  { id: "vermelho",      label: "Vermelho",          hex: "#dc2626" },
  { id: "verde",         label: "Verde",             hex: "#16a34a" },
  { id: "amarelo",       label: "Amarelo",           hex: "#ca8a04" },
  { id: "laranja",       label: "Laranja",           hex: "#ea580c" },
  { id: "rosa",          label: "Rosa",              hex: "#db2777" },
  { id: "roxo",          label: "Roxo",              hex: "#7c3aed" },
  { id: "bege",          label: "Bege",              hex: "#d4b896" },
  { id: "personalizada", label: "Outra / Me consulte", hex: null },
];

const MATERIAIS_OPCOES = [
  { id: "pv",      label: "PV",           descricao: "Mistura de poliéster e viscose, caimento elegante" },
  { id: "algodao", label: "100% Algodão", descricao: "Macio, respirável, ideal para o dia a dia" },
  { id: "dry-fit", label: "Dry Fit",      descricao: "Alta performance, absorve suor" },
  { id: "outro",   label: "Outro — nos indique", descricao: "Descreva o material na descrição do pedido" },
];

// ── helpers ──
function emailValido(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validarTel(v) {
  const n = v.replace(/\D/g, "");
  if (!n) return "Obrigatório";
  if (n.length < 10) return "Mínimo 10 dígitos";
  if (n.length > 11) return "Máximo 11 dígitos";
  return "";
}
function formatTel(v) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return `(${n.slice(0,2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
}
function formatCEP(v) {
  const n = v.replace(/\D/g, "").slice(0, 8);
  return n.length > 5 ? `${n.slice(0,5)}-${n.slice(5)}` : n;
}
async function buscarCEP(cep, setForm) {
  const n = cep.replace(/\D/g, "");
  if (n.length !== 8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${n}/json/`);
    const data = await res.json();
    if (!data.erro) {
      setForm(prev => ({
        ...prev,
        cidade: data.localidade || prev.cidade,
        estado: data.uf         || prev.estado,
        rua:    data.logradouro || prev.rua,
        bairro: data.bairro     || prev.bairro,
      }));
    }
  } catch {}
}

const FORM_INICIAL = {
  categoria: "",
  // roupas
  tiposRoupa: [],
  // quantidades por tipo+grupo+tamanho: { "camisa-comum": { adulto: { P: 2 }, baby: { M: 1 } } }
  quantidades: {},
  cores: {},        // { "camisa-comum": ["preto", "branco"] }
  materiais: {},    // { "camisa-comum": "pv" }
  materialCalca: "",
  // comunicação
  tipoComunicacao: "",
  dimensoes: "",
  // comuns
  descricao: "",
  fotos: [],
  // finalização
  nomeCliente: "", telefone: "", email: "",
  cep: "", cidade: "", estado: "", rua: "", numero: "", bairro: "", complemento: "",
  observacoes: "",
};

export default function Personalizado() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [modalTamanhos, setModalTamanhos] = useState(null); // tipoId
  const [modalCores, setModalCores] = useState(null);       // tipoId
  const [modalMaterial, setModalMaterial] = useState(null); // tipoId

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

  // ── quantidade helpers ──
  function setQtd(tipoId, grupoId, tamanho, valor) {
    const num = Math.max(0, parseInt(valor) || 0);
    setForm(prev => ({
      ...prev,
      quantidades: {
        ...prev.quantidades,
        [tipoId]: {
          ...(prev.quantidades[tipoId] || {}),
          [grupoId]: { ...(prev.quantidades[tipoId]?.[grupoId] || {}), [tamanho]: num },
        },
      },
    }));
  }
  function totalTipoGrupo(tipoId, grupoId) {
    return Object.values(form.quantidades[tipoId]?.[grupoId] || {}).reduce((a, b) => a + b, 0);
  }
  function totalTipo(tipoId) {
    return Object.values(form.quantidades[tipoId] || {}).reduce((acc, grp) =>
      acc + Object.values(grp).reduce((a, b) => a + b, 0), 0);
  }

  function toggleTipoRoupa(id) {
    setForm(prev => {
      const existe = prev.tiposRoupa.includes(id);
      return {
        ...prev,
        tiposRoupa: existe ? prev.tiposRoupa.filter(t => t !== id) : [...prev.tiposRoupa, id],
        quantidades: existe ? Object.fromEntries(Object.entries(prev.quantidades).filter(([k]) => k !== id)) : prev.quantidades,
        cores: existe ? Object.fromEntries(Object.entries(prev.cores).filter(([k]) => k !== id)) : prev.cores,
        materiais: existe ? Object.fromEntries(Object.entries(prev.materiais).filter(([k]) => k !== id)) : prev.materiais,
        materialCalca: id === "calcas" && existe ? "" : prev.materialCalca,
      };
    });
  }

  function toggleCor(tipoId, corId) {
    setForm(prev => {
      const atual = prev.cores[tipoId] || [];
      return {
        ...prev,
        cores: {
          ...prev.cores,
          [tipoId]: atual.includes(corId) ? atual.filter(c => c !== corId) : [...atual, corId],
        },
      };
    });
  }

  function setMaterial(tipoId, matId) {
    setForm(prev => ({ ...prev, materiais: { ...prev.materiais, [tipoId]: matId } }));
    setModalMaterial(null);
  }

  // ── validações ──
  // Total geral de unidades em roupas
  const totalUnidadesGeral = form.tiposRoupa.reduce((acc, id) => acc + totalTipo(id), 0);

  const etapa1Valida = (() => {
    if (!form.categoria) return false;
    if (form.categoria === "roupas") {
      if (form.tiposRoupa.length === 0) return false;
      for (const id of form.tiposRoupa) {
        const total = totalTipo(id);
        if (total === 0) return false;
        if (id === "calcas" && !form.materialCalca) return false;
        // Cor obrigatória para todos os tipos
        if ((form.cores[id] || []).length === 0) return false;
        // Material obrigatório para camisa e polo
        if ((id === "camisa-comum" || id === "polo") && !form.materiais[id]) return false;
      }
      // Mínimo de 20 unidades no total
      if (totalUnidadesGeral < 20) return false;
      return true;
    }
    if (form.categoria === "comunicacao") return !!form.tipoComunicacao && !!form.dimensoes.trim();
    return false;
  })();

  const finalizacaoValida = Boolean(
    form.nomeCliente.trim() &&
    !validarTel(form.telefone) &&
    form.email.trim() && emailValido(form.email) &&
    form.cep && form.cep.replace(/\D/g, "").length === 8 &&
    form.cidade.trim() && form.estado.trim() &&
    (form.rua || "").trim() && (form.numero || "").trim() && (form.bairro || "").trim()
  );

  // ── salvar ──
  async function salvarNoBanco() {
    setSalvando(true); setErro("");
    try {
      let resumo = "";
      if (form.categoria === "roupas") {
        resumo = form.tiposRoupa.map(id => {
          const tipo = TIPOS_ROUPA.find(t => t.id === id);
          if (id === "calcas") {
            const qtds = Object.entries(form.quantidades[id]?.calcas || {}).filter(([,v]) => v > 0).map(([t,v]) => `${t}:${v}`).join(" ");
            return `${tipo.label} [${form.materialCalca}]${qtds ? " (" + qtds + ")" : ""}`;
          }
          const cores = (form.cores[id] || []).map(c => CORES_OPCOES.find(x => x.id === c)?.label).join(", ");
          const mat = MATERIAIS_OPCOES.find(m => m.id === form.materiais[id])?.label || "";
          return `${tipo.label}${mat ? " [" + mat + "]" : ""}${cores ? " [" + cores + "]" : ""}`;
        }).join(" | ");
      } else {
        const tipo = TIPOS_COMUNICACAO.find(t => t.id === form.tipoComunicacao);
        resumo = `${tipo?.label} — ${form.dimensoes}`;
      }
      await api.post("pedidos-personalizados/", {
        nome_empresa: form.nomeCliente, slogan: form.dimensoes || "",
        ramo: resumo, quantidade: form.tiposRoupa.length || 1,
        estilo: form.categoria, paleta: form.materialCalca,
        aplicacoes: form.categoria === "roupas" ? form.tiposRoupa : [form.tipoComunicacao],
        referencia: form.descricao, observacoes: form.observacoes,
        nome_cliente: form.nomeCliente, telefone: form.telefone, email: form.email,
      });
      setEnviado(true);
    } catch { setErro("Erro ao salvar. Tente novamente ou use o WhatsApp."); }
    finally { setSalvando(false); }
  }

  function montarMsgWpp() {
    let detalhes = "";
    if (form.categoria === "roupas") {
      detalhes = form.tiposRoupa.map(id => {
        const tipo = TIPOS_ROUPA.find(t => t.id === id);
        if (id === "calcas") {
          const qtds = Object.entries(form.quantidades[id]?.calcas || {}).filter(([,v]) => v > 0).map(([t,v]) => `${t}: ${v}`).join(", ");
          return `*${tipo.label}* [Material: ${form.materialCalca}]${qtds ? "\n  Tamanhos: " + qtds : ""}`;
        }
        const grupos = GRUPOS_TAMANHO.map(g => {
          const qtds = Object.entries(form.quantidades[id]?.[g.id] || {}).filter(([,v]) => v > 0).map(([t,v]) => `${t}: ${v}`).join(", ");
          return qtds ? `  ${g.label}: ${qtds}` : "";
        }).filter(Boolean).join("\n");
        const cores = (form.cores[id] || []).map(c => CORES_OPCOES.find(x => x.id === c)?.label).join(", ");
        const mat = MATERIAIS_OPCOES.find(m => m.id === form.materiais[id])?.label || "";
        return `*${tipo.label}*${mat ? " [" + mat + "]" : ""}${cores ? "\n  Cores: " + cores : ""}${grupos ? "\n" + grupos : ""}`;
      }).join("\n\n");
    } else {
      const tipo = TIPOS_COMUNICACAO.find(t => t.id === form.tipoComunicacao);
      detalhes = `*${tipo?.label}*\nDimensões: ${form.dimensoes}`;
    }
    const msg = `🎨 *PEDIDO PERSONALIZADO — METZKER*\n\n📦 *Categoria:* ${form.categoria === "roupas" ? "Item de Roupa" : "Comunicação Visual"}\n\n📋 *Detalhes:*\n${detalhes}\n\n📝 *Descrição:* ${form.descricao || "—"}\n📝 *Obs:* ${form.observacoes || "—"}\n\n👤 ${form.nomeCliente}\n📱 ${form.telefone}\n📧 ${form.email}\n📍 ${form.rua}, ${form.numero}${form.complemento ? " — " + form.complemento : ""}\n   ${form.bairro} — ${form.cidade}/${form.estado} — CEP: ${form.cep}`;
    return encodeURIComponent(msg);
  }

  async function finalizarComWhatsApp() {
    await salvarNoBanco();
    window.open(`https://wa.me/5527997878391?text=${montarMsgWpp()}`, "_blank");
  }

  if (enviado) return (
    <div style={{ backgroundColor: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center px-6" style={{ maxWidth: "480px" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
        <h2 style={{ fontSize: "2rem", fontWeight: "300", color: t.text, marginBottom: "16px", fontFamily: "Georgia, serif" }}>Pedido recebido!</h2>
        <p style={{ color: t.textSecundario, lineHeight: 1.8, marginBottom: "32px", fontFamily: "system-ui" }}>
          Seu pedido foi registrado. Nossa equipe entrará em contato em breve.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => navigate("/")} style={{ padding: "12px 24px", border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg, cursor: "pointer", fontFamily: "system-ui" }}>Voltar ao início</button>
          <button onClick={() => { setEnviado(false); setEtapa(1); setForm(FORM_INICIAL); }} style={{ padding: "12px 24px", backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, border: "none", cursor: "pointer", fontFamily: "system-ui" }}>Novo pedido</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 20px" }}>

        {/* HEADER */}
        <div className="text-center" style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.25em", color: t.textSecundario, marginBottom: "8px", fontFamily: "system-ui" }}>Comunicação Visual</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: "300", color: t.text, fontFamily: "Georgia, serif" }}>
            Faça o Seu <em style={{ fontStyle: "italic" }}>Personalizado</em>
          </h1>
          <p style={{ color: t.textSecundario, marginTop: "12px", fontFamily: "system-ui", lineHeight: 1.7 }}>Crie sua logo ou identidade visual do zero com a gente.</p>
        </div>

        {/* PROGRESSO */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            {["Detalhes do pedido", "Finalizar pedido"].map((label, i) => (
              <span key={i} style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "system-ui", color: etapa > i ? t.text : t.textSecundario, fontWeight: etapa === i + 1 ? "700" : "400" }}>{label}</span>
            ))}
          </div>
          <div style={{ height: "2px", backgroundColor: t.border }}>
            <div style={{ height: "100%", width: etapa === 1 ? "50%" : "100%", backgroundColor: t.text, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* ══ ETAPA 1 ══ */}
        {etapa === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif" }}>Detalhes do Pedido</h2>

            {/* CATEGORIA */}
            <div>
              <label style={labelStyle}>O que você precisa? *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {CATEGORIAS.map(cat => (
                  <button key={cat.id} onClick={() => setForm(prev => ({ ...prev, categoria: cat.id, tiposRoupa: [], quantidades: {}, cores: {}, materiais: {}, tipoComunicacao: "", dimensoes: "", materialCalca: "" }))}
                    style={{ padding: "20px 16px", cursor: "pointer", textAlign: "center", fontFamily: "system-ui",
                      border: "2px solid " + (form.categoria === cat.id ? t.text : t.border),
                      backgroundColor: form.categoria === cat.id ? t.text : t.bgCard,
                      color: form.categoria === cat.id ? t.btnPrimarioText : t.text }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{cat.emoji}</div>
                    <div style={{ fontWeight: "600", fontSize: "13px" }}>{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ══ ROUPAS ══ */}
            {form.categoria === "roupas" && (
              <div>
                <label style={labelStyle}>Tipos de produto * (selecione um ou mais)</label>
                <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui", marginBottom: "12px", padding: "8px 12px", backgroundColor: t.bgSecundario, border: "1px solid " + t.border }}>
                  📦 Pedido mínimo de <strong style={{ color: t.text }}>20 unidades</strong> no total entre todos os tipos.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {TIPOS_ROUPA.map(tipo => {
                    const sel = form.tiposRoupa.includes(tipo.id);
                    const total = totalTipo(tipo.id);
                    const coresSel = form.cores[tipo.id] || [];
                    const matSel = form.materiais[tipo.id];
                    return (
                      <div key={tipo.id}>
                        {/* Botão do tipo */}
                        <button onClick={() => toggleTipoRoupa(tipo.id)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", cursor: "pointer", textAlign: "left", fontFamily: "system-ui", fontSize: "14px",
                            border: "2px solid " + (sel ? t.text : t.border),
                            backgroundColor: sel ? t.bgSecundario : t.bgCard, color: t.text }}>
                          <span style={{ fontWeight: sel ? "600" : "400" }}>{tipo.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {sel && total > 0 && <span style={{ fontSize: "12px", color: t.textSecundario }}>{total} un</span>}
                            <span style={{ fontSize: "18px", color: sel ? t.text : t.border }}>{sel ? "✓" : "+"}</span>
                          </div>
                        </button>

                        {/* Painel expandido */}
                        {sel && (
                          <div style={{ padding: "16px", backgroundColor: t.bgSecundario, border: "1px solid " + t.border, borderTop: "none", display: "flex", flexDirection: "column", gap: "12px" }}>

                            {/* Material calças */}
                            {tipo.id === "calcas" && (
                              <div>
                                <label style={{ ...labelStyle, marginBottom: "8px" }}>Material *</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  {MATERIAL_CALCAS.map(mat => (
                                    <button key={mat} onClick={() => setForm(prev => ({ ...prev, materialCalca: mat }))}
                                      style={{ padding: "8px 20px", cursor: "pointer", fontFamily: "system-ui", fontSize: "13px",
                                        border: "2px solid " + (form.materialCalca === mat ? t.text : t.border),
                                        backgroundColor: form.materialCalca === mat ? t.text : t.bgCard,
                                        color: form.materialCalca === mat ? t.btnPrimarioText : t.text }}>
                                      {mat}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Cor — só para camisa/polo */}
                            {tipo.temCor && (
                              <div>
                                <label style={{ ...labelStyle, marginBottom: "8px" }}>Cor(es)</label>
                                {coresSel.length > 0 && (
                                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                                    {coresSel.map(id => {
                                      const cor = CORES_OPCOES.find(c => c.id === id);
                                      return (
                                        <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", padding: "3px 8px", backgroundColor: t.bgCard, border: "1px solid " + t.border, fontFamily: "system-ui" }}>
                                          {cor.hex && <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: cor.hex, border: "1px solid " + t.border, display: "inline-block" }} />}
                                          {cor.label}
                                          <button onClick={() => toggleCor(tipo.id, id)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecundario, fontSize: "11px", padding: 0 }}>✕</button>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                                <button onClick={() => setModalCores(tipo.id)}
                                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", border: "1px dashed " + t.borderForte, backgroundColor: t.bgCard, color: t.text, cursor: "pointer", fontSize: "12px", fontFamily: "system-ui" }}>
                                  🎨 {coresSel.length === 0 ? "Selecionar cores" : "Adicionar mais"}
                                </button>
                              </div>
                            )}

                            {/* Material — só para camisa/polo */}
                            {tipo.temMaterial && (
                              <div>
                                <label style={{ ...labelStyle, marginBottom: "8px" }}>Material</label>
                                {matSel ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontSize: "13px", color: t.text, fontFamily: "system-ui" }}>
                                      {MATERIAIS_OPCOES.find(m => m.id === matSel)?.label}
                                    </span>
                                    <button onClick={() => setModalMaterial(tipo.id)} style={{ fontSize: "11px", color: t.textSecundario, background: "none", border: "1px solid " + t.border, cursor: "pointer", padding: "3px 8px", fontFamily: "system-ui" }}>Trocar</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setModalMaterial(tipo.id)}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", border: "1px dashed " + t.borderForte, backgroundColor: t.bgCard, color: t.text, cursor: "pointer", fontSize: "12px", fontFamily: "system-ui" }}>
                                    🧵 Selecionar material
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Tamanhos */}
                            <div>
                              <label style={{ ...labelStyle, marginBottom: "8px" }}>Tamanhos e quantidades *</label>
                              <button onClick={() => setModalTamanhos(tipo.id)}
                                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 14px", border: "1px solid " + t.borderForte, backgroundColor: t.bgCard, color: t.text, cursor: "pointer", fontSize: "12px", fontFamily: "system-ui" }}>
                                📐 {total > 0 ? `Editar tamanhos (${total} un)` : "Selecionar tamanhos e quantidades"}
                              </button>

                              {/* Resumo dos tamanhos por grupo */}
                              {total > 0 && (
                                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                  {(tipo.id === "calcas" ? [{ id: "calcas", label: "" }] : GRUPOS_TAMANHO).map(g => {
                                    const qtds = tipo.id === "calcas"
                                      ? Object.entries(form.quantidades[tipo.id]?.calcas || {}).filter(([,v]) => v > 0)
                                      : Object.entries(form.quantidades[tipo.id]?.[g.id] || {}).filter(([,v]) => v > 0);
                                    if (qtds.length === 0) return null;
                                    return (
                                      <div key={g.id} style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                        {g.label && <span style={{ fontSize: "10px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: "60px" }}>{g.label}:</span>}
                                        {qtds.map(([tam, qtd]) => (
                                          <span key={tam} style={{ fontSize: "11px", padding: "2px 7px", backgroundColor: t.bgCard, border: "1px solid " + t.border, fontFamily: "system-ui" }}>{tam}: {qtd}</span>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ COMUNICAÇÃO VISUAL ══ */}
            {form.categoria === "comunicacao" && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de serviço *</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {TIPOS_COMUNICACAO.map(tipo => (
                      <button key={tipo.id} onClick={() => setForm(prev => ({ ...prev, tipoComunicacao: tipo.id }))}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", cursor: "pointer", textAlign: "left", fontFamily: "system-ui", fontSize: "14px",
                          border: "2px solid " + (form.tipoComunicacao === tipo.id ? t.text : t.border),
                          backgroundColor: form.tipoComunicacao === tipo.id ? t.bgSecundario : t.bgCard,
                          color: t.text, fontWeight: form.tipoComunicacao === tipo.id ? "600" : "400" }}>
                        {form.tipoComunicacao === tipo.id ? "✓" : "○"} {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>
                {form.tipoComunicacao && (
                  <>
                    <div style={{ padding: "10px 12px", backgroundColor: t.bgSecundario, border: "1px solid " + t.border }}>
                      <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui" }}>
                        📦 <strong style={{ color: t.text }}>Quantidade mínima:</strong> consulte nossa equipe sobre quantidades mínimas — envie o pedido e entraremos em contato para alinhar detalhes.
                      </p>
                    </div>
                    <div>
                      <label style={labelStyle}>Dimensões / Tamanho *</label>
                      <input value={form.dimensoes} onChange={e => setForm(prev => ({ ...prev, dimensoes: e.target.value }))}
                        placeholder="Ex: 1,2m x 0,8m ou A4, A3, banner..." style={inputStyle} />
                    </div>
                  </>
                )}
              </>
            )}

            {/* DESCRIÇÃO + UPLOAD */}
            {form.categoria && (
              <>
                <div>
                  <label style={labelStyle}>{form.categoria === "roupas" ? "Descrição (estampa, cores, modelo...)" : "Descrição do projeto"}</label>
                  <textarea value={form.descricao} onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))} rows={4}
                    placeholder={form.categoria === "roupas" ? "Descreva a estampa, cores preferidas, estilo..." : "Descreva o logo, cores, referências..."}
                    style={{ ...inputStyle, resize: "none" }} />
                </div>
                <div>
                  <label style={labelStyle}>{form.categoria === "roupas" ? "Artes e estampas (opcional — até 5)" : "Arquivos de referência (opcional — até 5)"}</label>
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px", cursor: "pointer", border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard }}>
                    <span style={{ fontSize: "28px", marginBottom: "8px" }}>📎</span>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: t.text, fontFamily: "system-ui" }}>Clique para selecionar arquivos</span>
                    <span style={{ fontSize: "11px", color: t.textSecundario, marginTop: "4px", fontFamily: "system-ui" }}>PNG, JPG, PDF — até 5 arquivos</span>
                    <input type="file" multiple accept="image/*,.pdf" style={{ display: "none" }}
                      onChange={e => { const files = Array.from(e.target.files).slice(0, 5); setForm(prev => ({ ...prev, fotos: files.map(f => ({ file: f, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null, name: f.name })) })); }} />
                  </label>
                  {form.fotos.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                      {form.fotos.map((foto, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          {foto.url ? <img src={foto.url} alt="" style={{ width: "72px", height: "72px", objectFit: "cover", border: "1px solid " + t.border }} />
                            : <div style={{ width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bgSecundario, border: "1px solid " + t.border, fontSize: "11px", color: t.textSecundario }}>📄 {foto.name.split(".").pop().toUpperCase()}</div>}
                          <button onClick={() => setForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, j) => j !== i) }))}
                            style={{ position: "absolute", top: "-5px", right: "-5px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#ef4444", color: "white", border: "none", cursor: "pointer", fontSize: "10px" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Aviso mínimo 20 unidades e campos faltando */}
            {form.categoria === "roupas" && form.tiposRoupa.length > 0 && (
              <div style={{ backgroundColor: totalUnidadesGeral >= 20 ? "#f0fdf4" : "#fef9f0", border: "1px solid " + (totalUnidadesGeral >= 20 ? "#86efac" : "#fde68a"), padding: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", fontFamily: "system-ui", marginBottom: "6px",
                  color: totalUnidadesGeral >= 20 ? "#16a34a" : "#92400e" }}>
                  {totalUnidadesGeral >= 20 ? `✅ ${totalUnidadesGeral} unidades — mínimo atingido!` : `⚠️ Pedido mínimo: 20 unidades — você selecionou ${totalUnidadesGeral}`}
                </p>
                {(() => {
                  const itens = [];
                  for (const id of form.tiposRoupa) {
                    const tipo = TIPOS_ROUPA.find(t => t.id === id);
                    if ((form.cores[id] || []).length === 0) itens.push(`${tipo.label}: selecione a cor`);
                    if ((id === "camisa-comum" || id === "polo") && !form.materiais[id]) itens.push(`${tipo.label}: selecione o material`);
                    if (id === "calcas" && !form.materialCalca) itens.push("Calças: selecione o material (Jeans ou Brim)");
                    if (totalTipo(id) === 0) itens.push(`${tipo.label}: informe os tamanhos`);
                  }
                  return itens.length > 0 ? (
                    <ul style={{ fontSize: "12px", color: "#92400e", fontFamily: "system-ui", lineHeight: 1.8, paddingLeft: "16px", margin: 0 }}>
                      {itens.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : null;
                })()}
              </div>
            )}

            <button onClick={() => { if (etapa1Valida) setEtapa(2); }} disabled={!etapa1Valida} style={{ ...btnPrimary(etapa1Valida), width: "100%" }}>
              Próximo →
            </button>
          </div>
        )}

        {/* ══ ETAPA 2 — FINALIZAR ══ */}
        {etapa === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif" }}>Finalizar Pedido</h2>

            {/* RESUMO */}
            <div style={{ border: "1px solid " + t.border, padding: "20px", backgroundColor: t.bgCard }}>
              <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: t.textSecundario, fontFamily: "system-ui", marginBottom: "14px" }}>Resumo do pedido</p>
              <div style={{ padding: "8px 0", borderBottom: "1px solid " + t.border }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui" }}>{form.categoria === "roupas" ? "👕 Item de Roupa" : "🖨️ Comunicação Visual"}</p>
              </div>

              {form.categoria === "roupas" && form.tiposRoupa.map(id => {
                const tipo = TIPOS_ROUPA.find(t => t.id === id);
                const coresSel = (form.cores[id] || []).map(c => CORES_OPCOES.find(x => x.id === c)?.label).join(", ");
                const matSel = MATERIAIS_OPCOES.find(m => m.id === form.materiais[id])?.label;
                return (
                  <div key={id} style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui" }}>{tipo.label}</p>
                    {id === "calcas" && form.materialCalca && <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui" }}>Material: {form.materialCalca}</p>}
                    {matSel && <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui" }}>Material: {matSel}</p>}
                    {coresSel && <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui" }}>Cores: {coresSel}</p>}
                    {(id === "calcas" ? [{ id: "calcas", label: "" }] : GRUPOS_TAMANHO).map(g => {
                      const qtds = id === "calcas"
                        ? Object.entries(form.quantidades[id]?.calcas || {}).filter(([,v]) => v > 0)
                        : Object.entries(form.quantidades[id]?.[g.id] || {}).filter(([,v]) => v > 0);
                      if (!qtds.length) return null;
                      return (
                        <div key={g.id} style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px", alignItems: "center" }}>
                          {g.label && <span style={{ fontSize: "10px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase" }}>{g.label}:</span>}
                          {qtds.map(([tam, qtd]) => <span key={tam} style={{ fontSize: "11px", padding: "2px 7px", backgroundColor: t.bgSecundario, border: "1px solid " + t.border, fontFamily: "system-ui" }}>{tam}: {qtd}</span>)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {form.categoria === "comunicacao" && (
                <>
                  <div style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui" }}>{TIPOS_COMUNICACAO.find(t => t.id === form.tipoComunicacao)?.label}</p>
                    {form.dimensoes && <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui" }}>Dimensões: {form.dimensoes}</p>}
                  </div>
                </>
              )}

              {form.descricao && (
                <div style={{ padding: "10px 0" }}>
                  <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase" }}>Descrição</span>
                  <p style={{ fontSize: "13px", color: t.text, fontFamily: "system-ui", marginTop: "4px" }}>{form.descricao}</p>
                </div>
              )}
            </div>

            {/* DADOS CONTATO + ENDEREÇO */}
            <div style={{ borderTop: "2px solid " + t.borderForte, paddingTop: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui", marginBottom: "16px" }}>Seus dados para contato *</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Nome completo *</label>
                  <input value={form.nomeCliente} onChange={e => setForm(prev => ({ ...prev, nomeCliente: e.target.value }))} placeholder="Ex: João Silva" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Telefone / WhatsApp *</label>
                  <input value={form.telefone} onChange={e => setForm(prev => ({ ...prev, telefone: formatTel(e.target.value) }))} placeholder="(27) 99999-9999" maxLength={15} inputMode="tel"
                    style={{ ...inputStyle, borderColor: form.telefone && validarTel(form.telefone) ? "#ef4444" : t.border }} />
                  {form.telefone && validarTel(form.telefone) && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", fontFamily: "system-ui" }}>⚠️ {validarTel(form.telefone)}</p>}
                </div>
                <div>
                  <label style={labelStyle}>E-mail *</label>
                  <input value={form.email} type="email" onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Ex: joao@email.com"
                    style={{ ...inputStyle, borderColor: form.email && !emailValido(form.email) ? "#ef4444" : t.border }} />
                  {form.email && !emailValido(form.email) && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", fontFamily: "system-ui" }}>⚠️ E-mail inválido</p>}
                  {form.email && emailValido(form.email) && <p style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontFamily: "system-ui" }}>✅ E-mail válido</p>}
                </div>
                <div>
                  <label style={labelStyle}>CEP *</label>
                  <input value={form.cep} onChange={e => { const fmt = formatCEP(e.target.value); setForm(prev => ({ ...prev, cep: fmt })); if (fmt.replace(/\D/g, "").length === 8) buscarCEP(fmt, setForm); }}
                    placeholder="29000-000" maxLength={9} inputMode="numeric"
                    style={{ ...inputStyle, borderColor: form.cep && form.cep.replace(/\D/g, "").length < 8 ? "#ef4444" : t.border }} />
                  {form.cep && form.cep.replace(/\D/g, "").length === 8 && form.cidade && <p style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontFamily: "system-ui" }}>✅ {form.cidade}/{form.estado}</p>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Cidade *</label>
                    <input value={form.cidade} onChange={e => setForm(prev => ({ ...prev, cidade: e.target.value }))} placeholder="Vila Velha" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Estado *</label>
                    <input value={form.estado} onChange={e => setForm(prev => ({ ...prev, estado: e.target.value.toUpperCase().slice(0,2) }))} placeholder="ES" maxLength={2} style={{ ...inputStyle, textAlign: "center", textTransform: "uppercase" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Rua / Avenida *</label>
                    <input value={form.rua || ""} onChange={e => setForm(prev => ({ ...prev, rua: e.target.value }))} placeholder="Rua das Flores" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Número *</label>
                    <input value={form.numero || ""} onChange={e => setForm(prev => ({ ...prev, numero: e.target.value }))} placeholder="123" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Bairro *</label>
                    <input value={form.bairro || ""} onChange={e => setForm(prev => ({ ...prev, bairro: e.target.value }))} placeholder="Centro" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Complemento</label>
                    <input value={form.complemento || ""} onChange={e => setForm(prev => ({ ...prev, complemento: e.target.value }))} placeholder="Apto 2" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Observações finais (opcional)</label>
                  <textarea value={form.observacoes} onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))} rows={3} placeholder="Alguma informação extra..." style={{ ...inputStyle, resize: "none" }} />
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

            {!finalizacaoValida && (
              <div style={{ backgroundColor: "#fef9f0", border: "1px solid #fde68a", padding: "14px" }}>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#92400e", marginBottom: "8px", fontFamily: "system-ui" }}>⚠️ Preencha os campos obrigatórios para finalizar:</p>
                <ul style={{ fontSize: "12px", color: "#92400e", fontFamily: "system-ui", lineHeight: 1.8, paddingLeft: "16px", margin: 0 }}>
                  {!form.nomeCliente.trim() && <li>Nome completo</li>}
                  {validarTel(form.telefone) && <li>Telefone válido</li>}
                  {(!form.email.trim() || !emailValido(form.email)) && <li>E-mail válido</li>}
                  {(!form.cep || form.cep.replace(/\D/g, "").length < 8) && <li>CEP completo</li>}
                  {!form.cidade.trim() && <li>Cidade</li>}
                  {!form.estado.trim() && <li>Estado</li>}
                  {!(form.rua || "").trim() && <li>Rua / Avenida</li>}
                  {!(form.numero || "").trim() && <li>Número</li>}
                  {!(form.bairro || "").trim() && <li>Bairro</li>}
                </ul>
              </div>
            )}

            {erro && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", color: "#dc2626", fontSize: "13px", fontFamily: "system-ui" }}>⚠️ {erro}</div>}

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEtapa(1)} style={{ flex: 1, padding: "14px", border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg, cursor: "pointer", fontFamily: "system-ui", fontWeight: "600" }}>← Voltar</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={salvarNoBanco} disabled={salvando || !finalizacaoValida} style={{ ...btnPrimary(!salvando && finalizacaoValida), width: "100%", padding: "16px" }}>
                {salvando ? "Salvando..." : "✅ Finalizar pedido pelo site"}
              </button>
              <button onClick={finalizarComWhatsApp} disabled={salvando || !finalizacaoValida}
                style={{ width: "100%", padding: "16px", fontWeight: "600", fontSize: "14px", fontFamily: "system-ui", cursor: salvando || !finalizacaoValida ? "not-allowed" : "pointer", backgroundColor: salvando || !finalizacaoValida ? "#86efac" : "#22c55e", color: "white", border: "none" }}>
                💬 Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL TAMANHOS ══ */}
      {modalTamanhos && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={e => { if (e.target === e.currentTarget) setModalTamanhos(null); }}>
          <div style={{ backgroundColor: t.bgCard, width: "100%", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto", borderTop: "2px solid " + t.borderForte }}>
            {(() => {
              const tipo = TIPOS_ROUPA.find(t => t.id === modalTamanhos);
              const isCalca = modalTamanhos === "calcas";
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif" }}>{tipo?.label} — Tamanhos</h3>
                    <button onClick={() => setModalTamanhos(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: t.text }}>✕</button>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    {isCalca ? (
                      <>
                        <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui", marginBottom: "12px" }}>Informe a quantidade por tamanho:</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                          {TAMANHOS_CALCAS.map(tam => {
                            const qtd = form.quantidades[modalTamanhos]?.calcas?.[tam] || 0;
                            return (
                              <div key={tam} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid " + t.border, backgroundColor: qtd > 0 ? t.bgSecundario : t.bgCard }}>
                                <span style={{ fontSize: "14px", fontWeight: "700", color: t.text, fontFamily: "system-ui" }}>{tam}</span>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <button onClick={() => setQtd(modalTamanhos, "calcas", tam, qtd - 1)} style={{ width: "28px", height: "28px", border: "1px solid " + t.border, backgroundColor: t.bg, color: t.text, cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                  <span style={{ width: "36px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: t.text, fontFamily: "system-ui", borderTop: "1px solid " + t.border, borderBottom: "1px solid " + t.border, padding: "4px 0" }}>{qtd}</span>
                                  <button onClick={() => setQtd(modalTamanhos, "calcas", tam, qtd + 1)} style={{ width: "28px", height: "28px", border: "1px solid " + t.border, backgroundColor: t.bg, color: t.text, cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      GRUPOS_TAMANHO.map(grupo => (
                        <div key={grupo.id} style={{ marginBottom: "20px" }}>
                          <p style={{ fontSize: "12px", fontWeight: "700", color: t.text, fontFamily: "system-ui", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid " + t.border }}>
                            {grupo.label}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                            {grupo.tamanhos.map(tam => {
                              const qtd = form.quantidades[modalTamanhos]?.[grupo.id]?.[tam] || 0;
                              return (
                                <div key={tam} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", border: "1px solid " + t.border, backgroundColor: qtd > 0 ? t.bgSecundario : t.bgCard }}>
                                  <span style={{ fontSize: "13px", fontWeight: "700", color: t.text, fontFamily: "system-ui" }}>{tam}</span>
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <button onClick={() => setQtd(modalTamanhos, grupo.id, tam, qtd - 1)} style={{ width: "26px", height: "26px", border: "1px solid " + t.border, backgroundColor: t.bg, color: t.text, cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                    <span style={{ width: "32px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui", borderTop: "1px solid " + t.border, borderBottom: "1px solid " + t.border, padding: "3px 0" }}>{qtd}</span>
                                    <button onClick={() => setQtd(modalTamanhos, grupo.id, tam, qtd + 1)} style={{ width: "26px", height: "26px", border: "1px solid " + t.border, backgroundColor: t.bg, color: t.text, cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: "12px 16px 20px", borderTop: "1px solid " + t.border }}>
                    <button onClick={() => setModalTamanhos(null)} style={{ width: "100%", padding: "14px", backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, border: "none", cursor: "pointer", fontWeight: "700", fontFamily: "system-ui", fontSize: "14px" }}>
                      Confirmar tamanhos
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══ MODAL CORES ══ */}
      {modalCores && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={e => { if (e.target === e.currentTarget) setModalCores(null); }}>
          <div style={{ backgroundColor: t.bgCard, width: "100%", maxWidth: "480px", maxHeight: "80vh", overflowY: "auto", borderTop: "2px solid " + t.borderForte }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif" }}>🎨 Cores</h3>
              <button onClick={() => setModalCores(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: t.text }}>✕</button>
            </div>
            <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              {CORES_OPCOES.map(cor => {
                const sel = (form.cores[modalCores] || []).includes(cor.id);
                return (
                  <button key={cor.id} onClick={() => toggleCor(modalCores, cor.id)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", cursor: "pointer", textAlign: "left", fontFamily: "system-ui", fontSize: "13px",
                      border: "2px solid " + (sel ? t.text : t.border), backgroundColor: sel ? t.bgSecundario : t.bgCard, color: t.text }}>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, display: "inline-block", backgroundColor: cor.hex || "transparent", border: cor.hex ? "1px solid " + t.border : "2px dashed " + t.border }} />
                    <span style={{ fontWeight: sel ? "600" : "400" }}>{cor.label}</span>
                    {sel && <span style={{ marginLeft: "auto" }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "12px 16px 20px", borderTop: "1px solid " + t.border }}>
              <button onClick={() => setModalCores(null)} style={{ width: "100%", padding: "14px", backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, border: "none", cursor: "pointer", fontWeight: "700", fontFamily: "system-ui" }}>Confirmar cores</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL MATERIAL ══ */}
      {modalMaterial && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={e => { if (e.target === e.currentTarget) setModalMaterial(null); }}>
          <div style={{ backgroundColor: t.bgCard, width: "100%", maxWidth: "480px", maxHeight: "80vh", overflowY: "auto", borderTop: "2px solid " + t.borderForte }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif" }}>🧵 Material</h3>
              <button onClick={() => setModalMaterial(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: t.text }}>✕</button>
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {MATERIAIS_OPCOES.map(mat => {
                const sel = form.materiais[modalMaterial] === mat.id;
                return (
                  <button key={mat.id} onClick={() => setMaterial(modalMaterial, mat.id)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "14px 16px", cursor: "pointer", textAlign: "left", fontFamily: "system-ui",
                      border: "2px solid " + (sel ? t.text : t.border), backgroundColor: sel ? t.bgSecundario : t.bgCard }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: t.text }}>{mat.label} {sel ? "✓" : ""}</span>
                    <span style={{ fontSize: "11px", color: t.textSecundario, marginTop: "2px" }}>{mat.descricao}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}