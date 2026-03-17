import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const GALERIA_KEY = "metzker_galeria_trabalhos";

function Toast({ mensagem, tipo, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-3"
      style={{ backgroundColor: tipo === "sucesso" ? "#16a34a" : "#dc2626" }}>
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
      { id: "logos", label: "Logos" },
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
          <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={2} placeholder={form.categoria === "comunicacao" ? "Banner 1,5m x 80cm" : "Descreva o produto..."} style={{ ...inputStyle, resize: "none" }} /></div>
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
                        onChange={e => { const f = Array.from(e.target.files); setNovasImagens(f); setPreviews(f.map(x => URL.createObjectURL(x))); }} />
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

// ─── PEDIDOS ───────────────────────────────────────────────────────────────
function VerPedidos({ mostrarToast, dark, estilos }) {
  const { text, subtext, cardBg, border } = estilos;
  const [pedidos, setPedidos] = useState([]);
  const [personalizados, setPersonalizados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState(null);
  const [aba, setAba] = useState("catalogo"); // "catalogo" | "personalizado"

  useEffect(() => {
    Promise.all([
      api.get("pedidos/"),
      api.get("pedidos-personalizados/"),
    ]).then(([r1, r2]) => {
      setPedidos(r1.data);
      setPersonalizados(r2.data);
    }).catch(() => mostrarToast("Erro ao carregar pedidos.", "erro"))
      .finally(() => setLoading(false));
  }, []);

  async function atualizarStatus(id, status) {
    try {
      await api.patch(`pedidos-personalizados/${id}/`, { status });
      setPersonalizados(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      mostrarToast("Status atualizado!", "sucesso");
    } catch { mostrarToast("Erro ao atualizar.", "erro"); }
  }

  const ESTILOS_MAP = { minimalista: "Minimalista", moderno: "Moderno", classico: "Clássico", divertido: "Divertido", manuscrito: "Manuscrito" };
  const PALETAS_MAP = { "preto-branco": "Preto & Branco", azul: "Azul corporativo", vermelho: "Vermelho vibrante", verde: "Verde natural", dourado: "Dourado premium", personalizada: "Me consulte" };
  const APLICACOES_MAP = { camisa: "Camisas/Uniformes", banner: "Banner/Impressão", digital: "Uso Digital", acm: "Placa ACM", todos: "Todos os formatos" };
  const STATUS_CORES = { novo: "#2563eb", em_andamento: "#d97706", concluido: "#16a34a", cancelado: "#dc2626" };

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  return (
    <div>
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
          {pedidos.length === 0 && <p style={{ color: subtext }}>Nenhum pedido ainda.</p>}
          {pedidos.map(p => {
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
                          <th className="text-center p-3 font-semibold" style={{ color: text }}>Tam.</th>
                          <th className="text-center p-3 font-semibold" style={{ color: text }}>Qtd.</th>
                          <th className="text-right p-3 font-semibold" style={{ color: text }}>Subtotal</th>
                        </tr></thead>
                        <tbody>
                          {(p.itens || []).map((item, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? (dark ? "#1f2937" : "#fff") : (dark ? "#111827" : "#f9fafb") }}>
                              <td className="p-3" style={{ color: text }}>{item.produto_nome}</td>
                              <td className="p-3 text-center" style={{ color: subtext }}>{item.tamanho}</td>
                              <td className="p-3 text-center" style={{ color: subtext }}>{item.quantidade}</td>
                              <td className="p-3 text-right font-medium" style={{ color: text }}>R$ {(parseFloat(item.produto_preco) * item.quantidade).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <a href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: "#16a34a" }}>💬 WhatsApp</a>
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
          {personalizados.length === 0 && <p style={{ color: subtext }}>Nenhum pedido personalizado ainda.</p>}
          {personalizados.map(p => {
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
                      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>🏢 Empresa</p>
                        <p className="font-semibold text-sm" style={{ color: text }}>{p.nome_empresa}</p>
                        {p.slogan && <p className="text-xs italic" style={{ color: subtext }}>"{p.slogan}"</p>}
                        <p className="text-sm" style={{ color: subtext }}>Ramo: {p.ramo}</p>
                        <p className="text-sm" style={{ color: subtext }}>Quantidade: {p.quantidade} arte(s)</p>
                      </div>
                      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>👤 Contato</p>
                        <p className="font-semibold text-sm" style={{ color: text }}>{p.nome_cliente}</p>
                        {p.telefone && <p className="text-sm" style={{ color: subtext }}>📱 {p.telefone}</p>}
                        {p.email && <p className="text-sm" style={{ color: subtext }}>📧 {p.email}</p>}
                      </div>
                      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>🎨 Design</p>
                        <p className="text-sm" style={{ color: text }}>Estilo: <strong>{ESTILOS_MAP[p.estilo] || p.estilo}</strong></p>
                        <p className="text-sm" style={{ color: text }}>Paleta: <strong>{PALETAS_MAP[p.paleta] || p.paleta}</strong></p>
                        {p.aplicacoes?.length > 0 && (
                          <p className="text-sm" style={{ color: text }}>
                            Aplicações: <strong>{p.aplicacoes.map(a => APLICACOES_MAP[a] || a).join(", ")}</strong>
                          </p>
                        )}
                      </div>
                      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: subtext }}>📝 Detalhes</p>
                        {p.referencia && <p className="text-sm" style={{ color: subtext }}>Ref: {p.referencia}</p>}
                        {p.observacoes && <p className="text-sm" style={{ color: subtext }}>Obs: {p.observacoes}</p>}
                        {!p.referencia && !p.observacoes && <p className="text-sm" style={{ color: subtext }}>Sem observações</p>}
                      </div>
                    </div>

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
                            }}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {p.telefone && (
                      <a href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: "#16a34a" }}>
                        💬 Falar com {p.nome_cliente} pelo WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
      await Promise.all(Object.entries(valores[prodId] || {}).map(([tamanho, quantidade]) =>
        api.post("estoques/atualizar/", { produto: prodId, tamanho, quantidade: parseInt(quantidade) || 0 })
      ));
      mostrarToast("Estoque salvo!", "sucesso"); await carregar();
    } catch { mostrarToast("Erro ao salvar estoque.", "erro"); }
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
  { id: "cadastrar", label: "➕ Cadastrar" },
  { id: "produtos",  label: "📦 Produtos"  },
  { id: "pedidos",   label: "🧾 Pedidos"   },
  { id: "estoque",   label: "📊 Estoque"   },
  { id: "infos",     label: "✏️ Informações" },
];

export default function Admin() {
  const { dark } = useTheme();
  const [abaAtiva, setAbaAtiva] = useState("cadastrar");
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
        {abaAtiva === "cadastrar" && <CadastrarProduto {...props} />}
        {abaAtiva === "produtos"  && <ListarProdutos   {...props} />}
        {abaAtiva === "pedidos"   && <VerPedidos        {...props} />}
        {abaAtiva === "estoque"   && <GerenciarEstoque  {...props} />}
        {abaAtiva === "infos"     && <EditarInfos        {...props} />}
      </div>
    </div>
  );
}