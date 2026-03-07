import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Toast({ mensagem, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-3"
      style={{ backgroundColor: tipo === "sucesso" ? "#16a34a" : "#dc2626" }}>
      {tipo === "sucesso" ? "✅" : "❌"} {mensagem}
    </div>
  );
}

// ─── CADASTRAR PRODUTO ─────────────────────────────────────────────────────
function CadastrarProduto({ mostrarToast, dark, estilos }) {
  const { text, subtext, inputBg, inputBorder, cardBg, border } = estilos;
  const [form, setForm] = useState({ nome: "", descricao: "", preco: "" });
  const [imagens, setImagens] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "600", color: subtext, marginBottom: "4px", textTransform: "uppercase" };

  function handleImagens(e) {
    const files = Array.from(e.target.files);
    setImagens(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  }

  async function handleSubmit() {
    if (!form.nome || !form.preco) { mostrarToast("Preencha nome e preço.", "erro"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("nome", form.nome);
    fd.append("descricao", form.descricao || "");
    fd.append("preco", form.preco);
    fd.append("ativo", "true");
    imagens.forEach(img => fd.append("imagens", img));
    try {
      await api.post("produtos/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      mostrarToast(`"${form.nome}" cadastrado com sucesso!`, "sucesso");
      setForm({ nome: "", descricao: "", preco: "" });
      setImagens([]); setPreviews([]);
    } catch (e) {
      console.error(e.response?.data);
      mostrarToast("Erro ao cadastrar. Verifique os dados.", "erro");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: "560px" }}>
      <h2 className="text-xl font-semibold mb-6" style={{ color: text }}>Cadastrar Produto</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label style={labelStyle}>Nome *</label>
          <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Camiseta Polo" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Descrição</label>
          <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={3} placeholder="Descreva o produto..." style={{ ...inputStyle, resize: "none" }} />
        </div>
        <div>
          <label style={labelStyle}>Preço *</label>
          <input type="number" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} placeholder="129.90" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Imagens ({imagens.length} selecionada{imagens.length !== 1 ? "s" : ""})</label>
          <label className="flex flex-col items-center justify-center cursor-pointer rounded-xl p-8"
            style={{ border: "2px dashed " + inputBorder, backgroundColor: dark ? "#374151" : "#f9fafb" }}>
            <span className="text-3xl mb-2">📸</span>
            <span style={{ color: subtext, fontSize: "14px" }}>Clique para selecionar imagens</span>
            <span style={{ color: dark ? "#6b7280" : "#9ca3af", fontSize: "12px", marginTop: "4px" }}>Pode selecionar várias de uma vez</span>
            <input type="file" multiple accept="image/*" onChange={handleImagens} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} className="w-20 h-20 object-cover rounded-lg" style={{ border: "1px solid " + inputBorder }} />
                  <button onClick={() => { const n = imagens.filter((_, j) => j !== i); setImagens(n); setPreviews(n.map(f => URL.createObjectURL(f))); }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: "#ef4444", color: "white" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleSubmit} disabled={loading}
          className="py-3 rounded-lg font-semibold text-white"
          style={{ backgroundColor: loading ? "#9ca3af" : "#000000", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Salvando..." : "Salvar Produto"}
        </button>
      </div>
    </div>
  );
}

// ─── LISTAR PRODUTOS ───────────────────────────────────────────────────────
function ListarProdutos({ mostrarToast, dark, estilos }) {
  const { text, subtext, cardBg, border, inputBg, inputBorder } = estilos;
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [novasImagens, setNovasImagens] = useState([]);
  const [previews, setPreviews] = useState([]);

  const inputStyle = { padding: "7px 10px", borderRadius: "6px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" };

  const carregar = useCallback(async () => {
    try { const res = await api.get("produtos/"); setProdutos(res.data); }
    catch { mostrarToast("Erro ao carregar produtos.", "erro"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function toggleAtivo(p) {
    try {
      const fd = new FormData();
      fd.append("ativo", !p.ativo);
      fd.append("nome", p.nome);
      fd.append("preco", p.preco);
      await api.patch(`produtos/${p.id}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      mostrarToast(`"${p.nome}" ${!p.ativo ? "ativado" : "desativado"}!`, "sucesso");
      carregar();
    } catch { mostrarToast("Erro ao alterar status.", "erro"); }
  }

  async function excluir(p) {
    if (!confirm(`Excluir "${p.nome}"?`)) return;
    try { await api.delete(`produtos/${p.id}/`); mostrarToast(`"${p.nome}" excluído.`, "sucesso"); carregar(); }
    catch { mostrarToast("Erro ao excluir.", "erro"); }
  }

  async function salvarEdicao() {
    try {
      const fd = new FormData();
      fd.append("nome", editando.nome);
      fd.append("preco", editando.preco);
      fd.append("descricao", editando.descricao || "");
      fd.append("ativo", editando.ativo ? "true" : "false");
      novasImagens.forEach(img => fd.append("imagens", img));
      await api.patch(`produtos/${editando.id}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      mostrarToast("Produto atualizado!", "sucesso");
      setEditando(null); setNovasImagens([]); setPreviews([]);
      carregar();
    } catch { mostrarToast("Erro ao atualizar.", "erro"); }
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
                {p.imagens?.[0]?.imagem ? <img src={p.imagens[0].imagem} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>}
              </div>

              {editando?.id === p.id ? (
                <div className="flex-1 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: "11px", color: subtext, display: "block", marginBottom: "3px" }}>NOME</label>
                      <input value={editando.nome} onChange={e => setEditando({ ...editando, nome: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", color: subtext, display: "block", marginBottom: "3px" }}>PREÇO</label>
                      <input type="number" value={editando.preco} onChange={e => setEditando({ ...editando, preco: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: subtext, display: "block", marginBottom: "3px" }}>DESCRIÇÃO</label>
                    <textarea value={editando.descricao || ""} onChange={e => setEditando({ ...editando, descricao: e.target.value })} rows={2} style={{ ...inputStyle, resize: "none" }} />
                  </div>
                  {/* STATUS ATIVO */}
                  <div className="flex items-center gap-3">
                    <label style={{ fontSize: "11px", color: subtext, textTransform: "uppercase" }}>Visível no catálogo</label>
                    <button onClick={() => setEditando({ ...editando, ativo: !editando.ativo })}
                      className="px-3 py-1 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: editando.ativo ? "#16a34a" : "#dc2626", color: "white" }}>
                      {editando.ativo ? "✅ Ativo" : "❌ Inativo"}
                    </button>
                  </div>
                  {/* TROCAR IMAGENS */}
                  <div>
                    <label style={{ fontSize: "11px", color: subtext, display: "block", marginBottom: "3px" }}>TROCAR IMAGENS (substitui todas)</label>
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg text-sm"
                      style={{ border: "1px dashed " + inputBorder, color: subtext, display: "inline-flex" }}>
                      📸 Selecionar novas imagens
                      <input type="file" multiple accept="image/*" className="hidden"
                        onChange={e => { const f = Array.from(e.target.files); setNovasImagens(f); setPreviews(f.map(x => URL.createObjectURL(x))); }} />
                    </label>
                    {previews.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {previews.map((src, i) => <img key={i} src={src} className="w-14 h-14 object-cover rounded-lg" style={{ border: "1px solid " + inputBorder }} />)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={salvarEdicao} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "#16a34a" }}>Salvar</button>
                    <button onClick={() => { setEditando(null); setNovasImagens([]); setPreviews([]); }} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: text }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: text }}>{p.nome}</p>
                    <p className="text-sm" style={{ color: subtext }}>R$ {Number(p.preco).toFixed(2)}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ backgroundColor: p.ativo ? "#dcfce7" : "#fee2e2", color: p.ativo ? "#16a34a" : "#dc2626" }}>
                      {p.ativo ? "● Ativo" : "● Inativo"}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    <button onClick={() => toggleAtivo(p)}
                      className="px-3 py-1.5 text-sm rounded-lg font-medium"
                      style={{ backgroundColor: p.ativo ? "#fee2e2" : "#dcfce7", color: p.ativo ? "#dc2626" : "#16a34a" }}>
                      {p.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => { setEditando(p); setNovasImagens([]); setPreviews([]); }}
                      className="px-3 py-1.5 text-sm rounded-lg"
                      style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: text }}>Editar</button>
                    <button onClick={() => excluir(p)}
                      className="px-3 py-1.5 text-sm rounded-lg"
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
  const { text, subtext, cardBg, border, inputBg, inputBorder } = estilos;
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState(null); // id do pedido expandido

  useEffect(() => {
    api.get("pedidos/")
      .then(res => setPedidos(res.data))
      .catch(() => mostrarToast("Erro ao carregar pedidos.", "erro"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: text }}>
        Pedidos ({pedidos.length})
      </h2>
      <p className="text-sm mb-6" style={{ color: subtext }}>
        Clique em um pedido para ver os detalhes completos.
      </p>

      {pedidos.length === 0 && (
        <p style={{ color: subtext }}>Nenhum pedido ainda.</p>
      )}

      <div className="space-y-3">
        {pedidos.map(p => {
          const expandido = aberto === p.id;
          const totalPedido = p.total || p.itens?.reduce(
            (acc, i) => acc + (parseFloat(i.produto_preco) * i.quantidade), 0
          ) || 0;

          return (
            <div key={p.id} className="rounded-xl overflow-hidden"
              style={{ backgroundColor: cardBg, border: "1px solid " + border }}>

              {/* CABEÇALHO CLICÁVEL */}
              <button
                onClick={() => setAberto(expandido ? null : p.id)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 rounded-lg font-mono"
                    style={{ backgroundColor: dark ? "#374151" : "#e5e7eb", color: subtext }}>
                    #{p.id}
                  </span>
                  <div>
                    <p className="font-semibold" style={{ color: text }}>{p.nome_cliente}</p>
                    <p className="text-xs" style={{ color: subtext }}>
                      {new Date(p.data_pedido).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm" style={{ color: text }}>
                    R$ {Number(totalPedido).toFixed(2)}
                  </span>
                  <span style={{ color: subtext }}>{expandido ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* DETALHES EXPANDIDOS */}
              {expandido && (
                <div className="px-5 pb-5 space-y-5"
                  style={{ borderTop: "1px solid " + border }}>

                  {/* GRID DE INFORMAÇÕES */}
                  <div className="grid md:grid-cols-3 gap-4 pt-4">

                    {/* CLIENTE */}
                    <div className="rounded-lg p-4"
                      style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                      <p className="text-xs font-bold uppercase mb-3" style={{ color: subtext }}>
                        👤 Cliente
                      </p>
                      <p className="font-semibold text-sm" style={{ color: text }}>{p.nome_cliente}</p>
                      <p className="text-sm mt-1" style={{ color: subtext }}>📱 {p.telefone}</p>
                    </div>

                    {/* ENDEREÇO */}
                    <div className="rounded-lg p-4"
                      style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                      <p className="text-xs font-bold uppercase mb-3" style={{ color: subtext }}>
                        📍 Endereço
                      </p>
                      {p.rua ? (
                        <div className="text-sm space-y-0.5" style={{ color: text }}>
                          <p>{p.rua}, {p.numero}{p.complemento ? ` — ${p.complemento}` : ""}</p>
                          <p>{p.bairro}</p>
                          <p>{p.cidade}/{p.estado}</p>
                          <p style={{ color: subtext }}>CEP: {p.cep}</p>
                        </div>
                      ) : (
                        <p className="text-sm" style={{ color: subtext }}>Retirada no local</p>
                      )}
                    </div>

                    {/* PAGAMENTO */}
                    <div className="rounded-lg p-4"
                      style={{ backgroundColor: dark ? "#111827" : "#f3f4f6" }}>
                      <p className="text-xs font-bold uppercase mb-3" style={{ color: subtext }}>
                        💳 Pagamento
                      </p>
                      <p className="font-semibold text-sm" style={{ color: text }}>
                        {p.forma_pagamento || "Não informado"}
                      </p>
                      {p.observacao && (
                        <p className="text-xs mt-2" style={{ color: subtext }}>
                          📝 {p.observacao}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ITENS DO PEDIDO */}
                  <div>
                    <p className="text-xs font-bold uppercase mb-3" style={{ color: subtext }}>
                      🛍️ Itens
                    </p>
                    <div className="rounded-lg overflow-hidden"
                      style={{ border: "1px solid " + border }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: dark ? "#374151" : "#f3f4f6" }}>
                            <th className="text-left p-3 font-semibold" style={{ color: text }}>Produto</th>
                            <th className="text-center p-3 font-semibold" style={{ color: text }}>Tam.</th>
                            <th className="text-center p-3 font-semibold" style={{ color: text }}>Qtd.</th>
                            <th className="text-right p-3 font-semibold" style={{ color: text }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(p.itens || []).map((item, i) => (
                            <tr key={i}
                              style={{ backgroundColor: i % 2 === 0
                                ? (dark ? "#1f2937" : "#ffffff")
                                : (dark ? "#111827" : "#f9fafb") }}>
                              <td className="p-3" style={{ color: text }}>{item.produto_nome}</td>
                              <td className="p-3 text-center" style={{ color: subtext }}>{item.tamanho}</td>
                              <td className="p-3 text-center" style={{ color: subtext }}>{item.quantidade}</td>
                              <td className="p-3 text-right font-medium" style={{ color: text }}>
                                R$ {(parseFloat(item.produto_preco) * item.quantidade).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ borderTop: "2px solid " + border }}>
                            <td colSpan={3} className="p-3 text-right font-bold" style={{ color: text }}>
                              Total:
                            </td>
                            <td className="p-3 text-right font-bold text-base" style={{ color: text }}>
                              R$ {Number(totalPedido).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* AÇÃO WHATSAPP */}
                  <a
                    href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: "#16a34a" }}>
                    💬 Entrar em contato via WhatsApp
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ESTOQUE ───────────────────────────────────────────────────────────────
function GerenciarEstoque({ mostrarToast, dark, estilos }) {
  const { text, subtext, cardBg, border, inputBg, inputBorder } = estilos;
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  // valores[prodId][tamanho] = quantidade
  const [valores, setValores] = useState({});
  // tamanhos que existem no banco por produto
  const [tamanhosOriginais, setTamanhosOriginais] = useState({});
  const [novoTamanho, setNovoTamanho] = useState({});
  const [salvando, setSalvando] = useState({});

  const carregar = useCallback(async () => {
    try {
      const res = await api.get("produtos/");
      setProdutos(res.data);
      const vals = {}, originais = {};
      res.data.forEach(p => {
        vals[p.id] = {};
        originais[p.id] = [];
        (p.estoques || []).forEach(e => {
          vals[p.id][e.tamanho] = e.quantidade;
          originais[p.id].push(e.tamanho);
        });
      });
      setValores(vals);
      setTamanhosOriginais(originais);
    } catch { mostrarToast("Erro ao carregar.", "erro"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function setQtd(prodId, tamanho, qtd) {
    setValores(prev => ({ ...prev, [prodId]: { ...prev[prodId], [tamanho]: qtd } }));
  }

  function adicionarTamanho(prodId) {
    const tam = (novoTamanho[prodId] || "").trim().toUpperCase();
    if (!tam) { mostrarToast("Digite um tamanho válido.", "erro"); return; }
    if (valores[prodId]?.[tam] !== undefined) { mostrarToast("Tamanho já existe.", "erro"); return; }
    setValores(prev => ({ ...prev, [prodId]: { ...prev[prodId], [tam]: 0 } }));
    setNovoTamanho(prev => ({ ...prev, [prodId]: "" }));
  }

  async function removerTamanho(prodId, tamanho) {
    // Se existe no banco, deleta via API
    if (tamanhosOriginais[prodId]?.includes(tamanho)) {
      try {
        await api.delete("estoques/remover/", { data: { produto: prodId, tamanho } });
        setTamanhosOriginais(prev => ({ ...prev, [prodId]: prev[prodId].filter(t => t !== tamanho) }));
      } catch {
        mostrarToast("Erro ao remover tamanho.", "erro");
        return;
      }
    }
    // Remove da tela
    setValores(prev => {
      const novo = { ...prev[prodId] };
      delete novo[tamanho];
      return { ...prev, [prodId]: novo };
    });
    mostrarToast(`Tamanho ${tamanho} removido.`, "sucesso");
  }

  async function salvarEstoque(prodId) {
    setSalvando(prev => ({ ...prev, [prodId]: true }));
    const tamanhos = valores[prodId] || {};
    try {
      await Promise.all(
        Object.entries(tamanhos).map(([tamanho, quantidade]) =>
          api.post("estoques/atualizar/", {
            produto: prodId,
            tamanho,
            quantidade: parseInt(quantidade) || 0
          })
        )
      );
      mostrarToast("Estoque salvo com sucesso!", "sucesso");
      // Recarrega para atualizar quais tamanhos existem no banco
      await carregar();
    } catch (e) {
      console.error(e.response?.data);
      mostrarToast("Erro ao salvar estoque.", "erro");
    } finally {
      setSalvando(prev => ({ ...prev, [prodId]: false }));
    }
  }

  if (loading) return <p style={{ color: subtext }}>Carregando...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: text }}>Gerenciar Estoque</h2>
      <p className="text-sm mb-6" style={{ color: subtext }}>
        Adicione os tamanhos e quantidades. Clique em "Salvar Estoque" para confirmar.
      </p>
      <div className="space-y-4">
        {produtos.map(p => {
          const tams = Object.keys(valores[p.id] || {});
          return (
            <div key={p.id} className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
              <p className="font-semibold mb-4" style={{ color: text }}>{p.nome}</p>

              {tams.length === 0 && (
                <p className="text-sm mb-4" style={{ color: subtext }}>Nenhum tamanho cadastrado ainda.</p>
              )}

              <div className="flex gap-3 flex-wrap mb-4">
                {tams.map(tam => (
                  <div key={tam} className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold" style={{ color: subtext }}>{tam}</span>
                      <button onClick={() => removerTamanho(p.id, tam)}
                        className="text-xs leading-none" style={{ color: "#ef4444" }} title="Remover">✕</button>
                    </div>
                    <input type="number" min="0"
                      value={valores[p.id]?.[tam] ?? 0}
                      onChange={e => setQtd(p.id, tam, e.target.value)}
                      className="text-center text-sm rounded-lg"
                      style={{ width: "64px", padding: "6px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, outline: "none" }} />
                  </div>
                ))}
              </div>

              {/* ADICIONAR TAMANHO */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={novoTamanho[p.id] || ""}
                  onChange={e => setNovoTamanho(prev => ({ ...prev, [p.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && adicionarTamanho(p.id)}
                  placeholder="P, M, G, XGG, 38..."
                  className="text-sm rounded-lg"
                  style={{ padding: "6px 10px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, outline: "none", width: "150px" }}
                />
                <button onClick={() => adicionarTamanho(p.id)}
                  className="px-3 py-1.5 text-sm rounded-lg font-medium text-white"
                  style={{ backgroundColor: "#374151" }}>
                  + Tamanho
                </button>
              </div>

              {/* SALVAR */}
              <button onClick={() => salvarEstoque(p.id)} disabled={salvando[p.id]}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: salvando[p.id] ? "#9ca3af" : "#16a34a", cursor: salvando[p.id] ? "not-allowed" : "pointer" }}>
                {salvando[p.id] ? "Salvando..." : "💾 Salvar Estoque"}
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
  const { text, subtext, inputBg, inputBorder } = estilos;
  const [form, setForm] = useState({ whatsapp: "", email: "", endereco: "", cidade: "", atendimento: "" });

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid " + inputBorder, backgroundColor: inputBg, color: text, fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: "560px" }}>
      <h2 className="text-xl font-semibold mb-6" style={{ color: text }}>Editar Informações</h2>
      <div className="flex flex-col gap-4">
        {[
          { key: "whatsapp", label: "WhatsApp", placeholder: "(27) 99885-3043" },
          { key: "email", label: "E-mail", placeholder: "contato@metzker.com" },
          { key: "endereco", label: "Endereço", placeholder: "Rua Tobias Barreto, 37" },
          { key: "cidade", label: "Cidade / Estado", placeholder: "Vila Velha - ES" },
          { key: "atendimento", label: "Horário de Atendimento", placeholder: "Segunda a Sexta, 9h às 18h" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: subtext, marginBottom: "4px", textTransform: "uppercase" }}>{label}</label>
            <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} style={inputStyle} />
          </div>
        ))}
        <button onClick={() => mostrarToast("Informações atualizadas!", "sucesso")}
          className="py-3 rounded-lg font-semibold text-white"
          style={{ backgroundColor: "#000000" }}>
          Salvar Informações
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN PRINCIPAL ───────────────────────────────────────────────────────
const abas = [
  { id: "cadastrar", label: "➕ Cadastrar" },
  { id: "produtos", label: "📦 Produtos" },
  { id: "pedidos", label: "🧾 Pedidos" },
  { id: "estoque", label: "📊 Estoque" },
  { id: "infos", label: "✏️ Informações" },
];

export default function Admin() {
  const { dark } = useTheme();
  const [abaAtiva, setAbaAtiva] = useState("cadastrar");
  const [toast, setToast] = useState(null);

  const bg = dark ? "#111827" : "#ffffff";
  const text = dark ? "#ffffff" : "#000000";
  const border = dark ? "#374151" : "#e5e7eb";

  const estilos = {
    text,
    subtext: dark ? "#9ca3af" : "#6b7280",
    cardBg: dark ? "#1f2937" : "#f9fafb",
    border,
    inputBg: dark ? "#374151" : "#ffffff",
    inputBorder: dark ? "#4b5563" : "#d1d5db",
  };

  function mostrarToast(mensagem, tipo) { setToast({ mensagem, tipo }); }
  const props = { mostrarToast, dark, estilos };

  return (
    <div style={{ backgroundColor: bg, color: text, minHeight: "100vh" }}>
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
        <div className="flex gap-2 flex-wrap mb-8 pb-4" style={{ borderBottom: "1px solid " + border }}>
          {abas.map(aba => (
            <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: abaAtiva === aba.id ? (dark ? "#ffffff" : "#000000") : (dark ? "#1f2937" : "#f3f4f6"),
                color: abaAtiva === aba.id ? (dark ? "#000000" : "#ffffff") : text,
                border: "1px solid " + (abaAtiva === aba.id ? "transparent" : border),
              }}>
              {aba.label}
            </button>
          ))}
        </div>
        {abaAtiva === "cadastrar" && <CadastrarProduto {...props} />}
        {abaAtiva === "produtos"  && <ListarProdutos  {...props} />}
        {abaAtiva === "pedidos"   && <VerPedidos      {...props} />}
        {abaAtiva === "estoque"   && <GerenciarEstoque {...props} />}
        {abaAtiva === "infos"     && <EditarInfos     {...props} />}
      </div>
    </div>
  );
}