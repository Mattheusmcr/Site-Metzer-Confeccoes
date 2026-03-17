import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../services/api";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

const ESTILOS_LOGO = [
  { id: "minimalista", label: "Minimalista", descricao: "Limpo, simples, tipografia elegante",  emoji: "◻️" },
  { id: "moderno",     label: "Moderno",     descricao: "Geométrico, clean, contemporâneo",    emoji: "🔷" },
  { id: "classico",   label: "Clássico",    descricao: "Tradicional, brasão, formal",          emoji: "🏅" },
  { id: "divertido",  label: "Divertido",   descricao: "Colorido, dinâmico, jovem",            emoji: "🎨" },
  { id: "manuscrito", label: "Manuscrito",  descricao: "Letra cursiva, handmade, artesanal",   emoji: "✍️" },
];

const PALETAS = [
  { id: "preto-branco",  label: "Preto & Branco",      cores: ["#000000", "#ffffff"] },
  { id: "azul",          label: "Azul corporativo",     cores: ["#1e3a8a", "#93c5fd"] },
  { id: "vermelho",      label: "Vermelho vibrante",    cores: ["#dc2626", "#fca5a5"] },
  { id: "verde",         label: "Verde natural",        cores: ["#166534", "#86efac"] },
  { id: "dourado",       label: "Dourado premium",      cores: ["#92400e", "#fde68a"] },
  { id: "personalizada", label: "Me consulte",          cores: [] },
];

const APLICACOES = [
  { id: "camisa",  label: "Camisas / Uniformes", emoji: "👕" },
  { id: "banner",  label: "Banner / Impressão",  emoji: "🖼️" },
  { id: "digital", label: "Uso Digital",          emoji: "💻" },
  { id: "acm",     label: "Placa ACM",            emoji: "🪧" },
  { id: "todos",   label: "Todos os formatos",    emoji: "✅" },
];

const FORM_INICIAL = {
  nomeEmpresa: "", slogan: "", ramo: "", quantidade: 1,
  estilo: "", paleta: "", aplicacoes: [],
  referencia: "", observacoes: "",
  nomeCliente: "", telefone: "", email: "",
  fotos: [],
};

