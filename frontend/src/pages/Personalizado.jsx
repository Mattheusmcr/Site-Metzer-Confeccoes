import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

const TIPOS_PRODUTO = [
  { id: "camisa-comum",       label: "Camisa Comum",        emoji: "👕" },
  { id: "polo",               label: "Polo",                emoji: "👔" },
  { id: "calcas",             label: "Calças",              emoji: "👖" },
  { id: "logos-acm",         label: "Logos ACM",           emoji: "🪧" },
  { id: "impressoes-digitais", label: "Impressões Digitais", emoji: "🖨️" },
];

const TAMANHOS_ROUPAS = ["PP", "P", "M", "G", "GG", "XGG", "2XGG"];

const CORES_OPCOES = [
  { id: "branco",       label: "Branco",        hex: "#FFFFFF" },
  { id: "preto",        label: "Preto",          hex: "#1a1a1a" },
  { id: "cinza",        label: "Cinza",          hex: "#9ca3af" },
  { id: "azul-marinho", label: "Azul Marinho",   hex: "#1e3a8a" },
  { id: "azul-royal",   label: "Azul Royal",     hex: "#2563eb" },
  { id: "vermelho",     label: "Vermelho",       hex: "#dc2626" },
  { id: "verde",        label: "Verde",          hex: "#16a34a" },
  { id: "amarelo",      label: "Amarelo",        hex: "#ca8a04" },
  { id: "laranja",      label: "Laranja",        hex: "#ea580c" },
  { id: "rosa",         label: "Rosa",           hex: "#db2777" },
  { id: "roxo",         label: "Roxo",           hex: "#7c3aed" },
  { id: "bege",         label: "Bege",           hex: "#d4b896" },
  { id: "personalizada", label: "Outra / Me consulte", hex: null },
];

const MATERIAIS_OPCOES = [
  { id: "algodao",        label: "100% Algodão",       descricao: "Macio, respirável, ideal para o dia a dia" },
  { id: "poliester",      label: "Poliéster",           descricao: "Resistente, seca rápido, ótimo para esportes" },
  { id: "malha-fria",     label: "Malha Fria",          descricao: "Leve e confortável para climas quentes" },
  { id: "dry-fit",        label: "Dry Fit",             descricao: "Alta performance, absorve suor" },
  { id: "piquet",         label: "Piquet (Polo)",       descricao: "Clássico para camisas polo" },
  { id: "brim",           label: "Brim / Sarja",        descricao: "Resistente, ideal para calças e uniformes" },
  { id: "nao-sei",        label: "Não sei / Me indique", descricao: "Nossa equipe recomenda o melhor para você" },
];

const FORM_INICIAL = {
  // Detalhes do pedido
  tiposProduto: [],
  quantidades: {}, // { "camisa-comum": { P: 2, M: 3 }, ... }
  cores: [],
  material: "",
  descricao: "",
  fotos: [],
  // Finalização
  nomeCliente: "",
  telefone: "",
  email: "",
  observacoes: "",
};

