import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import {
  DashboardIcon, PlusIcon, PackageIcon, ReceiptIcon, ChartIcon, EditIcon,
  FolderIcon, CameraIcon, SaveIcon, CoinIcon, BagIcon, PaletteIcon,
  PulseIcon, UsersIcon, DocIcon, TrophyIcon, ListIcon, PhoneIcon,
  ShirtIcon, ImageIcon, CheckIcon, CloseIcon, TrashIcon, TagIcon,
  ClockIcon, ChevronDownIcon, UserIcon, PinIcon, CardIcon, TruckIcon,
  StoreIcon, MailIcon, WhatsAppIcon, PrinterIcon, DownloadIcon,
  SearchIcon, RefreshIcon,
} from "../components/Icons";

const GALERIA_KEY = "metzker_galeria_trabalhos";

function Toast({ mensagem, tipo, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-[70px] left-1/2 z-[9999] px-6 py-4 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-3"
      style={{ transform: "translateX(-50%)", backgroundColor: tipo === "sucesso" ? "#16a34a" : "#dc2626",
        fontFamily: "system-ui", maxWidth: "90vw", whiteSpace: "nowrap" }}>
      {tipo === "sucesso" ? <CheckIcon size={16} strokeWidth={2.2} /> : <CloseIcon size={15} strokeWidth={2.2} />} {mensagem}
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
                <FolderIcon size={13} strokeWidth={1.6} /> {CATEGORIAS_ADMIN.find(c => c.id === form.categoria)?.label} › {subcatsDisponiveis.find(s => s.id === form.subcategoria)?.label}
              </div>
            )}
          </div>
        )}
        <div>
          <label style={labelStyle}>Imagens ({imagens.length} selecionada{imagens.length !== 1 ? "s" : ""})</label>
          <label className="flex flex-col items-center justify-center cursor-pointer rounded-xl p-8"
            style={{ border: "2px dashed " + inputBorder, backgroundColor: dark ? "#374151" : "#F9F7F4" }}>
            <span className="mb-2" style={{ color: subtext }}><CameraIcon size={28} strokeWidth={1.4} /></span>
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
        <button onClick={handleSubmit} disabled={loading} className="cursor-pointer py-3 rounded-lg font-semibold text-white"
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
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: border, color: subtext }}>
                {p.imagens?.[0]?.imagem ? <img src={p.imagens[0].imagem} className="w-full h-full object-cover" alt="" />
                  : (p.categoria === "comunicacao" ? <ImageIcon size={22} strokeWidth={1.4} /> : <ShirtIcon size={22} strokeWidth={1.4} />)}
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
                      <FolderIcon size={13} strokeWidth={1.6} /> {CATEGORIAS_ADMIN.find(c => c.id === editando.categoria)?.label}
                      {editando.subcategoria && ` › ${subcatsEdicao.find(sub => sub.id === editando.subcategoria)?.label}`}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Visível no catálogo</label>
                    <button onClick={() => setEditando({ ...editando, ativo: !editando.ativo })}
                      className="px-3 py-1 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
                      style={{ backgroundColor: editando.ativo ? "#16a34a" : "#dc2626", color: "white" }}>
                      {editando.ativo ? <><CheckIcon size={13} strokeWidth={2} />Ativo</> : <><CloseIcon size={12} strokeWidth={2} />Inativo</>}
                    </button>
                  </div>
                  <div>
                    <label style={labelStyle}>Trocar Imagens (substitui todas)</label>
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg text-sm"
                      style={{ border: "1px dashed " + inputBorder, color: subtext, display: "inline-flex" }}>
                      <CameraIcon size={15} strokeWidth={1.6} /> Selecionar novas imagens
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
                    <button onClick={salvarEdicao} className="cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "#16a34a" }}>Salvar</button>
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
                      <span className="text-xs px-2 py-0.5 rounded-full mt-1 mr-2 inline-flex items-center gap-1"
                        style={{ backgroundColor: dark ? "#374151" : "#F2EDE6", color: subtext }}>
                        <FolderIcon size={11} strokeWidth={1.6} /> {labelCategoria(p)}
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

  const totalGeral = pedidos.length + personalizados.length;
  const faturamento = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
  const STATUS_LABELS = { novo:"Novo", em_andamento:"Em andamento", concluido:"Concluido", cancelado:"Cancelado" };
  const STATUS_CORES_D = { novo:"#2563eb", em_andamento:"#d97706", concluido:"#16a34a", cancelado:"#dc2626" };

  const statusCat = {novo:0, em_andamento:0, concluido:0, cancelado:0};
  pedidos.forEach(p => { const s = p.status||"novo"; statusCat[s] = (statusCat[s]||0)+1; });
  const statusPers = {novo:0, em_andamento:0, concluido:0, cancelado:0};
  personalizados.forEach(p => { const s = p.status||"novo"; statusPers[s] = (statusPers[s]||0)+1; });

  const contagem = {};
  pedidos.forEach(p => (p.itens||[]).forEach(i => {
    contagem[i.produto_nome] = (contagem[i.produto_nome]||0) + i.quantidade;
  }));
  const topProdutos = Object.entries(contagem).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const cards = [
    { label: "Total de pedidos", valor: totalGeral, Icone: PackageIcon, cor: "#2563eb" },
    { label: "Faturamento estimado", valor: "R$ " + faturamento.toFixed(2), Icone: CoinIcon, cor: "#16a34a" },
    { label: "Catalogo", valor: pedidos.length, Icone: BagIcon, cor: "#7c3aed" },
    { label: "Personalizados", valor: personalizados.length, Icone: PaletteIcon, cor: "#d97706" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: text }}><DashboardIcon size={20} strokeWidth={1.6} /> Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
            <div style={{ marginBottom: "8px", color: c.cor }}><c.Icone size={24} strokeWidth={1.5} /></div>
            <p style={{ fontSize: "22px", fontWeight: "700", color: c.cor, fontFamily: "system-ui" }}>{c.valor}</p>
            <p style={{ fontSize: "12px", color: subtext, fontFamily: "system-ui", marginTop: "4px" }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ color: text }}><ChartIcon size={18} strokeWidth={1.6} /></span>
            <p style={{ fontWeight:"600", fontSize:"15px", color: text, margin:0 }}>Google Analytics</p>
          </div>
          <a href="https://analytics.google.com" target="_blank" rel="noreferrer"
            style={{ fontSize:"12px", color:"#2563eb", fontFamily:"system-ui", fontWeight:"500",
              textDecoration:"none", padding:"6px 12px", borderRadius:"6px", border:"1px solid #2563eb", display:"inline-block" }}>
            Abrir GA →
          </a>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
          {[
            { label:"Tempo real", desc:"Quem esta no site agora", url:"https://analytics.google.com", Icone: PulseIcon },
            { label:"Usuarios", desc:"Visitantes por periodo", url:"https://analytics.google.com", Icone: UsersIcon },
            { label:"Paginas", desc:"Paginas mais acessadas", url:"https://analytics.google.com", Icone: DocIcon },
          ].map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noreferrer"
              style={{ borderRadius:"8px", padding:"12px 10px", textAlign:"center",
                backgroundColor: dark ? "#374151" : "#f9fafb", border: "1px solid " + border,
                textDecoration:"none", display:"block" }}>
              <div style={{ marginBottom:"5px", color: text, display:"flex", justifyContent:"center" }}><item.Icone size={20} strokeWidth={1.5} /></div>
              <p style={{ fontSize:"12px", color: text, fontFamily:"system-ui", fontWeight:"600", margin:0 }}>{item.label}</p>
              <p style={{ fontSize:"10px", color: subtext, fontFamily:"system-ui", marginTop:"2px" }}>{item.desc}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
          <p className="font-semibold mb-4 flex items-center gap-2" style={{ color: text }}><TrophyIcon size={17} strokeWidth={1.6} /> Produtos mais pedidos</p>
          {topProdutos.length === 0 && <p style={{ color: subtext, fontSize: "13px" }}>Nenhum pedido ainda.</p>}
          {topProdutos.map(([nome, qtd], i) => {
            const maxQtd = topProdutos[0]?.[1] || 1;
            const pct = Math.round((qtd * 100) / maxQtd);
            return (
              <div key={i} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: "13px", color: text }}>{nome}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: text }}>{qtd} un</span>
                </div>
                <div style={{ height: "6px", backgroundColor: dark ? "#374151" : "#e5e7eb", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: pct + "%", backgroundColor: "#2563eb", borderRadius: "3px" }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
          <p className="font-semibold mb-4 flex items-center gap-2" style={{ color: text }}><ChartIcon size={17} strokeWidth={1.6} /> Status por tipo</p>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: subtext, fontFamily: "system-ui", marginBottom: "8px" }}>
            Catalogo ({pedidos.length})
          </p>
          {Object.entries(statusCat).map(([id, qtd]) => (
            <div key={id} className="flex items-center gap-3 mb-2">
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: STATUS_CORES_D[id], flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: text, flex: 1 }}>{STATUS_LABELS[id]}</span>
              <span style={{ fontSize: "13px", fontWeight: qtd > 0 ? "700" : "400", color: qtd > 0 ? text : subtext }}>{qtd}</span>
            </div>
          ))}
          <div style={{ margin: "14px 0", borderTop: "1px solid " + border }} />
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: subtext, fontFamily: "system-ui", marginBottom: "8px" }}>
            Personalizados ({personalizados.length})
          </p>
          {Object.entries(statusPers).map(([id, qtd]) => (
            <div key={id} className="flex items-center gap-3 mb-2">
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: STATUS_CORES_D[id], flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: text, flex: 1 }}>{STATUS_LABELS[id]}</span>
              <span style={{ fontSize: "13px", fontWeight: qtd > 0 ? "700" : "400", color: qtd > 0 ? text : subtext }}>{qtd}</span>
            </div>
          ))}
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
  
  function mudarAba(novaAba) {
    setAba(novaAba);
    carregar(true); // Silent reload ao trocar aba
  }
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

  // Carregar pedidos (chamado no mount e ao trocar aba)
  const carregar = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    return Promise.all([
      api.get("pedidos/"),
      api.get("pedidos-personalizados/"),
    ]).then(([r1, r2]) => {
      const novoTotal = r1.data.length + r2.data.length;
      if (ultimoTotalRef.current !== null && novoTotal > ultimoTotalRef.current) {
        tocarSom();
        mostrarToast(`Novo pedido recebido!`, "sucesso");
      }
      ultimoTotalRef.current = novoTotal;
      setPedidos(r1.data);
      setPersonalizados(r2.data);
    }).catch(() => mostrarToast("Erro ao carregar pedidos.", "erro"))
      .finally(() => setLoading(false));
  }, [mostrarToast]);

  useEffect(() => {
    carregar();
    // Polling a cada 3 minutos - silencioso (sem refetch de loading)
    const interval = setInterval(() => {
      Promise.all([api.get("pedidos/"), api.get("pedidos-personalizados/")])
        .then(([r1, r2]) => {
          const novoTotal = r1.data.length + r2.data.length;
          if (ultimoTotalRef.current !== null && novoTotal > ultimoTotalRef.current) {
            tocarSom();
            mostrarToast("Novo pedido recebido!", "sucesso");
          }
          ultimoTotalRef.current = novoTotal;
          setPedidos(r1.data);
          setPersonalizados(r2.data);
        }).catch(() => {});
    }, 180000); // 3 minutos
    return () => clearInterval(interval);
  }, [carregar]);


  // ── GERAR PDF DO PEDIDO (Admin) ─────────────────────────────────────────
  function gerarPDFPedido(p) {
    const isCat = !p.ramo;
    const prot = p.protocolo || (isCat ? "MTZ-" + String(p.id).padStart(4,"0") : "MTZ-PERS-" + String(p.id).padStart(4,"0"));
    const freteLabel = p.frete_tipo === "retirada" ? "Retirada no local (Gratis)"
      : p.frete_tipo === "motoboy" ? "Motoboy - estimativa R$ " + parseFloat(p.frete_valor||0).toFixed(2) + " (Grande Vitoria/ES)"
      : p.frete_tipo === "correios" ? "Correios - valor a confirmar"
      : "Nao informado";
    const statusTxt = p.status === "concluido" ? "Concluido"
      : p.status === "cancelado" ? "Cancelado"
      : p.status === "em_andamento" ? "Em andamento" : "Novo";
    const itensHTML = isCat
      ? (p.itens||[]).map(i =>
          "<tr><td style='padding:8px 4px'>" + (i.produto_nome||"Produto") + "</td>"
          + "<td style='padding:8px 4px;text-align:center'>" + i.tamanho + "</td>"
          + "<td style='padding:8px 4px;text-align:center'>" + i.quantidade + "</td>"
          + "<td style='padding:8px 4px;text-align:right'>R$ " + (parseFloat(i.produto_preco||0)*i.quantidade).toFixed(2) + "</td></tr>"
        ).join("")
      : "<tr><td colspan='4' style='padding:8px 4px'>" + (p.ramo||"Pedido personalizado") + " - " + (p.quantidade||"-") + " unidades</td></tr>";

    const endHTML = p.rua
      ? "<p>" + p.rua + ", " + (p.numero||"s/n") + (p.complemento?" - "+p.complemento:"") + "</p><p>" + (p.bairro||"") + " - " + (p.cidade||"") + "/" + (p.estado||"") + "</p>"
      : "<p>Retirada no local</p>";

    const html = "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'><title>Pedido " + prot + "</title>"
      + "<style>*{box-sizing:border-box}body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 24px;color:#1a1a1a}"
      + ".prot{font-family:monospace;font-size:16px;font-weight:700;padding:10px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;display:inline-block;margin-bottom:16px}"
      + ".grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}"
      + ".block{padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px}"
      + ".block h3{font-size:10px;text-transform:uppercase;color:#6b7280;margin:0 0 6px;font-weight:700}"
      + ".block p{font-size:13px;margin:2px 0;line-height:1.5}"
      + "table{width:100%;border-collapse:collapse;margin:12px 0}"
      + "th{background:#f3f4f6;padding:8px 4px;text-align:left;font-size:11px;text-transform:uppercase;font-weight:700}"
      + "td{font-size:13px;color:#1a1a1a}"
      + ".frete{margin:12px 0;padding:12px 16px;background:#fef9f0;border:1px solid #fde68a;border-radius:6px;font-size:13px}"
      + ".footer{margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}"
      + "@media print{button{display:none}}</style></head><body>"
      + "<p style='font-size:22px;font-weight:300;letter-spacing:2px;margin-bottom:4px'><span style='color:#c41e3a;font-weight:700'>m</span>etzker solucoes</p>"
      + "<p style='color:#6b7280;font-size:12px;margin:0 0 16px'>Vila Velha, ES - (27) 99787-8391</p>"
      + "<h2 style='font-size:18px;font-weight:600;margin:20px 0 6px'>Pedido " + (isCat ? "Catalogo" : "Personalizado") + "</h2>"
      + "<div class='prot'>Protocolo: " + prot + "</div><br>"
      + "<span style='display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:16px;background:#f9fafb;color:#374151'>" + statusTxt + "</span>"
      + "<div class='grid'>"
      + "<div class='block'><h3>Cliente</h3><p><strong>" + (p.nome_cliente||"-") + "</strong></p><p>" + (p.telefone||"-") + "</p><p>" + (p.email||"-") + "</p></div>"
      + "<div class='block'><h3>Endereco</h3>" + endHTML + "</div>"
      + (isCat ? "<div class='block'><h3>Pagamento</h3><p>" + (p.forma_pagamento||"-") + "</p></div>" : "")
      + "<div class='block'><h3>Data</h3><p>" + new Date(p.data_pedido).toLocaleDateString("pt-BR") + "</p></div>"
      + (!isCat ? "<div class='block'><h3>Produto</h3><p>" + (p.ramo||"-") + "</p><p><strong>" + (p.quantidade||"-") + " unidades</strong></p></div>" : "")
      + "</div>"
      + "<div class='frete'><strong>Entrega:</strong> " + freteLabel + "</div>"
      + "<table><thead><tr><th>Produto</th>"
      + (isCat ? "<th style='text-align:center'>Tamanho</th><th style='text-align:center'>Qtd</th><th style='text-align:right'>Subtotal</th>" : "")
      + "</tr></thead><tbody>" + itensHTML + "</tbody></table>"
      + (p.observacao||p.observacoes ? "<div style='margin-top:16px;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px'><p style='font-size:13px'>" + (p.observacao||p.observacoes) + "</p></div>" : "")
      + "<div class='footer'>Metzker Solucoes - Polo Textil Santa Ines - Vila Velha, ES<br>Gerado em " + new Date().toLocaleDateString("pt-BR") + "</div>"
      + "<div style='text-align:center;margin-top:16px'><button onclick='window.print()' style='padding:10px 24px;background:#1a1a1a;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px'>Imprimir/Salvar PDF</button></div>"
      + "</body></html>";

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
  }


  function exportarExcel() {
    const cell = (v) => {
      const s = String(v||"-").replace(/\r?\n/g, " ").replace(/\t/g, " ").trim();
      return s.includes(";") || s.includes('"') || s.includes(",")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const catRows = pedidos.map(p => {
      const itensStr = (p.itens||[]).map(i =>
        `${i.produto_nome} - Tam: ${i.tamanho} - Qtd: ${i.quantidade} - R$ ${(parseFloat(i.produto_preco||0)*i.quantidade).toFixed(2)}`
      ).join(" | ");
      const protCat = p.protocolo || `MTZ-${String(p.id).padStart(4,"0")}`;
      return [
        cell(protCat), cell("Catálogo"), cell(p.id), cell(p.nome_cliente), cell(p.telefone), cell(p.email),
        cell(p.status||"novo"), cell(new Date(p.data_pedido).toLocaleDateString("pt-BR")),
        cell(`R$ ${(p.total||0).toFixed(2)}`), cell(p.forma_pagamento),
        cell(p.frete_tipo||"retirada"), cell(p.frete_valor!=null?`R$ ${parseFloat(p.frete_valor||0).toFixed(2)}`:"R$ 0,00"),
        cell(p.rua), cell(p.numero), cell(p.bairro), cell(p.cidade), cell(p.estado), cell(p.cep),
        cell(itensStr), cell(p.observacao),
      ].join(";");
    });

    const persRows = personalizados.map(p => {
      const refParts = [
        p.ramo ? `Produto: ${p.ramo}` : "",
        p.quantidade ? `Qtd: ${p.quantidade} un` : "",
        (p.referencia || "").replace(/\r?\n/g, " | ").replace(/\s+/g, " ").trim().slice(0, 300),
      ].filter(Boolean).join(" | ");
      const obs = (p.observacoes || "").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
      const prot = p.protocolo || `MTZ-PERS-${String(p.id).padStart(4,"0")}`;
      return [
        cell(prot), cell("Personalizado"), cell(p.id), cell(p.nome_cliente), cell(p.telefone), cell(p.email),
        cell(p.status||"novo"), cell(new Date(p.data_pedido).toLocaleDateString("pt-BR")),
        cell("A orçar"), cell("—"),
        cell(p.frete_tipo||"retirada"), cell(p.frete_tipo==="motoboy"?`~R$ ${p.frete_valor||"a combinar"}`:p.frete_tipo==="correios"?"Conforme Correios":"Grátis"),
        cell(p.rua||"—"), cell(p.numero||"—"), cell(p.bairro||"—"),
        cell(p.cidade||"—"), cell(p.estado||"—"), cell(p.cep||"—"),
        cell(refParts), cell(obs),
      ].join(";");
    });

    const header = ["Protocolo","Tipo","ID","Nome","Telefone","Email","Status","Data","Total","Pagamento",
      "Frete_Tipo","Frete_Valor","Rua","Numero","Bairro","Cidade","Estado","CEP","Itens","Observacoes"].join(";");

    const todos = [...catRows, ...persRows];
    if (todos.length === 0) { mostrarToast("Nenhum pedido para exportar.", "erro"); return; }

    const bom = "\uFEFF";
    const csv = bom + [header, ...todos].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `pedidos_metzker_${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.csv`;
    a.click(); URL.revokeObjectURL(url);
    mostrarToast("Exportado com sucesso!", "sucesso");
  }

  function registrarHistorico(id, novoStatus) {
    setHistoricoStatus(prev => {
      const hist = prev[id] || [];
      const idxAnterior = hist.findLastIndex ? hist.findLastIndex(h => h.status === novoStatus) : -1;
      const baseHist = idxAnterior >= 0 ? hist.slice(0, idxAnterior) : hist;
      const entrada = { status: novoStatus, data: new Date().toLocaleString("pt-BR") };
      return { ...prev, [id]: [...baseHist, entrada] };
    });
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

  const STATUS_CORES = { novo: "#2563eb", em_andamento: "#d97706", concluido: "#16a34a", cancelado: "#dc2626" };

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold" style={{ color: text }}>Pedidos</h2>
        <button onClick={exportarExcel}
          className="cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2"
          style={{ backgroundColor: "#16a34a", cursor: "pointer", fontFamily: "system-ui" }}>
          <DownloadIcon size={15} strokeWidth={1.8} /> Exportar Excel
        </button>
      </div>

      {/* Busca e filtro */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: subtext, pointerEvents: "none" }}>
            <SearchIcon size={15} strokeWidth={1.7} />
          </span>
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou email..."
            style={{ width: "100%", padding: "9px 14px 9px 36px", border: "1px solid " + border, backgroundColor: dark ? "#374151" : "#fff",
              color: text, borderRadius: "8px", fontSize: "13px", fontFamily: "system-ui", outline: "none", boxSizing: "border-box" }} />
        </div>
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
            color: text, borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <RefreshIcon size={16} strokeWidth={1.8} />
        </button>
      </div>

      {/* ABAS */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: "2px solid " + border }}>
        {[
          { id: "catalogo",     label: `Portfólio / Catálogo (${pedidos.length})`, Icone: BagIcon },
          { id: "personalizado", label: `Personalizados (${personalizados.length})`, Icone: PaletteIcon },
        ].map(a => (
          <button key={a.id} onClick={() => mudarAba(a.id)}
            className="px-4 py-2 text-sm font-medium transition inline-flex items-center gap-2"
            style={{
              borderBottom: aba === a.id ? "2px solid " + text : "2px solid transparent",
              color: aba === a.id ? text : subtext, backgroundColor: "transparent", marginBottom: "-2px",
            }}>
            <a.Icone size={15} strokeWidth={1.6} /> {a.label}
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
          {[...pedidos].filter(p => {
            const q = busca.toLowerCase();
            const matchBusca = !q || (p.nome_cliente||"").toLowerCase().includes(q) || (p.email||"").toLowerCase().includes(q);
            const matchStatus = filtroStatus === "todos" || (p.status||"novo") === filtroStatus;
            return matchBusca && matchStatus;
          }).sort((a, b) => {
            const peso = s => (s === "concluido" || s === "cancelado") ? 1 : 0;
            return peso(a.status||"novo") - peso(b.status||"novo");
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
                      <p className="text-xs font-mono flex items-center gap-1" style={{ color: "#2563eb" }}>
                        <TagIcon size={11} strokeWidth={1.8} /> {p.protocolo || `MTZ-${String(p.id).padStart(4,"0")}`}
                      </p>
                      <p className="text-xs" style={{ color: subtext }}>{new Date(p.data_pedido).toLocaleString("pt-BR")}</p>
                      {historicoStatus[`cat-${p.id}`]?.length > 0 && (
                        <p className="text-xs font-semibold mt-0.5 flex items-center gap-1" style={{ color: "#d97706" }}>
                          <ClockIcon size={11} strokeWidth={1.8} /> Status: {historicoStatus[`cat-${p.id}`].slice(-1)[0]?.status} — {historicoStatus[`cat-${p.id}`].slice(-1)[0]?.data}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-sm" style={{ color: text }}>R$ {Number(totalPedido).toFixed(2)}</span>
                    <span style={{ color: subtext }}><ChevronDownIcon size={15} strokeWidth={1.8} style={{ transform: expandido ? "rotate(180deg)" : "none", transition: "transform .2s" }} /></span>
                  </div>
                </button>
                {expandido && (
                  <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid " + border }}>
                    <div className="grid md:grid-cols-3 gap-4 pt-4">
                      {[
                        { titulo: "Cliente", Icone: UserIcon, conteudo: <><p className="font-semibold text-sm" style={{ color: text }}>{p.nome_cliente}</p><p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: subtext }}><PhoneIcon size={13} strokeWidth={1.6} />{p.telefone}</p></> },
                        { titulo: "Endereço", Icone: PinIcon, conteudo: p.rua ? <div className="text-sm space-y-0.5" style={{ color: text }}><p>{p.rua}, {p.numero}</p><p>{p.bairro} — {p.cidade}/{p.estado}</p></div> : <p className="text-sm" style={{ color: subtext }}>Retirada no local</p> },
                        { titulo: "Pagamento", Icone: CardIcon, conteudo: <p className="font-semibold text-sm" style={{ color: text }}>{p.forma_pagamento || "Não informado"}</p> },
                        { titulo: "Entrega", Icone: TruckIcon, conteudo: (
                          <div>
                            <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: text }}>
                              {p.frete_tipo === "retirada" ? <><StoreIcon size={14} strokeWidth={1.6} />Retirada no local</> :
                               p.frete_tipo === "motoboy" ? <><TruckIcon size={14} strokeWidth={1.6} />Motoboy</> :
                               p.frete_tipo === "correios" ? <><MailIcon size={14} strokeWidth={1.6} />Correios</> : "Não informado"}
                            </p>
                            {p.frete_tipo === "motoboy" && (
                              <p className="text-xs mt-1" style={{ color: "#d97706" }}>
                                Apenas Grande Vitoria/ES — confirmar via WhatsApp
                              </p>
                            )}
                            {p.frete_tipo === "correios" && (
                              <p className="text-xs mt-1" style={{ color: subtext }}>
                                Valor conforme Correios — confirmar com o cliente
                              </p>
                            )}
                            {p.frete_tipo === "motoboy" && p.frete_valor > 0 && (
                              <p className="text-xs font-semibold mt-1" style={{ color: text }}>
                                Estimativa: R$ {parseFloat(p.frete_valor||0).toFixed(2)}
                              </p>
                            )}
                            {p.frete_tipo === "retirada" && (
                              <p className="text-xs mt-1" style={{ color: "#16a34a", fontWeight:"600" }}>Grátis</p>
                            )}
                          </div>
                        ) },
                      ].map(({ titulo, Icone, conteudo }) => (
                        <div key={titulo} className="rounded-lg p-4" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                          <p className="text-xs font-bold uppercase mb-3 flex items-center gap-1.5" style={{ color: subtext }}><Icone size={13} strokeWidth={1.6} />{titulo}</p>
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
                            }}>{s.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* HISTÓRICO DE STATUS */}
                    {historicoStatus[`cat-${p.id}`]?.length > 0 && (
                      <div className="rounded-lg p-3 mt-2 mb-3" style={{ backgroundColor: dark ? "#111827" : "#f9fafb", border: "1px solid " + border }}>
                        <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: subtext }}><ListIcon size={12} strokeWidth={1.7} />Histórico de status</p>
                        {historicoStatus[`cat-${p.id}`].map((h, i) => (
                          <p key={i} style={{ fontSize: "11px", color: subtext, fontFamily: "system-ui" }}>
                            {h.data} → <strong style={{ color: text }}>{h.status}</strong>
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <a href={("https://wa.me/55" + p.telefone.split("").filter(ch => ch >= "0" && ch <= "9").join(""))} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: "#16a34a" }}><WhatsAppIcon size={15} strokeWidth={1.6} />WhatsApp</a>
                      <button onClick={() => setPedidoParaExcluir({ id: p.id, tipo: "catalogo", nome: p.nome_cliente })}
                        className="px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                        style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                        <TrashIcon size={14} strokeWidth={1.7} /> Excluir pedido
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
          {[...personalizados].filter(p => {
            const q = busca.toLowerCase();
            return (!q || (p.nome_cliente||"").toLowerCase().includes(q) || (p.email||"").toLowerCase().includes(q))
              && (filtroStatus === "todos" || p.status === filtroStatus);
          }).sort((a, b) => {
            const peso = s => (s === "concluido" || s === "cancelado") ? 1 : 0;
            return peso(a.status||"novo") - peso(b.status||"novo");
          }).map(p => {
            const expandido = aberto === `per-${p.id}`;
            return (
              <div key={p.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
                <button onClick={() => setAberto(expandido ? null : `per-${p.id}`)}
                  className="w-full p-5 flex items-center justify-between text-left">
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2 py-1 rounded-lg font-mono" style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: subtext }}>#{p.id}</span>
                    <div>
                      <p className="font-semibold" style={{ color: text }}>{p.nome_cliente}</p>
                      <p className="text-xs font-mono flex items-center gap-1" style={{ color: "#2563eb" }}>
                        <TagIcon size={11} strokeWidth={1.8} /> {p.protocolo || `MTZ-PERS-${String(p.id).padStart(4,"0")}`}
                      </p>
                      <p className="text-xs" style={{ color: subtext }}>{new Date(p.data_pedido).toLocaleString("pt-BR")}</p>
                      {historicoStatus[`pers-${p.id}`]?.length > 0 && (
                        <p className="text-xs font-semibold mt-0.5 flex items-center gap-1" style={{ color: "#d97706" }}>
                          <ClockIcon size={11} strokeWidth={1.8} /> Status: {historicoStatus[`pers-${p.id}`].slice(-1)[0]?.status} — {historicoStatus[`pers-${p.id}`].slice(-1)[0]?.data}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: STATUS_CORES[p.status] + "20", color: STATUS_CORES[p.status] }}>
                      ● {p.status === "novo" ? "Novo" : p.status === "em_andamento" ? "Em andamento" : p.status === "concluido" ? "Concluído" : "Cancelado"}
                    </span>
                    <span style={{ color: subtext }}><ChevronDownIcon size={15} strokeWidth={1.8} style={{ transform: expandido ? "rotate(180deg)" : "none", transition: "transform .2s" }} /></span>
                  </div>
                </button>

                {expandido && (
                  <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid " + border }}>
                    <div className="grid md:grid-cols-2 gap-4 pt-4">

                      {/* CONTATO */}
                      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: subtext }}><UserIcon size={13} strokeWidth={1.6} />Contato</p>
                        <p className="font-semibold text-sm" style={{ color: text }}>{p.nome_cliente}</p>
                        {p.telefone && <p className="text-sm flex items-center gap-1.5" style={{ color: subtext }}><PhoneIcon size={13} strokeWidth={1.6} />{p.telefone}</p>}
                        {p.email && <p className="text-sm flex items-center gap-1.5" style={{ color: subtext }}><MailIcon size={13} strokeWidth={1.6} />{p.email}</p>}
                        {p.observacoes && p.observacoes.includes("CEP") && (
                          <p className="text-sm flex items-center gap-1.5" style={{ color: subtext }}>
                            <PinIcon size={13} strokeWidth={1.6} />{p.observacoes.split("Descrição:")[0].replace("Obs:","").trim()}
                          </p>
                        )}
                      </div>

                      {/* CATEGORIA E TIPO */}
                      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: subtext }}><PackageIcon size={13} strokeWidth={1.6} />Pedido</p>
                        <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: text }}>
                          {p.estilo === "roupas" ? <><ShirtIcon size={15} strokeWidth={1.6} />Item de Roupa</> : p.estilo === "comunicacao" ? <><ImageIcon size={15} strokeWidth={1.6} />Comunicação Visual</> : p.ramo}
                        </p>
                        <p className="text-sm" style={{ color: subtext }}>Total: <strong style={{ color: text }}>{p.quantidade} unidades</strong></p>
                        {p.slogan && <p className="text-sm" style={{ color: subtext }}>Dimensões: {p.slogan}</p>}
                      </div>
                    </div>

                    {/* COMBINAÇÕES — exibe o campo referencia formatado */}
                    {p.referencia && (
                      <div className="rounded-lg p-4" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-3 flex items-center gap-1.5" style={{ color: subtext }}><PaletteIcon size={13} strokeWidth={1.6} />Combinações | Detalhes</p>
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
                        <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: subtext }}><EditIcon size={13} strokeWidth={1.6} />Descrição do cliente</p>
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
                        <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: subtext }}><ListIcon size={12} strokeWidth={1.7} />Histórico de status</p>
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
                        <p className="text-xs font-bold uppercase mb-3 flex items-center gap-1.5" style={{ color: subtext }}><ImageIcon size={13} strokeWidth={1.6} />Imagens de referência</p>
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
                        <a href={("https://wa.me/55" + p.telefone.split("").filter(ch => ch >= "0" && ch <= "9").join(""))} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                          style={{ backgroundColor: "#16a34a" }}>
                          <WhatsAppIcon size={15} strokeWidth={1.6} />
                          Falar com {p.nome_cliente} pelo WhatsApp
                        </a>
                      )}
                      <button onClick={() => setPedidoParaExcluir({ id: p.id, tipo: "personalizado", nome: p.nome_empresa })}
                        className="px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                        style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                        <TrashIcon size={14} strokeWidth={1.7} /> Excluir pedido
                      </button>
                      <button
                        onClick={() => gerarPDFPedido(p)}
                        style={{ padding:"7px 14px", fontSize:"12px", fontWeight:"600",
                          cursor:"pointer", border:"1px solid "+border, borderRadius:"6px",
                          backgroundColor: dark ? "#374151" : "#f3f4f6", color: text,
                          fontFamily:"system-ui", display:"flex", alignItems:"center", gap:"6px" }}>
                        <PrinterIcon size={14} strokeWidth={1.6} /> Gerar PDF
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
              <p className="mb-4 flex justify-center" style={{ color: "#dc2626" }}><TrashIcon size={36} strokeWidth={1.4} /></p>
              <h3 className="text-xl font-bold mb-2" style={{ color: text }}>Excluir pedido?</h3>
              <p className="text-sm" style={{ color: subtext }}>
                Você está prestes a excluir o pedido de <strong style={{ color: text }}>{pedidoParaExcluir.nome}</strong>.
              </p>
              <p className="text-sm mt-2 font-medium" style={{ color: "#dc2626" }}>
                Esta ação é irreversível. O pedido será removido permanentemente do painel e o cliente perderá o registro.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPedidoParaExcluir(null)}
                className="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-70"
                style={{ border: "1px solid " + border, color: text, backgroundColor: "transparent" }}>
                Cancelar
              </button>
              <button onClick={excluirPedido}
                className="cursor-pointer flex-1 py-3 rounded-lg font-semibold text-white transition hover:opacity-80"
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
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");

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
      try { await api.delete("estoques/remover/", { data: { produto: prodId, tamanho } });
        setTamanhosOriginais(prev => ({ ...prev, [prodId]: prev[prodId].filter(t => t !== tamanho) })); }
      catch { mostrarToast("Erro ao remover tamanho.", "erro"); return; }
    }
    setValores(prev => { const novo = { ...prev[prodId] }; delete novo[tamanho]; return { ...prev, [prodId]: novo }; });
    mostrarToast("Tamanho removido.", "sucesso");
  }

  async function salvarEstoque(prodId) {
    setSalvando(prev => ({ ...prev, [prodId]: true }));
    try {
      const entradas = Object.entries(valores[prodId] || {}).filter(([tamanho]) => tamanho && tamanho.trim());
      if (entradas.length === 0) { mostrarToast("Adicione ao menos um tamanho.", "erro"); return; }
      await Promise.all(entradas.map(([tamanho, quantidade]) =>
        api.post("estoques/atualizar/", { produto: prodId, tamanho: tamanho.trim(), quantidade: parseInt(quantidade) || 0 })
      ));
      mostrarToast("Estoque salvo!", "sucesso"); await carregar();
    } catch (e) { mostrarToast("Erro ao salvar.", "erro"); }
    finally { setSalvando(prev => ({ ...prev, [prodId]: false })); }
  }

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  // Separar por categoria
  const roupas = produtos.filter(p => p.categoria === "roupas" || !p.categoria);
  const comunicacao = produtos.filter(p => p.categoria === "comunicacao");

  const produtosFiltrados = categoriaAtiva === "todos" ? produtos
    : categoriaAtiva === "roupas" ? roupas
    : comunicacao;

  const abas = [
    { id: "todos",       label: "Todos (" + produtos.length + ")",        cor: text, Icone: PackageIcon },
    { id: "roupas",      label: "Roupas (" + roupas.length + ")",      cor: "#7c3aed", Icone: ShirtIcon },
    { id: "comunicacao", label: "Comunicação (" + comunicacao.length + ")", cor: "#2563eb", Icone: ImageIcon },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: text }}>Gerenciar Estoque</h2>
      <p className="text-sm mb-4" style={{ color: subtext }}>
        Para <strong>Comunicação Visual</strong>, use "tamanhos" para informar dimensões (ex: A4, Banner 1m).
        Para <strong>Roupas</strong>, use P, M, G, G1, G2, G3, GG, EXG, EXGG.
      </p>

      {/* Filtro por categoria */}
      <div className="flex gap-2 mb-6 flex-wrap" style={{ borderBottom: "2px solid " + border, paddingBottom: "0" }}>
        {abas.map(aba => (
          <button key={aba.id} onClick={() => setCategoriaAtiva(aba.id)}
            className="px-4 py-2 text-sm font-medium transition inline-flex items-center gap-2"
            style={{
              borderBottom: categoriaAtiva === aba.id ? "2px solid " + text : "2px solid transparent",
              color: categoriaAtiva === aba.id ? text : subtext,
              backgroundColor: "transparent", marginBottom: "-2px",
            }}>
            <aba.Icone size={15} strokeWidth={1.6} /> {aba.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {produtosFiltrados.map(p => {
          const tams = Object.keys(valores[p.id] || {});
          const isComunicacao = p.categoria === "comunicacao";
          const totalEstoque = Object.values(valores[p.id] || {}).reduce((s, q) => s + (parseInt(q) || 0), 0);
          return (
            <div key={p.id} className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <p className="font-semibold" style={{ color: text }}>{p.nome}</p>
                <span className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  style={{ backgroundColor: isComunicacao ? "#eff6ff" : "#f5f3ff",
                    color: isComunicacao ? "#2563eb" : "#7c3aed" }}>
                  {isComunicacao ? <ImageIcon size={11} strokeWidth={1.8} /> : <ShirtIcon size={11} strokeWidth={1.8} />}
                  {isComunicacao ? "Com. Visual" : "Roupa"}
                </span>
                {totalEstoque > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#f0fdf4", color: "#000000" }}>
                    {totalEstoque} un. em estoque
                  </span>
                )}
              </div>

              {tams.length === 0 && (
                <p className="text-sm mb-3" style={{ color: subtext }}>
                  {isComunicacao ? "Adicione os formatos disponíveis (ex: A4, Banner 1m, 80x60cm)" : "Nenhum tamanho cadastrado ainda."}
                </p>
              )}

              <div className="flex gap-3 flex-wrap mb-4">
                {tams.map(tam => (
                  <div key={tam} className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold" style={{ color: subtext }}>{tam}</span>
                      <button onClick={() => removerTamanho(p.id, tam)}
                        className="text-xs leading-none" style={{ color: "#ef4444" }}>✕</button>
                    </div>
                    <input type="number" min="0" value={valores[p.id]?.[tam] ?? 0}
                      onChange={e => setValores(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tam]: e.target.value } }))}
                      className="text-center text-sm rounded-lg"
                      style={{ width: "64px", padding: "6px", border: "1px solid " + inputBorder,
                        backgroundColor: inputBg, color: text, outline: "none",
                        borderColor: parseInt(valores[p.id]?.[tam]) === 0 ? "#fca5a5" : inputBorder }} />
                    {parseInt(valores[p.id]?.[tam]) === 0 && (
                      <span style={{ fontSize: "9px", color: "#dc2626" }}>sem estoque</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <input value={novoTamanho[p.id] || ""}
                  onChange={e => setNovoTamanho(prev => ({ ...prev, [p.id]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const tam = (novoTamanho[p.id] || "").trim().toUpperCase();
                      if (!tam || valores[p.id]?.[tam] !== undefined) return;
                      setValores(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tam]: 0 } }));
                      setNovoTamanho(prev => ({ ...prev, [p.id]: "" }));
                    }
                  }}
                  placeholder={isComunicacao ? "A4, Banner 1m, 80x60cm..." : "PP, P, M, G, G1..."}
                  style={{ padding: "6px 10px", border: "1px solid " + inputBorder, backgroundColor: inputBg,
                    color: text, outline: "none", width: "160px", borderRadius: "6px", fontSize: "13px" }} />
                <button onClick={() => {
                    const tam = (novoTamanho[p.id] || "").trim().toUpperCase();
                    if (!tam || valores[p.id]?.[tam] !== undefined) return;
                    setValores(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tam]: 0 } }));
                    setNovoTamanho(prev => ({ ...prev, [p.id]: "" }));
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg font-medium text-white inline-flex items-center gap-1.5"
                  style={{ backgroundColor: "#374151" }}>
                  <PlusIcon size={13} strokeWidth={2} /> {isComunicacao ? "Formato" : "Tamanho"}
                </button>
                {!isComunicacao && (
                  <div className="flex gap-1 flex-wrap">
                    {["PP","P","M","G","G1","G2","G3","GG","EXG","EXGG"].map(tam => (
                      valores[p.id]?.[tam] === undefined ? (
                        <button key={tam} onClick={() => setValores(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tam]: 0 } }))}
                          className="px-2 py-0.5 text-xs rounded"
                          style={{ border: "1px solid " + inputBorder, color: subtext, backgroundColor: "transparent" }}>
                          {tam}
                        </button>
                      ) : null
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => salvarEstoque(p.id)} disabled={salvando[p.id]}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white inline-flex items-center gap-2"
                style={{ backgroundColor: salvando[p.id] ? "#9ca3af" : "#16a34a",
                  cursor: salvando[p.id] ? "not-allowed" : "pointer" }}>
                <SaveIcon size={15} strokeWidth={1.6} /> {salvando[p.id] ? "Salvando..." : "Salvar"}
              </button>
            </div>
          );
        })}
        {produtosFiltrados.length === 0 && (
          <p style={{ color: subtext }}>Nenhum produto nesta categoria.</p>
        )}
      </div>
    </div>
  );
}

