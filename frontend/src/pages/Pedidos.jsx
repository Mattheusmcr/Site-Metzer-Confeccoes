import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import api from "../services/api";

// ── CÁLCULO DE FRETE ─────────────────────────────────────────────────────────
const REGIAO_METRO_ES = ["vitoria","vila velha","cariacica","serra","viana","guarapari","fundao"];

function estimarMotoboy(cidade, estado) {
  if ((estado||"").toUpperCase() !== "ES") return null;
  const c = (cidade||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if (!REGIAO_METRO_ES.some(r => c.includes(r))) return null;
  if (c.includes("vila velha")) return { min:8, max:25 };
  if (c.includes("vitoria")||c.includes("vitória")) return { min:15, max:35 };
  if (c.includes("cariacica")) return { min:20, max:40 };
  if (c.includes("serra")) return { min:25, max:45 };
  if (c.includes("guarapari")) return { min:40, max:70 };
  return { min:15, max:40 };
}

function estimarCorreios(estado) {
  const e = (estado||"").toUpperCase();
  if (e === "ES") return { pac:"R$ 20–35", sedex:"R$ 35–55", prazo:"3–5 dias úteis" };
  if (["SP","RJ","MG"].includes(e)) return { pac:"R$ 25–45", sedex:"R$ 45–70", prazo:"5–8 dias úteis" };
  return { pac:"R$ 35–60", sedex:"R$ 60–95", prazo:"7–12 dias úteis" };
}

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065", border: "#E8E0D5",
  inputBg: "#FFFFFF", inputBorder: "#D5CBC0",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FAF8F5",
};

