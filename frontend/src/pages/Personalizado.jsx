import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

const ESTILOS_LOGO = [
  { id: "minimalista", label: "Minimalista", descricao: "Limpo, simples, tipografia elegante", emoji: "◻️" },
  { id: "moderno",     label: "Moderno",     descricao: "Geométrico, clean, contemporâneo",   emoji: "🔷" },
  { id: "classico",   label: "Clássico",    descricao: "Tradicional, brasão, formal",         emoji: "🏅" },
  { id: "divertido",  label: "Divertido",   descricao: "Colorido, dinâmico, jovem",           emoji: "🎨" },
  { id: "manuscrito", label: "Manuscrito",  descricao: "Letra cursiva, handmade, artesanal",  emoji: "✍️" },
];

const PALETAS = [
  { id: "preto-branco", label: "Preto & Branco", cores: ["#000000", "#ffffff"] },
  { id: "azul",         label: "Azul corporativo", cores: ["#1e3a8a", "#93c5fd"] },
  { id: "vermelho",     label: "Vermelho vibrante", cores: ["#dc2626", "#fca5a5"] },
  { id: "verde",        label: "Verde natural",     cores: ["#166534", "#86efac"] },
  { id: "dourado",      label: "Dourado premium",   cores: ["#92400e", "#fde68a"] },
  { id: "personalizada", label: "Me consulte",      cores: [] },
];

const APLICACOES = [
  { id: "camisa",  label: "Camisas / Uniformes", emoji: "👕" },
  { id: "banner",  label: "Banner / Impressão",  emoji: "🖼️" },
  { id: "digital", label: "Uso Digital",          emoji: "💻" },
  { id: "acm",     label: "Placa ACM",            emoji: "🪧" },
  { id: "todos",   label: "Todos os formatos",    emoji: "✅" },
];

