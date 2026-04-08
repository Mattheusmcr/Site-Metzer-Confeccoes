import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const GALERIA_KEY = "metzker_galeria_trabalhos";

function Toast({ mensagem, tipo, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-3"
      style={{ transform: "translateX(-50%)", backgroundColor: tipo === "sucesso" ? "#16a34a" : "#dc2626",
        fontFamily: "system-ui", maxWidth: "90vw", whiteSpace: "nowrap" }}>
      {tipo === "sucesso" ? "✅" : "❌"} {mensagem}
    </div>
  );
}

const CATEGORIAS_ADMIN = [
  {
    id: "roupas", label: "Item de Roupa",
    subcategorias: [
      { id: "gola-polo", label: "Polos" },
      { id: "camisa-comum", label: "Camisas" },
      { id: "calca", label: "Calças" },
    ],
  },
  {
    id: "comunicacao", label: "Comunicação Visual",
    subcategorias: [
      { id: "logos-acm", label: "Logos ACM" },
      { id: "impressoes", label: "Impressões" },
    ],
  },
];

// ─── CADASTRAR PRODUTO ─────────────────────────────────────────────────────
function CadastrarProduto({ mostrarToast, dark, estilos }) {
  const { text, subtext, inputBg, inputBorder, border } = estilos;
  const [form, setForm] = useState({ nome: "", descricao: "", preco: "", categoria: "", subcategoria: "" });
  const [imagens, setImagens] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "600", color: subtext, marginBottom: "4px", textTransform: "uppercase" };
  const subcatsDisponiveis = CATEGORIAS_ADMIN.find(c => c.id === form.categoria)?.subcategorias || [];

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "categoria") setForm(prev => ({ ...prev, categoria: value, subcategoria: "" }));
    else setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    if (!form.nome || !form.preco) { mostrarToast("Preencha nome e preço.", "erro"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("nome", form.nome); fd.append("descricao", form.descricao || "");
    fd.append("preco", form.preco); fd.append("ativo", "true");
    fd.append("categoria", form.categoria); fd.append("subcategoria", form.subcategoria);
    imagens.forEach(img => fd.append("imagens", img));
    try {
      await api.post("produtos/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      mostrarToast(`"${form.nome}" cadastrado com sucesso!`, "sucesso");
      setForm({ nome: "", descricao: "", preco: "", categoria: "", subcategoria: "" });
      setImagens([]); setPreviews([]);
    } catch (e) { console.error(e.response?.data); mostrarToast("Erro ao cadastrar.", "erro"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: "560px" }}>
      <h2 className="text-xl font-semibold mb-6" style={{ color: text }}>Cadastrar Produto</h2>
      <div className="flex flex-col gap-4">
        <div><label style={labelStyle}>Nome *</label><input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Camiseta Polo" style={inputStyle} /></div>
        <div><label style={labelStyle}>Descrição {form.categoria === "comunicacao" ? "(ex: Banner 1,5m x 80cm)" : ""}</label>
          <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={4} placeholder={form.categoria === "comunicacao" ? "Banner 1,5m x 80cm" : "Descreva o produto..."} style={{ ...inputStyle, textAlign: "justify", resize: "none" }} /></div>
        <div><label style={labelStyle}>Preço *</label><input type="number" name="preco" value={form.preco} onChange={handleChange} placeholder="129.90" style={inputStyle} /></div>
        <div>
          <label style={labelStyle}>Categoria</label>
          <select name="categoria" value={form.categoria} onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">— Selecione —</option>
            {CATEGORIAS_ADMIN.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        {subcatsDisponiveis.length > 0 && (
          <div>
            <label style={labelStyle}>Subcategoria</label>
            <select name="subcategoria" value={form.subcategoria} onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">— Selecione —</option>
              {subcatsDisponiveis.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            {form.subcategoria && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: dark ? "#374151" : "#F2EDE6", color: text, border: "1px solid " + border }}>
                📂 {CATEGORIAS_ADMIN.find(c => c.id === form.categoria)?.label} › {subcatsDisponiveis.find(s => s.id === form.subcategoria)?.label}
              </div>
            )}
          </div>
        )}
        <div>
          <label style={labelStyle}>Imagens ({imagens.length} selecionada{imagens.length !== 1 ? "s" : ""})</label>
          <label className="flex flex-col items-center justify-center cursor-pointer rounded-xl p-8"
            style={{ border: "2px dashed " + inputBorder, backgroundColor: dark ? "#374151" : "#F9F7F4" }}>
            <span className="text-3xl mb-2">📸</span>
            <span style={{ color: subtext, fontSize: "14px" }}>Clique para selecionar imagens</span>
            <input type="file" multiple accept="image/*" onChange={e => { const f = Array.from(e.target.files); setImagens(f); setPreviews(f.map(x => URL.createObjectURL(x))); }} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} className="w-20 h-20 object-cover rounded-lg" style={{ border: "1px solid " + inputBorder }} />
                  <button onClick={() => { const n = imagens.filter((_, j) => j !== i); setImagens(n); setPreviews(n.map(f => URL.createObjectURL(f))); }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs items-center justify-center opacity-0 group-hover:opacity-100 flex"
                    style={{ backgroundColor: "#ef4444", color: "white" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleSubmit} disabled={loading} className="py-3 rounded-lg font-semibold text-white"
          style={{ backgroundColor: loading ? "#9ca3af" : "#1a1a1a", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Salvando..." : "Salvar Produto"}
        </button>
      </div>
    </div>
  );
}

// ─── LISTAR / EDITAR PRODUTOS ──────────────────────────────────────────────
function ListarProdutos({ mostrarToast, dark, estilos }) {
  const { text, subtext, cardBg, border, inputBg, inputBorder } = estilos;
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [novasImagens, setNovasImagens] = useState([]);
  const [previews, setPreviews] = useState([]);

  const inputStyle = { padding: "7px 10px", borderRadius: "6px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" };
  const labelStyle = { fontSize: "11px", color: subtext, display: "block", marginBottom: "3px", textTransform: "uppercase" };
  const subcatsEdicao = CATEGORIAS_ADMIN.find(c => c.id === editando?.categoria)?.subcategorias || [];

  const carregar = useCallback(async () => {
    try { const res = await api.get("produtos/"); setProdutos(res.data); }
    catch { mostrarToast("Erro ao carregar produtos.", "erro"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function toggleAtivo(p) {
    try {
      await api.patch(`produtos/${p.id}/`, {
        nome: p.nome,
        preco: p.preco,
        ativo: !p.ativo,
        categoria: p.categoria || "",
        subcategoria: p.subcategoria || "",
      });
      mostrarToast(`"${p.nome}" ${!p.ativo ? "ativado" : "desativado"}!`, "sucesso");
      carregar();
    } catch (e) {
      console.error("toggleAtivo erro:", e.response?.data);
      mostrarToast("Erro ao alterar status.", "erro");
    }
  }

  async function excluir(p) {
    if (!confirm(`Excluir "${p.nome}"?`)) return;
    try { await api.delete(`produtos/${p.id}/`); mostrarToast(`"${p.nome}" excluído.`, "sucesso"); carregar(); }
    catch { mostrarToast("Erro ao excluir.", "erro"); }
  }

  async function salvarEdicao() {
    try {
      if (novasImagens.length > 0) {
        // Com imagens: usa FormData (multipart)
        const fd = new FormData();
        fd.append("nome", editando.nome);
        fd.append("preco", editando.preco);
        fd.append("descricao", editando.descricao || "");
        fd.append("ativo", editando.ativo ? "true" : "false");
        fd.append("categoria", editando.categoria || "");
        fd.append("subcategoria", editando.subcategoria || "");
        novasImagens.forEach(img => fd.append("imagens", img));
        await api.patch(`produtos/${editando.id}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        // Sem imagens novas: usa JSON puro (garante que campos vazios/string sejam aceitos)
        await api.patch(`produtos/${editando.id}/`, {
          nome: editando.nome,
          preco: editando.preco,
          descricao: editando.descricao || "",
          ativo: editando.ativo,
          categoria: editando.categoria || "",
          subcategoria: editando.subcategoria || "",
        });
      }
      mostrarToast("Produto atualizado!", "sucesso");
      setEditando(null); setNovasImagens([]); setPreviews([]); carregar();
    } catch (e) {
      console.error("Erro ao atualizar:", e.response?.data);
      mostrarToast("Erro ao atualizar produto.", "erro");
    }
  }

  function labelCategoria(p) {
    const cat = CATEGORIAS_ADMIN.find(c => c.id === p.categoria);
    if (!cat) return null;
    const sub = cat.subcategorias.find(s => s.id === p.subcategoria);
    return sub ? `${cat.label} › ${sub.label}` : cat.label;
  }

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6" style={{ color: text }}>Produtos ({produtos.length})</h2>
      <div className="space-y-3">
        {produtos.map(p => (
          <div key={p.id} className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: border }}>
                {p.imagens?.[0]?.imagem ? <img src={p.imagens[0].imagem} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">{p.categoria === "comunicacao" ? "🖼️" : "👕"}</div>}
              </div>

              {editando?.id === p.id ? (
                <div className="flex-1 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div><label style={labelStyle}>Nome</label><input value={editando.nome} onChange={e => setEditando({ ...editando, nome: e.target.value })} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Preço</label><input type="number" value={editando.preco} onChange={e => setEditando({ ...editando, preco: e.target.value })} style={inputStyle} /></div>
                  </div>
                  <div>
                    <label style={labelStyle}>Descrição {editando.categoria === "comunicacao" ? "(dimensões, ex: 1,5m x 80cm)" : ""}</label>
                    <textarea value={editando.descricao || ""} onChange={e => setEditando({ ...editando, descricao: e.target.value })} rows={2} style={{ ...inputStyle, resize: "none" }} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Categoria</label>
                      <select value={editando.categoria || ""} onChange={e => setEditando({ ...editando, categoria: e.target.value, subcategoria: "" })} style={{ ...inputStyle, cursor: "pointer" }}>
                        <option value="">— Sem categoria —</option>
                        {CATEGORIAS_ADMIN.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    {subcatsEdicao.length > 0 && (
                      <div>
                        <label style={labelStyle}>Subcategoria</label>
                        <select value={editando.subcategoria || ""} onChange={e => setEditando({ ...editando, subcategoria: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                          <option value="">— Sem subcategoria —</option>
                          {subcatsEdicao.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  {editando.categoria && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: dark ? "#374151" : "#F2EDE6", color: text, border: "1px solid " + border }}>
                      📂 {CATEGORIAS_ADMIN.find(c => c.id === editando.categoria)?.label}
                      {editando.subcategoria && ` › ${subcatsEdicao.find(s => s.id === editando.subcategoria)?.label}`}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Visível no catálogo</label>
                    <button onClick={() => setEditando({ ...editando, ativo: !editando.ativo })}
                      className="px-3 py-1 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: editando.ativo ? "#16a34a" : "#dc2626", color: "white" }}>
                      {editando.ativo ? "✅ Ativo" : "❌ Inativo"}
                    </button>
                  </div>
                  <div>
                    <label style={labelStyle}>Trocar Imagens (substitui todas)</label>
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg text-sm"
                      style={{ border: "1px dashed " + inputBorder, color: subtext, display: "inline-flex" }}>
                      📸 Selecionar novas imagens
                      <input type="file" multiple accept="image/*" className="hidden"
                        onChange={e => { const novos = Array.from(e.target.files); setNovasImagens(prev => [...prev, ...novos].slice(0, 5)); setPreviews(prev => [...prev, ...novos.map(x => URL.createObjectURL(x))].slice(0, 5)); e.target.value = ""; }} />
                    </label>
                    {previews.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {previews.map((src, i) => <img key={i} src={src} className="w-14 h-14 object-cover rounded-lg" style={{ border: "1px solid " + inputBorder }} alt="" />)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={salvarEdicao} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "#16a34a" }}>Salvar</button>
                    <button onClick={() => { setEditando(null); setNovasImagens([]); setPreviews([]); }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold"
                      style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: text }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: text }}>{p.nome}</p>
                    <p className="text-sm" style={{ color: subtext }}>R$ {Number(p.preco).toFixed(2)}</p>
                    {labelCategoria(p) && (
                      <span className="text-xs px-2 py-0.5 rounded-full mt-1 mr-2 inline-block"
                        style={{ backgroundColor: dark ? "#374151" : "#F2EDE6", color: subtext }}>
                        📂 {labelCategoria(p)}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ backgroundColor: p.ativo ? "#dcfce7" : "#fee2e2", color: p.ativo ? "#16a34a" : "#dc2626" }}>
                      {p.ativo ? "● Ativo" : "● Inativo"}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    <button onClick={() => toggleAtivo(p)} className="px-3 py-1.5 text-sm rounded-lg font-medium"
                      style={{ backgroundColor: p.ativo ? "#fee2e2" : "#dcfce7", color: p.ativo ? "#dc2626" : "#16a34a" }}>
                      {p.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => { setEditando({ ...p }); setNovasImagens([]); setPreviews([]); }}
                      className="px-3 py-1.5 text-sm rounded-lg"
                      style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: text }}>Editar</button>
                    <button onClick={() => excluir(p)} className="px-3 py-1.5 text-sm rounded-lg"
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>Excluir</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── DASHBOARD ──────────────────────────────────────────────────────────────
function Dashboard({ dark, estilos }) {
  const { text, subtext, cardBg, border } = estilos;
  const [pedidos, setPedidos] = useState([]);
  const [personalizados, setPersonalizados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("pedidos/"), api.get("pedidos-personalizados/")])
      .then(([r1, r2]) => { setPedidos(r1.data); setPersonalizados(r2.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  const totalPedidos = pedidos.length + personalizados.length;
  const faturamento = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
  const novos = pedidos.filter(p => (p.status||"novo")==="novo").length + personalizados.filter(p => p.status==="novo").length;
  const concluidos = pedidos.filter(p => p.status==="concluido").length + personalizados.filter(p => p.status==="concluido").length;

  // Top produtos
  const contagem = {};
  pedidos.forEach(p => (p.itens||[]).forEach(i => {
    contagem[i.produto_nome] = (contagem[i.produto_nome]||0) + i.quantidade;
  }));
  const topProdutos = Object.entries(contagem).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Pedidos por mês (últimos 6)
  const meses = {};
  [...pedidos, ...personalizados].forEach(p => {
    const d = new Date(p.data_pedido);
    const k = `${d.getMonth()+1}/${d.getFullYear()}`;
    meses[k] = (meses[k]||0)+1;
  });

  const cards = [
    { label: "Total de pedidos", valor: totalPedidos, icone: "📦", cor: "#2563eb" },
    { label: "Faturamento estimado", valor: `R$ ${faturamento.toFixed(2)}`, icone: "💰", cor: "#16a34a" },
    { label: "Pedidos novos", valor: novos, icone: "🆕", cor: "#d97706" },
    { label: "Concluídos", valor: concluidos, icone: "✅", cor: "#7c3aed" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6" style={{ color: text }}>📈 Dashboard</h2>

      {/* Cards métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{c.icone}</div>
            <p style={{ fontSize: "22px", fontWeight: "700", color: c.cor, fontFamily: "system-ui" }}>{c.valor}</p>
            <p style={{ fontSize: "12px", color: subtext, fontFamily: "system-ui", marginTop: "4px" }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top produtos */}
        <div className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
          <p className="font-semibold mb-4" style={{ color: text }}>🏆 Produtos mais pedidos</p>
          {topProdutos.length === 0 && <p style={{ color: subtext, fontSize: "13px" }}>Nenhum pedido de catálogo ainda.</p>}
          {topProdutos.map(([nome, qtd], i) => {
            const max = topProdutos[0]?.[1] || 1;
            return (
              <div key={i} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: "13px", color: text, fontFamily: "system-ui" }}>{nome}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: text }}>{qtd} un</span>
                </div>
                <div style={{ height: "6px", backgroundColor: dark ? "#374151" : "#e5e7eb", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: `${(qtd/max)*100}%`, backgroundColor: "#2563eb", borderRadius: "3px" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Distribuição por status */}
        <div className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
          <p className="font-semibold mb-4" style={{ color: text }}>📊 Status dos pedidos</p>
          {[
            { id: "novo",         label: "Novos",         cor: "#2563eb" },
            { id: "em_andamento", label: "Em andamento",  cor: "#d97706" },
            { id: "concluido",    label: "Concluídos",    cor: "#16a34a" },
            { id: "cancelado",    label: "Cancelados",    cor: "#dc2626" },
          ].map(s => {
            const total = [...pedidos, ...personalizados].filter(p => (p.status||"novo") === s.id).length;
            const pct = totalPedidos > 0 ? Math.round((total/totalPedidos)*100) : 0;
            return (
              <div key={s.id} className="flex items-center gap-3 mb-3">
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: s.cor, flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: text, fontFamily: "system-ui", flex: 1 }}>{s.label}</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: text }}>{total}</span>
                <span style={{ fontSize: "11px", color: subtext }}>({pct}%)</span>
              </div>
            );
          })}
          <div style={{ marginTop: "16px", padding: "12px", backgroundColor: dark ? "#374151" : "#f3f4f6", borderRadius: "8px" }}>
            <p style={{ fontSize: "12px", color: subtext, fontFamily: "system-ui" }}>
              Pedidos personalizados: <strong style={{ color: text }}>{personalizados.length}</strong> &nbsp;|&nbsp;
              Portfólio: <strong style={{ color: text }}>{pedidos.length}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PEDIDOS ───────────────────────────────────────────────────────────────
function VerPedidos({ mostrarToast, dark, estilos }) {
  const { text, subtext, cardBg, border } = estilos;
  const [pedidos, setPedidos] = useState([]);
  const [personalizados, setPersonalizados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState(null);
  const [aba, setAba] = useState("catalogo");
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [historicoStatus, setHistoricoStatus] = useState({});
  const ultimoTotalRef = useRef(null);

  // ── Notificação sonora de novo pedido ──
  function tocarSom() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.35);
      });
    } catch {}
  }

  const carregar = useCallback(() => {
    return Promise.all([
      api.get("pedidos/"),
      api.get("pedidos-personalizados/"),
    ]).then(([r1, r2]) => {
      const novoTotal = r1.data.length + r2.data.length;
      if (ultimoTotalRef.current !== null && novoTotal > ultimoTotalRef.current) {
        tocarSom();
        mostrarToast(`🔔 Novo pedido recebido!`, "sucesso");
      }
      ultimoTotalRef.current = novoTotal;
      setPedidos(r1.data);
      setPersonalizados(r2.data);
    }).catch(() => mostrarToast("Erro ao carregar pedidos.", "erro"))
      .finally(() => setLoading(false));
  }, [mostrarToast]);

  useEffect(() => {
    carregar();
    // Polling a cada 60 segundos para detectar novos pedidos
    const interval = setInterval(carregar, 60000);
    return () => clearInterval(interval);
  }, [carregar]);

  function exportarExcel() {
    const todosP = [
      ...pedidos.map(p => ({
        Tipo: "Catálogo", ID: p.id, Nome: p.nome_cliente, Telefone: p.telefone, Email: p.email||"",
        Status: p.status||"novo", Data: new Date(p.data_pedido).toLocaleDateString("pt-BR"),
        Total: p.total?.toFixed(2)||"0.00", Pagamento: p.forma_pagamento,
        Cidade: p.cidade, Estado: p.estado,
      })),
      ...personalizados.map(p => ({
        Tipo: "Personalizado", ID: p.id, Nome: p.nome_cliente, Telefone: p.telefone, Email: p.email||"",
        Status: p.status, Data: new Date(p.data_pedido).toLocaleDateString("pt-BR"),
        Total: "-", Pagamento: "-", Cidade: "-", Estado: "-",
      })),
    ];
    const header = Object.keys(todosP[0]||{}).join(";");
    const linhas = todosP.map(r => Object.values(r).join(";"));
    const csv = [header, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `pedidos_metzker_${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.csv`;
    a.click(); URL.revokeObjectURL(url);
    mostrarToast("Exportado com sucesso!", "sucesso");
  }

  function registrarHistorico(id, novoStatus) {
    const entrada = { status: novoStatus, data: new Date().toLocaleString("pt-BR") };
    setHistoricoStatus(prev => ({ ...prev, [id]: [...(prev[id] || []), entrada] }));
  }

  async function atualizarStatus(id, status) {
    try {
      await api.patch(`pedidos-personalizados/${id}/`, { status });
      setPersonalizados(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      registrarHistorico(`pers-${id}`, status);
      mostrarToast("Status atualizado!", "sucesso");
    } catch { mostrarToast("Erro ao atualizar.", "erro"); }
  }

  async function atualizarStatusCatalogo(id, status) {
    try {
      await api.patch(`pedidos/${id}/`, { status });
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      registrarHistorico(`cat-${id}`, status);
      mostrarToast("Status atualizado!", "sucesso");
    } catch { mostrarToast("Erro ao atualizar.", "erro"); }
  }

  async function excluirPedido() {
    if (!pedidoParaExcluir) return;
    try {
      if (pedidoParaExcluir.tipo === "catalogo") {
        await api.delete(`pedidos/${pedidoParaExcluir.id}/`);
        setPedidos(prev => prev.filter(p => p.id !== pedidoParaExcluir.id));
      } else {
        await api.delete(`pedidos-personalizados/${pedidoParaExcluir.id}/`);
        setPersonalizados(prev => prev.filter(p => p.id !== pedidoParaExcluir.id));
      }
      mostrarToast("Pedido excluído com sucesso.", "sucesso");
    } catch {
      mostrarToast("Erro ao excluir pedido.", "erro");
    } finally {
      setPedidoParaExcluir(null);
    }
  }

  const ESTILOS_MAP = { minimalista: "Minimalista", moderno: "Moderno", classico: "Clássico", divertido: "Divertido", manuscrito: "Manuscrito" };
  const PALETAS_MAP = { "preto-branco": "Preto & Branco", azul: "Azul corporativo", vermelho: "Vermelho vibrante", verde: "Verde natural", dourado: "Dourado premium", personalizada: "Me consulte" };
  const APLICACOES_MAP = { camisa: "Camisas/Uniformes", banner: "Banner/Impressão", digital: "Uso Digital", acm: "Placa ACM", todos: "Todos os formatos" };
  const STATUS_CORES = { novo: "#2563eb", em_andamento: "#d97706", concluido: "#16a34a", cancelado: "#dc2626" };

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold" style={{ color: text }}>Pedidos</h2>
        <button onClick={exportarExcel}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2"
          style={{ backgroundColor: "#16a34a", cursor: "pointer", fontFamily: "system-ui" }}>
          📥 Exportar Excel
        </button>
      </div>

      {/* Busca e filtro */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="🔍 Buscar por nome ou email..."
          style={{ flex: 1, padding: "9px 14px", border: "1px solid " + border, backgroundColor: dark ? "#374151" : "#fff",
            color: text, borderRadius: "8px", fontSize: "13px", fontFamily: "system-ui", outline: "none" }} />
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          style={{ padding: "9px 14px", border: "1px solid " + border, backgroundColor: dark ? "#374151" : "#fff",
            color: text, borderRadius: "8px", fontSize: "13px", fontFamily: "system-ui", outline: "none" }}>
          <option value="todos">Todos os status</option>
          <option value="novo">Novo</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button onClick={carregar} title="Atualizar pedidos"
          style={{ padding: "9px 14px", border: "1px solid " + border, backgroundColor: dark ? "#374151" : "#fff",
            color: text, borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
          🔄
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2" style={{ color: text }}>Pedidos</h2>

      {/* ABAS */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: "2px solid " + border }}>
        {[
          { id: "catalogo",     label: `🛒 Portfólio / Catálogo (${pedidos.length})` },
          { id: "personalizado", label: `🎨 Personalizados (${personalizados.length})` },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className="px-4 py-2 text-sm font-medium transition"
            style={{
              borderBottom: aba === a.id ? "2px solid " + text : "2px solid transparent",
              color: aba === a.id ? text : subtext, backgroundColor: "transparent", marginBottom: "-2px",
            }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── PEDIDOS DO CATÁLOGO ── */}
      {aba === "catalogo" && (
        <div className="space-y-3">
          {(() => {
            const filtrados = pedidos.filter(p => {
              const q = busca.toLowerCase();
              const matchBusca = !q || (p.nome_cliente||"").toLowerCase().includes(q) || (p.email||"").toLowerCase().includes(q) || String(p.id) === q;
              const matchStatus = filtroStatus === "todos" || (p.status||"novo") === filtroStatus;
              return matchBusca && matchStatus;
            });
            return filtrados.length === 0 ? <p style={{ color: subtext }}>Nenhum pedido encontrado.</p> : null;
          })()}
          {pedidos.filter(p => {
            const q = busca.toLowerCase();
            const matchBusca = !q || (p.nome_cliente||"").toLowerCase().includes(q) || (p.email||"").toLowerCase().includes(q);
            const matchStatus = filtroStatus === "todos" || (p.status||"novo") === filtroStatus;
            return matchBusca && matchStatus;
          }).map(p => {
            const expandido = aberto === `cat-${p.id}`;
            const totalPedido = p.total || p.itens?.reduce((acc, i) => acc + parseFloat(i.produto_preco) * i.quantidade, 0) || 0;
            return (
              <div key={p.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
                <button onClick={() => setAberto(expandido ? null : `cat-${p.id}`)}
                  className="w-full p-5 flex items-center justify-between text-left">
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2 py-1 rounded-lg font-mono" style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: subtext }}>#{p.id}</span>
                    <div>
                      <p className="font-semibold" style={{ color: text }}>{p.nome_cliente}</p>
                      <p className="text-xs" style={{ color: subtext }}>{new Date(p.data_pedido).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-sm" style={{ color: text }}>R$ {Number(totalPedido).toFixed(2)}</span>
                    <span style={{ color: subtext }}>{expandido ? "▲" : "▼"}</span>
                  </div>
                </button>
                {expandido && (
                  <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid " + border }}>
                    <div className="grid md:grid-cols-3 gap-4 pt-4">
                      {[
                        { titulo: "👤 Cliente", conteudo: <><p className="font-semibold text-sm" style={{ color: text }}>{p.nome_cliente}</p><p className="text-sm mt-1" style={{ color: subtext }}>📱 {p.telefone}</p></> },
                        { titulo: "📍 Endereço", conteudo: p.rua ? <div className="text-sm space-y-0.5" style={{ color: text }}><p>{p.rua}, {p.numero}</p><p>{p.bairro} — {p.cidade}/{p.estado}</p></div> : <p className="text-sm" style={{ color: subtext }}>Retirada no local</p> },
                        { titulo: "💳 Pagamento", conteudo: <p className="font-semibold text-sm" style={{ color: text }}>{p.forma_pagamento || "Não informado"}</p> },
                      ].map(({ titulo, conteudo }) => (
                        <div key={titulo} className="rounded-lg p-4" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                          <p className="text-xs font-bold uppercase mb-3" style={{ color: subtext }}>{titulo}</p>
                          {conteudo}
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid " + border }}>
                      <table className="w-full text-sm">
                        <thead><tr style={{ backgroundColor: dark ? "#374151" : "#f3f4f6" }}>
                          <th className="text-left p-3 font-semibold" style={{ color: text }}>Produto</th>
                          <th className="text-center p-3 font-semibold" style={{ color: text }}>Tamanho</th>
                          <th className="text-center p-3 font-semibold" style={{ color: text }}>Qtd.</th>
                          <th className="text-right p-3 font-semibold" style={{ color: text }}>Preço Unit.</th>
                          <th className="text-right p-3 font-semibold" style={{ color: text }}>Subtotal</th>
                        </tr></thead>
                        <tbody>
                          {(p.itens || []).map((item, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? (dark ? "#1f2937" : "#fff") : (dark ? "#111827" : "#f9fafb") }}>
                              <td className="p-3 font-medium" style={{ color: text }}>{item.produto_nome}</td>
                              <td className="p-3 text-center" style={{ color: subtext }}>{item.tamanho}</td>
                              <td className="p-3 text-center" style={{ color: subtext }}>{item.quantidade}</td>
                              <td className="p-3 text-right" style={{ color: subtext }}>R$ {parseFloat(item.produto_preco).toFixed(2)}</td>
                              <td className="p-3 text-right font-semibold" style={{ color: text }}>R$ {(parseFloat(item.produto_preco) * item.quantidade).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ backgroundColor: dark ? "#374151" : "#f3f4f6", borderTop: "2px solid " + border }}>
                            <td colSpan={4} className="p-3 text-right font-bold" style={{ color: text }}>Total do Pedido</td>
                            <td className="p-3 text-right font-bold text-base" style={{ color: text }}>
                              R$ {((p.itens || []).reduce((acc, i) => acc + parseFloat(i.produto_preco) * i.quantidade, 0)).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    {/* Status pedido catálogo */}
                    <div className="mt-2 mb-3">
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: subtext }}>Status do pedido</p>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { id: "novo",         label: "Novo",         cor: "#2563eb" },
                          { id: "em_andamento", label: "Em andamento", cor: "#d97706" },
                          { id: "concluido",    label: "Concluído",    cor: "#16a34a" },
                          { id: "cancelado",    label: "Cancelado",    cor: "#dc2626" },
                        ].map(s => (
                          <button key={s.id} onClick={() => atualizarStatusCatalogo(p.id, s.id)}
                            style={{
                              padding: "5px 12px", fontSize: "12px", fontWeight: "600",
                              cursor: "pointer", border: "none", borderRadius: "6px", fontFamily: "system-ui",
                              backgroundColor: (p.status || "novo") === s.id ? s.cor : (dark ? "#374151" : "#e5e7eb"),
                              color: (p.status || "novo") === s.id ? "white" : text,
                              cursor: "pointer",
                            }}>{s.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* HISTÓRICO DE STATUS */}
                    {historicoStatus[`cat-${p.id}`]?.length > 0 && (
                      <div className="rounded-lg p-3 mt-2 mb-3" style={{ backgroundColor: dark ? "#111827" : "#f9fafb", border: "1px solid " + border }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>📋 Histórico de status</p>
                        {historicoStatus[`cat-${p.id}`].map((h, i) => (
                          <p key={i} style={{ fontSize: "11px", color: subtext, fontFamily: "system-ui" }}>
                            {h.data} → <strong style={{ color: text }}>{h.status}</strong>
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <a href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: "#16a34a" }}>💬 WhatsApp</a>
                      <button onClick={() => setPedidoParaExcluir({ id: p.id, tipo: "catalogo", nome: p.nome_cliente })}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                        🗑️ Excluir pedido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── PEDIDOS PERSONALIZADOS ── */}
      {aba === "personalizado" && (
        <div className="space-y-3">
          {personalizados.filter(p => {
            const q = busca.toLowerCase();
            return (!q || (p.nome_cliente||"").toLowerCase().includes(q) || (p.email||"").toLowerCase().includes(q))
              && (filtroStatus === "todos" || p.status === filtroStatus);
          }).length === 0 && <p style={{ color: subtext }}>Nenhum pedido encontrado.</p>}
          {personalizados.filter(p => {
            const q = busca.toLowerCase();
            return (!q || (p.nome_cliente||"").toLowerCase().includes(q) || (p.email||"").toLowerCase().includes(q))
              && (filtroStatus === "todos" || p.status === filtroStatus);
          }).map(p => {
            const expandido = aberto === `per-${p.id}`;
            return (
              <div key={p.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
                <button onClick={() => setAberto(expandido ? null : `per-${p.id}`)}
                  className="w-full p-5 flex items-center justify-between text-left">
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2 py-1 rounded-lg font-mono" style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: subtext }}>#{p.id}</span>
                    <div>
                      <p className="font-semibold" style={{ color: text }}>{p.nome_empresa}</p>
                      <p className="text-xs" style={{ color: subtext }}>{p.nome_cliente} — {new Date(p.data_pedido).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: STATUS_CORES[p.status] + "20", color: STATUS_CORES[p.status] }}>
                      ● {p.status === "novo" ? "Novo" : p.status === "em_andamento" ? "Em andamento" : p.status === "concluido" ? "Concluído" : "Cancelado"}
                    </span>
                    <span style={{ color: subtext }}>{expandido ? "▲" : "▼"}</span>
                  </div>
                </button>

                {expandido && (
                  <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid " + border }}>
                    <div className="grid md:grid-cols-2 gap-4 pt-4">

                      {/* CONTATO */}
                      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>👤 Contato</p>
                        <p className="font-semibold text-sm" style={{ color: text }}>{p.nome_cliente}</p>
                        {p.telefone && <p className="text-sm" style={{ color: subtext }}>📱 {p.telefone}</p>}
                        {p.email && <p className="text-sm" style={{ color: subtext }}>📧 {p.email}</p>}
                        {p.email && <p className="text-sm" style={{ color: subtext }}>📧 {p.email}</p>}
                        {p.observacoes && p.observacoes.includes("CEP") && (
                          <p className="text-sm" style={{ color: subtext }}>
                            📍 {p.observacoes.split("Descrição:")[0].replace("Obs:","").trim()}
                          </p>
                        )}
                      </div>

                      {/* CATEGORIA E TIPO */}
                      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>📦 Pedido</p>
                        <p className="text-sm font-semibold" style={{ color: text }}>
                          {p.estilo === "roupas" ? "👕 Item de Roupa" : p.estilo === "comunicacao" ? "🖨️ Comunicação Visual" : p.ramo}
                        </p>
                        <p className="text-sm" style={{ color: subtext }}>Total: <strong style={{ color: text }}>{p.quantidade} unidades</strong></p>
                        {p.slogan && <p className="text-sm" style={{ color: subtext }}>Dimensões: {p.slogan}</p>}
                      </div>
                    </div>

                    {/* COMBINAÇÕES — exibe o campo referencia formatado */}
                    {p.referencia && (
                      <div className="rounded-lg p-4" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-3" style={{ color: subtext }}>🎨 Combinações / Detalhes</p>
                        {p.referencia.includes("#1") ? (
                          p.referencia.split("\n").filter(l => l.trim()).map((linha, i, arr) => {
                            const partes = linha.split("|").map(s => s.trim()).filter(Boolean);
                            const titulo = partes[0] || "";
                            const detalhes = partes.slice(1);
                            return (
                              <div key={i} className="mb-4 pb-4" style={{ borderBottom: i < arr.length - 1 ? "1px solid " + border : "none" }}>
                                <p className="text-sm font-bold mb-2" style={{ color: text }}>{titulo}</p>
                                {detalhes.map((parte, j) => {
                                  const [chave, ...resto] = parte.split(":");
                                  const valor = resto.join(":").trim();
                                  if (chave.trim() === "Total") {
                                    return <p key={j} className="text-xs font-semibold mt-1" style={{ color: text }}>Total: {valor}</p>;
                                  }
                                  if (chave.trim().startsWith("Adulto") || chave.trim().startsWith("Baby") || chave.trim().startsWith("Infantil") || chave.trim().startsWith("Tamanhos")) {
                                    const grupo = chave.trim().replace(/\[.*\]/, "");
                                    const tamStr = parte.match(/\[([^\]]+)\]/)?.[1] || valor;
                                    const tams = tamStr.split(" ").filter(Boolean).map(t => {
                                      const [tam, qtd] = t.split(":");
                                      return qtd ? `${tam}: ${qtd} peça${parseInt(qtd) !== 1 ? "s" : ""}` : t;
                                    });
                                    return (
                                      <div key={j} className="mt-1">
                                        {grupo && <p className="text-xs font-semibold" style={{ color: subtext }}>{grupo}:</p>}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {tams.map((t, k) => (
                                            <span key={k} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: text }}>{t}</span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return <p key={j} className="text-xs mt-1" style={{ color: subtext }}><strong>{chave.trim()}:</strong> {valor}</p>;
                                })}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm" style={{ color: subtext, whiteSpace: "pre-wrap" }}>{p.referencia}</p>
                        )}
                      </div>
                    )}

                    {/* DESCRIÇÃO */}
                    {p.observacoes && (
                      <div className="rounded-lg p-4" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>📝 Descrição do cliente</p>
                        <p className="text-sm" style={{ color: subtext, whiteSpace: "pre-wrap" }}>
                          {p.observacoes.includes("Descrição:") 
                            ? p.observacoes.split("Descrição:")[1]?.trim() || "—"
                            : p.observacoes}
                        </p>
                      </div>
                    )}

                    {/* HISTÓRICO DE STATUS */}
                    {historicoStatus[`pers-${p.id}`]?.length > 0 && (
                      <div className="rounded-lg p-3 mt-2" style={{ backgroundColor: dark ? "#111827" : "#f9fafb", border: "1px solid " + border }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>📋 Histórico de status</p>
                        {historicoStatus[`pers-${p.id}`].map((h, i) => (
                          <p key={i} style={{ fontSize: "11px", color: subtext, fontFamily: "system-ui" }}>
                            {h.data} → <strong style={{ color: text }}>{h.status}</strong>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* IMAGENS DE REFERÊNCIA */}
                    {(p.imagem1 || p.imagem2 || p.imagem3 || p.imagem4 || p.imagem5) && (
                      <div className="rounded-lg p-4" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-3" style={{ color: subtext }}>🖼️ Imagens de referência</p>
                        <div className="flex gap-3 flex-wrap">
                          {[p.imagem1, p.imagem2, p.imagem3, p.imagem4, p.imagem5].filter(Boolean).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={`Referência ${i+1}`}
                                className="rounded object-cover hover:opacity-80 transition"
                                style={{ width: "90px", height: "90px", border: "2px solid " + border }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ATUALIZAR STATUS */}
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: subtext }}>Atualizar status</p>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { id: "novo",         label: "Novo",         cor: "#2563eb" },
                          { id: "em_andamento", label: "Em andamento", cor: "#d97706" },
                          { id: "concluido",    label: "Concluído",    cor: "#16a34a" },
                          { id: "cancelado",    label: "Cancelado",    cor: "#dc2626" },
                        ].map(s => (
                          <button key={s.id}
                            onClick={() => atualizarStatus(p.id, s.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            style={{
                              backgroundColor: p.status === s.id ? s.cor : (dark ? "#374151" : "#e5e7eb"),
                              color: p.status === s.id ? "white" : text,
                              cursor: "pointer",
                            }}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {p.telefone && (
                        <a href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                          style={{ backgroundColor: "#16a34a" }}>
                          💬 Falar com {p.nome_cliente} pelo WhatsApp
                        </a>
                      )}
                      <button onClick={() => setPedidoParaExcluir({ id: p.id, tipo: "personalizado", nome: p.nome_empresa })}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                        🗑️ Excluir pedido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {pedidoParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
            style={{ backgroundColor: dark ? "#1f2937" : "#ffffff" }}>
            <div className="text-center mb-6">
              <p className="text-4xl mb-4">🗑️</p>
              <h3 className="text-xl font-bold mb-2" style={{ color: text }}>Excluir pedido?</h3>
              <p className="text-sm" style={{ color: subtext }}>
                Você está prestes a excluir o pedido de <strong style={{ color: text }}>{pedidoParaExcluir.nome}</strong>.
              </p>
              <p className="text-sm mt-2 font-medium" style={{ color: "#dc2626" }}>
                ⚠️ Esta ação é irreversível. O pedido será removido permanentemente do painel e o cliente perderá o registro.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPedidoParaExcluir(null)}
                className="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-70"
                style={{ border: "1px solid " + border, color: text, backgroundColor: "transparent" }}>
                Cancelar
              </button>
              <button onClick={excluirPedido}
                className="flex-1 py-3 rounded-lg font-semibold text-white transition hover:opacity-80"
                style={{ backgroundColor: "#dc2626" }}>
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ESTOQUE ───────────────────────────────────────────────────────────────
function GerenciarEstoque({ mostrarToast, dark, estilos }) {
  const { text, subtext, cardBg, border, inputBg, inputBorder } = estilos;
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valores, setValores] = useState({});
  const [tamanhosOriginais, setTamanhosOriginais] = useState({});
  const [novoTamanho, setNovoTamanho] = useState({});
  const [salvando, setSalvando] = useState({});

  const carregar = useCallback(async () => {
    try {
      const res = await api.get("produtos/");
      setProdutos(res.data);
      const vals = {}, originais = {};
      res.data.forEach(p => {
        vals[p.id] = {}; originais[p.id] = [];
        (p.estoques || []).forEach(e => { vals[p.id][e.tamanho] = e.quantidade; originais[p.id].push(e.tamanho); });
      });
      setValores(vals); setTamanhosOriginais(originais);
    } catch { mostrarToast("Erro ao carregar.", "erro"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function removerTamanho(prodId, tamanho) {
    if (tamanhosOriginais[prodId]?.includes(tamanho)) {
      try { await api.delete("estoques/remover/", { data: { produto: prodId, tamanho } }); setTamanhosOriginais(prev => ({ ...prev, [prodId]: prev[prodId].filter(t => t !== tamanho) })); }
      catch { mostrarToast("Erro ao remover tamanho.", "erro"); return; }
    }
    setValores(prev => { const novo = { ...prev[prodId] }; delete novo[tamanho]; return { ...prev, [prodId]: novo }; });
    mostrarToast(`Tamanho ${tamanho} removido.`, "sucesso");
  }

  async function salvarEstoque(prodId) {
    setSalvando(prev => ({ ...prev, [prodId]: true }));
    try {
      const entradas = Object.entries(valores[prodId] || {}).filter(([tamanho]) => tamanho && tamanho.trim());
      if (entradas.length === 0) { mostrarToast("Adicione ao menos um tamanho/formato.", "erro"); return; }
      await Promise.all(entradas.map(([tamanho, quantidade]) =>
        api.post("estoques/atualizar/", { produto: prodId, tamanho: tamanho.trim(), quantidade: parseInt(quantidade) || 0 })
      ));
      mostrarToast("Estoque salvo!", "sucesso"); await carregar();
    } catch (e) {
      console.error(e.response?.data);
      mostrarToast("Erro ao salvar estoque. Verifique os dados.", "erro");
    }
    finally { setSalvando(prev => ({ ...prev, [prodId]: false })); }
  }

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: text }}>Gerenciar Estoque</h2>
      <p className="text-sm mb-6" style={{ color: subtext }}>
        Para produtos de <strong>Comunicação Visual</strong>, use os "tamanhos" para informar dimensões (ex: 1,5m x 80cm, A4, A3).
      </p>
      <div className="space-y-4">
        {produtos.map(p => {
          const tams = Object.keys(valores[p.id] || {});
          const isComunicacao = p.categoria === "comunicacao";
          return (
            <div key={p.id} className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
              <div className="flex items-center gap-2 mb-4">
                <p className="font-semibold" style={{ color: text }}>{p.nome}</p>
                {isComunicacao && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
                    🖼️ Comunicação Visual
                  </span>
                )}
              </div>
              {tams.length === 0 && <p className="text-sm mb-4" style={{ color: subtext }}>
                {isComunicacao ? "Adicione os formatos disponíveis (ex: A4, Banner 1m, etc)" : "Nenhum tamanho cadastrado ainda."}
              </p>}
              <div className="flex gap-3 flex-wrap mb-4">
                {tams.map(tam => (
                  <div key={tam} className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold" style={{ color: subtext }}>{tam}</span>
                      <button onClick={() => removerTamanho(p.id, tam)} className="text-xs leading-none" style={{ color: "#ef4444" }}>✕</button>
                    </div>
                    <input type="number" min="0" value={valores[p.id]?.[tam] ?? 0}
                      onChange={e => setValores(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tam]: e.target.value } }))}
                      className="text-center text-sm rounded-lg"
                      style={{ width: "64px", padding: "6px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, outline: "none" }} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input value={novoTamanho[p.id] || ""}
                  onChange={e => setNovoTamanho(prev => ({ ...prev, [p.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") { const tam = (novoTamanho[p.id] || "").trim().toUpperCase(); if (!tam || valores[p.id]?.[tam] !== undefined) return; setValores(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tam]: 0 } })); setNovoTamanho(prev => ({ ...prev, [p.id]: "" })); }}}
                  placeholder={isComunicacao ? "A4, Banner 1m, 80x60cm..." : "P, M, G, XGG, 38..."}
                  style={{ padding: "6px 10px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, outline: "none", width: "160px", borderRadius: "6px", fontSize: "13px" }} />
                <button onClick={() => { const tam = (novoTamanho[p.id] || "").trim().toUpperCase(); if (!tam || valores[p.id]?.[tam] !== undefined) return; setValores(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tam]: 0 } })); setNovoTamanho(prev => ({ ...prev, [p.id]: "" })); }}
                  className="px-3 py-1.5 text-sm rounded-lg font-medium text-white" style={{ backgroundColor: "#374151" }}>
                  + {isComunicacao ? "Formato" : "Tamanho"}
                </button>
              </div>
              <button onClick={() => salvarEstoque(p.id)} disabled={salvando[p.id]}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: salvando[p.id] ? "#9ca3af" : "#16a34a", cursor: salvando[p.id] ? "not-allowed" : "pointer" }}>
                {salvando[p.id] ? "Salvando..." : "💾 Salvar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── INFORMAÇÕES ───────────────────────────────────────────────────────────
function EditarInfos({ mostrarToast, dark, estilos }) {
  const { text, subtext, inputBg, inputBorder, cardBg, border } = estilos;
  const [form, setForm] = useState({ whatsapp: "", email: "", endereco: "", cidade: "", atendimento: "" });
  const [galeria, setGaleria] = useState(() => {
    try { const s = localStorage.getItem(GALERIA_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [novaUrl, setNovaUrl] = useState("");
  const [novoArquivo, setNovoArquivo] = useState(null);
  const [novoPreview, setNovoPreview] = useState("");

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "600", color: subtext, marginBottom: "4px", textTransform: "uppercase" };

  function salvarGaleria(novaLista) {
    setGaleria(novaLista);
    localStorage.setItem(GALERIA_KEY, JSON.stringify(novaLista));
    // Dispara evento para o Home.jsx atualizar (se estiver aberto em outra aba)
    window.dispatchEvent(new StorageEvent("storage", { key: GALERIA_KEY, newValue: JSON.stringify(novaLista) }));
  }

  function adicionarUrl() {
    if (!novaUrl.trim()) return;
    salvarGaleria([...galeria, novaUrl.trim()]);
    setNovaUrl("");
    mostrarToast("Foto adicionada à galeria!", "sucesso");
  }

  function adicionarArquivo() {
    if (!novoArquivo) return;
    // Converte para base64 e salva (funciona para arquivos locais)
    const reader = new FileReader();
    reader.onload = e => {
      salvarGaleria([...galeria, e.target.result]);
      setNovoArquivo(null); setNovoPreview("");
      mostrarToast("Foto adicionada à galeria!", "sucesso");
    };
    reader.readAsDataURL(novoArquivo);
  }

  function removerFoto(idx) {
    const nova = galeria.filter((_, i) => i !== idx);
    salvarGaleria(nova);
    mostrarToast("Foto removida.", "sucesso");
  }

  function moverFoto(idx, direcao) {
    const nova = [...galeria];
    const destino = idx + direcao;
    if (destino < 0 || destino >= nova.length) return;
    [nova[idx], nova[destino]] = [nova[destino], nova[idx]];
    salvarGaleria(nova);
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <h2 className="text-xl font-semibold mb-6" style={{ color: text }}>Editar Informações</h2>

      {/* DADOS DE CONTATO */}
      <div className="flex flex-col gap-4 mb-8">
        {[
          { key: "whatsapp", label: "WhatsApp", placeholder: "(27) 99885-3043" },
          { key: "email", label: "E-mail", placeholder: "contato@metzker.com" },
          { key: "endereco", label: "Endereço", placeholder: "Rua Tobias Barreto, 37" },
          { key: "cidade", label: "Cidade / Estado", placeholder: "Vila Velha - ES" },
          { key: "atendimento", label: "Horário de Atendimento", placeholder: "Segunda a Sexta, 9h às 18h" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} style={inputStyle} />
          </div>
        ))}
        <button onClick={() => mostrarToast("Informações atualizadas!", "sucesso")}
          className="py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: "#000000" }}>
          Salvar Informações
        </button>
      </div>

      {/* GALERIA DE TRABALHOS */}
      <div style={{ borderTop: "2px solid " + (dark ? "#374151" : "#E8E0D5"), paddingTop: "32px" }}>
        <h3 className="text-lg font-semibold mb-1" style={{ color: text }}>🖼️ Galeria de Trabalhos</h3>
        <p className="text-sm mb-6" style={{ color: subtext }}>
          Essas fotos aparecem na seção <strong>"Nossos Trabalhos"</strong> da página inicial.
          São exibidas em grupos de 3, com navegação.
        </p>

        {/* ADICIONAR POR URL */}
        <div className="mb-4">
          <label style={labelStyle}>Adicionar por URL</label>
          <div className="flex gap-2">
            <input value={novaUrl} onChange={e => setNovaUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && adicionarUrl()}
              placeholder="https://exemplo.com/foto.jpg"
              style={{ ...inputStyle, flex: 1 }} />
            <button onClick={adicionarUrl}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white shrink-0"
              style={{ backgroundColor: "#374151" }}>Adicionar</button>
          </div>
        </div>

        {/* ADICIONAR POR ARQUIVO */}
        <div className="mb-6">
          <label style={labelStyle}>Adicionar por Arquivo</label>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg text-sm"
              style={{ border: "1px dashed " + inputBorder, color: subtext, backgroundColor: dark ? "#374151" : "#F9F7F4" }}>
              📁 Escolher arquivo
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files[0]; if (!f) return; setNovoArquivo(f); setNovoPreview(URL.createObjectURL(f)); }} />
            </label>
            {novoPreview && (
              <img src={novoPreview} className="w-12 h-12 object-cover rounded-lg"
                style={{ border: "1px solid " + inputBorder }} alt="preview" />
            )}
            {novoArquivo && (
              <button onClick={adicionarArquivo}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "#16a34a" }}>Adicionar</button>
            )}
          </div>
        </div>

        {/* LISTA DE FOTOS */}
        {galeria.length === 0 && (
          <p className="text-sm py-6 text-center" style={{ color: subtext }}>
            Nenhuma foto na galeria ainda. Adicione acima.
          </p>
        )}
        <div className="space-y-2">
          {galeria.map((url, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
              <img src={url} className="w-14 h-14 object-cover rounded-lg shrink-0"
                style={{ border: "1px solid " + border }} alt={`Trabalho ${i + 1}`} />
              <span className="flex-1 text-xs truncate" style={{ color: subtext }}>
                Foto {i + 1}
              </span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => moverFoto(i, -1)} disabled={i === 0}
                  className="w-7 h-7 rounded flex items-center justify-center text-sm transition hover:opacity-70"
                  style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: text, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                <button onClick={() => moverFoto(i, 1)} disabled={i === galeria.length - 1}
                  className="w-7 h-7 rounded flex items-center justify-center text-sm transition hover:opacity-70"
                  style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: text, opacity: i === galeria.length - 1 ? 0.3 : 1 }}>↓</button>
                <button onClick={() => removerFoto(i)}
                  className="w-7 h-7 rounded flex items-center justify-center text-xs transition hover:opacity-70"
                  style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PRINCIPAL ───────────────────────────────────────────────────────
const abas = [
  { id: "dashboard", label: "📈 Dashboard"  },
  { id: "cadastrar", label: "➕ Cadastrar" },
  { id: "produtos",  label: "📦 Produtos"  },
  { id: "pedidos",   label: "🧾 Pedidos"   },
  { id: "estoque",   label: "📊 Estoque"   },
  { id: "infos",     label: "✏️ Informações" },
];

export default function Admin() {
  const { dark } = useTheme();
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const bg = dark ? "#111827" : "#ffffff";
  const text = dark ? "#ffffff" : "#000000";
  const border = dark ? "#374151" : "#e5e7eb";
  const estilos = { text, subtext: dark ? "#9ca3af" : "#6b7280", cardBg: dark ? "#1f2937" : "#f9fafb", border, inputBg: dark ? "#374151" : "#ffffff", inputBorder: dark ? "#4b5563" : "#d1d5db" };

  function mostrarToast(mensagem, tipo) { setToast({ mensagem, tipo }); }
  const props = { mostrarToast, dark, estilos };

  return (
    <div style={{ backgroundColor: bg, color: text, minHeight: "100vh" }}>
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8" style={{ color: text }}>Painel Administrativo</h1>
        <div className="flex gap-2 flex-wrap mb-8 pb-4" style={{ borderBottom: "1px solid " + border }}>
          {abas.map(aba => (
            <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: abaAtiva === aba.id ? (dark ? "#ffffff" : "#000000") : (dark ? "#1f2937" : "#f3f4f6"),
                color: abaAtiva === aba.id ? (dark ? "#000000" : "#ffffff") : text,
                border: "1px solid " + (abaAtiva === aba.id ? "transparent" : border) }}>
              {aba.label}
            </button>
          ))}
        </div>
        {abaAtiva === "dashboard" && <Dashboard        {...props} />}
        {abaAtiva === "cadastrar" && <CadastrarProduto {...props} />}
        {abaAtiva === "produtos"  && <ListarProdutos   {...props} />}
        {abaAtiva === "pedidos"   && <VerPedidos        {...props} />}
        {abaAtiva === "estoque"   && <GerenciarEstoque  {...props} />}
        {abaAtiva === "infos"     && <EditarInfos        {...props} />}
      </div>
    </div>
  );
}