function emailValido(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function cepValido(c) { return /^\d{5}-?\d{3}$/.test(c.replace(/\D/g, "").padStart(8, "0")) && c.replace(/\D/g, "").length === 8; }

async function buscarCep(cep, setForm) {
  const numeros = cep.replace(/\D/g, "");
  if (numeros.length !== 8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
    const data = await res.json();
    if (!data.erro) {
      setForm(prev => ({
        ...prev,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));
    }
  } catch {}
}
function validarTel(v) {
  const n = v.replace(/\D/g, "");
  if (!n) return "Obrigatório";
  if (n.length < 10) return "Mínimo 10 dígitos";
  if (n.length > 11) return "Máximo 11 dígitos";
  return "";
}

const isTipoRoupa = (id) => ["camisa-comum", "polo", "calcas"].includes(id);

export default function Personalizado() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [modalTipo, setModalTipo] = useState(false);
  const [modalTamanhos, setModalTamanhos] = useState(null);
  const [modalCores, setModalCores] = useState(false);
  const [modalMaterial, setModalMaterial] = useState(false);

  // ── helpers ──
  const inputStyle = {
    width: "100%", padding: "12px 14px", outline: "none",
    border: "1px solid " + t.border, backgroundColor: t.bgCard,
    color: t.text, fontSize: "14px", boxSizing: "border-box", fontFamily: "system-ui",
  };
  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: "600", color: t.textSecundario,
    marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "system-ui",
  };

  function toggleTipo(id) {
    setForm(prev => {
      const existe = prev.tiposProduto.includes(id);
      return {
        ...prev,
        tiposProduto: existe ? prev.tiposProduto.filter(t => t !== id) : [...prev.tiposProduto, id],
        quantidades: existe
          ? Object.fromEntries(Object.entries(prev.quantidades).filter(([k]) => k !== id))
          : prev.quantidades,
      };
    });
  }

  function setQtdTamanho(tipoId, tamanho, valor) {
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

  // Validações etapa 1
  const telErro = validarTel(form.telefone);
  const etapa1Valida = form.tiposProduto.length > 0;

  // Validação finalização
  const finalizacaoValida = (
    form.nomeCliente.trim() &&
    !validarTel(form.telefone) &&
    emailValido(form.email) &&
    cepValido(form.cep) &&
    form.cidade.trim() &&
    form.estado.trim()
  );

  // ── salvar ──
  async function salvarNoBanco() {
    setSalvando(true); setErro("");
    try {
      const resumoTipos = form.tiposProduto.map(id => {
        const tipo = TIPOS_PRODUTO.find(t => t.id === id);
        if (isTipoRoupa(id)) {
          const qtds = form.quantidades[id] || {};
          const detalhe = Object.entries(qtds)
            .filter(([, v]) => v > 0)
            .map(([tam, v]) => `${tam}: ${v}`)
            .join(", ");
          return `${tipo.label}${detalhe ? " (" + detalhe + ")" : ""}`;
        }
        return tipo.label;
      }).join(" | ");

      await api.post("pedidos-personalizados/", {
        nome_empresa:  form.nomeCliente,
        slogan:        "",
        ramo:          resumoTipos,
        quantidade:    form.tiposProduto.length,
        estilo:        "",
        paleta:        "",
        aplicacoes:    form.tiposProduto,
        referencia:    `Cores: ${form.cores.join(", ")} | Material: ${form.material} | ${form.descricao}`,
        observacoes:   form.observacoes,
        nome_cliente:  form.nomeCliente,
        telefone:      form.telefone,
        email:         form.email,
        observacoes:   form.observacoes + (form.cep ? ` | CEP: ${form.cep} | ${form.cidade}/${form.estado}` : ""),
      });
      setEnviado(true);
    } catch (e) {
      console.error(e.response?.data);
      setErro("Erro ao salvar. Tente novamente ou use o WhatsApp.");
    } finally { setSalvando(false); }
  }

  function enviarWhatsApp() {
    const coresLabel = form.cores.map(id => CORES_OPCOES.find(c => c.id === id)?.label).join(", ");
    const materialLabel = MATERIAIS_OPCOES.find(m => m.id === form.material)?.label || "";
    const resumo = form.tiposProduto.map(id => {
      const tipo = TIPOS_PRODUTO.find(t => t.id === id);
      if (isTipoRoupa(id)) {
        const qtds = form.quantidades[id] || {};
        const detalhe = Object.entries(qtds).filter(([, v]) => v > 0).map(([t, v]) => `${t}: ${v}`).join(", ");
        return `${tipo.label}${detalhe ? " — " + detalhe : ""}`;
      }
      return tipo.label;
    }).join("\n");

    const msg = `
🎨 *PEDIDO PERSONALIZADO — METZKER*

📋 *Produtos solicitados:*
${resumo}

🎨 *Cores:* ${coresLabel || "Não informado"}
🧵 *Material:* ${materialLabel || "Não informado"}
📝 *Descrição / ideia:* ${form.descricao || "Não informado"}
📎 *Observações:* ${form.observacoes || "Nenhuma"}

👤 *Contato:* ${form.nomeCliente}
📱 ${form.telefone}
📧 ${form.email}
📍 ${form.cidade}/${form.estado} — CEP: ${form.cep}
    `.trim();

    window.open(`https://wa.me/5527997878391?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function finalizarComWhatsApp() {
    await salvarNoBanco();
    enviarWhatsApp();
  }

  // ── sucesso ──
  if (enviado) return (
    <div style={{ backgroundColor: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center px-6" style={{ maxWidth: "480px" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
        <h2 style={{ fontSize: "2rem", fontWeight: "300", color: t.text, marginBottom: "16px", fontFamily: "Georgia, serif" }}>
          Pedido recebido!
        </h2>
        <p style={{ color: t.textSecundario, lineHeight: 1.8, marginBottom: "32px", fontFamily: "system-ui" }}>
          Seu pedido foi registrado. Nossa equipe entrará em contato em breve.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => navigate("/")}
            style={{ padding: "12px 24px", border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg, cursor: "pointer", fontFamily: "system-ui" }}>
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

        {/* PROGRESSO — 2 etapas */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            {["Detalhes do pedido", "Finalizar pedido"].map((label, i) => (
              <span key={i} style={{
                fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
                fontFamily: "system-ui", color: etapa > i ? t.text : t.textSecundario,
                fontWeight: etapa === i + 1 ? "700" : "400",
              }}>{label}</span>
            ))}
          </div>
          <div style={{ height: "2px", backgroundColor: t.border }}>
            <div style={{ height: "100%", width: etapa === 1 ? "50%" : "100%", backgroundColor: t.text, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* ══ ETAPA 1 — DETALHES DO PEDIDO ══ */}
        {etapa === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif" }}>
              Detalhes do Pedido
            </h2>

            {/* TIPOS DE PRODUTO */}
            <div>
              <label style={labelStyle}>Tipos de produto *</label>

              {/* Itens selecionados */}
              {form.tiposProduto.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {form.tiposProduto.map(id => {
                    const tipo = TIPOS_PRODUTO.find(t => t.id === id);
                    const total = totalTipo(id);
                    const qtds = form.quantidades[id] || {};
                    const tamanhosSelecionados = Object.entries(qtds).filter(([, v]) => v > 0);
                    return (
                      <div key={id}>
                        {/* Tag do tipo */}
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: "8px",
                          padding: "6px 12px", backgroundColor: t.text, color: t.btnPrimarioText,
                          fontSize: "12px", fontFamily: "system-ui",
                        }}>
                          <span>{tipo.emoji} {tipo.label}</span>
                          {isTipoRoupa(id) && total > 0 && (
                            <span style={{ opacity: 0.7 }}>({total} un)</span>
                          )}
                          <button onClick={() => toggleTipo(id)}
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}>
                            ✕
                          </button>
                        </div>

                        {/* Botão tamanhos e resumo — abaixo da tag, só para roupas */}
                        {isTipoRoupa(id) && (
                          <div style={{ marginTop: "8px", marginBottom: "4px" }}>
                            <button onClick={() => setModalTamanhos(id)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "8px",
                                padding: "8px 14px", border: "1px solid " + t.borderForte,
                                backgroundColor: t.bgCard, color: t.text, cursor: "pointer",
                                fontSize: "12px", fontFamily: "system-ui",
                              }}>
                              📐 {tamanhosSelecionados.length > 0 ? "Editar tamanhos" : "Selecionar tamanhos"}
                            </button>
                            {/* Resumo dos tamanhos */}
                            {tamanhosSelecionados.length > 0 && (
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                                {tamanhosSelecionados.map(([tam, qtd]) => (
                                  <span key={tam} style={{
                                    fontSize: "11px", padding: "3px 8px",
                                    backgroundColor: t.bgSecundario,
                                    border: "1px solid " + t.border,
                                    color: t.text, fontFamily: "system-ui",
                                  }}>
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
              )}

              {/* Botão abrir modal */}
              <button onClick={() => setModalTipo(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px",
                  border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard,
                  color: t.text, cursor: "pointer", fontSize: "13px", fontFamily: "system-ui", width: "100%",
                }}>
                <span style={{ fontSize: "18px" }}>+</span>
                {form.tiposProduto.length === 0 ? "Selecionar tipos de produto" : "Adicionar mais tipos"}
              </button>
            </div>

            {/* CORES */}
            <div>
              <label style={labelStyle}>Cores desejadas</label>
              {form.cores.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {form.cores.map(id => {
                    const cor = CORES_OPCOES.find(c => c.id === id);
                    return (
                      <div key={id} style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "4px 10px", border: "1px solid " + t.borderForte,
                        backgroundColor: t.bgCard, fontSize: "12px", fontFamily: "system-ui",
                      }}>
                        {cor.hex && <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: cor.hex, border: "1px solid " + t.border, display: "inline-block", flexShrink: 0 }} />}
                        {cor.label}
                        <button onClick={() => setForm(prev => ({ ...prev, cores: prev.cores.filter(c => c !== id) }))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecundario, fontSize: "12px", lineHeight: 1, padding: 0 }}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
              <button onClick={() => setModalCores(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px",
                  border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard,
                  color: t.text, cursor: "pointer", fontSize: "13px", fontFamily: "system-ui", width: "100%",
                }}>
                <span style={{ fontSize: "18px" }}>🎨</span>
                {form.cores.length === 0 ? "Selecionar cores" : "Adicionar mais cores"}
              </button>
            </div>

            {/* MATERIAL */}
            <div>
              <label style={labelStyle}>Material preferido</label>
              {form.material && (
                <div style={{ marginBottom: "10px", padding: "10px 14px", backgroundColor: t.bgSecundario, border: "1px solid " + t.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui" }}>
                      {MATERIAIS_OPCOES.find(m => m.id === form.material)?.label}
                    </p>
                    <p style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", marginTop: "2px" }}>
                      {MATERIAIS_OPCOES.find(m => m.id === form.material)?.descricao}
                    </p>
                  </div>
                  <button onClick={() => setForm(prev => ({ ...prev, material: "" }))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecundario, fontSize: "16px" }}>✕</button>
                </div>
              )}
              <button onClick={() => setModalMaterial(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px",
                  border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard,
                  color: t.text, cursor: "pointer", fontSize: "13px", fontFamily: "system-ui", width: "100%",
                }}>
                <span style={{ fontSize: "18px" }}>🧵</span>
                {!form.material ? "Selecionar material" : "Trocar material"}
              </button>
            </div>

            {/* DESCRIÇÃO */}
            <div>
              <label style={labelStyle}>Descrição do pedido (o que você está pensando)</label>
              <textarea value={form.descricao}
                onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                rows={4}
                placeholder="Descreva a ideia, cores que gosta, estilo que imagina, referências..."
                style={{ ...inputStyle, resize: "none" }} />
            </div>

            {/* UPLOAD FOTOS — renomeado para Artes e Estampas */}
            <div>
              <label style={labelStyle}>Artes e estampas (opcional — até 5 imagens)</label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "28px", cursor: "pointer",
                border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard,
              }}>
                <span style={{ fontSize: "28px", marginBottom: "8px" }}>📸</span>
                <span style={{ fontSize: "13px", fontWeight: "500", color: t.text, fontFamily: "system-ui" }}>
                  Clique para selecionar imagens
                </span>
                <span style={{ fontSize: "11px", color: t.textSecundario, marginTop: "4px", fontFamily: "system-ui" }}>
                  PNG, JPG — até 5 arquivos
                </span>
                <input type="file" multiple accept="image/*" style={{ display: "none" }}
                  onChange={e => {
                    const files = Array.from(e.target.files).slice(0, 5);
                    setForm(prev => ({ ...prev, fotos: files.map(f => ({ file: f, url: URL.createObjectURL(f) })) }));
                  }} />
              </label>
              {form.fotos.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                  {form.fotos.map((foto, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={foto.url} alt="" style={{ width: "72px", height: "72px", objectFit: "cover", border: "1px solid " + t.border }} />
                      <button onClick={() => setForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, j) => j !== i) }))}
                        style={{ position: "absolute", top: "-5px", right: "-5px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#ef4444", color: "white", border: "none", cursor: "pointer", fontSize: "10px" }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {form.fotos.length > 0 && (
                <p style={{ fontSize: "11px", color: t.textSecundario, marginTop: "6px", fontFamily: "system-ui" }}>
                  💡 Envie as imagens pelo WhatsApp após finalizar o pedido.
                </p>
              )}
            </div>

            <button onClick={() => { if (etapa1Valida) setEtapa(2); }}
              disabled={!etapa1Valida}
              style={{
                padding: "14px", fontWeight: "700", fontSize: "14px", fontFamily: "system-ui",
                cursor: etapa1Valida ? "pointer" : "not-allowed",
                backgroundColor: etapa1Valida ? t.btnPrimarioBg : t.border,
                color: etapa1Valida ? t.btnPrimarioText : t.textSecundario, border: "none",
              }}>
              Próximo →
            </button>
          </div>
        )}

        {/* ══ ETAPA 2 — FINALIZAR PEDIDO ══ */}
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

              {/* Tipos e tamanhos */}
              {form.tiposProduto.map(id => {
                const tipo = TIPOS_PRODUTO.find(t => t.id === id);
                const qtds = form.quantidades[id] || {};
                const total = totalTipo(id);
                return (
                  <div key={id} style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui" }}>
                        {tipo.emoji} {tipo.label}
                      </span>
                      {isTipoRoupa(id) && total > 0 && (
                        <span style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui" }}>
                          {total} unidade{total !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {isTipoRoupa(id) && Object.entries(qtds).filter(([, v]) => v > 0).length > 0 && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                        {Object.entries(qtds).filter(([, v]) => v > 0).map(([tam, qtd]) => (
                          <span key={tam} style={{ fontSize: "11px", padding: "2px 8px", backgroundColor: t.bgSecundario, color: t.text, fontFamily: "system-ui" }}>
                            {tam}: {qtd}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {form.cep && (
                <div style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase", letterSpacing: "0.1em" }}>Endereço</span>
                  <p style={{ fontSize: "13px", color: t.text, marginTop: "4px", fontFamily: "system-ui" }}>
                    {form.cidade}/{form.estado} — CEP: {form.cep}
                  </p>
                </div>
              )}

              {form.cores.length > 0 && (
                <div style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase", letterSpacing: "0.1em" }}>Cores</span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                    {form.cores.map(id => {
                      const cor = CORES_OPCOES.find(c => c.id === id);
                      return (
                        <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "3px 8px", backgroundColor: t.bgSecundario, fontFamily: "system-ui" }}>
                          {cor.hex && <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: cor.hex, border: "1px solid " + t.border, display: "inline-block" }} />}
                          {cor.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {form.material && (
                <div style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase", letterSpacing: "0.1em" }}>Material</span>
                  <p style={{ fontSize: "13px", color: t.text, marginTop: "4px", fontFamily: "system-ui" }}>
                    {MATERIAIS_OPCOES.find(m => m.id === form.material)?.label}
                  </p>
                </div>
              )}

              {form.descricao && (
                <div style={{ padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase", letterSpacing: "0.1em" }}>Descrição</span>
                  <p style={{ fontSize: "13px", color: t.text, marginTop: "4px", fontFamily: "system-ui" }}>{form.descricao}</p>
                </div>
              )}

              {form.fotos.length > 0 && (
                <div style={{ paddingTop: "10px" }}>
                  <span style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Artes/Estampas ({form.fotos.length})
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {form.fotos.map((foto, i) => (
                      <img key={i} src={foto.url} alt="" style={{ width: "56px", height: "56px", objectFit: "cover", border: "1px solid " + t.border }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DADOS DE CONTATO — obrigatórios */}
            <div style={{ borderTop: "2px solid " + t.borderForte, paddingTop: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, fontFamily: "system-ui", marginBottom: "16px" }}>
                Seus dados para contato *
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Nome completo *</label>
                  <input value={form.nomeCliente}
                    onChange={e => setForm(prev => ({ ...prev, nomeCliente: e.target.value }))}
                    placeholder="Ex: João Silva" style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Telefone / WhatsApp *</label>
                  <input value={form.telefone}
                    onChange={e => setForm(prev => ({ ...prev, telefone: e.target.value.replace(/[^0-9()\-\s+]/g, "") }))}
                    placeholder="Ex: (27) 99999-9999"
                    maxLength={15} inputMode="tel"
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
                  <label style={labelStyle}>CEP *</label>
                  <input value={form.cep}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                      const formatted = v.length > 5 ? v.slice(0,5) + "-" + v.slice(5) : v;
                      setForm(prev => ({ ...prev, cep: formatted }));
                      if (v.length === 8) buscarCep(v, setForm);
                    }}
                    placeholder="Ex: 29100-000"
                    inputMode="numeric"
                    maxLength={9}
                    style={{ ...inputStyle, borderColor: form.cep && !cepValido(form.cep) ? "#ef4444" : t.border }} />
                  {form.cep && !cepValido(form.cep) && (
                    <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", fontFamily: "system-ui" }}>⚠️ CEP inválido — 8 dígitos</p>
                  )}
                  {form.cep && cepValido(form.cep) && form.cidade && (
                    <p style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontFamily: "system-ui" }}>✅ {form.cidade}/{form.estado}</p>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Cidade *</label>
                    <input value={form.cidade}
                      onChange={e => setForm(prev => ({ ...prev, cidade: e.target.value }))}
                      placeholder="Ex: Vila Velha" style={inputStyle} />
                  </div>
                  <div style={{ width: "80px" }}>
                    <label style={labelStyle}>Estado *</label>
                    <input value={form.estado}
                      onChange={e => setForm(prev => ({ ...prev, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                      placeholder="ES" maxLength={2}
                      style={{ ...inputStyle, textAlign: "center", textTransform: "uppercase" }} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Observações finais (opcional)</label>
                  <textarea value={form.observacoes}
                    onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={3} placeholder="Alguma informação extra..."
                    style={{ ...inputStyle, resize: "none" }} />
                </div>
              </div>
            </div>

            {/* INFO */}
            <div style={{ backgroundColor: t.bgSecundario, border: "1px solid " + t.border, padding: "14px" }}>
              <p style={{ fontSize: "13px", color: t.textSecundario, lineHeight: 1.7, fontFamily: "system-ui" }}>
                ℹ️ <strong style={{ color: t.text }}>Finalizar pelo site</strong> registra o pedido no painel.
                <strong style={{ color: t.text }}> Enviar pelo WhatsApp</strong> salva e abre o WhatsApp com tudo preenchido.
                {form.fotos.length > 0 && " Envie as artes/estampas na conversa do WhatsApp."}
              </p>
            </div>

            {erro && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", color: "#dc2626", fontSize: "13px", fontFamily: "system-ui" }}>
                ⚠️ {erro}
              </div>
            )}

            {!finalizacaoValida && (
              <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui" }}>
                * Preencha nome, telefone e e-mail para finalizar.
              </p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setEtapa(1)}
                style={{ flex: 1, padding: "14px", border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg, cursor: "pointer", fontFamily: "system-ui", fontWeight: "600" }}>
                ← Voltar
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={salvarNoBanco} disabled={salvando || !finalizacaoValida}
                style={{
                  padding: "16px", fontWeight: "700", fontSize: "15px", fontFamily: "system-ui",
                  cursor: salvando || !finalizacaoValida ? "not-allowed" : "pointer",
                  backgroundColor: salvando || !finalizacaoValida ? t.border : t.btnPrimarioBg,
                  color: salvando || !finalizacaoValida ? t.textSecundario : t.btnPrimarioText,
                  border: "none",
                }}>
                {salvando ? "Salvando..." : "✅ Finalizar pedido pelo site"}
              </button>

              <button onClick={finalizarComWhatsApp} disabled={salvando || !finalizacaoValida}
                style={{
                  padding: "16px", fontWeight: "600", fontSize: "14px", fontFamily: "system-ui",
                  cursor: salvando || !finalizacaoValida ? "not-allowed" : "pointer",
                  backgroundColor: salvando || !finalizacaoValida ? "#86efac" : "#22c55e",
                  color: "white", border: "none",
                }}>
                💬 Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL — CORES ══ */}
      {modalCores && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setModalCores(false); }}>
          <div style={{ backgroundColor: t.bgCard, width: "100%", maxWidth: "480px", maxHeight: "80vh", overflowY: "auto", borderTop: "2px solid " + t.borderForte }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif" }}>🎨 Cores desejadas</h3>
              <button onClick={() => setModalCores(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: t.text }}>✕</button>
            </div>
            <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              {CORES_OPCOES.map(cor => {
                const selecionada = form.cores.includes(cor.id);
                return (
                  <button key={cor.id} onClick={() => setForm(prev => ({
                    ...prev,
                    cores: prev.cores.includes(cor.id) ? prev.cores.filter(c => c !== cor.id) : [...prev.cores, cor.id]
                  }))}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px",
                      cursor: "pointer", textAlign: "left", fontFamily: "system-ui", fontSize: "13px",
                      border: "2px solid " + (selecionada ? t.text : t.border),
                      backgroundColor: selecionada ? t.bgSecundario : t.bgCard,
                      color: t.text,
                    }}>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, display: "inline-block",
                      backgroundColor: cor.hex || "transparent",
                      border: cor.hex ? "1px solid " + t.border : "2px dashed " + t.border }} />
                    <span style={{ fontWeight: selecionada ? "600" : "400" }}>{cor.label}</span>
                    {selecionada && <span style={{ marginLeft: "auto" }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "12px 16px 20px", borderTop: "1px solid " + t.border }}>
              <button onClick={() => setModalCores(false)}
                style={{ width: "100%", padding: "14px", backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, border: "none", cursor: "pointer", fontWeight: "700", fontFamily: "system-ui", fontSize: "14px" }}>
                Confirmar cores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL — MATERIAL ══ */}
      {modalMaterial && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setModalMaterial(false); }}>
          <div style={{ backgroundColor: t.bgCard, width: "100%", maxWidth: "480px", maxHeight: "80vh", overflowY: "auto", borderTop: "2px solid " + t.borderForte }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif" }}>🧵 Material preferido</h3>
              <button onClick={() => setModalMaterial(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: t.text }}>✕</button>
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {MATERIAIS_OPCOES.map(mat => {
                const selecionado = form.material === mat.id;
                return (
                  <button key={mat.id} onClick={() => { setForm(prev => ({ ...prev, material: mat.id })); setModalMaterial(false); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "14px 16px",
                      cursor: "pointer", textAlign: "left", fontFamily: "system-ui",
                      border: "2px solid " + (selecionado ? t.text : t.border),
                      backgroundColor: selecionado ? t.bgSecundario : t.bgCard,
                    }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: t.text }}>{mat.label} {selecionado ? "✓" : ""}</span>
                    <span style={{ fontSize: "11px", color: t.textSecundario, marginTop: "2px" }}>{mat.descricao}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL — SELECIONAR TIPOS ══ */}
      {modalTipo && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setModalTipo(false); }}>
          <div style={{
            backgroundColor: t.bgCard, width: "100%", maxWidth: "480px",
            maxHeight: "80vh", overflowY: "auto",
            borderTop: "2px solid " + t.borderForte,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif" }}>
                Tipos de produto
              </h3>
              <button onClick={() => setModalTipo(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: t.text }}>✕</button>
            </div>
            <div style={{ padding: "16px" }}>
              {TIPOS_PRODUTO.map(tipo => {
                const selecionado = form.tiposProduto.includes(tipo.id);
                return (
                  <button key={tipo.id}
                    onClick={() => toggleTipo(tipo.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px", width: "100%",
                      padding: "14px 16px", marginBottom: "8px", cursor: "pointer",
                      textAlign: "left", fontFamily: "system-ui", fontSize: "14px",
                      border: "2px solid " + (selecionado ? t.text : t.border),
                      backgroundColor: selecionado ? t.text : t.bgCard,
                      color: selecionado ? t.btnPrimarioText : t.text,
                    }}>
                    <span style={{ fontSize: "22px" }}>{tipo.emoji}</span>
                    <span style={{ fontWeight: "600" }}>{tipo.label}</span>
                    {selecionado && <span style={{ marginLeft: "auto", fontSize: "16px" }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "12px 16px 20px", borderTop: "1px solid " + t.border }}>
              <button onClick={() => setModalTipo(false)}
                style={{ width: "100%", padding: "14px", backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, border: "none", cursor: "pointer", fontWeight: "700", fontFamily: "system-ui", fontSize: "14px" }}>
                Confirmar seleção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL — TAMANHOS E QUANTIDADES ══ */}
      {modalTamanhos && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setModalTamanhos(null); }}>
          <div style={{
            backgroundColor: t.bgCard, width: "100%", maxWidth: "480px",
            maxHeight: "80vh", overflowY: "auto",
            borderTop: "2px solid " + t.borderForte,
          }}>
            {(() => {
              const tipo = TIPOS_PRODUTO.find(t => t.id === modalTamanhos);
              const qtds = form.quantidades[modalTamanhos] || {};
              const total = Object.values(qtds).reduce((a, b) => a + b, 0);
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif" }}>
                        {tipo?.emoji} {tipo?.label}
                      </h3>
                      <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui", marginTop: "2px" }}>
                        Total: {total} unidade{total !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button onClick={() => setModalTamanhos(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: t.text }}>✕</button>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui", marginBottom: "16px" }}>
                      Informe a quantidade por tamanho:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                      {TAMANHOS_ROUPAS.map(tam => (
                        <div key={tam} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid " + t.border, backgroundColor: (qtds[tam] || 0) > 0 ? t.bgSecundario : t.bgCard }}>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: t.text, fontFamily: "system-ui", minWidth: "32px" }}>{tam}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                            <button onClick={() => setQtdTamanho(modalTamanhos, tam, (qtds[tam] || 0) - 1)}
                              style={{ width: "28px", height: "28px", border: "1px solid " + t.border, backgroundColor: t.bg, color: t.text, cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <span style={{ width: "36px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: t.text, fontFamily: "system-ui", borderTop: "1px solid " + t.border, borderBottom: "1px solid " + t.border, padding: "4px 0", lineHeight: "20px" }}>
                              {qtds[tam] || 0}
                            </span>
                            <button onClick={() => setQtdTamanho(modalTamanhos, tam, (qtds[tam] || 0) + 1)}
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