export default function Personalizado() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState({
    nomeEmpresa: "",
    slogan: "",
    ramo: "",
    estilo: "",
    paleta: "",
    aplicacoes: [],
    referencia: "",
    observacoes: "",
    quantidade: 1,
    fotos: [],
  });
  const [enviado, setEnviado] = useState(false);

  function toggleAplicacao(id) {
    setForm(prev => ({
      ...prev,
      aplicacoes: prev.aplicacoes.includes(id)
        ? prev.aplicacoes.filter(a => a !== id)
        : [...prev.aplicacoes, id],
    }));
  }

  function gerarMensagemWhatsApp() {
    const aplicacoesLabel = form.aplicacoes.map(id =>
      APLICACOES.find(a => a.id === id)?.label
    ).join(", ");

    const estiloLabel = ESTILOS_LOGO.find(e => e.id === form.estilo)?.label || "";
    const paletaLabel = PALETAS.find(p => p.id === form.paleta)?.label || "";

    const msg = `
🎨 *PEDIDO DE LOGO PERSONALIZADO — METZKER*

👤 *Empresa/Nome:* ${form.nomeEmpresa}
💬 *Slogan:* ${form.slogan || "Não informado"}
🏢 *Ramo de atuação:* ${form.ramo}

🎭 *Estilo desejado:* ${estiloLabel}
🎨 *Paleta de cores:* ${paletaLabel}
📐 *Aplicações:* ${aplicacoesLabel}
📦 *Quantidade:* ${form.quantidade}

📌 *Referências/inspirações:* ${form.referencia || "Nenhuma"}
📝 *Observações:* ${form.observacoes || "Nenhuma"}
    `.trim();

    const encoded = encodeURIComponent(msg);
    // Fotos são enviadas separadamente pelo WhatsApp após o texto
    window.open(`https://wa.me/5527997878391?text=${encoded}`, "_blank");
    setEnviado(true);
  }

  const totalEtapas = 4;
  const progresso = (etapa / totalEtapas) * 100;

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: t.textSecundario }}>
            Comunicação Visual
          </p>
          <h1 className="text-4xl font-bold mb-3" style={{ color: t.text }}>
            Faça o Seu Personalizado
          </h1>
          <p className="text-lg" style={{ color: t.textSecundario }}>
            Crie sua logo ou identidade visual do zero com a gente.
          </p>
        </div>

        {!enviado ? (
          <>
            {/* BARRA DE PROGRESSO */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {["Sobre você", "Estilo", "Cores & Uso", "Revisão"].map((label, i) => (
                  <span key={i} className="text-xs uppercase tracking-wider"
                    style={{ color: etapa > i ? t.text : t.textSecundario, fontWeight: etapa === i + 1 ? "700" : "400" }}>
                    {label}
                  </span>
                ))}
              </div>
              <div style={{ height: "3px", backgroundColor: t.border }}>
                <div style={{ height: "100%", width: `${progresso}%`, backgroundColor: t.text, transition: "width 0.4s ease" }} />
              </div>
            </div>

            {/* ETAPA 1 — SOBRE A EMPRESA */}
            {etapa === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold mb-6" style={{ color: t.text }}>
                  Conta um pouco sobre você
                </h2>

                {[
                  { key: "nomeEmpresa", label: "Nome da empresa ou projeto *", placeholder: "Ex: Metzker Confecções" },
                  { key: "slogan",      label: "Slogan (opcional)",              placeholder: "Ex: Veste quem tem estilo" },
                  { key: "ramo",        label: "Ramo de atuação *",              placeholder: "Ex: Confecções, Academia, Restaurante..." },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                      style={{ color: t.textSecundario }}>{label}</label>
                    <input
                      value={form[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 outline-none transition"
                      style={{ border: "1px solid " + t.border, backgroundColor: t.bgCard, color: t.text, fontSize: "14px" }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2"
                    style={{ color: t.textSecundario }}>Quantidade de artes *</label>
                  <div className="flex items-center gap-0" style={{ border: "1px solid " + t.border, width: "fit-content" }}>
                    <button onClick={() => setForm(prev => ({ ...prev, quantidade: Math.max(1, prev.quantidade - 1) }))}
                      className="px-4 py-2 font-bold transition hover:opacity-70"
                      style={{ backgroundColor: t.bgSecundario, color: t.text }}>−</button>
                    <span className="px-5 py-2 font-semibold"
                      style={{ borderLeft: "1px solid " + t.border, borderRight: "1px solid " + t.border, color: t.text }}>
                      {form.quantidade}
                    </span>
                    <button onClick={() => setForm(prev => ({ ...prev, quantidade: prev.quantidade + 1 }))}
                      className="px-4 py-2 font-bold transition hover:opacity-70"
                      style={{ backgroundColor: t.bgSecundario, color: t.text }}>+</button>
                  </div>
                </div>

                <button
                  onClick={() => { if (form.nomeEmpresa && form.ramo) setEtapa(2); }}
                  disabled={!form.nomeEmpresa || !form.ramo}
                  className="w-full py-4 font-semibold transition"
                  style={{
                    backgroundColor: form.nomeEmpresa && form.ramo ? t.btnPrimarioBg : t.border,
                    color: form.nomeEmpresa && form.ramo ? t.btnPrimarioText : t.textSecundario,
                  }}>
                  Próximo →
                </button>
              </div>
            )}

            {/* ETAPA 2 — ESTILO */}
            {etapa === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: t.text }}>
                  Qual estilo combina com você?
                </h2>
                <div className="space-y-3 mb-8">
                  {ESTILOS_LOGO.map(estilo => (
                    <button key={estilo.id}
                      onClick={() => setForm(prev => ({ ...prev, estilo: estilo.id }))}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left transition"
                      style={{
                        border: "2px solid " + (form.estilo === estilo.id ? t.text : t.border),
                        backgroundColor: form.estilo === estilo.id ? t.text : t.bgCard,
                        color: form.estilo === estilo.id ? t.btnPrimarioText : t.text,
                      }}>
                      <span className="text-2xl">{estilo.emoji}</span>
                      <div>
                        <p className="font-semibold">{estilo.label}</p>
                        <p className="text-xs mt-0.5"
                          style={{ color: form.estilo === estilo.id ? "rgba(255,255,255,0.7)" : t.textSecundario }}>
                          {estilo.descricao}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEtapa(1)}
                    className="flex-1 py-4 font-semibold transition hover:opacity-70"
                    style={{ border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg }}>
                    ← Voltar
                  </button>
                  <button onClick={() => { if (form.estilo) setEtapa(3); }}
                    disabled={!form.estilo}
                    className="flex-1 py-4 font-semibold transition"
                    style={{
                      backgroundColor: form.estilo ? t.btnPrimarioBg : t.border,
                      color: form.estilo ? t.btnPrimarioText : t.textSecundario,
                    }}>
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3 — CORES & APLICAÇÕES */}
            {etapa === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: t.text }}>
                  Cores e onde vai usar
                </h2>

                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: t.textSecundario }}>
                  Paleta de cores
                </p>
                <div className="grid grid-cols-3 gap-2 mb-8">
                  {PALETAS.map(paleta => (
                    <button key={paleta.id}
                      onClick={() => setForm(prev => ({ ...prev, paleta: paleta.id }))}
                      className="px-3 py-3 text-sm text-center transition"
                      style={{
                        border: "2px solid " + (form.paleta === paleta.id ? t.text : t.border),
                        backgroundColor: form.paleta === paleta.id ? t.text : t.bgCard,
                        color: form.paleta === paleta.id ? t.btnPrimarioText : t.text,
                      }}>
                      {paleta.cores.length > 0 && (
                        <div className="flex justify-center gap-1 mb-2">
                          {paleta.cores.map(cor => (
                            <span key={cor} style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: cor, display: "inline-block", border: "1px solid " + t.border }} />
                          ))}
                        </div>
                      )}
                      <span className="text-xs font-medium">{paleta.label}</span>
                    </button>
                  ))}
                </div>

                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: t.textSecundario }}>
                  Onde vai aplicar? (pode marcar vários)
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {APLICACOES.map(ap => (
                    <button key={ap.id}
                      onClick={() => toggleAplicacao(ap.id)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition"
                      style={{
                        border: "2px solid " + (form.aplicacoes.includes(ap.id) ? t.text : t.border),
                        backgroundColor: form.aplicacoes.includes(ap.id) ? t.text : t.bgCard,
                        color: form.aplicacoes.includes(ap.id) ? t.btnPrimarioText : t.text,
                      }}>
                      <span>{ap.emoji}</span> {ap.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: t.textSecundario }}>
                    Referências ou inspirações (links, descrições)
                  </label>
                  <textarea
                    value={form.referencia}
                    onChange={e => setForm(prev => ({ ...prev, referencia: e.target.value }))}
                    rows={3}
                    placeholder="Ex: Gosto do estilo da Nike, quero algo moderno como..."
                    className="w-full px-4 py-3 outline-none transition"
                    style={{ border: "1px solid " + t.border, backgroundColor: t.bgCard, color: t.text, fontSize: "14px", resize: "none" }}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: t.textSecundario }}>
                    Fotos de modelo / referência visual (opcional)
                  </label>
                  <label className="flex flex-col items-center justify-center cursor-pointer py-8 transition hover:opacity-80"
                    style={{ border: "2px dashed " + t.borderForte, backgroundColor: t.bgCard }}>
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-sm font-medium" style={{ color: t.text }}>Clique para selecionar imagens</span>
                    <span className="text-xs mt-1" style={{ color: t.textSecundario }}>PNG, JPG, JPEG — até 5 arquivos</span>
                    <input type="file" multiple accept="image/*" className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files).slice(0, 5);
                        const previews = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
                        setForm(prev => ({ ...prev, fotos: previews }));
                      }} />
                  </label>
                  {form.fotos?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {form.fotos.map((foto, i) => (
                        <div key={i} className="relative group">
                          <img src={foto.url} alt={`Referência ${i+1}`}
                            className="object-cover"
                            style={{ width: "80px", height: "80px", border: "1px solid " + t.border }} />
                          <button
                            onClick={() => setForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, j) => j !== i) }))}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                            style={{ backgroundColor: "#ef4444", color: "white" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setEtapa(2)}
                    className="flex-1 py-4 font-semibold transition hover:opacity-70"
                    style={{ border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg }}>
                    ← Voltar
                  </button>
                  <button onClick={() => { if (form.paleta && form.aplicacoes.length > 0) setEtapa(4); }}
                    disabled={!form.paleta || form.aplicacoes.length === 0}
                    className="flex-1 py-4 font-semibold transition"
                    style={{
                      backgroundColor: form.paleta && form.aplicacoes.length > 0 ? t.btnPrimarioBg : t.border,
                      color: form.paleta && form.aplicacoes.length > 0 ? t.btnPrimarioText : t.textSecundario,
                    }}>
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 4 — REVISÃO */}
            {etapa === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: t.text }}>
                  Revise seu pedido
                </h2>

                <div className="space-y-3 mb-6" style={{ border: "1px solid " + t.border, padding: "24px" }}>
                  {[
                    { label: "Empresa", value: form.nomeEmpresa },
                    { label: "Slogan",  value: form.slogan || "—" },
                    { label: "Ramo",    value: form.ramo },
                    { label: "Quantidade", value: form.quantidade + " arte(s)" },
                    { label: "Estilo",  value: ESTILOS_LOGO.find(e => e.id === form.estilo)?.label },
                    { label: "Paleta",  value: PALETAS.find(p => p.id === form.paleta)?.label },
                    { label: "Aplicações", value: form.aplicacoes.map(id => APLICACOES.find(a => a.id === id)?.label).join(", ") },
                    { label: "Referências", value: form.referencia || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4 py-2"
                      style={{ borderBottom: "1px solid " + t.border }}>
                      <span className="text-xs uppercase tracking-wider" style={{ color: t.textSecundario }}>{label}</span>
                      <span className="text-sm font-medium text-right" style={{ color: t.text }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: t.textSecundario }}>
                    Observações finais
                  </label>
                  <textarea
                    value={form.observacoes}
                    onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={3}
                    placeholder="Alguma informação extra que queira nos passar..."
                    className="w-full px-4 py-3 outline-none"
                    style={{ border: "1px solid " + t.border, backgroundColor: t.bgCard, color: t.text, fontSize: "14px", resize: "none" }}
                  />
                </div>

                {/* Fotos de referência na revisão */}
                {form.fotos?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider mb-2" style={{ color: t.textSecundario }}>
                      Fotos de referência ({form.fotos.length})
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {form.fotos.map((foto, i) => (
                        <img key={i} src={foto.url} alt={`Ref ${i+1}`}
                          className="object-cover"
                          style={{ width: "72px", height: "72px", border: "1px solid " + t.border }} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 mb-6" style={{ backgroundColor: t.bgSecundario, border: "1px solid " + t.border }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: t.text }}>ℹ️ Como funciona?</p>
                  <p className="text-sm" style={{ color: t.textSecundario }}>
                    Ao clicar em "Enviar pelo WhatsApp", suas informações serão enviadas para nossa equipe.
                    {form.fotos?.length > 0 && " Após enviar o texto, envie também as fotos de referência na mesma conversa."}
                    {" "}Entraremos em contato para confirmar detalhes, enviar orçamento e prazo.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setEtapa(3)}
                    className="flex-1 py-4 font-semibold transition hover:opacity-70"
                    style={{ border: "1px solid " + t.border, color: t.text, backgroundColor: t.bg }}>
                    ← Voltar
                  </button>
                  <button onClick={gerarMensagemWhatsApp}
                    className="flex-1 py-4 font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: "#22c55e" }}>
                    💬 Enviar pelo WhatsApp
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* SUCESSO */
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: t.text }}>Pedido enviado!</h2>
            <p className="text-lg mb-8" style={{ color: t.textSecundario }}>
              Sua solicitação foi enviada pelo WhatsApp. Nossa equipe entrará em contato em breve com orçamento e prazo.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/")}
                className="px-8 py-3 font-semibold transition hover:opacity-70"
                style={{ border: "1px solid " + t.border, color: t.text }}>
                Voltar ao início
              </button>
              <button onClick={() => { setEnviado(false); setEtapa(1); setForm({ nomeEmpresa: "", slogan: "", ramo: "", estilo: "", paleta: "", aplicacoes: [], referencia: "", observacoes: "", quantidade: 1, fotos: [] }); }}
                className="px-8 py-3 font-semibold transition hover:opacity-80"
                style={{ backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText }}>
                Novo pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}