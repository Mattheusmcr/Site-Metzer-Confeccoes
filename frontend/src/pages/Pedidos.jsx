import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import api from "../services/api";
import { WhatsAppIcon, PrinterIcon, CartIcon, CardIcon, StoreIcon, TruckIcon, MailIcon,
  UserIcon, PinIcon, DocIcon, TagIcon, CopyIcon, WarningIcon, ClockIcon, CheckIcon, PartyIcon, CloseIcon } from "../components/Icons";
import { cabecalhoComprovante, abrirComprovante } from "../utils/comprovantePDF";

// CÁLCULO DE FRETE
const REGIAO_METRO_ES = ["vitoria","vila velha","cariacica","serra","viana","guarapari","fundao"];

function estimarMotoboy(cidade, estado) {
  if ((estado||"").toUpperCase() !== "ES") return null;
  const c = (cidade||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  if (!REGIAO_METRO_ES.some(r => c.includes(r))) return null;
  if (c.includes("vila velha")) return { min:8, max:25 };
  if (c.includes("vitoria")||c.includes("vitória")) return { min:15, max:35 };
  if (c.includes("cariacica")) return { min:20, max:40 };
  if (c.includes("serra")) return { min:25, max:45 };
  if (c.includes("guarapari")) return { min:40, max:70 };
  return { min:15, max:40 };
}

function estimarCorreios(estado) {
  // Estimativas baseadas na tabela dos Correios 2024 (pacote ~500g, 15x15x10cm)
  // Origem: Vila Velha - ES (CEP 29118-180)
  const e = (estado||"").toUpperCase();
  const tabela = {
    "ES": { pac:"R$ 18–28", sedex:"R$ 30–45", prazo:"1–3 dias úteis" },
    "RJ": { pac:"R$ 22–32", sedex:"R$ 40–58", prazo:"2–4 dias úteis" },
    "SP": { pac:"R$ 24–36", sedex:"R$ 44–65", prazo:"3–5 dias úteis" },
    "MG": { pac:"R$ 22–33", sedex:"R$ 40–58", prazo:"2–5 dias úteis" },
    "BA": { pac:"R$ 26–38", sedex:"R$ 48–70", prazo:"3–6 dias úteis" },
    "GO": { pac:"R$ 28–40", sedex:"R$ 52–75", prazo:"4–7 dias úteis" },
    "DF": { pac:"R$ 28–40", sedex:"R$ 52–75", prazo:"4–7 dias úteis" },
    "PR": { pac:"R$ 28–42", sedex:"R$ 52–78", prazo:"4–7 dias úteis" },
    "SC": { pac:"R$ 30–44", sedex:"R$ 55–80", prazo:"4–7 dias úteis" },
    "RS": { pac:"R$ 32–48", sedex:"R$ 58–85", prazo:"5–8 dias úteis" },
    "MT": { pac:"R$ 32–48", sedex:"R$ 58–88", prazo:"5–9 dias úteis" },
    "MS": { pac:"R$ 30–44", sedex:"R$ 54–80", prazo:"4–8 dias úteis" },
    "PA": { pac:"R$ 36–54", sedex:"R$ 65–95", prazo:"6–10 dias úteis" },
    "AM": { pac:"R$ 40–60", sedex:"R$ 72–105", prazo:"7–12 dias úteis" },
    "CE": { pac:"R$ 30–45", sedex:"R$ 55–82", prazo:"4–8 dias úteis" },
    "PE": { pac:"R$ 30–45", sedex:"R$ 55–82", prazo:"4–8 dias úteis" },
    "MA": { pac:"R$ 33–50", sedex:"R$ 60–88", prazo:"5–9 dias úteis" },
    "PI": { pac:"R$ 33–50", sedex:"R$ 60–88", prazo:"5–9 dias úteis" },
    "AL": { pac:"R$ 30–45", sedex:"R$ 55–82", prazo:"4–8 dias úteis" },
    "SE": { pac:"R$ 28–42", sedex:"R$ 52–78", prazo:"3–7 dias úteis" },
    "PB": { pac:"R$ 31–47", sedex:"R$ 57–84", prazo:"5–9 dias úteis" },
    "RN": { pac:"R$ 31–47", sedex:"R$ 57–84", prazo:"5–9 dias úteis" },
    "TO": { pac:"R$ 34–52", sedex:"R$ 62–92", prazo:"5–9 dias úteis" },
    "RO": { pac:"R$ 38–57", sedex:"R$ 68–100", prazo:"6–10 dias úteis" },
    "AC": { pac:"R$ 42–63", sedex:"R$ 75–110", prazo:"7–12 dias úteis" },
    "RR": { pac:"R$ 42–63", sedex:"R$ 75–110", prazo:"7–12 dias úteis" },
    "AP": { pac:"R$ 40–60", sedex:"R$ 72–105", prazo:"7–12 dias úteis" },
  };
  return tabela[e] || { pac:"R$ 35–55", sedex:"R$ 62–92", prazo:"6–10 dias úteis" };
}

const t = {
  bg: "#FFFFFF", bgSecundario: "#F4F2EE", bgCard: "#FFFFFF",
  text: "#161513", textSecundario: "#8A877F", border: "rgba(0,0,0,0.08)",
  inputBg: "#FFFFFF", inputBorder: "rgba(0,0,0,0.12)",
  accent: "#C2660A",
  btnPrimarioBg: "#161513", btnPrimarioText: "#FFFFFF",
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


// Extrai o valor mínimo de uma faixa estimada tipo "R$ 18–28" → 18
function parseValorMinimo(faixaStr) {
  const m = (faixaStr || "").match(/\d+/);
  return m ? parseFloat(m[0]) : 0;
}

const CHECKOUT_SNAPSHOT_KEY = "metzker_mp_checkout";

export default function Pedidos() {
  const { cart, increase, decrease, removeFromCart, setCart } = useContext(CartContext);
  const [cliente, setCliente] = useState({
    nome:"", telefone:"", email:"", cep:"", rua:"", numero:"",
    complemento:"", bairro:"", cidade:"", estado:"", observacao:"",
  });
  const [erros, setErros] = useState({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [mensagemEstoque, setMensagemEstoque] = useState("");
  const [erroPedido, setErroPedido] = useState("");
  const [pedidoSalvo, setPedidoSalvo] = useState(null);
  // Verificar retorno do Mercado Pago via URL params
  const urlParams = new URLSearchParams(window.location.search);
  const mpStatus = urlParams.get('status');
  const [protocolo, setProtocolo] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [frete, setFrete] = useState({ tipo: "", valor: 0 });
  const [calcFrete, setCalcFrete] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // O redirecionamento para o Mercado Pago recarrega a página e perde o estado em
  // memória (carrinho, dados do cliente). Por isso salvamos um snapshot antes de
  // sair e restauramos aqui ao voltar, conforme o status do pagamento.
  useEffect(() => {
    const raw = sessionStorage.getItem(CHECKOUT_SNAPSHOT_KEY);
    if (!raw) return;
    let snap;
    try { snap = JSON.parse(raw); } catch { return; }

    if (mpStatus === 'aprovado') {
      const paymentId = urlParams.get('payment_id') || urlParams.get('collection_id');
      const prot = paymentId ? `MTZ-MP-${paymentId}` : `MTZ-MP-${Date.now().toString().slice(-6)}`;
      setProtocolo(prot);
      setPedidoSalvo({ ...snap, protocolo: prot });
      setCart([]);
      sessionStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
    } else if (mpStatus === 'pendente' || mpStatus === 'falhou') {
      setCart(snap.cartRestore || []);
      setCliente(snap.c || cliente);
      setFrete(snap.frete || frete);
      if (mpStatus === 'falhou') sessionStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = cart.reduce((a,i) => a + (parseFloat(i.produto?.preco)||0)*i.quantidade, 0);
  const freteValor = frete.tipo === "retirada" ? 0 : (parseFloat(frete.valor) || 0);
  const totalComFrete = total + freteValor;
  const itensComProblema = cart.filter(item => {
    // Se estoques não foi carregado (produto adicionado pelo card do catálogo),
    // não bloqueia o pedido - validação ocorre no servidor
    if (!item.produto.estoques || item.produto.estoques.length === 0) return false;
    const est = item.produto.estoques.find(e => e.tamanho === item.tamanho);
    if (!est) return false; // tamanho não tem registro de estoque = aceita
    return item.quantidade > est.quantidade;
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
      `<tr>
        <td>${i.nome}</td>
        <td style="text-align:center">${i.tamanho}</td>
        <td style="text-align:center">${i.qtd}</td>
        <td style="text-align:right">R$ ${(i.preco*i.qtd).toFixed(2)}</td>
      </tr>`
    ).join("");

    const corpo = `
      ${cabecalhoComprovante()}
      <h2>Comprovante de Pedido</h2>
      <span class="badge badge-concluido">Pedido confirmado</span>
      <div class="protocolo">${dados.protocolo || ""}</div>
      <div class="grid">
        <div class="bloco">
          <h3>Cliente</h3>
          <p><strong>${c.nome}</strong></p>
          <p>${c.telefone}</p>
          <p>${c.email}</p>
        </div>
        <div class="bloco">
          <h3>Endereço de entrega</h3>
          <p>${c.rua}, ${c.numero}${c.complemento?" - "+c.complemento:""}</p>
          <p>${c.bairro} - ${c.cidade}/${c.estado}</p>
          <p>CEP: ${c.cep}</p>
        </div>
        <div class="bloco">
          <h3>Pagamento</h3>
          <p>Mercado Pago</p>
        </div>
        <div class="bloco">
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
      ${c.observacao ? `<div class="caixa" style="margin-top:12px"><strong>Obs:</strong> ${c.observacao}</div>` : ""}
      <div class="rodape">
        Guarde este comprovante. Nossa equipe entrará em contato pelo WhatsApp para confirmar a entrega.<br/>
        Desenvolvido por Matheus Costa Rodrigues &middot; metzkersolucoes.com.br
      </div>`;

    abrirComprovante(corpo, `Pedido Metzker #${Date.now().toString().slice(-6)}`);
  }

  function montarMsgWA(dados) {
    const {itens,totalSalvo,c} = dados;
    const itensStr = itens.map(i =>
      `• ${i.nome} | ${i.tamanho} | ${i.qtd}x | R$ ${(i.preco*i.qtd).toFixed(2)}`
    ).join("%0A");
    const obs = c.observacao ? `%0A%0A📝 *Obs:* ${c.observacao}` : "";
    const freteInfo = dados.frete_tipo && dados.frete_tipo !== "retirada"
      ? `%0A🚚 *Frete:* ${dados.frete_tipo === "motoboy" ? "Motoboy" : "Correios"}`
      : "%0A🏪 *Retirada no local*";
    return `https://wa.me/5527997878391?text=Olá! Fiz um pedido no site:%0A%0A👤 *Nome:* ${c.nome}%0A📱 *Tel:* ${c.telefone}%0A📧 *Email:* ${c.email}%0A%0A🛍️ *Itens:*%0A${itensStr}%0A%0A💰 *Total: R$ ${totalSalvo.toFixed(2)}*${freteInfo}%0A%0A📍 *Endereço:*%0A${c.rua}, ${c.numero}${c.complemento?" - "+c.complemento:""}%0A${c.bairro} - ${c.cidade}/${c.estado} | CEP: ${c.cep}%0A%0A💳 *Pagamento:* Mercado Pago${obs}`;
  }

  function verificarEstoque() {
    if (estoqueInsuficiente) {
      const nomes = itensComProblema.map(i => i.produto.nome).join(", ");
      setMensagemEstoque(`Estoque insuficiente: ${nomes}. Ajuste as quantidades.`);
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

    setSalvando(true);
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

      // Em produção usa init_point, em dev usa sandbox para testes
      const url = import.meta.env.PROD
        ? res.data.init_point
        : res.data.sandbox_init_point;
      if (!url) throw new Error("URL de pagamento não retornada pelo servidor.");

      // Salva um snapshot do pedido - o redirecionamento para o MP recarrega a
      // página e perde carrinho/dados em memória; recuperamos ao voltar.
      const snapshot = {
        cartRestore: cart,
        c: { ...cliente },
        frete: { ...frete },
        itens: cart.map(i => ({ nome: i.produto.nome, tamanho: i.tamanho, qtd: i.quantidade, preco: parseFloat(i.produto.preco) })),
        totalSalvo: totalComFrete,
      };
      sessionStorage.setItem(CHECKOUT_SNAPSHOT_KEY, JSON.stringify(snapshot));

      // Redireciona para o checkout do Mercado Pago
      window.location.href = url;
    } catch(e) {
      console.error("Erro MP completo:", e.response?.data || e.message);
      const msg = e.response?.data?.erro || e.message || "Erro desconhecido";
      setErroPedido(`Não foi possível iniciar o pagamento: ${msg}`);
      setSalvando(false);
      window.scrollTo({top:0,behavior:"smooth"});
    }
  }

  const inputStyle = (campo) => ({
    width:"100%", padding:"11px 14px", borderRadius:"12px", boxSizing:"border-box",
    border:"1px solid "+(erros[campo]?"#DC2626":t.inputBorder),
    backgroundColor: erros[campo]?"#FEF2F2":t.inputBg,
    color:t.text, fontSize:"14px", outline:"none",
  });
  const labelStyle = (campo) => ({
    display:"block", fontSize:"11px", fontWeight:"700", marginBottom:"6px",
    textTransform:"uppercase", letterSpacing:"0.1em",
    color: erros[campo]?"#DC2626":t.textSecundario,
  });
  const cardStyle = {backgroundColor:t.bgCard, border:"1px solid "+t.border, borderRadius:"18px", padding:"24px"};
  const qtdErros = Object.keys(erros).filter(k=>erros[k]).length;

  // TELA DE SUCESSO (renderizada quando o Mercado Pago confirma o pagamento)
  if (mpStatus === 'aprovado' && pedidoSalvo) return (
    <div style={{backgroundColor:t.bg, fontFamily:"Manrope, sans-serif"}}>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-5">
          <span className="flex items-center justify-center rounded-full" style={{width:"72px", height:"72px", backgroundColor:t.bgSecundario, color:t.text}}>
            <PartyIcon size={36} strokeWidth={1.4} />
          </span>
        </div>
        <h1 style={{fontFamily:"Newsreader, serif", fontStyle:"italic", fontSize:"2.1rem", fontWeight:500, color:t.text, marginBottom:"16px"}}>Pedido confirmado!</h1>
        <p className="mb-6" style={{color:t.textSecundario, lineHeight:1.8}}>
          Nossa equipe entrará em contato pelo WhatsApp <strong style={{color:t.text}}>{pedidoSalvo.c.telefone}</strong> para confirmar os detalhes.
        </p>

        {/* PROTOCOLO */}
        <div className="mb-8 p-5" style={{backgroundColor:t.bgSecundario, border:"1px solid "+t.border, borderRadius:"18px"}}>
          <p className="text-xs uppercase font-bold mb-2 flex items-center justify-center gap-1.5" style={{color:t.textSecundario, letterSpacing:"0.1em"}}>
            <TagIcon size={13} strokeWidth={1.8} /> Número do Protocolo
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span style={{fontSize:"1.6rem", fontWeight:"700", fontFamily:"monospace", letterSpacing:"0.05em", color:t.text}}>
              {protocolo}
            </span>
            <button
              onClick={() => { navigator.clipboard.writeText(protocolo).then(() => { setCopiado(true); setTimeout(()=>setCopiado(false),2500); }); }}
              className="inline-flex items-center gap-1.5 transition-all duration-300 hover:shadow-md"
              style={{padding:"7px 18px", backgroundColor:copiado?"#16A34A":t.btnPrimarioBg, color:"#FFFFFF",
                border:"none", cursor:"pointer", fontSize:"12px", fontWeight:"700",
                borderRadius:"999px"}}>
              {copiado ? <><CheckIcon size={14} strokeWidth={2.2} /> Copiado!</> : <><CopyIcon size={14} strokeWidth={1.8} /> Copiar</>}
            </button>
          </div>
          <p className="text-xs mt-3" style={{color:t.textSecundario}}>
            Guarde este número para acompanhar ou questionar seu pedido.
          </p>
        </div>

        {/* Resumo do pedido */}
        <div className="text-left mb-8 p-5" style={{backgroundColor:t.bgCard, border:"1px solid "+t.border, borderRadius:"18px"}}>
          <p className="text-xs uppercase font-bold mb-3" style={{color:t.textSecundario, letterSpacing:"0.1em"}}>Resumo do pedido</p>
          {pedidoSalvo.itens.map((item,i) => (
            <div key={i} className="flex justify-between py-2" style={{borderBottom:"1px solid "+t.border}}>
              <span className="text-sm" style={{color:t.text}}>{item.nome} - {item.tamanho} × {item.qtd}</span>
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
            className="px-6 py-3 font-bold inline-flex items-center gap-2"
            style={{backgroundColor:t.btnPrimarioBg, color:t.btnPrimarioText, cursor:"pointer", borderRadius:"999px"}}>
            <PrinterIcon size={17} strokeWidth={1.6} />
            Salvar / Imprimir PDF
          </button>
          <a href={montarMsgWA({...pedidoSalvo, frete_tipo: pedidoSalvo.frete?.tipo})} target="_blank" rel="noreferrer"
            className="px-6 py-3 font-bold text-white inline-flex items-center gap-2"
            style={{backgroundColor:"#25D366", cursor:"pointer", borderRadius:"999px"}}>
            <WhatsAppIcon size={17} strokeWidth={1.6} />
            Enviar pelo WhatsApp
          </a>
          <button onClick={() => { window.location.href = "/pedidos"; }}
            className="px-6 py-3 font-bold"
            style={{backgroundColor:t.bgSecundario, color:t.text, cursor:"pointer", border:"1px solid "+t.border, borderRadius:"999px"}}>
            Novo pedido
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{backgroundColor:t.bg, color:t.text, fontFamily:"Manrope, sans-serif"}}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 style={{fontFamily:"Newsreader, serif", fontStyle:"italic", fontSize:"2.3rem", fontWeight:500, color:t.text, marginBottom:"32px"}}>Finalizar Pedido</h1>

        {mpStatus === 'aprovado' && (
          <div className="p-6 mb-6 text-center" style={{backgroundColor:"#F0FDF4", border:"1px solid #86EFAC", borderRadius:"18px"}}>
            <div className="flex justify-center mb-3" style={{color:"#16A34A"}}><PartyIcon size={40} strokeWidth={1.4} /></div>
            <h2 className="text-xl font-bold mb-2" style={{color:"#16A34A"}}>Pagamento aprovado!</h2>
            <p style={{color:t.textSecundario}}>Seu pedido foi confirmado pelo Mercado Pago. Nossa equipe entrará em contato em breve.</p>
          </div>
        )}
        {mpStatus === 'pendente' && (
          <div className="p-6 mb-6 text-center" style={{backgroundColor:"#FEF9F0", border:"1px solid #FDE68A", borderRadius:"18px"}}>
            <div className="flex justify-center mb-3" style={{color:"#92400E"}}><ClockIcon size={40} strokeWidth={1.4} /></div>
            <h2 className="text-xl font-bold mb-2" style={{color:"#92400E"}}>Pagamento pendente</h2>
            <p style={{color:t.textSecundario}}>Aguardando confirmação do pagamento. Você receberá um email quando for aprovado.</p>
          </div>
        )}
        {mpStatus === 'falhou' && (
          <div className="p-6 mb-6 text-center" style={{backgroundColor:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"18px"}}>
            <div className="flex justify-center mb-3" style={{color:"#DC2626"}}><CloseIcon size={36} strokeWidth={1.8} /></div>
            <h2 className="text-xl font-bold mb-2" style={{color:"#DC2626"}}>Pagamento não realizado</h2>
            <p style={{color:t.textSecundario}}>O pagamento não foi concluído. Tente novamente ou escolha outra forma de pagamento.</p>
          </div>
        )}
        {cart.length===0 && !mpStatus && <p style={{color:t.textSecundario}}>Carrinho vazio.</p>}

        {/* ALERTAS */}
        {mensagemEstoque && (
          <div className="p-4 mb-6 flex gap-3" style={{backgroundColor:"#FEF2F2",border:"1px solid #FECACA", borderRadius:"16px"}}>
            <span style={{color:"#DC2626"}}><WarningIcon size={20} strokeWidth={1.6} /></span>
            <div>
              <p className="font-semibold" style={{color:"#DC2626"}}>Estoque insuficiente</p>
              <p className="text-sm mt-1" style={{color:"#7F1D1D"}}>{mensagemEstoque}</p>
            </div>
          </div>
        )}
        {erroPedido && (
          <div className="p-4 mb-6 flex gap-3" style={{backgroundColor:"#FEF2F2",border:"1px solid #FECACA", borderRadius:"16px"}}>
            <span style={{color:"#DC2626"}}><WarningIcon size={20} strokeWidth={1.6} /></span>
            <div>
              <p className="font-semibold" style={{color:"#DC2626"}}>Erro ao registrar pedido</p>
              <p className="text-sm mt-1" style={{color:"#7F1D1D"}}>{erroPedido}</p>
            </div>
          </div>
        )}
        {tentouEnviar && qtdErros>0 && !mensagemEstoque && (
          <div className="p-4 mb-6 flex gap-3" style={{backgroundColor:"#FEF2F2",border:"1px solid #FECACA", borderRadius:"16px"}}>
            <span style={{color:"#DC2626"}}><WarningIcon size={16} strokeWidth={1.8} /></span>
            <div>
              <p className="font-semibold" style={{color:"#DC2626"}}>Campos obrigatórios</p>
              <p className="text-sm" style={{color:t.textSecundario}}>{qtdErros} campo{qtdErros>1?"s":""} precisam ser preenchidos.</p>
            </div>
          </div>
        )}

        {/* ITENS */}
        {cart.length>0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color:t.text}}>
              <CartIcon size={19} strokeWidth={1.6} /> Seus Itens
            </h2>
            <div className="space-y-3">
              {cart.map((item,i) => {
                const est = item.produto?.estoques?.find(e=>e.tamanho===item.tamanho);
                const semEst = est && item.quantidade > est.quantidade;
                return (
                  <div key={i} className="p-4 flex justify-between items-center transition-shadow duration-300 hover:shadow-md"
                    style={{backgroundColor:t.bgCard,border:"1px solid "+(semEst?"#FECACA":t.border), borderRadius:"16px"}}>
                    <div>
                      <p className="font-semibold" style={{color:t.text}}>{item.produto.nome}</p>
                      <p className="text-sm" style={{color:t.textSecundario}}>Tamanho: {item.tamanho}</p>
                      <p className="text-sm font-medium" style={{color:t.text}}>
                        R$ {(parseFloat(item.produto?.preco||0)*item.quantidade).toFixed(2)}
                      </p>
                      {semEst && <p className="text-sm font-semibold mt-1 flex items-center gap-1.5" style={{color:"#DC2626"}}><WarningIcon size={14} strokeWidth={1.8} /> Estoque insuficiente</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decrease(item.produto.id, item.tamanho)}
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                        style={{backgroundColor:t.bgSecundario, color:t.text, cursor:"pointer"}}>-</button>
                      <span className="w-6 text-center font-medium" style={{color:t.text}}>{item.quantidade}</span>
                      <button onClick={() => increase(item.produto.id, item.tamanho)}
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                        style={{backgroundColor:t.bgSecundario, color:t.text, cursor:"pointer"}}>+</button>
                      <button onClick={() => removeFromCart(item.produto.id, item.tamanho)}
                        className="ml-3 text-sm" style={{color:"#DC2626", cursor:"pointer"}}>Remover</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-right" style={{fontFamily:"Newsreader, serif", fontStyle:"italic", fontSize:"1.6rem", fontWeight:500, color:t.text}}>
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
        )}

        {cart.length>0 && (
          <div className="space-y-6">
            {/* DADOS PESSOAIS */}
            <div style={cardStyle}>
              <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{color:t.text}}><UserIcon size={18} strokeWidth={1.6} /> Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle("nome")}>Nome completo *</label>
                  <input name="nome" value={cliente.nome} onChange={handleChange}
                    placeholder="Seu nome completo" style={inputStyle("nome")} />
                  {erros.nome && <p className="text-xs mt-1" style={{color:"#DC2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("telefone")}>Telefone / WhatsApp *</label>
                  <input name="telefone" value={cliente.telefone} onChange={handleTelefone}
                    placeholder="(27) 99999-9999" inputMode="tel" maxLength={15} style={inputStyle("telefone")} />
                  {erros.telefone && <p className="text-xs mt-1" style={{color:"#DC2626"}}>Obrigatório</p>}
                </div>
                <div className="md:col-span-2">
                  <label style={labelStyle("email")}>E-mail *</label>
                  <input name="email" value={cliente.email} onChange={handleEmail}
                    type="email" placeholder="seu@email.com" style={inputStyle("email")} />
                  {erros.email && <p className="text-xs mt-1" style={{color:"#DC2626"}}>E-mail inválido</p>}
                  {cliente.email && emailValido(cliente.email) && <p className="text-xs mt-1 flex items-center gap-1" style={{color:"#16A34A"}}><CheckIcon size={12} strokeWidth={2.2} /> E-mail válido</p>}
                </div>
              </div>
            </div>

            {/* ENDEREÇO */}
            <div style={cardStyle}>
              <h2 className="text-base font-bold mb-1 flex items-center gap-2" style={{color:t.text}}><PinIcon size={18} strokeWidth={1.6} /> Endereço de Entrega</h2>
              <p className="text-sm mb-4" style={{color:t.textSecundario}}>CEP preenche o endereço automaticamente.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label style={labelStyle("cep")}>CEP *</label>
                  <input name="cep" value={cliente.cep} onChange={handleCEP}
                    placeholder="29000-000" inputMode="numeric" maxLength={9} style={inputStyle("cep")} />
                  {erros.cep && <p className="text-xs mt-1" style={{color:"#DC2626"}}>Obrigatório</p>}
                  {cliente.cep.replace(/\D/g,"").length===8 && cliente.cidade && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{color:"#16A34A"}}><CheckIcon size={12} strokeWidth={2.2} /> {cliente.cidade}/{cliente.estado}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label style={labelStyle("rua")}>Rua / Avenida *</label>
                  <input name="rua" value={cliente.rua} onChange={handleChange} placeholder="Rua das Flores" style={inputStyle("rua")} />
                  {erros.rua && <p className="text-xs mt-1" style={{color:"#DC2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("numero")}>Número *</label>
                  <input name="numero" value={cliente.numero} onChange={handleChange} placeholder="123" style={inputStyle("numero")} />
                  {erros.numero && <p className="text-xs mt-1" style={{color:"#DC2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("complemento")}>Complemento</label>
                  <input name="complemento" value={cliente.complemento} onChange={handleChange} placeholder="Apto 2" style={inputStyle("complemento")} />
                </div>
                <div>
                  <label style={labelStyle("bairro")}>Bairro *</label>
                  <input name="bairro" value={cliente.bairro} onChange={handleChange} placeholder="Centro" style={inputStyle("bairro")} />
                  {erros.bairro && <p className="text-xs mt-1" style={{color:"#DC2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("cidade")}>Cidade *</label>
                  <input name="cidade" value={cliente.cidade} onChange={handleChange} placeholder="Vila Velha" style={inputStyle("cidade")} />
                  {erros.cidade && <p className="text-xs mt-1" style={{color:"#DC2626"}}>Obrigatório</p>}
                </div>
                <div>
                  <label style={labelStyle("estado")}>Estado *</label>
                  <input name="estado" value={cliente.estado} onChange={handleChange}
                    placeholder="ES" maxLength={2}
                    style={{...inputStyle("estado"), textTransform:"uppercase", textAlign:"center"}}
                    onInput={e => e.target.value=e.target.value.toUpperCase()} />
                  {erros.estado && <p className="text-xs mt-1" style={{color:"#DC2626"}}>Obrigatório</p>}
                </div>
              </div>
            </div>



            {/* FRETE */}
            {(() => {
              const motoInfo = estimarMotoboy(cliente.cidade, cliente.estado);
              const corInfo  = estimarCorreios(cliente.estado || "outros");
              return (
                <div style={{...cardStyle, borderColor: !frete.tipo && calcFrete ? "#FECACA" : t.border}}>
                  <h2 className="text-base font-bold mb-1 flex items-center gap-2" style={{color:t.text}}><TruckIcon size={18} strokeWidth={1.6} /> Como deseja receber? *</h2>
                  <p className="text-sm mb-4" style={{color:t.textSecundario}}>
                    Escolha uma opção abaixo. Os valores de motoboy e Correios são estimativas - a loja confirmará o valor exato pelo WhatsApp antes de enviar.
                  </p>
                  <div className="flex flex-col gap-3">

                    {/* Retirada */}
                    <button onClick={() => setFrete({tipo:"retirada", valor:0})}
                      className="transition-all duration-300 hover:shadow-md"
                      style={{ padding:"14px 16px", borderRadius:"14px", textAlign:"left", cursor:"pointer",
                        border:"2px solid "+(frete.tipo==="retirada" ? t.text : t.border),
                        backgroundColor: frete.tipo==="retirada" ? t.bgSecundario : t.bgCard }}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <div>
                          <p style={{fontWeight:"600", fontSize:"14px", color:t.text, margin:0, display:"flex", alignItems:"center", gap:"7px"}}><StoreIcon size={16} strokeWidth={1.6} />Retirada no local</p>
                          <p style={{fontSize:"12px", color:t.textSecundario, marginTop:"3px"}}>Polo Têxtil Santa Inês - Vila Velha, ES</p>
                          <p style={{fontSize:"11px", color:t.textSecundario, marginTop:"2px"}}>Combinamos o dia e horário pelo WhatsApp</p>
                        </div>
                        <span style={{fontWeight:"700", fontSize:"15px", color:"#16A34A", whiteSpace:"nowrap", marginLeft:"12px"}}>
                          Grátis
                        </span>
                      </div>
                      {frete.tipo==="retirada" && <p className="flex items-center gap-1" style={{fontSize:"11px", color:t.text, marginTop:"8px", fontWeight:"600"}}><CheckIcon size={12} strokeWidth={2.2} /> Selecionado</p>}
                    </button>

                    {/*  Motoboy - sempre aparece, preço muda conforme cidade */}
                    <button onClick={() => { if (motoInfo) setFrete({tipo:"motoboy", valor: motoInfo.min}); }}
                      className="transition-all duration-300 hover:shadow-md"
                      style={{ padding:"14px 16px", borderRadius:"14px", textAlign:"left", cursor: motoInfo ? "pointer" : "default",
                        border:"2px solid "+(frete.tipo==="motoboy" ? t.text : t.border),
                        backgroundColor: frete.tipo==="motoboy" ? t.bgSecundario : t.bgCard,
                        opacity: motoInfo ? 1 : 0.5 }}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <div>
                          <p style={{fontWeight:"600", fontSize:"14px", color:t.text, margin:0, display:"flex", alignItems:"center", gap:"7px"}}><TruckIcon size={16} strokeWidth={1.6} />Entrega por motoboy</p>
                          <p style={{fontSize:"12px", color:t.textSecundario, marginTop:"3px"}}>
                            {motoInfo
                              ? `Entrega própria pela Grande Vitória - estimativa de R$ ${motoInfo.min} a R$ ${motoInfo.max}`
                              : "Disponível apenas para a região da Grande Vitória / ES"}
                          </p>
                          {motoInfo && <p style={{fontSize:"11px", color:t.textSecundario, marginTop:"2px"}}>Valor final confirmado pela loja pelo WhatsApp</p>}
                        </div>
                        <span style={{fontWeight:"700", fontSize:"13px", color: t.textSecundario, whiteSpace:"nowrap", marginLeft:"12px"}}>
                          {motoInfo ? `~R$ ${motoInfo.min}–${motoInfo.max}` : "Indisponível"}
                        </span>
                      </div>
                      {frete.tipo==="motoboy" && <p className="flex items-center gap-1" style={{fontSize:"11px", color:t.text, marginTop:"8px", fontWeight:"600"}}><CheckIcon size={12} strokeWidth={2.2} /> Selecionado</p>}
                    </button>

                    {/* Correios - sempre aparece */}
                    <button onClick={() => setFrete({tipo:"correios", valor: parseValorMinimo(corInfo.pac)})}
                      className="transition-all duration-300 hover:shadow-md"
                      style={{ padding:"14px 16px", borderRadius:"14px", textAlign:"left", cursor:"pointer",
                        border:"2px solid "+(frete.tipo==="correios" ? t.text : t.border),
                        backgroundColor: frete.tipo==="correios" ? t.bgSecundario : t.bgCard }}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                        <div style={{flex:1}}>
                          <p style={{fontWeight:"600", fontSize:"14px", color:t.text, margin:0, display:"flex", alignItems:"center", gap:"7px"}}><MailIcon size={16} strokeWidth={1.6} />Correios (PAC ou SEDEX)</p>
                          <p style={{fontSize:"12px", color:t.textSecundario, marginTop:"3px"}}>Envio para qualquer cidade do Brasil</p>
                          <div style={{display:"flex", gap:"16px", marginTop:"6px"}}>
                            <span style={{fontSize:"12px", color:t.textSecundario}}>PAC: <strong style={{color:t.text}}>{corInfo.pac}</strong></span>
                            <span style={{fontSize:"12px", color:t.textSecundario}}>SEDEX: <strong style={{color:t.text}}>{corInfo.sedex}</strong></span>
                          </div>
                          <p style={{fontSize:"11px", color:t.textSecundario, marginTop:"3px"}}>Prazo estimado: {corInfo.prazo} · Valor confirmado pela loja</p>
                        </div>
                      </div>
                      {frete.tipo==="correios" && <p className="flex items-center gap-1" style={{fontSize:"11px", color:t.text, marginTop:"8px", fontWeight:"600"}}><CheckIcon size={12} strokeWidth={2.2} /> Selecionado</p>}
                    </button>

                  </div>
                  {!frete.tipo && calcFrete && (
                    <p className="flex items-center gap-1.5" style={{fontSize:"12px", color:"#DC2626", marginTop:"12px"}}><WarningIcon size={13} strokeWidth={1.8} /> Selecione uma opção de entrega para continuar.</p>
                  )}
                </div>
              );
            })()}

            {/* OBS */}
            <div style={cardStyle}>
              <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{color:t.text}}>
                <DocIcon size={17} strokeWidth={1.6} /> Observações <span style={{color:t.textSecundario, fontWeight:400, fontSize:"14px"}}>(opcional)</span>
              </h2>
              <textarea name="observacao" value={cliente.observacao} onChange={handleChange}
                placeholder="Alguma informação adicional?" rows={3}
                style={{...inputStyle("observacao"), resize:"none"}} />
            </div>

            {/* PAGAMENTO */}
            <div style={cardStyle}>
              <h2 className="text-base font-bold mb-1 flex items-center gap-2" style={{color:t.text}}><CardIcon size={18} strokeWidth={1.6} /> Pagamento</h2>
              <p className="text-sm mb-4" style={{color:t.textSecundario}}>
                O pagamento é feito com segurança pelo Mercado Pago - Pix, cartão ou boleto.
              </p>

              {/* Resumo do valor */}
              <div className="p-4 mb-4" style={{backgroundColor:t.bgSecundario, border:"1px solid "+t.border, borderRadius:"14px"}}>
                <div className="flex justify-between mb-1">
                  <span style={{fontSize:"13px", color:t.textSecundario}}>Subtotal produtos:</span>
                  <span style={{fontSize:"13px", color:t.text}}>R$ {total.toFixed(2)}</span>
                </div>
                {frete.tipo && frete.tipo !== "retirada" && (
                  <div className="flex justify-between mb-1">
                    <span style={{fontSize:"13px", color:t.textSecundario}}>
                      Frete ({frete.tipo === "motoboy" ? "Motoboy" : "Correios"}):
                    </span>
                    <span style={{fontSize:"13px", color:t.text}}>R$ {freteValor.toFixed(2)}</span>
                  </div>
                )}
                {frete.tipo === "retirada" && (
                  <div className="flex justify-between mb-1">
                    <span style={{fontSize:"13px", color:t.textSecundario}}>Frete:</span>
                    <span style={{fontSize:"13px", color:"#16A34A", fontWeight:"600"}}>Grátis</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 mt-1" style={{borderTop:"1px solid "+t.border}}>
                  <span style={{fontSize:"15px", fontWeight:"700", color:t.text}}>Total:</span>
                  <span style={{fontFamily:"Newsreader, serif", fontStyle:"italic", fontSize:"20px", fontWeight:"500", color:t.text}}>R$ {totalComFrete.toFixed(2)}</span>
                </div>
              </div>

              {!frete.tipo && tentouEnviar && (
                <p style={{fontSize:"12px", color:"#DC2626"}}>Selecione uma opção de entrega antes de pagar.</p>
              )}
            </div>

            {/* BOTÃO CONFIRMAR - cria a preferência e redireciona para o Mercado Pago */}
            <button onClick={pagarComMP} disabled={salvando}
              className="cursor-pointer w-full py-5 font-bold text-base transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
              style={{backgroundColor: !salvando ? t.btnPrimarioBg : "#9CA3AF",
                color:t.btnPrimarioText, cursor: !salvando ? "pointer" : "not-allowed",
                borderRadius:"999px", fontSize:"16px"}}>
              <CardIcon size={18} strokeWidth={1.6} />
              {salvando ? "Redirecionando para o Mercado Pago..." : "Pagar com Mercado Pago"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
