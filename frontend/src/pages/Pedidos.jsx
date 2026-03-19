import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import api from "../services/api";

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065", border: "#E8E0D5",
  inputBg: "#FFFFFF", inputBorder: "#D5CBC0",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

// Formata telefone: (27) 99999-9999
function formatTelefone(valor) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2)  return n;
  if (n.length <= 6)  return `(${n.slice(0,2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
}

// Formata CEP: 29000-000
function formatCEP(valor) {
  const n = valor.replace(/\D/g, "").slice(0, 8);
  if (n.length <= 5) return n;
  return `${n.slice(0,5)}-${n.slice(5)}`;
}

// Busca CEP na ViaCEP e preenche endereço
async function buscarCEP(cep, setCliente) {
  const numeros = cep.replace(/\D/g, "");
  if (numeros.length !== 8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
    const data = await res.json();
    if (!data.erro) {
      setCliente(prev => ({
        ...prev,
        rua:    data.logradouro || prev.rua,
        bairro: data.bairro     || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf         || prev.estado,
      }));
    }
  } catch {}
}

function Pedidos() {
  const { cart, increase, decrease, removeFromCart, setCart } = useContext(CartContext);
  const [cliente, setCliente] = useState({
    nome: "", telefone: "", cep: "", rua: "", numero: "",
    complemento: "", bairro: "", cidade: "", estado: "",
    formaPagamento: "", observacao: "",
  });
  const [erros, setErros] = useState({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [mensagemEstoque, setMensagemEstoque] = useState("");

  const camposObrigatorios = ["nome", "telefone", "cep", "rua", "numero", "bairro", "cidade", "estado", "formaPagamento"];
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.produto?.preco) || 0) * item.quantidade, 0);

  // Verifica estoque item a item
  const itensComProblema = cart.filter(item => {
    const est = item.produto.estoques?.find(e => e.tamanho === item.tamanho);
    return !est || item.quantidade > est.quantidade;
  });
  const estoqueInsuficiente = itensComProblema.length > 0;

  function handleChange(e) {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
    if (tentouEnviar) setErros(prev => ({ ...prev, [name]: !value.trim() }));
  }

  function handleTelefone(e) {
    const formatted = formatTelefone(e.target.value);
    setCliente(prev => ({ ...prev, telefone: formatted }));
    if (tentouEnviar) setErros(prev => ({ ...prev, telefone: !formatted.trim() }));
  }

  function handleCEP(e) {
    const formatted = formatCEP(e.target.value);
    setCliente(prev => ({ ...prev, cep: formatted }));
    if (formatted.replace(/\D/g, "").length === 8) {
      buscarCEP(formatted, setCliente);
    }
    if (tentouEnviar) setErros(prev => ({ ...prev, cep: !formatted.trim() }));
  }

  function validar() {
    const novosErros = {};
    camposObrigatorios.forEach(c => { if (!cliente[c]?.trim()) novosErros[c] = true; });
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function montarMensagem() {
    const itens = cart.map(item =>
      `• ${item.produto.nome} | Tam: ${item.tamanho} | ${item.quantidade}x | R$ ${(parseFloat(item.produto.preco) * item.quantidade).toFixed(2)}`
    ).join("%0A");
    const obs = cliente.observacao ? `%0A%0A📝 *Observações:* ${cliente.observacao}` : "";
    return `Olá! Gostaria de fazer um pedido:%0A%0A👤 *Nome:* ${cliente.nome}%0A📱 *Telefone:* ${cliente.telefone}%0A%0A🛍️ *Itens:*%0A${itens}%0A%0A💰 *Total: R$ ${total.toFixed(2)}*%0A%0A📍 *Endereço:*%0A${cliente.rua}, ${cliente.numero}${cliente.complemento ? " - " + cliente.complemento : ""}%0A${cliente.bairro} - ${cliente.cidade}/${cliente.estado}%0ACEP: ${cliente.cep}%0A%0A💳 *Pagamento:* ${cliente.formaPagamento}${obs}`;
  }

  function enviarWhatsApp() {
    setTentouEnviar(true);
    setMensagemEstoque("");

    // Bloqueia se tiver estoque insuficiente
    if (estoqueInsuficiente) {
      const nomes = itensComProblema.map(i => i.produto.nome).join(", ");
      setMensagemEstoque(`⚠️ Não é possível enviar o pedido pois os seguintes itens estão sem estoque suficiente: ${nomes}. Ajuste as quantidades ou remova os itens para continuar.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!validar() || cart.length === 0) return;
    window.open(`https://wa.me/5527997878391?text=${montarMensagem()}`, "_blank");
  }

  async function finalizarPedido() {
    setTentouEnviar(true);
    setMensagemEstoque("");

    // Mostra mensagem de estoque mesmo ao clicar em confirmar
    if (estoqueInsuficiente) {
      const nomes = itensComProblema.map(i => i.produto.nome).join(", ");
      setMensagemEstoque(`⚠️ Não é possível confirmar o pedido pois os seguintes itens estão sem estoque suficiente: ${nomes}. Ajuste as quantidades ou remova os itens para continuar.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!validar()) return;

    try {
      await api.post("pedidos/", {
        nome_cliente: cliente.nome, telefone: cliente.telefone,
        cep: cliente.cep, rua: cliente.rua, numero: cliente.numero,
        complemento: cliente.complemento, bairro: cliente.bairro,
        cidade: cliente.cidade, estado: cliente.estado,
        forma_pagamento: cliente.formaPagamento, observacao: cliente.observacao,
        itens: cart.map(item => ({ produto: item.produto.id, tamanho: item.tamanho, quantidade: item.quantidade })),
      });
      window.open(`https://wa.me/5527997878391?text=${montarMensagem()}`, "_blank");
      setCart([]);
    } catch { alert("Erro ao finalizar pedido. Tente novamente."); }
  }

  const inputStyle = (campo) => ({
    width: "100%", padding: "10px 12px", borderRadius: "6px", boxSizing: "border-box",
    border: "1px solid " + (erros[campo] ? "#ef4444" : t.inputBorder),
    backgroundColor: erros[campo] ? "#fff5f5" : t.inputBg,
    color: t.text, fontSize: "14px", outline: "none", fontFamily: "system-ui",
  });
  const labelStyle = (campo) => ({
    display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px",
    textTransform: "uppercase", letterSpacing: "0.05em",
    color: erros[campo] ? "#ef4444" : t.textSecundario, fontFamily: "system-ui",
  });
  const cardStyle = { backgroundColor: t.bgCard, border: "1px solid " + t.border, borderRadius: "12px", padding: "24px" };
  const qtdErros = Object.keys(erros).filter(k => erros[k]).length;

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto px-4 md:p-6 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: t.text }}>Finalizar Pedido</h1>

        {cart.length === 0 && <p style={{ color: t.textSecundario }}>Carrinho vazio.</p>}

        {/* ALERTA DE ESTOQUE — aparece ao tentar enviar/confirmar */}
        {mensagemEstoque && (
          <div className="rounded-xl p-4 mb-6 flex items-start gap-3"
            style={{ backgroundColor: "#fef2f2", border: "2px solid #fecaca" }}>
            <span style={{ fontSize: "20px" }}>🚫</span>
            <div>
              <p className="font-semibold" style={{ color: "#dc2626" }}>Pedido bloqueado — estoque insuficiente</p>
              <p className="text-sm mt-1" style={{ color: "#7f1d1d" }}>{mensagemEstoque}</p>
            </div>
          </div>
        )}

        {tentouEnviar && qtdErros > 0 && !mensagemEstoque && (
          <div className="rounded-xl p-4 mb-6 flex items-start gap-3"
            style={{ backgroundColor: "#fff5f5", border: "1px solid #fecaca" }}>
            <span>⚠️</span>
            <div>
              <p className="font-semibold" style={{ color: "#dc2626" }}>Preencha todos os campos obrigatórios</p>
              <p className="text-sm" style={{ color: t.textSecundario }}>{qtdErros} campo{qtdErros > 1 ? "s" : ""} precisam ser preenchidos.</p>
            </div>
          </div>
        )}

        {/* ITENS */}
        {cart.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: t.text }}>🛍️ Seus Itens</h2>
            <div className="space-y-3">
              {cart.map((item, i) => {
                const est = item.produto?.estoques?.find(e => e.tamanho === item.tamanho);
                const semEstoque = !est || item.quantidade > est.quantidade;
                return (
                  <div key={i} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ backgroundColor: t.bgCard, border: "1px solid " + (semEstoque ? "#fecaca" : t.border) }}>
                    <div>
                      <p className="font-semibold" style={{ color: t.text }}>{item.produto.nome}</p>
                      <p className="text-sm" style={{ color: t.textSecundario }}>Tamanho: {item.tamanho}</p>
                      <p className="text-sm font-medium" style={{ color: t.text }}>
                        R$ {(parseFloat(item.produto?.preco || 0) * item.quantidade).toFixed(2)}
                      </p>
                      {semEstoque && (
                        <p className="text-sm font-semibold mt-1" style={{ color: "#dc2626" }}>
                          🚫 Estoque insuficiente — remova ou reduza a quantidade
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decrease(item.produto.id, item.tamanho)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                        style={{ backgroundColor: t.bgSecundario, color: t.text }}>-</button>
                      <span className="w-6 text-center font-medium" style={{ color: t.text }}>{item.quantidade}</span>
                      <button onClick={() => increase(item.produto.id, item.tamanho)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                        style={{ backgroundColor: t.bgSecundario, color: t.text }}>+</button>
                      <button onClick={() => removeFromCart(item.produto.id, item.tamanho)}
                        className="ml-3 text-sm" style={{ color: "#dc2626" }}>Remover</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xl font-bold text-right" style={{ color: t.text }}>
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="space-y-6">
            {/* DADOS PESSOAIS */}
            <div style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: t.text }}>📋 Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle("nome")}>Nome completo *</label>
                  <input name="nome" value={cliente.nome} onChange={handleChange}
                    placeholder="Seu nome completo" style={inputStyle("nome")} />
                  {erros.nome && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Campo obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("telefone")}>Telefone / WhatsApp *</label>
                  <input name="telefone" value={cliente.telefone}
                    onChange={handleTelefone}
                    placeholder="(27) 99999-9999"
                    inputMode="tel" maxLength={15}
                    style={inputStyle("telefone")} />
                  {erros.telefone && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Campo obrigatório</p>}
                </div>
              </div>
            </div>

            {/* ENDEREÇO */}
            <div style={cardStyle}>
              <h2 className="text-lg font-semibold mb-1" style={{ color: t.text }}>📍 Endereço de Entrega</h2>
              <p className="text-sm mb-4" style={{ color: t.textSecundario }}>Digite o CEP para preencher automaticamente.</p>
              <div className="grid md:grid-cols-3 gap-4">
                {/* CEP com auto-preenchimento */}
                <div>
                  <label style={labelStyle("cep")}>CEP *</label>
                  <input name="cep" value={cliente.cep}
                    onChange={handleCEP}
                    placeholder="29000-000"
                    inputMode="numeric" maxLength={9}
                    style={inputStyle("cep")} />
                  {erros.cep && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Campo obrigatório</p>}
                  {cliente.cep.replace(/\D/g, "").length === 8 && cliente.cidade && (
                    <p className="text-xs mt-1" style={{ color: "#16a34a" }}>✅ {cliente.cidade}/{cliente.estado}</p>
                  )}
                </div>

                {/* Rua */}
                <div className="md:col-span-2">
                  <label style={labelStyle("rua")}>Rua / Avenida *</label>
                  <input name="rua" value={cliente.rua} onChange={handleChange}
                    placeholder="Rua das Flores" style={inputStyle("rua")} />
                  {erros.rua && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Campo obrigatório</p>}
                </div>

                {/* Número */}
                <div>
                  <label style={labelStyle("numero")}>Número *</label>
                  <input name="numero" value={cliente.numero} onChange={handleChange}
                    placeholder="123" style={inputStyle("numero")} />
                  {erros.numero && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Campo obrigatório</p>}
                </div>

                {/* Complemento */}
                <div>
                  <label style={labelStyle("complemento")}>Complemento</label>
                  <input name="complemento" value={cliente.complemento} onChange={handleChange}
                    placeholder="Apto 2, Bloco B" style={inputStyle("complemento")} />
                </div>

                {/* Bairro */}
                <div>
                  <label style={labelStyle("bairro")}>Bairro *</label>
                  <input name="bairro" value={cliente.bairro} onChange={handleChange}
                    placeholder="Centro" style={inputStyle("bairro")} />
                  {erros.bairro && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Campo obrigatório</p>}
                </div>

                {/* Cidade */}
                <div>
                  <label style={labelStyle("cidade")}>Cidade *</label>
                  <input name="cidade" value={cliente.cidade} onChange={handleChange}
                    placeholder="Vila Velha" style={inputStyle("cidade")} />
                  {erros.cidade && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Campo obrigatório</p>}
                </div>

                {/* Estado */}
                <div>
                  <label style={labelStyle("estado")}>Estado *</label>
                  <input name="estado" value={cliente.estado} onChange={handleChange}
                    placeholder="ES" maxLength={2}
                    style={{ ...inputStyle("estado"), textTransform: "uppercase" }}
                    onInput={e => { e.target.value = e.target.value.toUpperCase(); }} />
                  {erros.estado && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Campo obrigatório</p>}
                </div>
              </div>
            </div>

            {/* PAGAMENTO */}
            <div style={{ ...cardStyle, borderColor: erros.formaPagamento ? "#fecaca" : t.border }}>
              <h2 className="text-lg font-semibold mb-1" style={{ color: t.text }}>💳 Forma de Pagamento *</h2>
              {erros.formaPagamento && <p className="text-sm mb-3" style={{ color: "#dc2626" }}>⚠️ Selecione uma forma de pagamento</p>}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"].map(forma => (
                  <button key={forma}
                    onClick={() => { setCliente(prev => ({ ...prev, formaPagamento: forma })); setErros(prev => ({ ...prev, formaPagamento: false })); }}
                    className="py-3 px-4 rounded-lg text-sm font-medium transition"
                    style={{
                      backgroundColor: cliente.formaPagamento === forma ? t.btnPrimarioBg : t.bgSecundario,
                      color: cliente.formaPagamento === forma ? t.btnPrimarioText : t.text,
                      border: "1px solid " + (cliente.formaPagamento === forma ? t.btnPrimarioBg : t.border),
                    }}>{forma}</button>
                ))}
              </div>
            </div>

            {/* OBSERVAÇÕES */}
            <div style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: t.text }}>
                📝 Observações <span style={{ color: t.textSecundario, fontWeight: 400, fontSize: "14px" }}>(opcional)</span>
              </h2>
              <textarea name="observacao" value={cliente.observacao} onChange={handleChange}
                placeholder="Alguma informação adicional?" rows={3}
                style={{ ...inputStyle("observacao"), resize: "none" }} />
            </div>

            {/* BOTÕES */}
            <div className="grid md:grid-cols-2 gap-4 pb-8">
              <button onClick={enviarWhatsApp}
                className="py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition"
                style={{ backgroundColor: "#22c55e" }}>
                💬 Enviar pelo WhatsApp
              </button>
              <button onClick={finalizarPedido}
                className="py-4 rounded-xl font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: t.btnPrimarioBg, color: t.btnPrimarioText, cursor: "pointer" }}>
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