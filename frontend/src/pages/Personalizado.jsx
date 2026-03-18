import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

const APLICACOES = [
  { id: "camisa",  label: "Camisas / Uniformes", emoji: "👕" },
  { id: "banner",  label: "Banner / Impressão",  emoji: "🖼️" },
  { id: "digital", label: "Uso Digital",          emoji: "💻" },
  { id: "acm",     label: "Placa ACM",            emoji: "🪧" },
  { id: "todos",   label: "Todos os formatos",    emoji: "✅" },
];

const FORM_INICIAL = {
  nomeEmpresa: "", slogan: "", ramo: "",
  quantidade: 1, aplicacoes: [],
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
  const [erroTel, setErroTel] = useState("");

  function toggleAplicacao(id) {
    setForm(prev => ({
      ...prev,
      aplicacoes: prev.aplicacoes.includes(id)
        ? prev.aplicacoes.filter(a => a !== id)
        : [...prev.aplicacoes, id],
    }));
  }

  // Validação de telefone — só números, mín 10, máx 11 dígitos
  function validarTelefone(valor) {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length < 10) return "Telefone inválido — mínimo 10 dígitos";
    if (numeros.length > 11) return "Telefone inválido — máximo 11 dígitos";
    return "";
  }

  function handleTelefone(valor) {
    // Só aceita números, parênteses, traço e espaço
    const filtrado = valor.replace(/[^0-9()\-\s+]/g, "");
    setForm(prev => ({ ...prev, telefone: filtrado }));
    setErroTel(validarTelefone(filtrado));
  }

  // Validação de email simples
  function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const etapa1Valida = (
    form.nomeEmpresa.trim() &&
    form.ramo.trim() &&
    form.nomeCliente.trim() &&
    !validarTelefone(form.telefone) &&
    form.email.trim() && emailValido(form.email)
  );

  async function salvarNoBanco() {
    setSalvando(true);
    setErro("");
    try {
      await api.post("pedidos-personalizados/", {
        nome_empresa:  form.nomeEmpresa,
        slogan:        form.slogan,
        ramo:          form.ramo,
        quantidade:    form.quantidade,
        estilo:        "",
        paleta:        "",
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

  function enviarWhatsApp() {
    const aplicacoesLabel = form.aplicacoes
      .map(id => APLICACOES.find(a => a.id === id)?.label).join(", ");

    const msg = `
🎨 *PEDIDO DE LOGO PERSONALIZADO — METZKER*

👤 *Empresa/Nome:* ${form.nomeEmpresa}
💬 *Slogan:* ${form.slogan || "Não informado"}
🏢 *Ramo:* ${form.ramo}
📦 *Quantidade:* ${form.quantidade} arte(s)
📐 *Aplicações:* ${aplicacoesLabel || "Não informado"}

📌 *Referências:* ${form.referencia || "Nenhuma"}
📝 *Observações:* ${form.observacoes || "Nenhuma"}

📋 *Contato:* ${form.nomeCliente} | ${form.telefone} | ${form.email}
    `.trim();

    window.open(`https://wa.me/5527997878391?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function finalizarComWhatsApp() {
    await salvarNoBanco();
    enviarWhatsApp();
  }

  const totalEtapas = 3;
  const progresso = (etapa / totalEtapas) * 100;

  const inputStyle = {
    width: "100%", padding: "12px 14px", outline: "none",
    border: "1px solid " + t.border, backgroundColor: t.bgCard,
    color: t.text, fontSize: "14px", boxSizing: "border-box",
    fontFamily: "system-ui",
  };
  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: "600",
    color: t.textSecundario, marginBottom: "6px",
    textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "system-ui",
  };
  const btnNext = (ativo) => ({
    flex: 1, padding: "14px", fontWeight: "600",
    cursor: ativo ? "pointer" : "not-allowed",
    backgroundColor: ativo ? t.btnPrimarioBg : t.border,
    color: ativo ? t.btnPrimarioText : t.textSecundario,
    border: "none", fontSize: "14px", fontFamily: "system-ui",
  });
  const btnBack = {
    flex: 1, padding: "14px", fontWeight: "600", cursor: "pointer",
    border: "1px solid " + t.border, color: t.text,
    backgroundColor: t.bg, fontSize: "14px", fontFamily: "system-ui",
  };

  // ── SUCESSO ──
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
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
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

        {/* PROGRESSO — 3 etapas */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            {["Sobre você", "Aplicações & Referências", "Finalizar"].map((label, i) => (
              <span key={i} style={{
                fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "system-ui",
                color: etapa > i ? t.text : t.textSecundario,
                fontWeight: etapa === i + 1 ? "700" : "400",
              }}>{label}</span>
            ))}
          </div>
          <div style={{ height: "2px", backgroundColor: t.border }}>
            <div style={{ height: "100%", width: `${progresso}%`, backgroundColor: t.text, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* ══ ETAPA 1 — SOBRE VOCÊ ══ */}
        {etapa === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif", marginBottom: "8px" }}>
              Conta um pouco sobre você
            </h2>

            {/* Nome empresa */}
            <div>
              <label style={labelStyle}>Nome da empresa ou projeto *</label>
              <input value={form.nomeEmpresa}
                onChange={e => setForm(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                placeholder="Ex: Metzker Confecções" style={inputStyle} />
            </div>

            {/* Slogan */}
            <div>
              <label style={labelStyle}>Slogan (opcional)</label>
              <input value={form.slogan}
                onChange={e => setForm(prev => ({ ...prev, slogan: e.target.value }))}
                placeholder="Ex: Veste quem tem estilo" style={inputStyle} />
            </div>

            {/* Ramo */}
            <div>
              <label style={labelStyle}>Ramo de atuação *</label>
              <input value={form.ramo}
                onChange={e => setForm(prev => ({ ...prev, ramo: e.target.value }))}
                placeholder="Ex: Confecções, Academia, Restaurante..." style={inputStyle} />
            </div>

            {/* Nome cliente */}
            <div>
              <label style={labelStyle}>Seu nome (para contato) *</label>
              <input value={form.nomeCliente}
                onChange={e => setForm(prev => ({ ...prev, nomeCliente: e.target.value }))}
                placeholder="Ex: João Silva" style={inputStyle} />
            </div>

            {/* Telefone com validação */}
            <div>
              <label style={labelStyle}>Telefone / WhatsApp * (somente números)</label>
              <input value={form.telefone}
                onChange={e => handleTelefone(e.target.value)}
                placeholder="Ex: 27999999999"
                maxLength={15}
                inputMode="tel"
                style={{ ...inputStyle, borderColor: erroTel ? "#ef4444" : t.border }} />
              {erroTel && (
                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", fontFamily: "system-ui" }}>⚠️ {erroTel}</p>
              )}
            </div>

            {/* Email obrigatório */}
            <div>
              <label style={labelStyle}>E-mail *</label>
              <input value={form.email} type="email"
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ex: joao@email.com"
                style={{ ...inputStyle, borderColor: form.email && !emailValido(form.email) ? "#ef4444" : t.border }} />
              {form.email && !emailValido(form.email) && (
                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", fontFamily: "system-ui" }}>⚠️ E-mail inválido</p>
              )}
            </div>

            {/* Quantidade */}
            <div>
              <label style={labelStyle}>Quantidade de artes *</label>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid " + t.border, width: "fit-content" }}>
                <button onClick={() => setForm(prev => ({ ...prev, quantidade: Math.max(1, prev.quantidade - 1) }))}
                  style={{ padding: "10px 18px", backgroundColor: t.bgSecundario, color: t.text, border: "none", cursor: "pointer", fontSize: "18px" }}>−</button>
                <span style={{ padding: "10px 24px", color: t.text, fontWeight: "600", borderLeft: "1px solid " + t.border, borderRight: "1px solid " + t.border, fontFamily: "system-ui" }}>
                  {form.quantidade}
                </span>
                <button onClick={() => setForm(prev => ({ ...prev, quantidade: prev.quantidade + 1 }))}
                  style={{ padding: "10px 18px", backgroundColor: t.bgSecundario, color: t.text, border: "none", cursor: "pointer", fontSize: "18px" }}>+</button>
              </div>
            </div>

            <button onClick={() => { if (etapa1Valida) setEtapa(2); }}
              disabled={!etapa1Valida}
              style={btnNext(etapa1Valida)}>
              Próximo →
            </button>
          </div>
        )}

        {/* ══ ETAPA 2 — APLICAÇÕES & REFERÊNCIAS ══ */}
        {etapa === 2 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif", marginBottom: "24px" }}>
              Aplicações & Referências
            </h2>

            {/* Onde vai usar */}
            <label style={labelStyle}>Onde vai usar? (marque um ou mais) *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "24px" }}>
              {APLICACOES.map(ap => (
                <button key={ap.id} onClick={() => toggleAplicacao(ap.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
                    cursor: "pointer", fontFamily: "system-ui", fontSize: "13px",
                    border: "2px solid " + (form.aplicacoes.includes(ap.id) ? t.text : t.border),
                    backgroundColor: form.aplicacoes.includes(ap.id) ? t.text : t.bgCard,
                    color: form.aplicacoes.includes(ap.id) ? t.btnPrimarioText : t.text,
                  }}>
                  <span>{ap.emoji}</span> {ap.label}
                </button>
              ))}
            </div>

            {/* Referências */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Referências ou inspirações (opcional)</label>
              <textarea value={form.referencia}
                onChange={e => setForm(prev => ({ ...prev, referencia: e.target.value }))}
                rows={3} placeholder="Ex: Gosto do estilo da Nike, quero algo moderno..."
                style={{ ...inputStyle, resize: "none" }} />
            </div>

            {/* Upload fotos */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Fotos de referência visual (opcional — até 5 imagens)</label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "32px", cursor: "pointer",
                border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard,
              }}>
                <span style={{ fontSize: "32px", marginBottom: "8px" }}>📸</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: t.text, fontFamily: "system-ui" }}>
                  Clique para selecionar imagens
                </span>
                <span style={{ fontSize: "12px", color: t.textSecundario, marginTop: "4px", fontFamily: "system-ui" }}>
                  PNG, JPG — até 5 arquivos
                </span>
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
                        style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#ef4444", color: "white", border: "none", cursor: "pointer", fontSize: "11px" }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {form.fotos.length > 0 && (
                <p style={{ fontSize: "12px", color: t.textSecundario, marginTop: "8px", fontFamily: "system-ui" }}>
                  💡 As imagens serão enviadas pelo WhatsApp após finalizar o pedido.
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEtapa(1)} style={btnBack}>← Voltar</button>
              <button onClick={() => { if (form.aplicacoes.length > 0) setEtapa(3); }}
                disabled={form.aplicacoes.length === 0}
                style={btnNext(form.aplicacoes.length > 0)}>
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* ══ ETAPA 3 — FINALIZAR ══ */}
        {etapa === 3 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "400", color: t.text, fontFamily: "Georgia, serif", marginBottom: "24px" }}>
              Revise e finalize
            </h2>

            {/* Resumo */}
            <div style={{ border: "1px solid " + t.border, padding: "24px", marginBottom: "20px" }}>
              {[
                { label: "Empresa",     value: form.nomeEmpresa },
                { label: "Slogan",      value: form.slogan || "—" },
                { label: "Ramo",        value: form.ramo },
                { label: "Contato",     value: `${form.nomeCliente} — ${form.telefone} — ${form.email}` },
                { label: "Quantidade",  value: form.quantidade + " arte(s)" },
                { label: "Aplicações",  value: form.aplicacoes.map(id => APLICACOES.find(a => a.id === id)?.label).join(", ") || "—" },
                { label: "Referências", value: form.referencia || "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "16px", padding: "10px 0", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: t.textSecundario, fontFamily: "system-ui" }}>{label}</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: t.text, fontFamily: "system-ui", textAlign: "right", maxWidth: "60%" }}>{value}</span>
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

            {/* Observações */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Observações finais (opcional)</label>
              <textarea value={form.observacoes}
                onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3} placeholder="Alguma informação extra..."
                style={{ ...inputStyle, resize: "none" }} />
            </div>

            {/* Info */}
            <div style={{ backgroundColor: t.bgSecundario, border: "1px solid " + t.border, padding: "16px", marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, marginBottom: "6px", fontFamily: "system-ui" }}>ℹ️ Como funciona?</p>
              <p style={{ fontSize: "13px", color: t.textSecundario, lineHeight: 1.7, fontFamily: "system-ui" }}>
                Escolha como prefere finalizar. <strong>Finalizar pelo site</strong> registra o pedido no nosso painel.
                <strong> Enviar pelo WhatsApp</strong> salva e abre o WhatsApp com as informações preenchidas.
                {form.fotos.length > 0 && " Após abrir o WhatsApp, envie também as fotos de referência na mesma conversa."}
              </p>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px 16px", marginBottom: "16px", color: "#dc2626", fontSize: "13px", fontFamily: "system-ui" }}>
                ⚠️ {erro}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <button onClick={() => setEtapa(2)} style={btnBack}>← Voltar</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Finalizar pelo site */}
              <button onClick={salvarNoBanco} disabled={salvando}
                style={{
                  width: "100%", padding: "16px", fontWeight: "700", fontSize: "15px",
                  cursor: salvando ? "not-allowed" : "pointer",
                  backgroundColor: salvando ? t.border : t.btnPrimarioBg,
                  color: t.btnPrimarioText, border: "none", fontFamily: "system-ui",
                }}>
                {salvando ? "Salvando..." : "✅ Finalizar pedido pelo site"}
              </button>

              {/* WhatsApp + salva */}
              <button onClick={finalizarComWhatsApp} disabled={salvando}
                style={{
                  width: "100%", padding: "16px", fontWeight: "600", fontSize: "14px",
                  cursor: salvando ? "not-allowed" : "pointer",
                  backgroundColor: "#22c55e", color: "white", border: "none", fontFamily: "system-ui",
                }}>
                💬 Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}