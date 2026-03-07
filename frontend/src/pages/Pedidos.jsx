import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Pedidos() {
  const { dark } = useTheme();
  const { cart, increase, decrease, removeFromCart, setCart } = useContext(CartContext);

  const [cliente, setCliente] = useState({
    nome: "", telefone: "", cep: "", rua: "", numero: "",
    complemento: "", bairro: "", cidade: "", estado: "",
    formaPagamento: "", observacao: "",
  });

  const [erros, setErros] = useState({});
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const camposObrigatorios = ["nome", "telefone", "cep", "rua", "numero", "bairro", "cidade", "estado", "formaPagamento"];

  const total = cart.reduce(
    (acc, item) => acc + (parseFloat(item.produto?.preco) || 0) * item.quantidade, 0
  );

  const estoqueInsuficiente = cart.some(item => {
    const estoque = item.produto.estoques?.find(e => e.tamanho === item.tamanho);
    return !estoque || item.quantidade > estoque.quantidade;
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
    if (tentouEnviar) {
      setErros(prev => ({ ...prev, [name]: !value.trim() }));
    }
  }

  function validar() {
    const novosErros = {};
    camposObrigatorios.forEach(campo => {
      if (!cliente[campo] || !cliente[campo].trim()) {
        novosErros[campo] = true;
      }
    });
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function montarMensagem() {
    const itens = cart
      .map(item =>
        `• ${item.produto.nome} | Tam: ${item.tamanho} | ${item.quantidade}x | R$ ${(parseFloat(item.produto.preco) * item.quantidade).toFixed(2)}`
      )
      .join("%0A");

    const obs = cliente.observacao ? `%0A%0A📝 *Observações:* ${cliente.observacao}` : "";

    return (
      `Olá! Gostaria de fazer um pedido:%0A%0A` +
      `👤 *Nome:* ${cliente.nome}%0A` +
      `📱 *Telefone:* ${cliente.telefone}%0A%0A` +
      `🛍️ *Itens do Pedido:*%0A${itens}%0A%0A` +
      `💰 *Total: R$ ${total.toFixed(2)}*%0A%0A` +
      `📍 *Endereço de Entrega:*%0A` +
      `${cliente.rua}, ${cliente.numero}${cliente.complemento ? " - " + cliente.complemento : ""}%0A` +
      `${cliente.bairro} - ${cliente.cidade}/${cliente.estado}%0A` +
      `CEP: ${cliente.cep}%0A%0A` +
      `💳 *Forma de Pagamento:* ${cliente.formaPagamento}` +
      obs
    );
  }

  function enviarWhatsApp() {
    setTentouEnviar(true);
    if (!validar()) return;
    if (cart.length === 0) { alert("Carrinho vazio."); return; }
    window.open(`https://wa.me/5527997878391?text=${montarMensagem()}`, "_blank");
  }

  async function finalizarPedido() {
    setTentouEnviar(true);
    if (!validar()) return;
    if (estoqueInsuficiente) { alert("Existe item com estoque insuficiente."); return; }
    try {
      await api.post("pedidos/", {
        nome_cliente: cliente.nome,
        telefone: cliente.telefone,
        itens: cart.map(item => ({
          produto: item.produto.id,
          tamanho: item.tamanho,
          quantidade: item.quantidade,
        })),
      });
      window.open(`https://wa.me/5527997878391?text=${montarMensagem()}`, "_blank");
      setCart([]);
    } catch {
      alert("Erro ao finalizar pedido.");
    }
  }

  const bg = dark ? "#111827" : "#ffffff";
  const cardBg = dark ? "#1f2937" : "#ffffff";
  const border = dark ? "#374151" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#000000";
  const subtext = dark ? "#9ca3af" : "#6b7280";
  const inputBg = dark ? "#374151" : "#ffffff";
  const inputBorder = dark ? "#4b5563" : "#d1d5db";

  function inputStyle(campo) {
    const temErro = erros[campo];
    return {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid " + (temErro ? "#ef4444" : inputBorder),
      backgroundColor: temErro ? (dark ? "#3b1f1f" : "#fff5f5") : inputBg,
      color: text,
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    };
  }

  const labelStyle = (campo) => ({
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: erros[campo] ? "#ef4444" : subtext,
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  });

  const qtdErros = Object.keys(erros).length;

  return (
    <div style={{ backgroundColor: bg, color: text, minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

        {cart.length === 0 && (
          <p style={{ color: subtext }}>Carrinho vazio.</p>
        )}

        {/* ALERTA GERAL DE ERROS */}
        {tentouEnviar && qtdErros > 0 && (
          <div className="rounded-xl p-4 mb-6 flex items-start gap-3"
            style={{ backgroundColor: dark ? "#3b1f1f" : "#fef2f2", border: "1px solid #ef4444" }}>
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-500">Preencha todos os campos obrigatórios</p>
              <p className="text-sm" style={{ color: subtext }}>
                {qtdErros} campo{qtdErros > 1 ? "s" : ""} precisam ser preenchidos antes de continuar.
              </p>
            </div>
          </div>
        )}

        {/* ITENS */}
        {cart.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">🛍️ Seus Itens</h2>
            <div className="space-y-3">
              {cart.map((item, index) => {
                const estoque = item.produto?.estoques?.find(e => e.tamanho === item.tamanho);
                const semEstoque = !estoque || item.quantidade > estoque.quantidade;
                return (
                  <div key={index} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
                    <div>
                      <p className="font-semibold">{item.produto.nome}</p>
                      <p className="text-sm" style={{ color: subtext }}>Tamanho: {item.tamanho}</p>
                      <p className="text-sm font-medium">
                        R$ {(parseFloat(item.produto?.preco || 0) * item.quantidade).toFixed(2)}
                      </p>
                      {semEstoque && <p className="text-red-500 text-sm font-medium">⚠️ Estoque insuficiente</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decrease(item.produto.id, item.tamanho)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                        style={{ backgroundColor: dark ? "#374151" : "#f3f4f6", color: text }}>-</button>
                      <span className="w-6 text-center font-medium">{item.quantidade}</span>
                      <button onClick={() => increase(item.produto.id, item.tamanho)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                        style={{ backgroundColor: dark ? "#374151" : "#f3f4f6", color: text }}>+</button>
                      <button onClick={() => removeFromCart(item.produto.id, item.tamanho)}
                        className="ml-3 text-red-500 text-sm hover:text-red-700">Remover</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xl font-bold text-right">Total: R$ {total.toFixed(2)}</div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="space-y-6">

            {/* DADOS PESSOAIS */}
            <div className="rounded-xl p-6" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
              <h2 className="text-lg font-semibold mb-4">📋 Dados Pessoais</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle("nome")}>Nome completo *</label>
                  <input name="nome" value={cliente.nome} onChange={handleChange}
                    placeholder="Seu nome completo" style={inputStyle("nome")} />
                  {erros.nome && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("telefone")}>Telefone / WhatsApp *</label>
                  <input name="telefone" value={cliente.telefone} onChange={handleChange}
                    placeholder="(27) 99999-9999" style={inputStyle("telefone")} />
                  {erros.telefone && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
                </div>
              </div>
            </div>

            {/* ENDEREÇO */}
            <div className="rounded-xl p-6" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
              <h2 className="text-lg font-semibold mb-1">📍 Endereço de Entrega</h2>
              <p className="text-sm mb-4" style={{ color: subtext }}>
                Todos os campos de endereço são obrigatórios.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label style={labelStyle("cep")}>CEP *</label>
                  <input name="cep" value={cliente.cep} onChange={handleChange}
                    placeholder="29000-000" style={inputStyle("cep")} />
                  {erros.cep && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
                </div>
                <div className="md:col-span-2">
                  <label style={labelStyle("rua")}>Rua / Avenida *</label>
                  <input name="rua" value={cliente.rua} onChange={handleChange}
                    placeholder="Rua das Flores" style={inputStyle("rua")} />
                  {erros.rua && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("numero")}>Número *</label>
                  <input name="numero" value={cliente.numero} onChange={handleChange}
                    placeholder="123" style={inputStyle("numero")} />
                  {erros.numero && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
                </div>
                <div>
                  <label style={{ ...labelStyle("complemento"), color: subtext }}>Complemento</label>
                  <input name="complemento" value={cliente.complemento} onChange={handleChange}
                    placeholder="Apto 2, Bloco B" style={inputStyle("complemento")} />
                </div>
                <div>
                  <label style={labelStyle("bairro")}>Bairro *</label>
                  <input name="bairro" value={cliente.bairro} onChange={handleChange}
                    placeholder="Centro" style={inputStyle("bairro")} />
                  {erros.bairro && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("cidade")}>Cidade *</label>
                  <input name="cidade" value={cliente.cidade} onChange={handleChange}
                    placeholder="Vila Velha" style={inputStyle("cidade")} />
                  {erros.cidade && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("estado")}>Estado *</label>
                  <input name="estado" value={cliente.estado} onChange={handleChange}
                    placeholder="ES" style={inputStyle("estado")} />
                  {erros.estado && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
                </div>
              </div>
            </div>

            {/* PAGAMENTO */}
            <div className="rounded-xl p-6" style={{
              backgroundColor: cardBg,
              border: "1px solid " + (erros.formaPagamento ? "#ef4444" : border)
            }}>
              <h2 className="text-lg font-semibold mb-1">💳 Forma de Pagamento *</h2>
              {erros.formaPagamento && (
                <p className="text-red-500 text-sm mb-3">⚠️ Selecione uma forma de pagamento</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"].map(forma => (
                  <button key={forma}
                    onClick={() => {
                      setCliente({ ...cliente, formaPagamento: forma });
                      setErros(prev => ({ ...prev, formaPagamento: false }));
                    }}
                    className="py-3 px-4 rounded-lg text-sm font-medium transition"
                    style={{
                      backgroundColor: cliente.formaPagamento === forma ? "#000000" : (dark ? "#374151" : "#f3f4f6"),
                      color: cliente.formaPagamento === forma ? "#ffffff" : text,
                      border: "1px solid " + (cliente.formaPagamento === forma ? "#000000" : inputBorder),
                    }}>
                    {forma}
                  </button>
                ))}
              </div>
            </div>

            {/* OBSERVAÇÕES */}
            <div className="rounded-xl p-6" style={{ backgroundColor: cardBg, border: "1px solid " + border }}>
              <h2 className="text-lg font-semibold mb-4">📝 Observações <span style={{ color: subtext, fontWeight: 400, fontSize: "14px" }}>(opcional)</span></h2>
              <textarea name="observacao" value={cliente.observacao} onChange={handleChange}
                placeholder="Alguma informação adicional? Ex: cor preferida, personalização, etc."
                rows={3} style={{ ...inputStyle("observacao"), resize: "none" }} />
            </div>

            {/* BOTÕES */}
            <div className="grid md:grid-cols-2 gap-4 pb-8">
              <button onClick={enviarWhatsApp}
                className="py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ backgroundColor: "#22c55e" }}>
                💬 Enviar pelo WhatsApp
              </button>
              <button onClick={finalizarPedido} disabled={estoqueInsuficiente}
                className="py-4 rounded-xl font-semibold text-white transition hover:opacity-90"
                style={{
                  backgroundColor: estoqueInsuficiente ? "#9ca3af" : "#000000",
                  cursor: estoqueInsuficiente ? "not-allowed" : "pointer",
                }}>
                ✅ Confirmar Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pedidos;