function formatTelefone(v) {
  const n = v.replace(/\D/g,"").slice(0,11);
  if (n.length<=2) return n;
  if (n.length<=6) return `(${n.slice(0,2)}) ${n.slice(2)}`;
  if (n.length<=10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
}
function formatCEP(v) {
  const n = v.replace(/\D/g,"").slice(0,8);
  return n.length>5 ? `${n.slice(0,5)}-${n.slice(5)}` : n;
}
async function buscarCEP(cep, setCliente) {
  const n = cep.replace(/\D/g,"");
  if (n.length!==8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${n}/json/`);
    const data = await res.json();
    if (!data.erro) setCliente(p => ({...p,
      rua: data.logradouro||p.rua, bairro: data.bairro||p.bairro,
      cidade: data.localidade||p.cidade, estado: data.uf||p.estado,
    }));
  } catch {}
}
function emailValido(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export default function Pedidos() {
  const { cart, increase, decrease, removeFromCart, setCart } = useContext(CartContext);
  const [cliente, setCliente] = useState({
    nome:"", telefone:"", email:"", cep:"", rua:"", numero:"",
    complemento:"", bairro:"", cidade:"", estado:"", formaPagamento:"", observacao:"",
  });
  const [erros, setErros] = useState({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [mensagemEstoque, setMensagemEstoque] = useState("");
  const [erroPedido, setErroPedido] = useState("");
  const [pedidoConcluido, setPedidoConcluido] = useState(false);
  const [pedidoSalvo, setPedidoSalvo] = useState(null);
  // Verificar retorno do Mercado Pago via URL params
  const urlParams = new URLSearchParams(window.location.search);
  const mpStatus = urlParams.get('status');
  const [protocolo, setProtocolo] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [frete, setFrete] = useState({ tipo: "", valor: 0 });
  const [calcFrete, setCalcFrete] = useState(false);

  const total = cart.reduce((a,i) => a + (parseFloat(i.produto?.preco)||0)*i.quantidade, 0);
  const itensComProblema = cart.filter(item => {
    const est = item.produto.estoques?.find(e => e.tamanho===item.tamanho);
    return !est || item.quantidade>est.quantidade;
  });
  const estoqueInsuficiente = itensComProblema.length>0;

  function handleChange(e) {
    const {name,value} = e.target;
    setCliente(p => ({...p,[name]:value}));
    if (tentouEnviar) setErros(p => ({...p,[name]:!value.trim()}));
  }
  function handleTelefone(e) {
    const f = formatTelefone(e.target.value);
    setCliente(p => ({...p,telefone:f}));
    if (tentouEnviar) setErros(p => ({...p,telefone:!f.trim()}));
  }
  function handleEmail(e) {
    setCliente(p => ({...p,email:e.target.value}));
    if (tentouEnviar) setErros(p => ({...p,email:!emailValido(e.target.value)}));
  }
  function handleCEP(e) {
    const f = formatCEP(e.target.value);
    setCliente(p => ({...p,cep:f}));
    if (f.replace(/\D/g,"").length===8) buscarCEP(f,setCliente);
    if (tentouEnviar) setErros(p => ({...p,cep:!f.trim()}));
  }

  function validar() {
    const novos = {};
    ["nome","telefone","cep","rua","numero","bairro","cidade","estado"].forEach(c => {
      if (!cliente[c]?.trim()) novos[c]=true;
    });
    if (!emailValido(cliente.email)) novos.email=true;
    setErros(novos);
    return Object.keys(novos).length===0;
  }

  function gerarPDF(dados) {
    const { itens, totalSalvo, c } = dados;
    const itensHTML = itens.map(i =>
      `<tr style="border-bottom:1px solid #eee">
        <td style="padding:8px 4px">${i.nome}</td>
        <td style="padding:8px 4px;text-align:center">${i.tamanho}</td>
        <td style="padding:8px 4px;text-align:center">${i.qtd}</td>
        <td style="padding:8px 4px;text-align:right">R$ ${(i.preco*i.qtd).toFixed(2)}</td>
      </tr>`
    ).join("");

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Pedido Metzker #${Date.now().toString().slice(-6)}</title>
    <style>
      body{font-family:system-ui,sans-serif;max-width:600px;margin:40px auto;padding:0 20px;color:#1a1a1a}
      .logo{font-size:28px;font-weight:300;letter-spacing:2px;margin-bottom:4px}
      .logo span{color:#c41e3a;font-weight:700}
      h2{font-size:20px;font-weight:600;margin:24px 0 4px}
      .badge{display:inline-block;padding:4px 12px;background:#f0fdf4;color:#16a34a;border:1px solid #86efac;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th{background:#f3f4f6;padding:10px 4px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
      td{font-size:14px}
      .total{font-size:18px;font-weight:700;text-align:right;padding:12px 0;border-top:2px solid #1a1a1a}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}
      .info-block{padding:12px;background:#f9fafb;border:1px solid #e5e7eb}
      .info-block h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin:0 0 6px}
      .info-block p{font-size:13px;margin:2px 0}
      .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center}
    </style></head><body>
      <div class="logo"><span>m</span>etzker soluções</div>
      <p style="color:#6b7280;font-size:12px;margin:0 0 20px">Vila Velha, ES · (27) 99787-8391 · andremetzkrr@gmail.com</p>
      <h2>Comprovante de Pedido</h2>
      <span class="badge">✅ Pedido confirmado</span>
      <div style="margin:12px 0;padding:12px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-family:monospace;font-size:18px;font-weight:700;letter-spacing:0.05em">
        🔖 ${dados.protocolo || ""}
      </div>
      <div class="info-grid">
        <div class="info-block">
          <h3>Cliente</h3>
          <p><strong>${c.nome}</strong></p>
          <p>${c.telefone}</p>
          <p>${c.email}</p>
        </div>
        <div class="info-block">
          <h3>Endereço de entrega</h3>
          <p>${c.rua}, ${c.numero}${c.complemento?" - "+c.complemento:""}</p>
          <p>${c.bairro} — ${c.cidade}/${c.estado}</p>
          <p>CEP: ${c.cep}</p>
        </div>
        <div class="info-block">
          <h3>Pagamento</h3>
          <p>${c.formaPagamento}</p>
        </div>
        <div class="info-block">
          <h3>Data</h3>
          <p>${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</p>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>Produto</th><th style="text-align:center">Tamanho</th>
          <th style="text-align:center">Qtd</th><th style="text-align:right">Subtotal</th>
        </tr></thead>
        <tbody>${itensHTML}</tbody>
      </table>
      <div class="total">Total: R$ ${totalSalvo.toFixed(2)}</div>
      ${c.observacao ? `<p style="margin-top:12px;font-size:13px;color:#6b7280">Obs: ${c.observacao}</p>` : ""}
      <div class="footer">
        Guarde este comprovante. Nossa equipe entrará em contato pelo WhatsApp para confirmar a entrega.<br/>
        Desenvolvido por Matheus Costa Rodrigues · metzkersolucoes.com.br
      </div>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }

  function montarMsgWA(dados) {
    const {itens,totalSalvo,c} = dados;
    const itensStr = itens.map(i =>
      `• ${i.nome} | ${i.tamanho} | ${i.qtd}x | R$ ${(i.preco*i.qtd).toFixed(2)}`
    ).join("%0A");
    const obs = c.observacao ? `%0A%0A📝 *Obs:* ${c.observacao}` : "";
    return `https://wa.me/5527997878391?text=Olá! Fiz um pedido no site:%0A%0A👤 *Nome:* ${c.nome}%0A📱 *Tel:* ${c.telefone}%0A📧 *Email:* ${c.email}%0A%0A🛍️ *Itens:*%0A${itensStr}%0A%0A💰 *Total: R$ ${totalSalvo.toFixed(2)}*%0A%0A📍 *Endereço:*%0A${c.rua}, ${c.numero}${c.complemento?" - "+c.complemento:""}%0A${c.bairro} - ${c.cidade}/${c.estado} | CEP: ${c.cep}%0A%0A💳 *Pagamento:* ${c.formaPagamento}${obs}`;
  }

  function verificarEstoque() {
    if (estoqueInsuficiente) {
      const nomes = itensComProblema.map(i => i.produto.nome).join(", ");
      setMensagemEstoque(`⚠️ Estoque insuficiente: ${nomes}. Ajuste as quantidades.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    return true;
  }

  async function pagarComMP() {
    setTentouEnviar(true);
    setCalcFrete(true);
    setMensagemEstoque("");
    setErroPedido("");
    if (!verificarEstoque()) return;
    if (!frete.tipo) {
      setErroPedido("Selecione uma opção de entrega antes de continuar.");
      window.scrollTo({top:0,behavior:"smooth"});
      return;
    }
    if (!validar()) { window.scrollTo({top:0,behavior:"smooth"}); return; }

    try {
      const payload = {
        itens: cart.map(i => ({
          produto_id: i.produto.id,
          nome: i.produto.nome,
          quantidade: i.quantidade,
          preco: parseFloat(i.produto.preco),
          tamanho: i.tamanho,
        })),
        cliente: {
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          cep: cliente.cep,
          rua: cliente.rua,
          numero: cliente.numero,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          estado: cliente.estado,
          complemento: cliente.complemento,
          observacao: cliente.observacao,
          frete_tipo: frete.tipo,
          frete_valor: frete.valor,
        },
      };
      console.log("Criando preferência MP:", payload);
      const res = await api.post("mp-criar-preferencia/", payload);
      console.log("Resposta MP:", res.data);

      const url = res.data.init_point;
      if (!url) throw new Error("URL de pagamento não retornada pelo servidor.");

      // Redireciona para o checkout do Mercado Pago
      window.location.href = url;
    } catch(e) {
      console.error("Erro MP completo:", e.response?.data || e.message);
      const msg = e.response?.data?.erro || e.message || "Erro desconhecido";
      setErroPedido(`Não foi possível iniciar o pagamento: ${msg}`);
      window.scrollTo({top:0,behavior:"smooth"});
    }
  }

  async function finalizarPedido() {
    setTentouEnviar(true);
    setMensagemEstoque("");
    setErroPedido("");

    if (estoqueInsuficiente) {
      const nomes = itensComProblema.map(i=>i.produto.nome).join(", ");
      setMensagemEstoque(`⚠️ Estoque insuficiente: ${nomes}. Ajuste as quantidades.`);
      window.scrollTo({top:0,behavior:"smooth"});
      return;
    }
    if (!validar()) { window.scrollTo({top:0,behavior:"smooth"}); return; }

    // Salvar snapshot antes de limpar carrinho
    const snapshot = {
      itens: cart.map(i => ({nome:i.produto.nome, tamanho:i.tamanho, qtd:i.quantidade, preco:parseFloat(i.produto.preco)})),
      totalSalvo: total,
      c: {...cliente},
    };

    try {
      await api.post("pedidos/", {
        nome_cliente: cliente.nome, telefone: cliente.telefone, email: cliente.email,
        cep: cliente.cep, rua: cliente.rua, numero: cliente.numero,
        complemento: cliente.complemento, bairro: cliente.bairro,
        cidade: cliente.cidade, estado: cliente.estado,
        forma_pagamento: "Mercado Pago", observacao: cliente.observacao,
        itens_input: cart.map(i => ({produto:i.produto.id, tamanho:i.tamanho, quantidade:i.quantidade})),
      });
      // Gerar número de protocolo único
      const agora = new Date();
      const dataStr = agora.getFullYear().toString() +
        String(agora.getMonth()+1).padStart(2,'0') +
        String(agora.getDate()).padStart(2,'0');
      const idStr = String(Date.now()).slice(-4);
      const prot = `MTZ-${dataStr}-${idStr}`;
      setProtocolo(prot);
      setPedidoSalvo({...snapshot, protocolo: prot});
      setCart([]);
      setPedidoConcluido(true);
      window.scrollTo({top:0,behavior:"smooth"});
    } catch(e) {
      console.error("Erro pedido:", e.response?.data, e.response?.status);
      setErroPedido("Não foi possível registrar o pedido. Tente novamente.");
      window.scrollTo({top:0,behavior:"smooth"});
    }
  }

  const inputStyle = (campo) => ({
    width:"100%", padding:"10px 12px", borderRadius:"6px", boxSizing:"border-box",
    border:"1px solid "+(erros[campo]?"#ef4444":t.inputBorder),
    backgroundColor: erros[campo]?"#fff5f5":t.inputBg,
    color:t.text, fontSize:"14px", outline:"none", fontFamily:"system-ui",
  });
  const labelStyle = (campo) => ({
    display:"block", fontSize:"11px", fontWeight:"600", marginBottom:"4px",
    textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:"system-ui",
    color: erros[campo]?"#ef4444":t.textSecundario,
  });
  const cardStyle = {backgroundColor:t.bgCard, border:"1px solid "+t.border, borderRadius:"12px", padding:"24px"};
  const qtdErros = Object.keys(erros).filter(k=>erros[k]).length;

  // ── TELA DE SUCESSO ──
  if (pedidoConcluido && pedidoSalvo) return (
    <div style={{backgroundColor:t.bg, minHeight:"100vh"}}>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div style={{fontSize:"64px",marginBottom:"20px"}}>🎉</div>
        <h1 className="text-3xl font-bold mb-4" style={{color:t.text}}>Pedido confirmado!</h1>
        <p className="mb-6" style={{color:t.textSecundario, lineHeight:1.8}}>
          Nossa equipe entrará em contato pelo WhatsApp <strong style={{color:t.text}}>{pedidoSalvo.c.telefone}</strong> para confirmar os detalhes.
        </p>

        {/* PROTOCOLO */}
        <div className="mb-8 rounded-xl p-5" style={{backgroundColor:t.bgSecundario, border:"2px solid "+t.borderForte}}>
          <p className="text-xs uppercase font-bold mb-2" style={{color:t.textSecundario, letterSpacing:"0.1em"}}>
            🔖 Número do Protocolo
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span style={{fontSize:"1.6rem", fontWeight:"700", fontFamily:"monospace", letterSpacing:"0.05em", color:t.text}}>
              {protocolo}
            </span>
            <button
              onClick={() => { navigator.clipboard.writeText(protocolo).then(() => { setCopiado(true); setTimeout(()=>setCopiado(false),2500); }); }}
              style={{padding:"6px 16px", backgroundColor:copiado?"#16a34a":t.btnPrimarioBg, color:t.btnPrimarioText,
                border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", fontWeight:"600",
                borderRadius:"6px", transition:"background 0.3s"}}>
              {copiado ? "✅ Copiado!" : "📋 Copiar"}
            </button>
          </div>
          <p className="text-xs mt-3" style={{color:t.textSecundario, fontFamily:"system-ui"}}>
            Guarde este número para acompanhar ou questionar seu pedido.
          </p>
        </div>

        {/* Resumo do pedido */}
        <div className="text-left mb-8 rounded-xl p-5" style={{backgroundColor:t.bgCard, border:"1px solid "+t.border}}>
          <p className="text-xs uppercase font-bold mb-3" style={{color:t.textSecundario, letterSpacing:"0.1em"}}>Resumo do pedido</p>
          {pedidoSalvo.itens.map((item,i) => (
            <div key={i} className="flex justify-between py-2" style={{borderBottom:"1px solid "+t.border}}>
              <span className="text-sm" style={{color:t.text}}>{item.nome} — {item.tamanho} × {item.qtd}</span>
              <span className="text-sm font-semibold" style={{color:t.text}}>R$ {(item.preco*item.qtd).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-bold">
            <span style={{color:t.text}}>Total</span>
            <span style={{color:t.text}}>R$ {pedidoSalvo.totalSalvo.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => gerarPDF(pedidoSalvo)}
            className="px-6 py-3 font-semibold rounded-lg"
            style={{backgroundColor:t.btnPrimarioBg, color:t.btnPrimarioText, fontFamily:"system-ui", cursor:"pointer"}}>
            📄 Salvar / Imprimir PDF
          </button>
          <a href={montarMsgWA(pedidoSalvo)} target="_blank" rel="noreferrer"
            className="px-6 py-3 font-semibold text-white rounded-lg"
            style={{backgroundColor:"#22c55e", fontFamily:"system-ui", cursor:"pointer"}}>
            💬 Enviar pelo WhatsApp
          </a>
          <button onClick={() => { setPedidoConcluido(false); setPedidoSalvo(null); }}
            className="px-6 py-3 font-semibold rounded-lg"
            style={{backgroundColor:t.bgSecundario, color:t.text, fontFamily:"system-ui", cursor:"pointer", border:"1px solid "+t.border}}>
            Novo pedido
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{backgroundColor:t.bg, color:t.text, minHeight:"100vh"}}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{color:t.text}}>Finalizar Pedido</h1>

        {mpStatus === 'aprovado' && (
          <div className="rounded-xl p-6 mb-6 text-center" style={{backgroundColor:"#f0fdf4", border:"2px solid #86efac"}}>
            <div style={{fontSize:"48px", marginBottom:"12px"}}>🎉</div>
            <h2 className="text-xl font-bold mb-2" style={{color:"#16a34a"}}>Pagamento aprovado!</h2>
            <p style={{color:t.textSecundario, fontFamily:"system-ui"}}>Seu pedido foi confirmado pelo Mercado Pago. Nossa equipe entrará em contato em breve.</p>
          </div>
        )}
        {mpStatus === 'pendente' && (
          <div className="rounded-xl p-6 mb-6 text-center" style={{backgroundColor:"#fef9f0", border:"2px solid #fde68a"}}>
            <div style={{fontSize:"48px", marginBottom:"12px"}}>⏳</div>
            <h2 className="text-xl font-bold mb-2" style={{color:"#92400e"}}>Pagamento pendente</h2>
            <p style={{color:t.textSecundario, fontFamily:"system-ui"}}>Aguardando confirmação do pagamento. Você receberá um email quando for aprovado.</p>
          </div>
        )}
        {mpStatus === 'falhou' && (
          <div className="rounded-xl p-6 mb-6 text-center" style={{backgroundColor:"#fef2f2", border:"2px solid #fecaca"}}>
            <div style={{fontSize:"48px", marginBottom:"12px"}}>❌</div>
            <h2 className="text-xl font-bold mb-2" style={{color:"#dc2626"}}>Pagamento não realizado</h2>
            <p style={{color:t.textSecundario, fontFamily:"system-ui"}}>O pagamento não foi concluído. Tente novamente ou escolha outra forma de pagamento.</p>
          </div>
        )}
        {cart.length===0 && !mpStatus && <p style={{color:t.textSecundario}}>Carrinho vazio.</p>}

        {/* ALERTAS */}
        {mensagemEstoque && (
          <div className="rounded-xl p-4 mb-6 flex gap-3" style={{backgroundColor:"#fef2f2",border:"2px solid #fecaca"}}>
            <span style={{fontSize:"20px"}}>🚫</span>
            <div>
              <p className="font-semibold" style={{color:"#dc2626"}}>Estoque insuficiente</p>
              <p className="text-sm mt-1" style={{color:"#7f1d1d"}}>{mensagemEstoque}</p>
            </div>
          </div>
        )}
        {erroPedido && (
          <div className="rounded-xl p-4 mb-6 flex gap-3" style={{backgroundColor:"#fef2f2",border:"2px solid #fecaca"}}>
            <span style={{fontSize:"20px"}}>⚠️</span>
            <div>
              <p className="font-semibold" style={{color:"#dc2626"}}>Erro ao registrar pedido</p>
              <p className="text-sm mt-1" style={{color:"#7f1d1d"}}>{erroPedido}</p>
            </div>
          </div>
        )}
        {tentouEnviar && qtdErros>0 && !mensagemEstoque && (
          <div className="rounded-xl p-4 mb-6 flex gap-3" style={{backgroundColor:"#fff5f5",border:"1px solid #fecaca"}}>
            <span>⚠️</span>
            <div>
              <p className="font-semibold" style={{color:"#dc2626"}}>Campos obrigatórios</p>
              <p className="text-sm" style={{color:t.textSecundario}}>{qtdErros} campo{qtdErros>1?"s":""} precisam ser preenchidos.</p>
            </div>
          </div>
        )}

        {/* ITENS */}
        {cart.length>0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{color:t.text}}>🛍️ Seus Itens</h2>
            <div className="space-y-3">
              {cart.map((item,i) => {
                const est = item.produto?.estoques?.find(e=>e.tamanho===item.tamanho);
                const semEst = !est || item.quantidade>est.quantidade;
                return (
                  <div key={i} className="rounded-xl p-4 flex justify-between items-center"
                    style={{backgroundColor:t.bgCard,border:"1px solid "+(semEst?"#fecaca":t.border)}}>
                    <div>
                      <p className="font-semibold" style={{color:t.text}}>{item.produto.nome}</p>
                      <p className="text-sm" style={{color:t.textSecundario}}>Tamanho: {item.tamanho}</p>
                      <p className="text-sm font-medium" style={{color:t.text}}>
                        R$ {(parseFloat(item.produto?.preco||0)*item.quantidade).toFixed(2)}
                      </p>
                      {semEst && <p className="text-sm font-semibold mt-1" style={{color:"#dc2626"}}>🚫 Estoque insuficiente</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decrease(item.produto.id, item.tamanho)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                        style={{backgroundColor:t.bgSecundario, color:t.text, cursor:"pointer"}}>-</button>
                      <span className="w-6 text-center font-medium" style={{color:t.text}}>{item.quantidade}</span>
                      <button onClick={() => increase(item.produto.id, item.tamanho)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                        style={{backgroundColor:t.bgSecundario, color:t.text, cursor:"pointer"}}>+</button>
                      <button onClick={() => removeFromCart(item.produto.id, item.tamanho)}
                        className="ml-3 text-sm" style={{color:"#dc2626", cursor:"pointer"}}>Remover</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xl font-bold text-right" style={{color:t.text}}>
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
        )}

        {cart.length>0 && (
          <div className="space-y-6">
            {/* DADOS PESSOAIS */}
            <div style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{color:t.text}}>📋 Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle("nome")}>Nome completo *</label>
                  <input name="nome" value={cliente.nome} onChange={handleChange}
                    placeholder="Seu nome completo" style={inputStyle("nome")} />
                  {erros.nome && <p className="text-xs mt-1" style={{color:"#dc2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("telefone")}>Telefone / WhatsApp *</label>
                  <input name="telefone" value={cliente.telefone} onChange={handleTelefone}
                    placeholder="(27) 99999-9999" inputMode="tel" maxLength={15} style={inputStyle("telefone")} />
                  {erros.telefone && <p className="text-xs mt-1" style={{color:"#dc2626"}}>Obrigatório</p>}
                </div>
                <div className="md:col-span-2">
                  <label style={labelStyle("email")}>E-mail *</label>
                  <input name="email" value={cliente.email} onChange={handleEmail}
                    type="email" placeholder="seu@email.com" style={inputStyle("email")} />
                  {erros.email && <p className="text-xs mt-1" style={{color:"#dc2626"}}>E-mail inválido</p>}
                  {cliente.email && emailValido(cliente.email) && <p className="text-xs mt-1" style={{color:"#16a34a"}}>✅ E-mail válido</p>}
                </div>
              </div>
            </div>

            {/* ENDEREÇO */}
            <div style={cardStyle}>
              <h2 className="text-lg font-semibold mb-1" style={{color:t.text}}>📍 Endereço de Entrega</h2>
              <p className="text-sm mb-4" style={{color:t.textSecundario}}>CEP preenche o endereço automaticamente.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label style={labelStyle("cep")}>CEP *</label>
                  <input name="cep" value={cliente.cep} onChange={handleCEP}
                    placeholder="29000-000" inputMode="numeric" maxLength={9} style={inputStyle("cep")} />
                  {erros.cep && <p className="text-xs mt-1" style={{color:"#dc2626"}}>Obrigatório</p>}
                  {cliente.cep.replace(/\D/g,"").length===8 && cliente.cidade && (
                    <p className="text-xs mt-1" style={{color:"#16a34a"}}>✅ {cliente.cidade}/{cliente.estado}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label style={labelStyle("rua")}>Rua / Avenida *</label>
                  <input name="rua" value={cliente.rua} onChange={handleChange} placeholder="Rua das Flores" style={inputStyle("rua")} />
                  {erros.rua && <p className="text-xs mt-1" style={{color:"#dc2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("numero")}>Número *</label>
                  <input name="numero" value={cliente.numero} onChange={handleChange} placeholder="123" style={inputStyle("numero")} />
                  {erros.numero && <p className="text-xs mt-1" style={{color:"#dc2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("complemento")}>Complemento</label>
                  <input name="complemento" value={cliente.complemento} onChange={handleChange} placeholder="Apto 2" style={inputStyle("complemento")} />
                </div>
                <div>
                  <label style={labelStyle("bairro")}>Bairro *</label>
                  <input name="bairro" value={cliente.bairro} onChange={handleChange} placeholder="Centro" style={inputStyle("bairro")} />
                  {erros.bairro && <p className="text-xs mt-1" style={{color:"#dc2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("cidade")}>Cidade *</label>
                  <input name="cidade" value={cliente.cidade} onChange={handleChange} placeholder="Vila Velha" style={inputStyle("cidade")} />
                  {erros.cidade && <p className="text-xs mt-1" style={{color:"#dc2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("estado")}>Estado *</label>
                  <input name="estado" value={cliente.estado} onChange={handleChange}
                    placeholder="ES" maxLength={2}
                    style={{...inputStyle("estado"), textTransform:"uppercase"}}
                    onInput={e => e.target.value=e.target.value.toUpperCase()} />
                  {erros.estado && <p className="text-xs mt-1" style={{color:"#dc2626"}}>Obrigatório</p>}
                </div>
              </div>
            </div>



            {/* FRETE */}
            {(() => {
              const motoInfo = estimarMotoboy(cliente.cidade, cliente.estado);
              const corInfo  = estimarCorreios(cliente.estado || "outros");
              const cidadeLabel = cliente.cidade ? ` para ${cliente.cidade}` : "";
              return (
                <div style={{...cardStyle, borderColor: !frete.tipo && calcFrete ? "#fecaca" : t.border}}>
                  <h2 className="text-lg font-semibold mb-1" style={{color:t.text}}>🚚 Como deseja receber? *</h2>
                  <p className="text-sm mb-4" style={{color:t.textSecundario}}>
                    Escolha uma opção abaixo. Os valores de motoboy e Correios são estimativas — a loja confirmará o valor exato pelo WhatsApp antes de enviar.
                  </p>
                  <div className="flex flex-col gap-3">

                    {/* ── Retirada ── */}
                    <button onClick={() => setFrete({tipo:"retirada", valor:0})}
                      style={{ padding:"14px 16px", borderRadius:"10px", textAlign:"left", cursor:"pointer",
                        border:"2px solid "+(frete.tipo==="retirada" ? "#16a34a" : t.border),
                        backgroundColor: frete.tipo==="retirada" ? "#f0fdf4" : t.bgCard }}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <div>
                          <p style={{fontWeight:"600", fontSize:"14px", color:t.text, margin:0}}>🏪 Retirada no local</p>
                          <p style={{fontSize:"12px", color:t.textSecundario, marginTop:"3px"}}>Polo Têxtil Santa Inês — Vila Velha, ES</p>
                          <p style={{fontSize:"11px", color:t.textSecundario, marginTop:"2px"}}>Combinamos o dia e horário pelo WhatsApp</p>
                        </div>
                        <span style={{fontWeight:"700", fontSize:"15px", color:"#16a34a", whiteSpace:"nowrap", marginLeft:"12px"}}>
                          Grátis
                        </span>
                      </div>
                      {frete.tipo==="retirada" && <p style={{fontSize:"11px", color:"#16a34a", marginTop:"8px", fontWeight:"600"}}>✅ Selecionado</p>}
                    </button>

                    {/* ── Motoboy ── sempre aparece, preço muda conforme cidade */}
                    <button onClick={() => setFrete({tipo:"motoboy", valor: motoInfo ? motoInfo.min : 0})}
                      style={{ padding:"14px 16px", borderRadius:"10px", textAlign:"left", cursor:"pointer",
                        border:"2px solid "+(frete.tipo==="motoboy" ? "#1d4ed8" : t.border),
                        backgroundColor: frete.tipo==="motoboy" ? "#eff6ff" : t.bgCard,
                        opacity: motoInfo ? 1 : 0.5 }}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <div>
                          <p style={{fontWeight:"600", fontSize:"14px", color:t.text, margin:0}}>🛵 Entrega por motoboy</p>
                          <p style={{fontSize:"12px", color:t.textSecundario, marginTop:"3px"}}>
                            {motoInfo
                              ? `Entrega própria${cidadeLabel} — estimativa de R$ ${motoInfo.min} a R$ ${motoInfo.max}`
                              : "Disponível apenas para a região da Grande Vitória / ES"}
                          </p>
                          {motoInfo && <p style={{fontSize:"11px", color:t.textSecundario, marginTop:"2px"}}>Valor final confirmado pela loja pelo WhatsApp</p>}
                        </div>
                        <span style={{fontWeight:"700", fontSize:"13px", color: motoInfo ? "#1d4ed8" : t.textSecundario, whiteSpace:"nowrap", marginLeft:"12px"}}>
                          {motoInfo ? `~R$ ${motoInfo.min}–${motoInfo.max}` : "Indisponível"}
                        </span>
                      </div>
                      {frete.tipo==="motoboy" && <p style={{fontSize:"11px", color:"#1d4ed8", marginTop:"8px", fontWeight:"600"}}>✅ Selecionado</p>}
                    </button>

                    {/* ── Correios ── sempre aparece */}
                    <button onClick={() => setFrete({tipo:"correios", valor:0})}
                      style={{ padding:"14px 16px", borderRadius:"10px", textAlign:"left", cursor:"pointer",
                        border:"2px solid "+(frete.tipo==="correios" ? "#7c3aed" : t.border),
                        backgroundColor: frete.tipo==="correios" ? "#f5f3ff" : t.bgCard }}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                        <div style={{flex:1}}>
                          <p style={{fontWeight:"600", fontSize:"14px", color:t.text, margin:0}}>📬 Correios (PAC ou SEDEX)</p>
                          <p style={{fontSize:"12px", color:t.textSecundario, marginTop:"3px"}}>Envio para qualquer cidade do Brasil</p>
                          <div style={{display:"flex", gap:"16px", marginTop:"6px"}}>
                            <span style={{fontSize:"12px", color:t.textSecundario}}>PAC: <strong style={{color:t.text}}>{corInfo.pac}</strong></span>
                            <span style={{fontSize:"12px", color:t.textSecundario}}>SEDEX: <strong style={{color:t.text}}>{corInfo.sedex}</strong></span>
                          </div>
                          <p style={{fontSize:"11px", color:t.textSecundario, marginTop:"3px"}}>Prazo estimado: {corInfo.prazo} · Valor confirmado pela loja</p>
                        </div>
                      </div>
                      {frete.tipo==="correios" && <p style={{fontSize:"11px", color:"#7c3aed", marginTop:"8px", fontWeight:"600"}}>✅ Selecionado</p>}
                    </button>

                  </div>
                  {!frete.tipo && calcFrete && (
                    <p style={{fontSize:"12px", color:"#dc2626", marginTop:"12px"}}>⚠️ Selecione uma opção de entrega para continuar.</p>
                  )}
                </div>
              );
            })()}

            {/* OBS */}
            <div style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{color:t.text}}>
                📝 Observações <span style={{color:t.textSecundario, fontWeight:400, fontSize:"14px"}}>(opcional)</span>
              </h2>
              <textarea name="observacao" value={cliente.observacao} onChange={handleChange}
                placeholder="Alguma informação adicional?" rows={3}
                style={{...inputStyle("observacao"), resize:"none"}} />
            </div>

            {/* BOTÃO */}
            {/* Info sobre pagamento */}
            <div style={{backgroundColor:t.bgSecundario, border:"1px solid "+t.border, borderRadius:"10px", padding:"14px 16px"}}>
              <p style={{fontSize:"13px", color:t.textSecundario, fontFamily:"system-ui", margin:0}}>
                🔒 Pagamento processado com segurança pelo <strong style={{color:t.text}}>Mercado Pago</strong>. Ao confirmar, você será redirecionado para concluir o pagamento.
              </p>
            </div>

            <button onClick={pagarComMP}
              className="cursor-pointer w-full py-5 font-bold text-lg hover:opacity-90 transition"
              style={{backgroundColor:t.btnPrimarioBg, color:t.btnPrimarioText, cursor:"pointer",
                fontFamily:"system-ui", borderRadius:"12px", fontSize:"16px"}}>
              ✅ Confirmar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}