// ─── INFORMAÇÕES & IMAGENS DO SITE ───────────────────────────────────────────
const HERO_ESTATICAS = [
  { id: null, titulo: "hero_01", imagem: "/ImagemPrincipal.jpg",  _static: true },
  { id: null, titulo: "hero_02", imagem: "/ImagemPrincipal2.jpg", _static: true },
  { id: null, titulo: "hero_03", imagem: "/ImagemPrincipal3.jpg", _static: true },
  { id: null, titulo: "hero_04", imagem: "/ImagemPrincipal4.jpg", _static: true },
];
const GALERIA_ESTATICAS = [
  { id: null, titulo: "galeria_01", imagem: "/Galeria1.jpeg", _static: true },
  { id: null, titulo: "galeria_02", imagem: "/Galeria2.jpeg", _static: true },
  { id: null, titulo: "galeria_03", imagem: "/Galeria3.jpeg", _static: true },
];

function EditarInfos({ mostrarToast, dark, estilos }) {
  const { text, subtext, inputBg, inputBorder, cardBg, border } = estilos;

  const [galeriaItems, setGaleriaItems] = useState(GALERIA_ESTATICAS);
  const [heroItems, setHeroItems]       = useState(HERO_ESTATICAS);
  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState({});

  const cardStyle = { backgroundColor: cardBg, border: "1px solid " + border, borderRadius: "12px", padding: "20px", marginBottom: "24px" };

  async function carregarImagens() {
    try {
      const res = await api.get("institucional/");
      const todos = res.data || [];
      const galeriaAPI = todos.filter(i => i.titulo?.startsWith("galeria_") && i.imagem)
        .sort((a,b) => a.titulo.localeCompare(b.titulo));
      const heroAPI = todos.filter(i => i.titulo?.startsWith("hero_") && i.imagem)
        .sort((a,b) => a.titulo.localeCompare(b.titulo));
      if (galeriaAPI.length > 0) setGaleriaItems(galeriaAPI);
      if (heroAPI.length > 0) setHeroItems(heroAPI);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { carregarImagens(); }, []);

  async function uploadImagem(file, tipo, itemOuNull) {
    const key = tipo + "_" + (itemOuNull?.titulo || "new");
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const fd = new FormData();
      fd.append("imagem", file);
      fd.append("conteudo", "");

      if (itemOuNull && itemOuNull.id) {
        fd.append("titulo", itemOuNull.titulo);
        await api.patch("institucional/" + itemOuNull.id + "/", fd,
          { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        const existentes = tipo === "galeria" ? galeriaItems : heroItems;
        const nums = existentes
          .map(i => parseInt(i.titulo.split("_")[1] || "0"))
          .filter(n => !isNaN(n));
        const proxNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
        fd.append("titulo", tipo + "_" + String(proxNum).padStart(2, "0"));
        await api.post("institucional/", fd,
          { headers: { "Content-Type": "multipart/form-data" } });
      }
      mostrarToast("Imagem salva com sucesso!", "sucesso");
      await carregarImagens();
    } catch(e) {
      console.error(e.response?.data);
      mostrarToast("Erro ao salvar imagem.", "erro");
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  }

  async function removerImagem(item) {
    if (item._static) {
      mostrarToast("Esta é uma imagem original do site. Para remover, envie uma imagem substituta.", "erro");
      return;
    }
    if (!confirm("Remover esta imagem do site?")) return;
    try {
      await api.delete("institucional/" + item.id + "/");
      mostrarToast("Imagem removida!", "sucesso");
      await carregarImagens();
    } catch { mostrarToast("Erro ao remover.", "erro"); }
  }

  function ImageCard({ item, tipo, isNew }) {
    const key = tipo + "_" + (isNew ? "new" : item?.titulo);
    const isUploading = uploading[key];
    const isStatic = item?._static;

    return (
      <div className="relative group rounded-xl overflow-hidden"
        style={{ backgroundColor: dark ? "#374151" : "#f3f4f6",
          border: "2px " + (isNew ? "dashed" : "solid") + " " + (item?.imagem ? border : inputBorder),
          aspectRatio: "1" }}>
        {item?.imagem ? (
          <>
            <img src={item.imagem} alt="" className="w-full h-full object-cover" />
            {isStatic && (
              <div className="absolute top-1 left-1">
                <span style={{ fontSize: "9px", backgroundColor: "rgba(0,0,0,0.6)", color: "white",
                  padding: "2px 5px", borderRadius: "4px" }}>original</span>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
              <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5"
                style={{ backgroundColor: "#2563eb" }}>
                <RefreshIcon size={13} strokeWidth={1.8} /> Substituir
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files[0]) uploadImagem(e.target.files[0], tipo, item); }} />
              </label>
              {!isStatic && (
                <button onClick={() => removerImagem(item)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5"
                  style={{ backgroundColor: "#dc2626" }}>
                  <TrashIcon size={13} strokeWidth={1.8} /> Remover
                </button>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <p className="text-white text-xs font-bold">Enviando...</p>
              </div>
            )}
          </>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            style={{ minHeight: "120px" }}>
            {isUploading ? (
              <p style={{ color: subtext, fontSize: "12px" }}>Enviando...</p>
            ) : (
              <>
                <span className="mb-1.5" style={{ color: subtext }}><PlusIcon size={22} strokeWidth={1.6} /></span>
                <span style={{ fontSize: "11px", color: subtext, textAlign: "center", padding: "0 8px" }}>
                  Clique para adicionar
                </span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files[0]) uploadImagem(e.target.files[0], tipo, null); }} />
          </label>
        )}
      </div>
    );
  }

  if (loading) return <p style={{ color: subtext }}>Carregando imagens...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6" style={{ color: text }}>Gerenciar Imagens do Site</h2>

      {/* ── GALERIA / PROJETOS ENTREGUES ── */}
      <div style={cardStyle}>
        <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
          <h3 className="text-base font-semibold" style={{ color: text }}>Galeria de Projetos Entregues</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#f0fdf4", color: "#000000" }}>
            Recomendado: 800×800 px (quadrado)
          </span>
        </div>
        <p className="text-sm mb-4" style={{ color: subtext }}>
          Fotos da seção "Projetos Entregues" na página inicial. Passe o mouse sobre uma foto para substituir.
          Imagens marcadas como "original" são as imagens iniciais do site.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {galeriaItems.map(item => (
            <ImageCard key={item.titulo} item={item} tipo="galeria" isNew={false} />
          ))}
          <ImageCard item={null} tipo="galeria" isNew={true} />
        </div>
      </div>

      {/* ── BANNER PRINCIPAL ── */}
      <div style={cardStyle}>
        <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
          <h3 className="text-base font-semibold" style={{ color: text }}>Banner Principal</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#eff6ff", color: "#000000" }}>
            Recomendado: 1920×900 px (horizontal)
          </span>
        </div>
        <p className="text-sm mb-4" style={{ color: subtext }}>
          Imagens do slideshow principal do site. Máximo 4 imagens. Fotos horizontais funcionam melhor.
          Ao substituir, a nova imagem entra imediatamente no site.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {heroItems.map(item => (
            <ImageCard key={item.titulo} item={item} tipo="hero" isNew={false} />
          ))}
          {heroItems.length < 4 && (
            <ImageCard item={null} tipo="hero" isNew={true} />
          )}
        </div>
      </div>

      {/* ── FOTO SOBRE NÓS ── */}
      <div style={cardStyle}>
        <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
          <h3 className="text-base font-semibold" style={{ color: text }}>Imagem "Sobre Nós"</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#fef9f0", color: "#000000" }}>
            Recomendado: 600×700 px (retrato)
          </span>
        </div>
        <p className="text-sm mb-4" style={{ color: subtext }}>
          Foto ao lado do texto de apresentação da empresa na página inicial.
        </p>
        {(() => {
          const sobreItem = [...galeriaItems, ...heroItems].find(i => i.titulo === "sobre_nos") || null;
          return (
            <div className="flex items-center gap-4">
              <div style={{ width: "120px", height: "140px", borderRadius: "12px", overflow: "hidden",
                border: "2px dashed " + inputBorder, flexShrink: 0 }}>
                {sobreItem?.imagem
                  ? <img src={sobreItem.imagem} className="w-full h-full object-cover" alt="" />
                  : <img src="/FotoMetkzerepai.jpg" className="w-full h-full object-cover" alt="Foto atual" />
                }
              </div>
              <div>
                <label className="cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold text-white inline-flex items-center gap-2"
                  style={{ backgroundColor: "#1a1a1a" }}>
                  <CameraIcon size={15} strokeWidth={1.6} /> {sobreItem ? "Substituir foto" : "Enviar nova foto"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={async e => {
                      if (!e.target.files[0]) return;
                      const fd = new FormData();
                      fd.append("imagem", e.target.files[0]);
                      fd.append("titulo", "sobre_nos");
                      fd.append("conteudo", "");
                      try {
                        if (sobreItem && sobreItem.id) {
                          await api.patch("institucional/" + sobreItem.id + "/", fd,
                            { headers: { "Content-Type": "multipart/form-data" } });
                        } else {
                          await api.post("institucional/", fd,
                            { headers: { "Content-Type": "multipart/form-data" } });
                        }
                        mostrarToast("Foto atualizada!", "sucesso");
                        await carregarImagens();
                      } catch { mostrarToast("Erro ao salvar.", "erro"); }
                    }} />
                </label>
                <p className="text-xs mt-2" style={{ color: subtext }}>
                  Foto atual: FotoMetkzerepai.jpg (imagem do pai da empresa)
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── ADMIN PRINCIPAL ───────────────────────────────────────────────────────
const abas = [
  { id: "dashboard", label: "Dashboard",  Icone: DashboardIcon },
  { id: "cadastrar", label: "Cadastrar",  Icone: PlusIcon },
  { id: "produtos",  label: "Produtos",   Icone: PackageIcon },
  { id: "pedidos",   label: "Pedidos",    Icone: ReceiptIcon },
  { id: "estoque",   label: "Estoque",    Icone: ChartIcon },
  { id: "infos",     label: "Informações", Icone: EditIcon },
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
              className="px-4 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
              style={{ backgroundColor: abaAtiva === aba.id ? (dark ? "#ffffff" : "#000000") : (dark ? "#1f2937" : "#f3f4f6"),
                color: abaAtiva === aba.id ? (dark ? "#000000" : "#ffffff") : text,
                border: "1px solid " + (abaAtiva === aba.id ? "transparent" : border) }}>
              <aba.Icone size={15} strokeWidth={1.7} /> {aba.label}
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