export default function Personalizado() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function toggleAplicacao(id) {
    setForm(prev => ({
      ...prev,
      aplicacoes: prev.aplicacoes.includes(id)
        ? prev.aplicacoes.filter(a => a !== id)
        : [...prev.aplicacoes, id],
    }));
  }

  // Salva o pedido no banco de dados (Admin vai ver)
  async function salvarNoBanco() {
    setSalvando(true);
    setErro("");
    try {
      await api.post("pedidos-personalizados/", {
        nome_empresa:  form.nomeEmpresa,
        slogan:        form.slogan,
        ramo:          form.ramo,
        quantidade:    form.quantidade,
        estilo:        form.estilo,
        paleta:        form.paleta,
        aplicacoes:    form.aplicacoes,
        referencia:    form.referencia,
        observacoes:   form.observacoes,
        nome_cliente:  form.nomeCliente,
        telefone:      form.telefone,
        email:         form.email,
      });
      setEnviado(true);
    } catch (e) {
      console.error(e.response?.data);
      setErro("Erro ao salvar pedido. Tente novamente ou use o WhatsApp.");
    } finally {
      setSalvando(false);
    }
  }

  // Abre WhatsApp com mensagem formatada
  function enviarWhatsApp() {
    const aplicacoesLabel = form.aplicacoes
      .map(id => APLICACOES.find(a => a.id === id)?.label).join(", ");
    const estiloLabel  = ESTILOS_LOGO.find(e => e.id === form.estilo)?.label || "";
    const paletaLabel  = PALETAS.find(p => p.id === form.paleta)?.label || "";

    const msg = `
🎨 *PEDIDO DE LOGO PERSONALIZADO — METZKER*

👤 *Empresa/Nome:* ${form.nomeEmpresa}
💬 *Slogan:* ${form.slogan || "Não informado"}
🏢 *Ramo:* ${form.ramo}
📦 *Quantidade:* ${form.quantidade} arte(s)

🎭 *Estilo:* ${estiloLabel}
🎨 *Paleta:* ${paletaLabel}
📐 *Aplicações:* ${aplicacoesLabel}

📌 *Referências:* ${form.referencia || "Nenhuma"}
📝 *Observações:* ${form.observacoes || "Nenhuma"}

${form.nomeCliente ? `\n📋 *Contato:* ${form.nomeCliente} | ${form.telefone}` : ""}
    `.trim();

    window.open(`https://wa.me/5527997878391?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // Salva E abre WhatsApp
  async function finalizarComWhatsApp() {
    await salvarNoBanco();
    enviarWhatsApp();
  }

  const totalEtapas = 4;
  const progresso = (etapa / totalEtapas) * 100;

  // ── INPUT / SELECT helpers ──
  const inputStyle = {
    width: "100%", padding: "12px 14px", outline: "none",
    border: "1px solid " + t.border, backgroundColor: t.bgCard,
    color: t.text, fontSize: "14px", boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: "600",
    color: t.textSecundario, marginBottom: "6px",
    textTransform: "uppercase", letterSpacing: "0.1em",
  };
  const btnNext = (ativo) => ({
    flex: 1, padding: "14px", fontWeight: "600", cursor: ativo ? "pointer" : "not-allowed",
    backgroundColor: ativo ? t.btnPrimarioBg : t.border,
    color: ativo ? t.btnPrimarioText : t.textSecundario,
    border: "none", fontSize: "14px",
  });
  const btnBack = {
    flex: 1, padding: "14px", fontWeight: "600", cursor: "pointer",
    border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg, fontSize: "14px",
  };

  if (enviado) return (
    <div style={{ backgroundColor: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center px-6" style={{ maxWidth: "480px" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
        <h2 style={{ fontSize: "2rem", fontWeight: "300", color: t.text, marginBottom: "16px", fontFamily: "Georgia, serif" }}>
          Pedido recebido!
        </h2>
        <p style={{ color: t.textSecundario, lineHeight: 1.8, marginBottom: "32px", fontFamily: "system-ui" }}>
          Seu pedido foi registrado com sucesso. Nossa equipe entrará em contato em breve com orçamento e prazo de entrega.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate("/")}
            style={{ ...btnBack, flex: "none", padding: "12px 24px" }}>
            Voltar ao início
          </button>
          <button onClick={() => { setEnviado(false); setEtapa(1); setForm(FORM_INICIAL); }}
            style={{ ...btnNext(true), flex: "none", padding: "12px 24px" }}>
            Novo pedido
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px" }}>

        {/* HEADER */}
        <div className="text-center" style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.25em", color: t.textSecundario, marginBottom: "8px", fontFamily: "system-ui" }}>
            Comunicação Visual
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "300", color: t.text, fontFamily: "Georgia, serif" }}>
            Faça o Seu <em style={{ fontStyle: "italic" }}>Personalizado</em>
          </h1>
          <p style={{ color: t.textSecundario, marginTop: "12px", fontFamily: "system-ui", lineHeight: 1.7 }}>
            Crie sua logo ou identidade visual do zero com a gente.
          </p>
        </div>

        {/* PROGRESSO */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            {["Sobre você", "Estilo", "Cores & Uso", "Finalizar"].map((label, i) => (
              <span key={i} style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "system-ui",
                color: etapa > i ? t.text : t.textSecundario, fontWeight: etapa === i + 1 ? "700" : "400" }}>
                {label}
              </span>
            ))}
          </div>
          <div style={{ height: "2px", backgroundColor: t.border }}>
            <div style={{ height: "100%", width: `${progresso}%`, backgroundColor: t.text, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* ── ETAPA 1 — SOBRE ── */}
        {etapa === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif", marginBottom: "8px" }}>
              Conta um pouco sobre você
            </h2>

            {[
              { key: "nomeEmpresa", label: "Nome da empresa ou projeto *", placeholder: "Ex: Metzker Confecções" },
              { key: "slogan",      label: "Slogan (opcional)",              placeholder: "Ex: Veste quem tem estilo" },
              { key: "ramo",        label: "Ramo de atuação *",              placeholder: "Ex: Confecções, Academia, Restaurante..." },
              { key: "nomeCliente", label: "Seu nome (para contato) *",     placeholder: "Ex: João Silva" },
              { key: "telefone",    label: "Telefone / WhatsApp *",          placeholder: "Ex: (27) 99999-9999" },
              { key: "email",       label: "E-mail (opcional)",              placeholder: "Ex: joao@email.com" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder} style={inputStyle} />
              </div>
            ))}

            <div>
              <label style={labelStyle}>Quantidade de artes *</label>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid " + t.border, width: "fit-content" }}>
                <button onClick={() => setForm(prev => ({ ...prev, quantidade: Math.max(1, prev.quantidade - 1) }))}
                  style={{ padding: "10px 18px", backgroundColor: t.bgSecundario, color: t.text, border: "none", cursor: "pointer", fontSize: "18px" }}>−</button>
                <span style={{ padding: "10px 24px", color: t.text, fontWeight: "600", borderLeft: "1px solid " + t.border, borderRight: "1px solid " + t.border }}>
                  {form.quantidade}
                </span>
                <button onClick={() => setForm(prev => ({ ...prev, quantidade: prev.quantidade + 1 }))}
                  style={{ padding: "10px 18px", backgroundColor: t.bgSecundario, color: t.text, border: "none", cursor: "pointer", fontSize: "18px" }}>+</button>
              </div>
            </div>

            <button onClick={() => { if (form.nomeEmpresa && form.ramo && form.nomeCliente && form.telefone) setEtapa(2); }}
              disabled={!form.nomeEmpresa || !form.ramo || !form.nomeCliente || !form.telefone}
              style={btnNext(form.nomeEmpresa && form.ramo && form.nomeCliente && form.telefone)}>
              Próximo →
            </button>
          </div>
        )}

        {/* ── ETAPA 2 — ESTILO ── */}
        {etapa === 2 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif", marginBottom: "24px" }}>
              Qual estilo combina com você?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {ESTILOS_LOGO.map(estilo => (
                <button key={estilo.id} onClick={() => setForm(prev => ({ ...prev, estilo: estilo.id }))}
                  style={{
                    display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", textAlign: "left", cursor: "pointer",
                    border: "2px solid " + (form.estilo === estilo.id ? t.text : t.border),
                    backgroundColor: form.estilo === estilo.id ? t.text : t.bgCard,
                    color: form.estilo === estilo.id ? t.btnPrimarioText : t.text,
                  }}>
                  <span style={{ fontSize: "24px" }}>{estilo.emoji}</span>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "14px" }}>{estilo.label}</p>
                    <p style={{ fontSize: "12px", marginTop: "2px", color: form.estilo === estilo.id ? "rgba(255,255,255,0.65)" : t.textSecundario }}>
                      {estilo.descricao}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEtapa(1)} style={btnBack}>← Voltar</button>
              <button onClick={() => { if (form.estilo) setEtapa(3); }} disabled={!form.estilo} style={btnNext(!!form.estilo)}>
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* ── ETAPA 3 — CORES & USO ── */}
        {etapa === 3 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif", marginBottom: "24px" }}>
              Cores e onde vai usar
            </h2>

            <label style={labelStyle}>Paleta de cores *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "24px" }}>
              {PALETAS.map(paleta => (
                <button key={paleta.id} onClick={() => setForm(prev => ({ ...prev, paleta: paleta.id }))}
                  style={{
                    padding: "12px", textAlign: "center", cursor: "pointer",
                    border: "2px solid " + (form.paleta === paleta.id ? t.text : t.border),
                    backgroundColor: form.paleta === paleta.id ? t.text : t.bgCard,
                    color: form.paleta === paleta.id ? t.btnPrimarioText : t.text,
                  }}>
                  {paleta.cores.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "6px" }}>
                      {paleta.cores.map(cor => (
                        <span key={cor} style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: cor, display: "inline-block", border: "1px solid " + t.border }} />
                      ))}
                    </div>
                  )}
                  <span style={{ fontSize: "11px", fontWeight: "500", fontFamily: "system-ui" }}>{paleta.label}</span>
                </button>
              ))}
            </div>

            <label style={labelStyle}>Onde vai aplicar? (marque um ou mais) *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "24px" }}>
              {APLICACOES.map(ap => (
                <button key={ap.id} onClick={() => toggleAplicacao(ap.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", cursor: "pointer",
                    border: "2px solid " + (form.aplicacoes.includes(ap.id) ? t.text : t.border),
                    backgroundColor: form.aplicacoes.includes(ap.id) ? t.text : t.bgCard,
                    color: form.aplicacoes.includes(ap.id) ? t.btnPrimarioText : t.text,
                    fontSize: "13px", fontFamily: "system-ui",
                  }}>
                  <span>{ap.emoji}</span> {ap.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Referências ou inspirações (opcional)</label>
              <textarea value={form.referencia} onChange={e => setForm(prev => ({ ...prev, referencia: e.target.value }))}
                rows={3} placeholder="Ex: Gosto do estilo da Nike, quero algo moderno como..."
                style={{ ...inputStyle, resize: "none" }} />
            </div>

            {/* UPLOAD DE FOTOS */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Fotos de referência visual (opcional — até 5 imagens)</label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "32px", cursor: "pointer", border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard,
              }}>
                <span style={{ fontSize: "32px", marginBottom: "8px" }}>📸</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: t.text, fontFamily: "system-ui" }}>Clique para selecionar imagens</span>
                <span style={{ fontSize: "12px", color: t.textSecundario, marginTop: "4px", fontFamily: "system-ui" }}>PNG, JPG — até 5 arquivos</span>
                <input type="file" multiple accept="image/*" style={{ display: "none" }}
                  onChange={e => {
                    const files = Array.from(e.target.files).slice(0, 5);
                    setForm(prev => ({ ...prev, fotos: files.map(f => ({ file: f, url: URL.createObjectURL(f) })) }));
                  }} />
              </label>
              {form.fotos.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                  {form.fotos.map((foto, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={foto.url} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid " + t.border }} />
                      <button onClick={() => setForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, j) => j !== i) }))}
                        style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#ef4444", color: "white", border: "none", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEtapa(2)} style={btnBack}>← Voltar</button>
              <button onClick={() => { if (form.paleta && form.aplicacoes.length > 0) setEtapa(4); }}
                disabled={!form.paleta || form.aplicacoes.length === 0}
                style={btnNext(form.paleta && form.aplicacoes.length > 0)}>
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* ── ETAPA 4 — FINALIZAR ── */}
        {etapa === 4 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif", marginBottom: "24px" }}>
              Revise e finalize
            </h2>

            {/* RESUMO */}
            <div style={{ border: "1px solid " + t.border, padding: "24px", marginBottom: "20px" }}>
              {[
                { label: "Empresa",     value: form.nomeEmpresa },
                { label: "Slogan",      value: form.slogan || "—" },
                { label: "Ramo",        value: form.ramo },
                { label: "Contato",     value: `${form.nomeCliente} — ${form.telefone}${form.email ? " — " + form.email : ""}` },
                { label: "Quantidade",  value: form.quantidade + " arte(s)" },
                { label: "Estilo",      value: ESTILOS_LOGO.find(e => e.id === form.estilo)?.label || "—" },
                { label: "Paleta",      value: PALETAS.find(p => p.id === form.paleta)?.label || "—" },
                { label: "Aplicações",  value: form.aplicacoes.map(id => APLICACOES.find(a => a.id === id)?.label).join(", ") || "—" },
                { label: "Referências", value: form.referencia || "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "16px", padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: t.textSecundario, fontFamily: "system-ui" }}>{label}</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: t.text, fontFamily: "system-ui", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Fotos */}
            {form.fotos.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Fotos de referência ({form.fotos.length})</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {form.fotos.map((foto, i) => (
                    <img key={i} src={foto.url} alt="" style={{ width: "72px", height: "72px", objectFit: "cover", border: "1px solid " + t.border }} />
                  ))}
                </div>
              </div>
            )}

            {/* Observações finais */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Observações finais (opcional)</label>
              <textarea value={form.observacoes} onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3} placeholder="Alguma informação extra..."
                style={{ ...inputStyle, resize: "none" }} />
            </div>

            {/* Info */}
            <div style={{ backgroundColor: t.bgSecundario, border: "1px solid " + t.border, padding: "16px", marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, marginBottom: "6px", fontFamily: "system-ui" }}>ℹ️ Como funciona?</p>
              <p style={{ fontSize: "13px", color: t.textSecundario, lineHeight: 1.7, fontFamily: "system-ui" }}>
                Escolha como prefere enviar seu pedido. Você pode <strong>finalizar pelo site</strong> (o pedido fica registrado para nossa equipe)
                ou <strong>enviar pelo WhatsApp</strong> para falar diretamente. Se tiver fotos de referência, envie-as na conversa do WhatsApp.
              </p>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px 16px", marginBottom: "16px", color: "#dc2626", fontSize: "13px", fontFamily: "system-ui" }}>
                ⚠️ {erro}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEtapa(3)} style={btnBack}>← Voltar</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
              {/* BOTÃO PRINCIPAL — Finalizar pelo site */}
              <button onClick={salvarNoBanco} disabled={salvando}
                style={{
                  width: "100%", padding: "16px", fontWeight: "700", fontSize: "15px", cursor: salvando ? "not-allowed" : "pointer",
                  backgroundColor: salvando ? t.border : t.btnPrimarioBg, color: t.btnPrimarioText, border: "none", fontFamily: "system-ui",
                }}>
                {salvando ? "Salvando..." : "✅ Finalizar pedido pelo site"}
              </button>

              {/* BOTÃO SECUNDÁRIO — WhatsApp */}
              <button onClick={finalizarComWhatsApp} disabled={salvando}
                style={{
                  width: "100%", padding: "16px", fontWeight: "600", fontSize: "14px", cursor: salvando ? "not-allowed" : "pointer",
                  backgroundColor: "#22c55e", color: "white", border: "none", fontFamily: "system-ui",
                }}>
                💬 Enviar pelo WhatsApp (também salva o pedido)
              </button>

              {/* BOTÃO TERCIÁRIO — Só WhatsApp sem salvar */}
              <button onClick={enviarWhatsApp}
                style={{
                  width: "100%", padding: "12px", fontWeight: "400", fontSize: "13px", cursor: "pointer",
                  backgroundColor: "transparent", color: t.textSecundario, border: "1px solid " + t.border, fontFamily: "system-ui",
                }}>
                Só enviar pelo WhatsApp (sem salvar no site)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}