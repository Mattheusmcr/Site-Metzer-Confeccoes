import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShirtIcon, ImageIcon, PaletteIcon, ThreadIcon, RulerIcon, CheckIcon,
  WarningIcon, PaperclipIcon, DocIcon, TruckIcon, StoreIcon, MailIcon,
  InfoIcon, PartyIcon, TagIcon, CopyIcon, PrinterIcon, CloseIcon,
  UserIcon, ListIcon,
} from "../components/Icons";

// ── CÁLCULO DE FRETE ─────────────────────────────────────────────────────────
const REGIAO_METRO_ES_P = ["vitoria","vila velha","cariacica","serra","viana","guarapari","fundao"];
function estimarMotoboyP(cidade, estado) {
  if ((estado||"").toUpperCase() !== "ES") return null;
  const c = (cidade||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if (!REGIAO_METRO_ES_P.some(r => c.includes(r))) return null;
  if (c.includes("vila velha")) return { min:8, max:25 };
  if (c.includes("vitoria")||c.includes("vitória")) return { min:15, max:35 };
  if (c.includes("cariacica")) return { min:20, max:40 };
  if (c.includes("serra")) return { min:25, max:45 };
  if (c.includes("guarapari")) return { min:40, max:70 };
  return { min:15, max:40 };
}
function estimarCorreiosP(estado) {
  const e = (estado||"").toUpperCase();
  const tabela = {
    "ES":{ pac:"R$ 18–28", sedex:"R$ 30–45", prazo:"1–3 dias úteis" },
    "RJ":{ pac:"R$ 22–32", sedex:"R$ 40–58", prazo:"2–4 dias úteis" },
    "SP":{ pac:"R$ 24–36", sedex:"R$ 44–65", prazo:"3–5 dias úteis" },
    "MG":{ pac:"R$ 22–33", sedex:"R$ 40–58", prazo:"2–5 dias úteis" },
    "BA":{ pac:"R$ 26–38", sedex:"R$ 48–70", prazo:"3–6 dias úteis" },
    "GO":{ pac:"R$ 28–40", sedex:"R$ 52–75", prazo:"4–7 dias úteis" },
    "DF":{ pac:"R$ 28–40", sedex:"R$ 52–75", prazo:"4–7 dias úteis" },
    "PR":{ pac:"R$ 28–42", sedex:"R$ 52–78", prazo:"4–7 dias úteis" },
    "SC":{ pac:"R$ 30–44", sedex:"R$ 55–80", prazo:"4–7 dias úteis" },
    "RS":{ pac:"R$ 32–48", sedex:"R$ 58–85", prazo:"5–8 dias úteis" },
    "MT":{ pac:"R$ 32–48", sedex:"R$ 58–88", prazo:"5–9 dias úteis" },
    "MS":{ pac:"R$ 30–44", sedex:"R$ 54–80", prazo:"4–8 dias úteis" },
    "PA":{ pac:"R$ 36–54", sedex:"R$ 65–95", prazo:"6–10 dias úteis" },
    "AM":{ pac:"R$ 40–60", sedex:"R$ 72–105", prazo:"7–12 dias úteis" },
    "CE":{ pac:"R$ 30–45", sedex:"R$ 55–82", prazo:"4–8 dias úteis" },
    "PE":{ pac:"R$ 30–45", sedex:"R$ 55–82", prazo:"4–8 dias úteis" },
    "MA":{ pac:"R$ 33–50", sedex:"R$ 60–88", prazo:"5–9 dias úteis" },
    "PI":{ pac:"R$ 33–50", sedex:"R$ 60–88", prazo:"5–9 dias úteis" },
    "AL":{ pac:"R$ 30–45", sedex:"R$ 55–82", prazo:"4–8 dias úteis" },
    "SE":{ pac:"R$ 28–42", sedex:"R$ 52–78", prazo:"3–7 dias úteis" },
    "PB":{ pac:"R$ 31–47", sedex:"R$ 57–84", prazo:"5–9 dias úteis" },
    "RN":{ pac:"R$ 31–47", sedex:"R$ 57–84", prazo:"5–9 dias úteis" },
    "TO":{ pac:"R$ 34–52", sedex:"R$ 62–92", prazo:"5–9 dias úteis" },
    "RO":{ pac:"R$ 38–57", sedex:"R$ 68–100", prazo:"6–10 dias úteis" },
    "AC":{ pac:"R$ 42–63", sedex:"R$ 75–110", prazo:"7–12 dias úteis" },
    "RR":{ pac:"R$ 42–63", sedex:"R$ 75–110", prazo:"7–12 dias úteis" },
    "AP":{ pac:"R$ 40–60", sedex:"R$ 72–105", prazo:"7–12 dias úteis" },
  };
  return tabela[e] || { pac:"R$ 35–55", sedex:"R$ 62–92", prazo:"6–10 dias úteis" };
}
// Extrai o valor mínimo de uma faixa estimada tipo "R$ 18–28" → 18
function parseValorMinimoP(faixaStr) {
  const m = (faixaStr || "").match(/\d+/);
  return m ? parseFloat(m[0]) : 0;
}
import api from "../services/api";

const t = {
  bg: "#FFFFFF", bgSecundario: "#F2F2F2", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#595959",
  border: "#E0E0E0", borderForte: "#B0B0B0",
  btnPrimarioBg: "#1a1a1a", btnPrimarioText: "#FFFFFF",
};

const CATEGORIAS = [
  { id: "roupas",      label: "Item de Roupa",      Icone: ShirtIcon, cor: t.text },
  { id: "comunicacao", label: "Comunicação Visual", Icone: ImageIcon, cor: t.text },
];

const TIPOS_ROUPA = [
  { id: "camisa-comum", label: "Camisa Comum" },
  { id: "polo",         label: "Polo" },
  { id: "calcas",       label: "Calças" },
];

const TIPOS_COMUNICACAO = [
  { id: "logos-acm",           label: "Logos ACM" },
  { id: "impressoes-digitais", label: "Impressões Digitais" },
];

const GRUPOS_TAMANHO = [
  { id: "adulto",   label: "Adulto",    tamanhos: ["PP","P","M","G","G1","G2","G3","GG","EXG","EXGG"] },
  { id: "baby",     label: "Baby Look", tamanhos: ["PP","P","M","G","G1","G2","G3","GG","EXG","EXGG"] },
  { id: "infantil", label: "Infantil",  tamanhos: ["4","6","8","10","12","14"] },
];
const TAMANHOS_CALCAS = ["36","38","40","42","44","46","48","50"];
const MATERIAL_CALCAS = ["Jeans","Brim"];

const CORES_OPCOES = [
  { id:"branco",        label:"Branco",             hex:"#FFFFFF" },
  { id:"preto",         label:"Preto",              hex:"#1a1a1a" },
  { id:"cinza",         label:"Cinza",              hex:"#9ca3af" },
  { id:"azul-marinho",  label:"Azul Marinho",       hex:"#1e3a8a" },
  { id:"azul-royal",    label:"Azul Royal",         hex:"#2563eb" },
  { id:"vermelho",      label:"Vermelho",           hex:"#dc2626" },
  { id:"verde",         label:"Verde",              hex:"#16a34a" },
  { id:"amarelo",       label:"Amarelo",            hex:"#ca8a04" },
  { id:"laranja",       label:"Laranja",            hex:"#ea580c" },
  { id:"rosa",          label:"Rosa",               hex:"#db2777" },
  { id:"roxo",          label:"Roxo",               hex:"#7c3aed" },
  { id:"bege",          label:"Bege",               hex:"#d4b896" },
  { id:"personalizada", label:"Outra / Me consulte", hex:null },
];

const MATERIAIS_OPCOES = [
  { id:"pv",      label:"PV",            descricao:"Mistura de poliéster e viscose, caimento elegante" },
  { id:"algodao", label:"100% Algodão",  descricao:"Macio, respirável, ideal para o dia a dia" },
  { id:"dry-fit", label:"Dry Fit",       descricao:"Alta performance, absorve suor" },
  { id:"outro",   label:"Outro — nos indique", descricao:"Descreva o material na descrição do pedido" },
];

// ── helpers ──
function emailValido(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validarTel(v){ const n=v.replace(/\D/g,""); if(!n) return "Obrigatório"; if(n.length<10) return "Mínimo 10 dígitos"; if(n.length>11) return "Máximo 11 dígitos"; return ""; }
function formatTel(v){ const n=v.replace(/\D/g,"").slice(0,11); if(n.length<=2) return n; if(n.length<=6) return `(${n.slice(0,2)}) ${n.slice(2)}`; if(n.length<=10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`; return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`; }
function formatCEP(v){ const n=v.replace(/\D/g,"").slice(0,8); return n.length>5?`${n.slice(0,5)}-${n.slice(5)}`:n; }
async function buscarCEP(cep,setForm){ const n=cep.replace(/\D/g,""); if(n.length!==8) return; try{ const r=await fetch(`https://viacep.com.br/ws/${n}/json/`); const d=await r.json(); if(!d.erro) setForm(p=>({...p,cidade:d.localidade||p.cidade,estado:d.uf||p.estado,rua:d.logradouro||p.rua,bairro:d.bairro||p.bairro})); }catch{} }

function IconBadge({ Icone, cor, size = 13, box = 24 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: box + "px", height: box + "px", borderRadius: "8px",
      backgroundColor: cor + "1f", color: cor, flexShrink: 0 }}>
      <Icone size={size} strokeWidth={1.8} />
    </span>
  );
}

// Uma "combinação" = { id, tipoId, cor, material, quantidades: {adulto:{P:2}, baby:{M:1}} ou {calcas:{36:2}} }
function novaCombinacao(tipoId, idx){ return { id: `${tipoId}-${idx}-${Date.now()}`, tipoId, cor: "", material: tipoId==="calcas" ? "" : "", quantidades: {} }; }

const FORM_INICIAL = {
  categoria: "",
  combinacoes: [],          // array de combinações
  tipoComunicacao: "",
  dimensoes: "",
  descricao: "",
  fotos: [],
  nomeCliente:"", telefone:"", email:"",
  cep:"", cidade:"", estado:"", rua:"", numero:"", bairro:"", complemento:"",
  observacoes:"",
  frete_tipo:"", frete_valor:0,
};

export default function Personalizado(){
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [copiado, setCopiado] = useState(false);
  // modais
  const [modalTamanhos, setModalTamanhos] = useState(null); // combId
  const [modalCores, setModalCores] = useState(null);       // combId
  const [modalMaterial, setModalMaterial] = useState(null); // combId
  const [tabelaAberta, setTabelaAberta] = useState(false);

  const inputStyle = { width:"100%", padding:"12px 14px", outline:"none", border:"1px solid "+t.border, borderRadius:"10px", backgroundColor:t.bgCard, color:t.text, fontSize:"14px", lineHeight:1.5, boxSizing:"border-box", fontFamily:"system-ui", transition:"border-color 0.2s" };
  const labelStyle = { display:"block", fontSize:"12px", fontWeight:"600", color:t.textSecundario, marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"system-ui" };
  const btnP = (a)=>({ padding:"14px", fontWeight:"700", fontSize:"14px", fontFamily:"system-ui", cursor:a?"pointer":"not-allowed", border:"none", borderRadius:"10px", backgroundColor:a?t.btnPrimarioBg:t.border, color:a?t.btnPrimarioText:t.textSecundario });

  // ── combinações helpers ──
  function addCombinacao(tipoId){
    const idx = form.combinacoes.filter(c=>c.tipoId===tipoId).length;
    setForm(p=>({...p, combinacoes:[...p.combinacoes, novaCombinacao(tipoId, idx)]}));
  }
  function removeCombinacao(combId){
    setForm(p=>({...p, combinacoes:p.combinacoes.filter(c=>c.id!==combId)}));
  }
  function updateComb(combId, field, value){
    setForm(p=>({...p, combinacoes:p.combinacoes.map(c=>c.id===combId?{...c,[field]:value}:c)}));
  }
  function setQtdComb(combId, grupoId, tamanho, valor){
    const num = Math.max(0, parseInt(valor)||0);
    setForm(p=>({...p, combinacoes:p.combinacoes.map(c=>{
      if(c.id!==combId) return c;
      return {...c, quantidades:{...c.quantidades, [grupoId]:{...(c.quantidades[grupoId]||{}), [tamanho]:num}}};
    })}));
  }
  function totalComb(comb){ return Object.values(comb.quantidades).reduce((a,g)=>a+Object.values(g).reduce((x,y)=>x+y,0),0); }
  const totalGeral = form.combinacoes.reduce((a,c)=>a+totalComb(c),0);

  // ── validação ──
  const etapa1Valida = (()=>{
    if(!form.categoria) return false;
    if(form.categoria==="roupas"){
      if(form.combinacoes.length===0) return false;
      for(const c of form.combinacoes){
        if(!c.cor) return false;
        if(c.tipoId==="calcas" && !c.material) return false;
        if((c.tipoId==="camisa-comum"||c.tipoId==="polo") && !c.material) return false;
        if(totalComb(c)===0) return false;
      }
      return true;
    }
    if(form.categoria==="comunicacao") return !!form.tipoComunicacao && !!form.dimensoes.trim();
    return false;
  })();

  const finalizacaoValida = Boolean(
    form.nomeCliente.trim() && !validarTel(form.telefone) &&
    form.email.trim() && emailValido(form.email) &&
    form.cep && form.cep.replace(/\D/g,"").length===8 &&
    form.cidade.trim() && form.estado.trim() &&
    (form.rua||"").trim() && (form.numero||"").trim() && (form.bairro||"").trim()
  );

  // ── salvar ──
  function gerarPDFPersonalizado() {
    const combinacoesHTML = form.categoria === "roupas"
      ? form.combinacoes.map((c, i) => {
          const tipo = TIPOS_ROUPA.find(t => t.id === c.tipoId);
          const cor = CORES_OPCOES.find(x => x.id === c.cor)?.label || c.cor;
          const mat = c.tipoId === "calcas"
            ? c.material
            : MATERIAIS_OPCOES.find(m => m.id === c.material)?.label || c.material;
          const tamanhos = (c.tipoId === "calcas"
            ? Object.entries(c.quantidades.calcas || {})
            : GRUPOS_TAMANHO.flatMap(g => Object.entries(c.quantidades[g.id] || {}).map(([t,v]) => [t,v,g.label]))
          ).filter(([,v]) => v > 0)
           .map(([tam, qtd, grupo]) => `${grupo ? grupo+": " : ""}${tam}: ${qtd} pç${qtd > 1 ? "s" : ""}`)
           .join(" &nbsp;|&nbsp; ");
          return `<div style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;margin-bottom:8px;border-radius:6px">
            <strong style="font-size:14px">#${i+1} ${tipo?.label}</strong><br/>
            <span style="font-size:12px;color:#6b7280">Cor: ${cor} &nbsp;|&nbsp; Material: ${mat}</span><br/>
            <span style="font-size:12px">${tamanhos}</span>
            <div style="font-size:12px;font-weight:600;margin-top:4px">Total: ${totalComb(c)} unidades</div>
          </div>`;
        }).join("")
      : `<div style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px">
          <strong>${TIPOS_COMUNICACAO.find(t => t.id === form.tipoComunicacao)?.label || ""}</strong><br/>
          <span style="font-size:12px;color:#6b7280">Dimensões: ${form.dimensoes}</span>
        </div>`;

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Pedido Personalizado Metzker</title>
    <style>
      body{font-family:system-ui,sans-serif;max-width:600px;margin:40px auto;padding:0 20px;color:#1a1a1a}
      .logo{font-size:28px;font-weight:300;letter-spacing:2px;margin-bottom:4px}
      .logo span{color:#c41e3a;font-weight:700}
      h2{font-size:20px;font-weight:600;margin:24px 0 4px}
      .badge{display:inline-block;padding:4px 14px;background:#fef9f0;color:#92400e;border:1px solid #fde68a;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:20px}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0}
      .info-block{padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px}
      .info-block h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin:0 0 6px}
      .info-block p{font-size:13px;margin:2px 0}
      .aviso{background:#fef9f0;border:1px solid #fde68a;padding:14px;border-radius:6px;font-size:12px;color:#92400e;margin-top:20px}
      .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center}
    </style></head><body>
      <div class="logo"><span>m</span>etzker soluções</div>
      <p style="color:#6b7280;font-size:12px;margin:0 0 20px">Vila Velha, ES · (27) 99787-8391 · andremetzkrr@gmail.com</p>
      <h2>Comprovante de Pedido Personalizado</h2>
      <span class="badge">Pedido personalizado registrado</span>
      <div style="margin:12px 0;padding:12px 16px;background:#fef9f0;border:1px solid #fde68a;border-radius:8px;font-family:monospace;font-size:18px;font-weight:700;letter-spacing:0.05em">
        ${protocolo}
      </div>

      <div class="info-grid">
        <div class="info-block">
          <h3>Cliente</h3>
          <p><strong>${form.nomeCliente}</strong></p>
          <p>${form.telefone}</p>
          <p>${form.email}</p>
        </div>
        <div class="info-block">
          <h3>Endereço</h3>
          <p>${form.rua||"-"}, ${form.numero||"-"}${form.complemento ? " — " + form.complemento : ""}</p>
          <p>${form.bairro||"-"} — ${form.cidade||"-"}/${form.estado||"-"}</p>
          <p>CEP: ${form.cep||"-"}</p>
        </div>
        <div class="info-block">
          <h3>Categoria</h3>
          <p>${form.categoria === "roupas" ? "Item de Roupa" : "Comunicação Visual"}</p>
          ${form.categoria === "roupas" ? `<p>Total: <strong>${totalGeral} unidades</strong></p>` : `<p>Dimensões: ${form.dimensoes}</p>`}
        </div>
        <div class="info-block">
          <h3>Entrega</h3>
          <p><strong>${form.frete_tipo === "retirada" ? "Retirada no local" : form.frete_tipo === "motoboy" ? "Motoboy" : form.frete_tipo === "correios" ? "Correios (PAC/SEDEX)" : "A confirmar"}</strong></p>
          ${form.frete_tipo === "motoboy" ? `<p style="color:#d97706;font-size:12px">Apenas Grande Vitória / ES</p>` : ""}
          ${form.frete_tipo === "correios" ? `<p style="color:#6b7280;font-size:12px">Valor confirmado pela loja</p>` : ""}
          ${form.frete_tipo === "retirada" ? `<p style="color:#16a34a;font-weight:600">Grátis</p>` : ""}
        </div>
        <div class="info-block">
          <h3>Data</h3>
          <p>${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})}</p>
        </div>
      </div>

      <h3 style="font-size:15px;margin:20px 0 10px">Combinações / Detalhes</h3>
      ${combinacoesHTML}

      ${form.descricao ? `<div style="margin-top:14px;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:13px"><strong>Descrição:</strong> ${form.descricao}</div>` : ""}
      ${form.observacoes ? `<div style="margin-top:8px;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:13px"><strong>Observações:</strong> ${form.observacoes}</div>` : ""}

      <div class="aviso">
        <strong>Atenção:</strong> o valor não está incluído neste comprovante. O orçamento será confirmado pela equipe Metzker pelo WhatsApp após análise do pedido.
      </div>
      <div class="footer">
        Guarde este comprovante. Nossa equipe entrará em contato para confirmar detalhes e orçamento.<br/>
        metzkersolucoes.com.br · Desenvolvido por Matheus Costa Rodrigues
      </div>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }

  async function salvarNoBanco(){
    setSalvando(true); setErro("");
    try{
      const detalhesCombinacoes = form.combinacoes.map((c,i)=>{
        const tipo = TIPOS_ROUPA.find(t=>t.id===c.tipoId);
        const cor = CORES_OPCOES.find(x=>x.id===c.cor)?.label||c.cor;
        const mat = c.tipoId==="calcas"
          ? c.material
          : MATERIAIS_OPCOES.find(m=>m.id===c.material)?.label||c.material;
        const grupos = Object.entries(c.quantidades).map(([g,qtds])=>{
          const nomeGrupo = GRUPOS_TAMANHO.find(x=>x.id===g)?.label||g;
          const itens = Object.entries(qtds).filter(([,v])=>v>0).map(([t,v])=>`${t}:${v}`).join(" ");
          return itens?`${nomeGrupo}[${itens}]`:"";
        }).filter(Boolean).join(" | ");
        return `#${i+1} ${tipo?.label} | Cor:${cor} | Material:${mat} | ${grupos} | Total:${totalComb(c)}un`;
      }).join("\n");

      // Usa FormData para enviar imagens junto com o pedido
      const fd = new FormData();
      fd.append("nome_empresa", form.nomeCliente);
      fd.append("slogan", form.dimensoes||"");
      fd.append("ramo", form.categoria==="roupas"
        ? form.combinacoes.map(c=>TIPOS_ROUPA.find(t=>t.id===c.tipoId)?.label).join(", ")
        : TIPOS_COMUNICACAO.find(t=>t.id===form.tipoComunicacao)?.label||"");
      fd.append("quantidade", String(totalGeral||1));
      fd.append("estilo", form.categoria);
      fd.append("paleta", JSON.stringify(form.combinacoes.map(c=>c.cor)));
      fd.append("aplicacoes", JSON.stringify(form.categoria==="roupas"?[...new Set(form.combinacoes.map(c=>c.tipoId))]:[form.tipoComunicacao]));
      fd.append("referencia", detalhesCombinacoes||form.descricao||"");
      fd.append("observacoes", (form.observacoes||"")+"\n\nDescrição: "+(form.descricao||""));
      fd.append("nome_cliente", form.nomeCliente);
      fd.append("telefone", form.telefone);
      fd.append("email", form.email);
      fd.append("cep", form.cep);
      fd.append("rua", form.rua);
      fd.append("numero", form.numero);
      fd.append("complemento", form.complemento);
      fd.append("bairro", form.bairro);
      fd.append("cidade", form.cidade);
      fd.append("estado", form.estado);
      fd.append("frete_tipo", form.frete_tipo || "retirada");
      fd.append("frete_valor", form.frete_valor || 0);
      // Imagens (máx 5)
      form.fotos.forEach((foto, i) => {
        if(foto.file && i < 5) fd.append(`imagem${i+1}`, foto.file);
      });

      await api.post("pedidos-personalizados/", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Gerar protocolo único
      const agora = new Date();
      const dataStr = agora.getFullYear().toString() +
        String(agora.getMonth()+1).padStart(2,'0') +
        String(agora.getDate()).padStart(2,'0');
      const prot = `MTZ-PERS-${dataStr}-${String(Date.now()).slice(-4)}`;
      setProtocolo(prot);
      setEnviado(true);
    } catch(e) {
      console.error("Erro pedido personalizado:", e.response?.data, e.response?.status);
      const msg = e.response?.status === 400
        ? "Dados inválidos. Verifique os campos e tente novamente."
        : "Não foi possível registrar. Use o WhatsApp para enviar seu pedido!";
      setErro(msg);
    }
    finally { setSalvando(false); }
  }

  function montarMsgWpp(){
    let detalhes="";
    if(form.categoria==="roupas"){
      detalhes = form.combinacoes.map((c,i)=>{
        const tipo=TIPOS_ROUPA.find(t=>t.id===c.tipoId);
        const cor=CORES_OPCOES.find(x=>x.id===c.cor)?.label||c.cor;
        const mat=c.tipoId==="calcas"?c.material:MATERIAIS_OPCOES.find(m=>m.id===c.material)?.label||c.material;
        const grupos = (c.tipoId==="calcas"
          ? Object.entries(c.quantidades.calcas||{}).filter(([,v])=>v>0).map(([t,v])=>`${t}:${v}`)
          : GRUPOS_TAMANHO.map(g=>{
              const itens=Object.entries(c.quantidades[g.id]||{}).filter(([,v])=>v>0).map(([t,v])=>`${t}:${v}`);
              return itens.length?`${g.label}[${itens.join(" ")}]`:"";
            }).filter(Boolean)
        ).join(" | ");
        return `*Combinação ${i+1}:* ${tipo?.label}\nCor: ${cor} | Material: ${mat}\nTamanhos: ${grupos}\nTotal: ${totalComb(c)} unidades`;
      }).join("\n\n");
    } else {
      const tipo=TIPOS_COMUNICACAO.find(t=>t.id===form.tipoComunicacao);
      detalhes=`*${tipo?.label}*\nDimensões: ${form.dimensoes}`;
    }
    const msg=`*PEDIDO PERSONALIZADO — METZKER*\n\n*Categoria:* ${form.categoria==="roupas"?"Item de Roupa":"Comunicação Visual"}\n\n${detalhes}\n\n*Descrição:* ${form.descricao||"—"}\n*Obs:* ${form.observacoes||"—"}\n\n${form.nomeCliente}\n${form.telefone}\n${form.email}\n${form.rua}, ${form.numero}${form.complemento?" — "+form.complemento:""}\n   ${form.bairro} — ${form.cidade}/${form.estado} — CEP: ${form.cep}`;
    return encodeURIComponent(msg);
  }

  async function finalizarComWhatsApp(){ await salvarNoBanco(); window.open(`https://wa.me/5527997878391?text=${montarMsgWpp()}`,"_blank"); }

  if(enviado) return (
    <div style={{backgroundColor:t.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="text-center px-6" style={{maxWidth:"480px"}}>
        <div style={{display:"flex", justifyContent:"center", marginBottom:"24px"}}>
          <span style={{display:"flex", alignItems:"center", justifyContent:"center",
            width:"72px", height:"72px", borderRadius:"50%", backgroundColor:"#fef9f0", color:"#d97706"}}>
            <PartyIcon size={36} strokeWidth={1.4} />
          </span>
        </div>
        <h2 style={{fontSize:"2rem",fontWeight:"300",color:t.text,marginBottom:"16px",fontFamily:"Georgia, serif"}}>Pedido recebido!</h2>
        <p style={{color:t.textSecundario,lineHeight:1.8,marginBottom:"20px",fontFamily:"system-ui"}}>Seu pedido foi registrado. Nossa equipe entrará em contato em breve pelo WhatsApp para confirmar detalhes e orçamento.</p>

        {/* PROTOCOLO */}
        <div style={{backgroundColor:t.bgSecundario, border:"1px solid "+t.border, borderRadius:"16px", padding:"24px", marginBottom:"24px"}}>
          <p style={{fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.1em", color:t.textSecundario, fontFamily:"system-ui", marginBottom:"10px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px"}}>
            <IconBadge Icone={TagIcon} cor={t.text} size={11} box={20} /> Número do Protocolo
          </p>
          <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:"12px", flexWrap:"wrap"}}>
            <span style={{fontSize:"1.5rem", fontWeight:"700", fontFamily:"monospace", letterSpacing:"0.05em", color:t.text}}>
              {protocolo}
            </span>
            <button
              onClick={() => { navigator.clipboard.writeText(protocolo).then(() => { setCopiado(true); setTimeout(()=>setCopiado(false),2500); }); }}
              className="transition-all duration-300 hover:shadow-md"
              style={{padding:"6px 16px", backgroundColor:copiado?"#16a34a":t.btnPrimarioBg, color:t.btnPrimarioText,
                border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", fontWeight:"600",
                borderRadius:"8px", display:"inline-flex", alignItems:"center", gap:"6px"}}>
              {copiado ? <><CheckIcon size={14} strokeWidth={2.2} />Copiado!</> : <><CopyIcon size={14} strokeWidth={1.8} />Copiar</>}
            </button>
          </div>
          <p style={{fontSize:"11px", color:t.textSecundario, fontFamily:"system-ui", marginTop:"8px"}}>
            Guarde este número para acompanhar ou questionar seu pedido.
          </p>
        </div>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={gerarPDFPersonalizado}
            className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            style={{padding:"12px 24px",borderRadius:"10px",backgroundColor:t.btnPrimarioBg,color:t.btnPrimarioText,border:"none",cursor:"pointer",fontFamily:"system-ui",display:"inline-flex",alignItems:"center",gap:"8px"}}>
            <PrinterIcon size={16} strokeWidth={1.6} /> Salvar / Imprimir PDF
          </button>
          <button onClick={()=>navigate("/")}
            className="transition-all duration-300 hover:shadow-md"
            style={{padding:"12px 24px",borderRadius:"10px",border:"1px solid "+t.border,color:t.text,backgroundColor:t.bg,cursor:"pointer",fontFamily:"system-ui"}}>Voltar ao início</button>
          <button onClick={()=>{setEnviado(false);setEtapa(1);setForm(FORM_INICIAL);}}
            className="transition-all duration-300 hover:shadow-md"
            style={{padding:"12px 24px",borderRadius:"10px",backgroundColor:t.bgSecundario,color:t.text,border:"1px solid "+t.border,cursor:"pointer",fontFamily:"system-ui"}}>Novo pedido</button>
        </div>
      </div>
    </div>
  );

  // ── Modal helper component ──
  const getComb = (id) => form.combinacoes.find(c=>c.id===id);

  return (
    <div style={{backgroundColor:t.bg,color:t.text,overflowX:"hidden"}}>
      <div style={{maxWidth:"680px",margin:"0 auto",padding:"48px 20px"}}>

        {/* HEADER */}
        <div className="text-center" style={{marginBottom:"40px"}}>
          <p style={{fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.25em",color:t.textSecundario,marginBottom:"8px",fontFamily:"system-ui"}}>Comunicação Visual</p>
          <h1 style={{fontSize:"clamp(1.8rem,5vw,3rem)",fontWeight:"300",color:t.text,fontFamily:"Georgia, serif"}}>Faça o Seu <em style={{fontStyle:"italic"}}>Personalizado</em></h1>
          <p style={{color:t.textSecundario,marginTop:"12px",fontFamily:"system-ui",lineHeight:1.7}}>Crie sua logo ou identidade visual do zero com a gente.</p>
        </div>

        {/* PROGRESSO */}
        <div style={{marginBottom:"40px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
            {["Detalhes do pedido","Finalizar pedido"].map((label,i)=>(
              <span key={i} style={{fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"system-ui",color:etapa>i?t.text:t.textSecundario,fontWeight:etapa===i+1?"700":"400"}}>{label}</span>
            ))}
          </div>
          <div style={{height:"2px",backgroundColor:t.border}}>
            <div style={{height:"100%",width:etapa===1?"50%":"100%",backgroundColor:t.text,transition:"width 0.4s ease"}}/>
          </div>
        </div>

        {/* ══ ETAPA 1 ══ */}
        {etapa===1 && (
          <div style={{display:"flex",flexDirection:"column",gap:"28px"}}>
            <h2 style={{fontSize:"1.4rem",fontWeight:"400",color:t.text,fontFamily:"Georgia, serif"}}>Detalhes do Pedido</h2>

            {/* CATEGORIA */}
            <div>
              <label style={labelStyle}>O que você precisa? *</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                {CATEGORIAS.map(cat=>{
                  const sel = form.categoria === cat.id;
                  return (
                    <button key={cat.id} onClick={()=>setForm(p=>({...p,categoria:cat.id,combinacoes:[],tipoComunicacao:"",dimensoes:""}))}
                      className="transition-all duration-300 hover:shadow-md"
                      style={{padding:"20px 16px",borderRadius:"14px",cursor:"pointer",textAlign:"center",fontFamily:"system-ui",border:"2px solid "+(sel?cat.cor:t.border),backgroundColor:sel?cat.cor:t.bgCard,color:sel?"#ffffff":t.text}}>
                      <div style={{display:"flex",justifyContent:"center",marginBottom:"8px",color: sel ? "#ffffff" : cat.cor}}>
                        <cat.Icone size={26} strokeWidth={1.5} />
                      </div>
                      <div style={{fontWeight:"600",fontSize:"13px"}}>{cat.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══ ROUPAS ══ */}
            {form.categoria==="roupas" && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                  <label style={{...labelStyle,marginBottom:0}}>Combinações de produto *</label>
                </div>

                {/* Lista de combinações */}
                {form.combinacoes.map((comb,idx)=>{
                  const tipo = TIPOS_ROUPA.find(t=>t.id===comb.tipoId);
                  const corObj = CORES_OPCOES.find(c=>c.id===comb.cor);
                  const total = totalComb(comb);
                  return (
                    <div key={comb.id} className="transition-shadow duration-300 hover:shadow-md" style={{marginBottom:"14px",borderRadius:"14px",overflow:"hidden",border:"1px solid "+t.border,backgroundColor:t.bgCard}}>
                      {/* Header combinação */}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",backgroundColor:t.bgSecundario,borderBottom:"1px solid "+t.border}}>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <IconBadge Icone={ShirtIcon} cor={t.text} size={12} box={22} />
                          {corObj?.hex && <span style={{width:"14px",height:"14px",borderRadius:"50%",backgroundColor:corObj.hex,border:"1px solid "+t.border,display:"inline-block",flexShrink:0}}/>}
                          <span style={{fontWeight:"600",fontSize:"13px",color:t.text,fontFamily:"system-ui"}}>
                            {tipo?.label}{corObj?" — "+corObj.label:""}
                            {total>0&&<span style={{color:t.textSecundario,fontWeight:"400"}}> ({total} un)</span>}
                          </span>
                        </div>
                        <button onClick={()=>removeCombinacao(comb.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",display:"flex"}}><CloseIcon size={16} strokeWidth={2} /></button>
                      </div>

                      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:"12px"}}>
                        {/* Cor */}
                        <div>
                          <label style={{...labelStyle,marginBottom:"6px"}}>Cor *</label>
                          {comb.cor ? (
                            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                              {corObj?.hex && <span style={{width:"16px",height:"16px",borderRadius:"50%",backgroundColor:corObj.hex,border:"1px solid "+t.border,display:"inline-block"}}/>}
                              <span style={{fontSize:"13px",color:t.text,fontFamily:"system-ui"}}>{corObj?.label}</span>
                              <button onClick={()=>setModalCores(comb.id)} style={{fontSize:"11px",color:t.textSecundario,background:"none",border:"1px solid "+t.border,borderRadius:"6px",cursor:"pointer",padding:"3px 10px",fontFamily:"system-ui"}}>Trocar</button>
                            </div>
                          ) : (
                            <button onClick={()=>setModalCores(comb.id)} style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",border:"1px dashed "+t.borderForte,backgroundColor:t.bgCard,color:t.text,cursor:"pointer",fontSize:"12px",fontFamily:"system-ui"}}>
                              <PaletteIcon size={14} strokeWidth={1.6} /> Selecionar cor
                            </button>
                          )}
                        </div>

                        {/* Material calças */}
                        {comb.tipoId==="calcas" && (
                          <div>
                            <label style={{...labelStyle,marginBottom:"6px"}}>Material *</label>
                            <div style={{display:"flex",gap:"8px"}}>
                              {MATERIAL_CALCAS.map(mat=>(
                                <button key={mat} onClick={()=>updateComb(comb.id,"material",mat)}
                                  className="transition-all duration-200 hover:shadow-sm"
                                  style={{padding:"7px 18px",borderRadius:"8px",cursor:"pointer",fontFamily:"system-ui",fontSize:"13px",border:"2px solid "+(comb.material===mat?t.text:t.border),backgroundColor:comb.material===mat?t.text:t.bgCard,color:comb.material===mat?t.btnPrimarioText:t.text}}>
                                  {mat}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Material camisa/polo */}
                        {(comb.tipoId==="camisa-comum"||comb.tipoId==="polo") && (
                          <div>
                            <label style={{...labelStyle,marginBottom:"6px"}}>Material *</label>
                            {comb.material ? (
                              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                                <span style={{fontSize:"13px",color:t.text,fontFamily:"system-ui"}}>{MATERIAIS_OPCOES.find(m=>m.id===comb.material)?.label}</span>
                                <button onClick={()=>setModalMaterial(comb.id)} style={{fontSize:"11px",color:t.textSecundario,background:"none",border:"1px solid "+t.border,borderRadius:"6px",cursor:"pointer",padding:"3px 10px",fontFamily:"system-ui"}}>Trocar</button>
                              </div>
                            ) : (
                              <button onClick={()=>setModalMaterial(comb.id)} style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",border:"1px dashed "+t.borderForte,backgroundColor:t.bgCard,color:t.text,cursor:"pointer",fontSize:"12px",fontFamily:"system-ui"}}>
                                <ThreadIcon size={14} strokeWidth={1.6} /> Selecionar material
                              </button>
                            )}
                          </div>
                        )}

                        {/* Tamanhos */}
                        <div>
                          <label style={{...labelStyle,marginBottom:"6px"}}>Tamanhos e quantidades *</label>
                          <button onClick={()=>setModalTamanhos(comb.id)} className="transition-all duration-300 hover:shadow-sm" style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"8px 14px",borderRadius:"8px",border:"1px solid "+t.borderForte,backgroundColor:t.bgCard,color:t.text,cursor:"pointer",fontSize:"12px",fontFamily:"system-ui"}}>
                            <RulerIcon size={14} strokeWidth={1.6} /> {total>0?`Editar tamanhos (${total} un)`:"Selecionar tamanhos e quantidades"}
                          </button>
                          {total>0 && (
                            <div style={{marginTop:"8px",display:"flex",flexDirection:"column",gap:"3px"}}>
                              {(comb.tipoId==="calcas"?[{id:"calcas",label:""}]:GRUPOS_TAMANHO).map(g=>{
                                const qtds=comb.tipoId==="calcas"
                                  ?Object.entries(comb.quantidades.calcas||{}).filter(([,v])=>v>0)
                                  :Object.entries(comb.quantidades[g.id]||{}).filter(([,v])=>v>0);
                                if(!qtds.length) return null;
                                return (
                                  <div key={g.id} style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                                    {g.label&&<p style={{fontSize:"10px",fontWeight:"700",color:t.textSecundario,fontFamily:"system-ui",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>{g.label}</p>}
                                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                                    {qtds.map(([tam,qtd])=>(
                                      <div key={tam} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 10px",borderRadius:"8px",backgroundColor:t.bgCard,border:"1px solid "+t.borderForte,minWidth:"44px"}}>
                                        <span style={{fontSize:"12px",fontWeight:"700",color:t.text,fontFamily:"system-ui"}}>{tam}</span>
                                        <span style={{fontSize:"10px",color:t.textSecundario,fontFamily:"system-ui"}}>{qtd} {parseInt(qtd)===1?"pç":"pçs"}</span>
                                      </div>
                                    ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Botões para adicionar combinação */}
                <div>
                  <label style={labelStyle}>Adicionar combinação</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                    {TIPOS_ROUPA.map(tipo=>(
                      <button key={tipo.id} onClick={()=>addCombinacao(tipo.id)}
                        className="transition-all duration-300 hover:shadow-sm"
                        style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"9px 14px",borderRadius:"8px",border:"1px solid "+t.borderForte,backgroundColor:t.bgCard,color:t.text,cursor:"pointer",fontSize:"13px",fontFamily:"system-ui"}}>
                        + {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link tabela de medidas */}
                <button onClick={() => setTabelaAberta(true)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecundario, fontSize: "12px", fontFamily: "system-ui", textDecoration: "underline", padding: 0, textAlign: "left", display:"inline-flex", alignItems:"center", gap:"5px" }}>
                  <RulerIcon size={13} strokeWidth={1.6} /> Ver tabela de medidas
                </button>

                {/* Contador e checklist */}
                {form.combinacoes.length>0 && (
                  <div style={{backgroundColor:totalGeral>0?"#f0fdf4":"#fef9f0",border:"1px solid "+(totalGeral>0?"#86efac":"#fde68a"),borderRadius:"12px",padding:"14px"}}>
                    <p style={{fontSize:"13px",fontWeight:"600",fontFamily:"system-ui",marginBottom:"6px",color:totalGeral>0?"#16a34a":"#92400e",display:"flex",alignItems:"center",gap:"6px"}}>
                      {totalGeral>0
                        ? <><CheckIcon size={15} strokeWidth={2.2} />{totalGeral} unidade{totalGeral>1?"s":""} selecionada{totalGeral>1?"s":""}</>
                        : <><WarningIcon size={15} strokeWidth={1.8} />Selecione ao menos 1 unidade</>}
                    </p>
                    {(()=>{
                      const itens=[];
                      for(const c of form.combinacoes){
                        const tipo=TIPOS_ROUPA.find(t=>t.id===c.tipoId);
                        const corObj=CORES_OPCOES.find(x=>x.id===c.cor);
                        const label=`${tipo?.label}${corObj?" ("+corObj.label+")":""}`;
                        if(!c.cor) itens.push(`${label}: selecione a cor`);
                        if(!c.material) itens.push(`${label}: selecione o material`);
                        if(totalComb(c)===0) itens.push(`${label}: informe os tamanhos`);
                      }
                      return itens.length>0?(
                        <ul style={{fontSize:"12px",color:"#92400e",fontFamily:"system-ui",lineHeight:1.8,paddingLeft:"16px",margin:0}}>
                          {itens.map((item,i)=><li key={i}>{item}</li>)}
                        </ul>
                      ):null;
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ══ COMUNICAÇÃO VISUAL ══ */}
            {form.categoria==="comunicacao" && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de serviço *</label>
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    {TIPOS_COMUNICACAO.map(tipo=>{
                      const sel = form.tipoComunicacao===tipo.id;
                      return (
                        <button key={tipo.id} onClick={()=>setForm(p=>({...p,tipoComunicacao:tipo.id}))}
                          className="transition-all duration-300 hover:shadow-md"
                          style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",borderRadius:"12px",cursor:"pointer",textAlign:"left",fontFamily:"system-ui",fontSize:"14px",border:"2px solid "+(sel?t.text:t.border),backgroundColor:sel?t.bgSecundario:t.bgCard,color:t.text,fontWeight:sel?"600":"400"}}>
                          {sel ? <CheckIcon size={15} strokeWidth={2.2} style={{color:"#16a34a"}} /> : <span style={{width:"15px",height:"15px",borderRadius:"50%",border:"1.5px solid "+t.border,display:"inline-block"}} />}
                          {tipo.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {form.tipoComunicacao && (
                  <div>
                    <label style={labelStyle}>Dimensões do material *</label>
                    <p style={{ fontSize:"12px", color:t.textSecundario, fontFamily:"system-ui", marginBottom:"8px", lineHeight:1.5 }}>
                      Informe a largura × altura desejada. Ex: <strong style={{color:t.text}}>1,2m × 0,8m</strong> ou <strong style={{color:t.text}}>A4</strong> ou <strong style={{color:t.text}}>80cm × 60cm</strong>
                    </p>
                    <input value={form.dimensoes} onChange={e=>setForm(p=>({...p,dimensoes:e.target.value}))}
                      placeholder="Ex: 1,2m × 0,8m — largura × altura" style={inputStyle}/>
                    {form.dimensoes && (
                      <p style={{ fontSize:"11px", color:"#16a34a", fontFamily:"system-ui", marginTop:"4px", display:"flex", alignItems:"center", gap:"5px" }}>
                        <CheckIcon size={12} strokeWidth={2.2} /> Dimensões: {form.dimensoes}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* DESCRIÇÃO + UPLOAD */}
            {form.categoria && (
              <>
                <div>
                  <label style={labelStyle}>{form.categoria==="roupas"?"Descrição (estampa, tema, arte...)":"Descrição do projeto"}</label>
                  <textarea value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))} rows={4}
                    placeholder={form.categoria==="roupas"?"Descreva o tema, arte, estampa, referências...":"Descreva o logo, cores, referências..."}
                    style={{...inputStyle,resize:"none"}}/>
                </div>
                <div>
                  <label style={labelStyle}>{form.categoria==="roupas"?"Artes e estampas (opcional — até 5)":"Arquivos de referência (opcional — até 5)"}</label>
                  <label className="transition-all duration-300 hover:shadow-sm" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px",borderRadius:"14px",cursor:"pointer",border:"2px dashed "+t.borderForte,backgroundColor:t.bgCard}}>
                    <span style={{marginBottom:"10px"}}><IconBadge Icone={PaperclipIcon} cor={t.text} size={20} box={44} /></span>
                    <span style={{fontSize:"13px",fontWeight:"500",color:t.text,fontFamily:"system-ui"}}>Clique para selecionar arquivos</span>
                    <span style={{fontSize:"11px",color:t.textSecundario,marginTop:"4px",fontFamily:"system-ui"}}>PNG, JPG, PDF — até 5 arquivos</span>
                    <input type="file" multiple accept="image/*,.pdf" style={{display:"none"}} onChange={e=>{const files=Array.from(e.target.files).slice(0,5);setForm(p=>({...p,fotos:files.map(f=>({file:f,url:f.type.startsWith("image/")?URL.createObjectURL(f):null,name:f.name}))}));}}/>
                  </label>
                  {form.fotos.length>0&&(
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginTop:"10px"}}>
                      {form.fotos.map((foto,i)=>(
                        <div key={i} style={{position:"relative"}}>
                          {foto.url?<img src={foto.url} alt="" style={{width:"72px",height:"72px",borderRadius:"10px",objectFit:"cover",border:"1px solid "+t.border}}/>
                            :<div style={{width:"72px",height:"72px",borderRadius:"10px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:t.bgSecundario,border:"1px solid "+t.border,color:t.textSecundario,gap:"3px"}}>
                                <DocIcon size={20} strokeWidth={1.5} />
                                <span style={{fontSize:"9px"}}>{foto.name.split(".").pop().toUpperCase()}</span>
                              </div>}
                          <button onClick={()=>setForm(p=>({...p,fotos:p.fotos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:"-5px",right:"-5px",width:"18px",height:"18px",borderRadius:"50%",backgroundColor:"#ef4444",color:"white",border:"none",cursor:"pointer",fontSize:"10px"}}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <button onClick={()=>{if(etapa1Valida)setEtapa(2);}} disabled={!etapa1Valida}
              className="transition-all duration-300 hover:enabled:shadow-lg hover:enabled:-translate-y-0.5"
              style={{...btnP(etapa1Valida),width:"100%"}}>Próximo →</button>
          </div>
        )}

        {/* ══ ETAPA 2 — FINALIZAR ══ */}
        {etapa===2 && (
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            <h2 style={{fontSize:"1.4rem",fontWeight:"400",color:t.text,fontFamily:"Georgia, serif"}}>Finalizar Pedido</h2>

            {/* RESUMO */}
            <div style={{border:"1px solid "+t.border,borderRadius:"14px",padding:"20px",backgroundColor:t.bgCard}}>
              <p style={{fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.1em",color:t.textSecundario,fontFamily:"system-ui",marginBottom:"14px",display:"flex",alignItems:"center",gap:"8px"}}>
                <IconBadge Icone={ListIcon} cor="#6b6b6b" size={12} box={22} /> Resumo do pedido
              </p>
              <div style={{padding:"8px 0",borderBottom:"1px solid "+t.border}}>
                <p style={{fontSize:"13px",fontWeight:"600",color:t.text,fontFamily:"system-ui",display:"flex",alignItems:"center",gap:"7px"}}>
                  {form.categoria==="roupas" ? <ShirtIcon size={15} strokeWidth={1.7} style={{color:"#2563eb"}} /> : <ImageIcon size={15} strokeWidth={1.7} style={{color:"#7c3aed"}} />}
                  {form.categoria==="roupas"?"Item de Roupa":"Comunicação Visual"}
                </p>
                {form.categoria==="roupas"&&<p style={{fontSize:"12px",color:t.textSecundario,fontFamily:"system-ui"}}>Total: {totalGeral} unidades em {form.combinacoes.length} combinação{form.combinacoes.length!==1?"ões":""}</p>}
              </div>

              {form.categoria==="roupas" && form.combinacoes.map((comb,i)=>{
                const tipo=TIPOS_ROUPA.find(t=>t.id===comb.tipoId);
                const cor=CORES_OPCOES.find(x=>x.id===comb.cor);
                const mat=comb.tipoId==="calcas"?comb.material:MATERIAIS_OPCOES.find(m=>m.id===comb.material)?.label;
                return (
                  <div key={comb.id} style={{padding:"10px 0",borderBottom:"1px solid "+t.border}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
                      {cor?.hex&&<span style={{width:"12px",height:"12px",borderRadius:"50%",backgroundColor:cor.hex,border:"1px solid "+t.border,display:"inline-block"}}/>}
                      <span style={{fontSize:"13px",fontWeight:"600",color:t.text,fontFamily:"system-ui"}}>Comb. {i+1}: {tipo?.label} — {cor?.label}</span>
                      <span style={{fontSize:"12px",color:t.textSecundario,fontFamily:"system-ui"}}>{totalComb(comb)} un</span>
                    </div>
                    {mat&&<p style={{fontSize:"12px",color:t.textSecundario,fontFamily:"system-ui"}}>Material: {mat}</p>}
                    {(comb.tipoId==="calcas"?[{id:"calcas",label:""}]:GRUPOS_TAMANHO).map(g=>{
                      const qtds=comb.tipoId==="calcas"
                        ?Object.entries(comb.quantidades.calcas||{}).filter(([,v])=>v>0)
                        :Object.entries(comb.quantidades[g.id]||{}).filter(([,v])=>v>0);
                      if(!qtds.length) return null;
                      return (
                        <div key={g.id} style={{display:"flex",gap:"5px",flexWrap:"wrap",marginTop:"4px",alignItems:"center"}}>
                          {g.label&&<span style={{fontSize:"10px",color:t.textSecundario,fontFamily:"system-ui",textTransform:"uppercase"}}>{g.label}:</span>}
                          {qtds.map(([tam,qtd])=><span key={tam} style={{fontSize:"11px",padding:"2px 6px",backgroundColor:t.bgSecundario,border:"1px solid "+t.border,fontFamily:"system-ui"}}>{tam}: {qtd}</span>)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {form.categoria==="comunicacao"&&(
                <div style={{padding:"10px 0",borderBottom:"1px solid "+t.border}}>
                  <p style={{fontSize:"13px",fontWeight:"600",color:t.text,fontFamily:"system-ui"}}>{TIPOS_COMUNICACAO.find(t=>t.id===form.tipoComunicacao)?.label}</p>
                  {form.dimensoes&&<p style={{fontSize:"12px",color:t.textSecundario,fontFamily:"system-ui",display:"flex",alignItems:"center",gap:"5px"}}><RulerIcon size={12} strokeWidth={1.6} /> Dimensões: <strong style={{color:t.text}}>{form.dimensoes}</strong></p>}
                </div>
              )}

              {form.descricao&&(
                <div style={{padding:"10px 0"}}>
                  <span style={{fontSize:"11px",color:t.textSecundario,fontFamily:"system-ui",textTransform:"uppercase"}}>Descrição</span>
                  <p style={{fontSize:"13px",color:t.text,fontFamily:"system-ui",marginTop:"4px"}}>{form.descricao}</p>
                </div>
              )}
            </div>

            {/* CONTATO + ENDEREÇO */}
            <div style={{borderTop:"2px solid "+t.borderForte,paddingTop:"20px"}}>
              <p style={{fontSize:"13px",fontWeight:"600",color:t.text,fontFamily:"system-ui",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
                <IconBadge Icone={UserIcon} cor={t.text} size={12} box={22} /> Seus dados para contato *
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                <div><label style={labelStyle}>Nome completo *</label><input value={form.nomeCliente} onChange={e=>setForm(p=>({...p,nomeCliente:e.target.value}))} placeholder="Ex: João Silva" style={inputStyle}/></div>
                <div>
                  <label style={labelStyle}>Telefone / WhatsApp *</label>
                  <input value={form.telefone} onChange={e=>setForm(p=>({...p,telefone:formatTel(e.target.value)}))} placeholder="(27) 99999-9999" maxLength={15} inputMode="tel" style={{...inputStyle,borderColor:form.telefone&&validarTel(form.telefone)?"#ef4444":t.border}}/>
                  {form.telefone&&validarTel(form.telefone)&&<p style={{fontSize:"11px",color:"#ef4444",marginTop:"4px",fontFamily:"system-ui",display:"flex",alignItems:"center",gap:"4px"}}><WarningIcon size={12} strokeWidth={1.8} /> {validarTel(form.telefone)}</p>}
                </div>
                <div>
                  <label style={labelStyle}>E-mail *</label>
                  <input value={form.email} type="email" onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="Ex: joao@email.com" style={{...inputStyle,borderColor:form.email&&!emailValido(form.email)?"#ef4444":t.border}}/>
                  {form.email&&!emailValido(form.email)&&<p style={{fontSize:"11px",color:"#ef4444",marginTop:"4px",fontFamily:"system-ui",display:"flex",alignItems:"center",gap:"4px"}}><WarningIcon size={12} strokeWidth={1.8} /> E-mail inválido</p>}
                  {form.email&&emailValido(form.email)&&<p style={{fontSize:"11px",color:"#16a34a",marginTop:"4px",fontFamily:"system-ui",display:"flex",alignItems:"center",gap:"4px"}}><CheckIcon size={12} strokeWidth={2.2} /> E-mail válido</p>}
                </div>
                <div>
                  <label style={labelStyle}>CEP *</label>
                  <input value={form.cep} onChange={e=>{const fmt=formatCEP(e.target.value);setForm(p=>({...p,cep:fmt}));if(fmt.replace(/\D/g,"").length===8)buscarCEP(fmt,setForm);}} placeholder="29000-000" maxLength={9} inputMode="numeric" style={{...inputStyle,borderColor:form.cep&&form.cep.replace(/\D/g,"").length<8?"#ef4444":t.border}}/>
                  {form.cep&&form.cep.replace(/\D/g,"").length===8&&form.cidade&&<p style={{fontSize:"11px",color:"#16a34a",marginTop:"4px",fontFamily:"system-ui",display:"flex",alignItems:"center",gap:"4px"}}><CheckIcon size={12} strokeWidth={2.2} /> {form.cidade}/{form.estado}</p>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:"12px"}}>
                  <div><label style={labelStyle}>Cidade *</label><input value={form.cidade} onChange={e=>setForm(p=>({...p,cidade:e.target.value}))} placeholder="Vila Velha" style={inputStyle}/></div>
                  <div><label style={labelStyle}>Estado *</label><input value={form.estado} onChange={e=>setForm(p=>({...p,estado:e.target.value.toUpperCase().slice(0,2)}))} placeholder="ES" maxLength={2} style={{...inputStyle,textAlign:"center",textTransform:"uppercase"}}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"12px"}}>
                  <div><label style={labelStyle}>Rua / Avenida *</label><input value={form.rua||""} onChange={e=>setForm(p=>({...p,rua:e.target.value}))} placeholder="Rua das Flores" style={inputStyle}/></div>
                  <div><label style={labelStyle}>Número *</label><input value={form.numero||""} onChange={e=>setForm(p=>({...p,numero:e.target.value}))} placeholder="123" style={inputStyle}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                  <div><label style={labelStyle}>Bairro *</label><input value={form.bairro||""} onChange={e=>setForm(p=>({...p,bairro:e.target.value}))} placeholder="Centro" style={inputStyle}/></div>
                  <div><label style={labelStyle}>Complemento</label><input value={form.complemento||""} onChange={e=>setForm(p=>({...p,complemento:e.target.value}))} placeholder="Apto 2" style={inputStyle}/></div>
                </div>
                <div><label style={labelStyle}>Observações finais (opcional)</label><textarea value={form.observacoes} onChange={e=>setForm(p=>({...p,observacoes:e.target.value}))} rows={3} placeholder="Alguma informação extra..." style={{...inputStyle,resize:"none"}}/></div>

                {/* FRETE */}
                {(() => {
                  const motoP = estimarMotoboyP(form.cidade, form.estado);
                  const corP  = estimarCorreiosP(form.estado || "outros");
                  const cidadeL = form.cidade ? ` para ${form.cidade}` : "";
                  return (
                    <div>
                      <label style={{...labelStyle, marginBottom:"10px", display:"flex", alignItems:"center", gap:"8px"}}><IconBadge Icone={TruckIcon} cor="#6b6b6b" size={11} box={20} /> Como deseja receber? *</label>
                      <p style={{fontSize:"12px",color:t.textSecundario,fontFamily:"system-ui",marginBottom:"10px",lineHeight:1.5}}>
                        Escolha uma opção. Os valores de motoboy e Correios são estimativas — confirmamos o valor exato pelo WhatsApp.
                      </p>
                      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>

                        {/* Retirada */}
                        <button onClick={()=>setForm(p=>({...p,frete_tipo:"retirada",frete_valor:0}))}
                          className="transition-all duration-300 hover:shadow-md"
                          style={{padding:"12px 14px",borderRadius:"10px",textAlign:"left",cursor:"pointer",
                            border:"2px solid "+(form.frete_tipo==="retirada"?t.text:t.border),
                            backgroundColor:form.frete_tipo==="retirada"?t.bgSecundario:t.bgCard}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <p style={{fontSize:"13px",fontWeight:"600",color:t.text,margin:0,display:"flex",alignItems:"center",gap:"8px"}}><IconBadge Icone={StoreIcon} cor={t.text} size={12} box={22} /> Retirada no local</p>
                              <p style={{fontSize:"11px",color:t.textSecundario,margin:"3px 0 0"}}>Polo Têxtil Santa Inês — Vila Velha, ES</p>
                            </div>
                            <span style={{fontSize:"13px",fontWeight:"700",color:"#16a34a",whiteSpace:"nowrap",marginLeft:"12px"}}>Grátis</span>
                          </div>
                          {form.frete_tipo==="retirada" && <p style={{fontSize:"11px",color:t.text,marginTop:"6px",fontWeight:"600",display:"flex",alignItems:"center",gap:"4px"}}><CheckIcon size={12} strokeWidth={2.2} /> Selecionado</p>}
                        </button>

                        {/* Motoboy — sempre visível, desativado se fora da região */}
                        <button onClick={()=>{ if(motoP) setForm(p=>({...p,frete_tipo:"motoboy",frete_valor:motoP.min})); }}
                          className="transition-all duration-300 hover:shadow-md"
                          style={{padding:"12px 14px",borderRadius:"10px",textAlign:"left",cursor: motoP?"pointer":"default",
                            border:"2px solid "+(form.frete_tipo==="motoboy"?t.text:t.border),
                            backgroundColor:form.frete_tipo==="motoboy"?t.bgSecundario:t.bgCard,
                            opacity: motoP ? 1 : 0.45}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{flex:1}}>
                              <p style={{fontSize:"13px",fontWeight:"600",color:t.text,margin:0,display:"flex",alignItems:"center",gap:"8px"}}><IconBadge Icone={TruckIcon} cor={t.text} size={12} box={22} /> Entrega por motoboy</p>
                              <p style={{fontSize:"11px",color:t.textSecundario,margin:"3px 0 0"}}>
                                {motoP
                                  ? `Entrega própria${cidadeL} — estimativa de R$ ${motoP.min} a R$ ${motoP.max}`
                                  : "Disponível apenas para a região da Grande Vitória / ES"}
                              </p>
                            </div>
                            <span style={{fontSize:"12px",fontWeight:"700",color:t.textSecundario,whiteSpace:"nowrap",marginLeft:"12px"}}>
                              {motoP ? `~R$ ${motoP.min}–${motoP.max}` : "Indisponível"}
                            </span>
                          </div>
                          {form.frete_tipo==="motoboy" && <p style={{fontSize:"11px",color:t.text,marginTop:"6px",fontWeight:"600",display:"flex",alignItems:"center",gap:"4px"}}><CheckIcon size={12} strokeWidth={2.2} /> Selecionado</p>}
                        </button>

                        {/* Correios — sempre visível */}
                        <button onClick={()=>setForm(p=>({...p,frete_tipo:"correios",frete_valor:parseValorMinimoP(corP.pac)}))}
                          className="transition-all duration-300 hover:shadow-md"
                          style={{padding:"12px 14px",borderRadius:"10px",textAlign:"left",cursor:"pointer",
                            border:"2px solid "+(form.frete_tipo==="correios"?t.text:t.border),
                            backgroundColor:form.frete_tipo==="correios"?t.bgSecundario:t.bgCard}}>
                          <div>
                            <p style={{fontSize:"13px",fontWeight:"600",color:t.text,margin:0,display:"flex",alignItems:"center",gap:"8px"}}><IconBadge Icone={MailIcon} cor={t.text} size={12} box={22} /> Correios (PAC ou SEDEX)</p>
                            <p style={{fontSize:"11px",color:t.textSecundario,margin:"3px 0 0"}}>Para qualquer cidade do Brasil</p>
                            <div style={{display:"flex",gap:"14px",marginTop:"5px"}}>
                              <span style={{fontSize:"11px",color:t.textSecundario}}>PAC: <strong style={{color:t.text}}>{corP.pac}</strong></span>
                              <span style={{fontSize:"11px",color:t.textSecundario}}>SEDEX: <strong style={{color:t.text}}>{corP.sedex}</strong></span>
                            </div>
                            <p style={{fontSize:"10px",color:t.textSecundario,marginTop:"3px"}}>Prazo: {corP.prazo} · Valor confirmado pela loja</p>
                          </div>
                          {form.frete_tipo==="correios" && <p style={{fontSize:"11px",color:t.text,marginTop:"6px",fontWeight:"600",display:"flex",alignItems:"center",gap:"4px"}}><CheckIcon size={12} strokeWidth={2.2} /> Selecionado</p>}
                        </button>

                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            <div style={{backgroundColor:t.bgSecundario,border:"1px solid "+t.border,borderRadius:"12px",padding:"14px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
              <span style={{color:t.textSecundario, marginTop:"1px", flexShrink:0}}><InfoIcon size={16} strokeWidth={1.7} /></span>
              <p style={{fontSize:"13px",color:t.textSecundario,lineHeight:1.7,fontFamily:"system-ui",margin:0}}>
                Ao confirmar o pedido, nossa equipe entrará em contato pelo WhatsApp para confirmar detalhes, prazo e orçamento.
                {form.fotos.length>0&&" As imagens de referência enviadas serão salvas junto ao pedido."}
              </p>
            </div>

            {!finalizacaoValida&&(
              <div style={{backgroundColor:"#fef9f0",border:"1px solid #fde68a",borderRadius:"12px",padding:"14px"}}>
                <p style={{fontSize:"12px",fontWeight:"600",color:"#92400e",marginBottom:"8px",fontFamily:"system-ui",display:"flex",alignItems:"center",gap:"6px"}}><WarningIcon size={14} strokeWidth={1.8} /> Preencha os campos obrigatórios para finalizar:</p>
                <ul style={{fontSize:"12px",color:"#92400e",fontFamily:"system-ui",lineHeight:1.8,paddingLeft:"16px",margin:0}}>
                  {!form.nomeCliente.trim()&&<li>Nome completo</li>}
                  {validarTel(form.telefone)&&<li>Telefone válido</li>}
                  {(!form.email.trim()||!emailValido(form.email))&&<li>E-mail válido</li>}
                  {(!form.cep||form.cep.replace(/\D/g,"").length<8)&&<li>CEP completo</li>}
                  {!form.cidade.trim()&&<li>Cidade</li>}
                  {!form.estado.trim()&&<li>Estado</li>}
                  {!(form.rua||"").trim()&&<li>Rua / Avenida</li>}
                  {!(form.numero||"").trim()&&<li>Número</li>}
                  {!(form.bairro||"").trim()&&<li>Bairro</li>}
                </ul>
              </div>
            )}

            {erro&&<div style={{backgroundColor:"#fef2f2",border:"1px solid #fecaca",borderRadius:"12px",padding:"12px",color:"#dc2626",fontSize:"13px",fontFamily:"system-ui",display:"flex",alignItems:"center",gap:"6px"}}><WarningIcon size={14} strokeWidth={1.8} /> {erro}</div>}

            <div style={{display:"flex",gap:"12px"}}>
              <button onClick={()=>setEtapa(1)} className="transition-all duration-300 hover:shadow-md"
                style={{flex:1,padding:"14px",borderRadius:"10px",border:"1px solid "+t.border,color:t.text,backgroundColor:t.bg,cursor:"pointer",fontFamily:"system-ui",fontWeight:"600"}}>← Voltar</button>
            </div>
            <button onClick={salvarNoBanco} disabled={salvando||!finalizacaoValida}
              className="transition-all duration-300 hover:enabled:shadow-lg hover:enabled:-translate-y-0.5"
              style={{ cursor: "pointer",...btnP(!salvando&&finalizacaoValida),width:"100%",padding:"18px",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
              {salvando ? "Salvando..." : <><CheckIcon size={17} strokeWidth={2.2} /> Confirmar Pedido</>}
            </button>
          </div>
        )}
      </div>

      {/* ══ MODAL TAMANHOS ══ */}
      {modalTamanhos && getComb(modalTamanhos) && (()=>{
        const comb = getComb(modalTamanhos);
        const isCalca = comb.tipoId==="calcas";
        const tipo = TIPOS_ROUPA.find(t=>t.id===comb.tipoId);
        const cor = CORES_OPCOES.find(c=>c.id===comb.cor);
        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{backgroundColor:"rgba(0,0,0,0.5)"}} onClick={e=>{if(e.target===e.currentTarget)setModalTamanhos(null);}}>
            <div style={{backgroundColor:t.bgCard,width:"100%",maxWidth:"500px",maxHeight:"85vh",overflowY:"auto",borderRadius:"20px 20px 0 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 20px 16px",borderBottom:"1px solid "+t.border}}>
                <div>
                  <h3 style={{fontSize:"16px",fontWeight:"600",color:t.text,fontFamily:"Georgia, serif"}}>{tipo?.label} {cor?"— "+cor.label:""}</h3>
                  <p style={{fontSize:"12px",color:t.textSecundario,fontFamily:"system-ui",marginTop:"2px"}}>Total: {totalComb(comb)} unidades</p>
                </div>
                <button onClick={()=>setModalTamanhos(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.text,display:"flex"}}><CloseIcon size={20} strokeWidth={1.8} /></button>
              </div>
              <div style={{padding:"16px 20px"}}>
                {isCalca ? (
                  <>
                    <p style={{fontSize:"12px",color:t.textSecundario,fontFamily:"system-ui",marginBottom:"12px"}}>Informe a quantidade por tamanho:</p>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px"}}>
                      {TAMANHOS_CALCAS.map(tam=>{
                        const qtd=comb.quantidades.calcas?.[tam]||0;
                        return (
                          <div key={tam} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:"10px",border:"1px solid "+t.border,backgroundColor:qtd>0?t.bgSecundario:t.bgCard}}>
                            <span style={{fontSize:"14px",fontWeight:"700",color:t.text,fontFamily:"system-ui"}}>{tam}</span>
                            <div className="rounded-lg overflow-hidden" style={{display:"flex",alignItems:"center",border:"1px solid "+t.border}}>
                              <button onClick={()=>setQtdComb(comb.id,"calcas",tam,Math.max(0,qtd-1))} style={{width:"28px",height:"28px",border:"none",backgroundColor:t.bg,color:t.text,cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                              <input type="number" min="0" value={qtd===0?"":qtd}
                                onChange={e=>{const v=parseInt(e.target.value)||0;setQtdComb(comb.id,"calcas",tam,Math.max(0,v));}}
                                onFocus={e=>e.target.select()}
                                style={{width:"44px",textAlign:"center",fontSize:"14px",fontWeight:"600",color:t.text,fontFamily:"system-ui",border:"none",borderLeft:"1px solid "+t.border,borderRight:"1px solid "+t.border,padding:"4px 0",backgroundColor:t.bg,outline:"none"}}
                                placeholder="0"
                              />
                              <button onClick={()=>setQtdComb(comb.id,"calcas",tam,qtd+1)} style={{width:"28px",height:"28px",border:"none",backgroundColor:t.bg,color:t.text,cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  GRUPOS_TAMANHO.map(grupo=>(
                    <div key={grupo.id} style={{marginBottom:"20px"}}>
                      <p style={{fontSize:"12px",fontWeight:"700",color:t.text,fontFamily:"system-ui",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"10px",paddingBottom:"6px",borderBottom:"1px solid "+t.border}}>{grupo.label}</p>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px"}}>
                        {grupo.tamanhos.map(tam=>{
                          const qtd=comb.quantidades[grupo.id]?.[tam]||0;
                          return (
                            <div key={tam} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:"10px",border:"1px solid "+t.border,backgroundColor:qtd>0?t.bgSecundario:t.bgCard}}>
                              <span style={{fontSize:"13px",fontWeight:"700",color:t.text,fontFamily:"system-ui"}}>{tam}</span>
                              <div className="rounded-lg overflow-hidden" style={{display:"flex",alignItems:"center",border:"1px solid "+t.border}}>
                                <button onClick={()=>setQtdComb(comb.id,grupo.id,tam,Math.max(0,qtd-1))} style={{width:"26px",height:"26px",border:"none",backgroundColor:t.bg,color:t.text,cursor:"pointer",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                                <input type="number" min="0" value={qtd===0?"":qtd}
                                  onChange={e=>{const v=parseInt(e.target.value)||0;setQtdComb(comb.id,grupo.id,tam,Math.max(0,v));}}
                                  onFocus={e=>e.target.select()}
                                  style={{width:"40px",textAlign:"center",fontSize:"13px",fontWeight:"600",color:t.text,fontFamily:"system-ui",border:"none",borderLeft:"1px solid "+t.border,borderRight:"1px solid "+t.border,padding:"3px 0",backgroundColor:t.bg,outline:"none"}}
                                  placeholder="0"
                                />
                                <button onClick={()=>setQtdComb(comb.id,grupo.id,tam,qtd+1)} style={{width:"26px",height:"26px",border:"none",backgroundColor:t.bg,color:t.text,cursor:"pointer",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{padding:"12px 16px 20px",borderTop:"1px solid "+t.border}}>
                <button onClick={()=>setModalTamanhos(null)} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{width:"100%",padding:"14px",borderRadius:"10px",backgroundColor:t.btnPrimarioBg,color:t.btnPrimarioText,border:"none",cursor:"pointer",fontWeight:"700",fontFamily:"system-ui",fontSize:"14px"}}>Confirmar tamanhos</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ MODAL CORES ══ */}
      {modalCores && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{backgroundColor:"rgba(0,0,0,0.5)"}} onClick={e=>{if(e.target===e.currentTarget)setModalCores(null);}}>
          <div style={{backgroundColor:t.bgCard,width:"100%",maxWidth:"480px",maxHeight:"80vh",overflowY:"auto",borderRadius:"20px 20px 0 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 20px 16px",borderBottom:"1px solid "+t.border}}>
              <h3 style={{fontSize:"16px",fontWeight:"600",color:t.text,fontFamily:"Georgia, serif",display:"flex",alignItems:"center",gap:"10px"}}><IconBadge Icone={PaletteIcon} cor={t.text} size={15} box={28} /> Selecionar cor</h3>
              <button onClick={()=>setModalCores(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.text,display:"flex"}}><CloseIcon size={20} strokeWidth={1.8} /></button>
            </div>
            <div style={{padding:"16px",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px"}}>
              {CORES_OPCOES.map(cor=>{
                const sel = getComb(modalCores)?.cor===cor.id;
                return (
                  <button key={cor.id} onClick={()=>{updateComb(modalCores,"cor",cor.id);setModalCores(null);}}
                    className="transition-all duration-300 hover:shadow-sm"
                    style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 14px",borderRadius:"10px",cursor:"pointer",textAlign:"left",fontFamily:"system-ui",fontSize:"13px",border:"2px solid "+(sel?t.text:t.border),backgroundColor:sel?t.bgSecundario:t.bgCard,color:t.text}}>
                    <span style={{width:"20px",height:"20px",borderRadius:"50%",flexShrink:0,display:"inline-block",backgroundColor:cor.hex||"transparent",border:cor.hex?"1px solid "+t.border:"2px dashed "+t.border}}/>
                    <span style={{fontWeight:sel?"600":"400"}}>{cor.label}</span>
                    {sel&&<span style={{marginLeft:"auto",color:"#16a34a",display:"flex"}}><CheckIcon size={15} strokeWidth={2.2} /></span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL MATERIAL ══ */}
      {modalMaterial && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{backgroundColor:"rgba(0,0,0,0.5)"}} onClick={e=>{if(e.target===e.currentTarget)setModalMaterial(null);}}>
          <div style={{backgroundColor:t.bgCard,width:"100%",maxWidth:"480px",maxHeight:"80vh",overflowY:"auto",borderRadius:"20px 20px 0 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 20px 16px",borderBottom:"1px solid "+t.border}}>
              <h3 style={{fontSize:"16px",fontWeight:"600",color:t.text,fontFamily:"Georgia, serif",display:"flex",alignItems:"center",gap:"10px"}}><IconBadge Icone={ThreadIcon} cor={t.text} size={15} box={28} /> Selecionar material</h3>
              <button onClick={()=>setModalMaterial(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.text,display:"flex"}}><CloseIcon size={20} strokeWidth={1.8} /></button>
            </div>
            <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:"8px"}}>
              {MATERIAIS_OPCOES.map(mat=>{
                const sel=getComb(modalMaterial)?.material===mat.id;
                return (
                  <button key={mat.id} onClick={()=>{updateComb(modalMaterial,"material",mat.id);setModalMaterial(null);}}
                    className="transition-all duration-300 hover:shadow-sm"
                    style={{display:"flex",flexDirection:"column",alignItems:"flex-start",padding:"14px 16px",borderRadius:"10px",cursor:"pointer",textAlign:"left",fontFamily:"system-ui",border:"2px solid "+(sel?t.text:t.border),backgroundColor:sel?t.bgSecundario:t.bgCard}}>
                    <span style={{fontSize:"13px",fontWeight:"600",color:t.text,display:"flex",alignItems:"center",gap:"6px"}}>{mat.label} {sel && <CheckIcon size={13} strokeWidth={2.2} style={{color:"#16a34a"}} />}</span>
                    <span style={{fontSize:"11px",color:t.textSecundario,marginTop:"2px"}}>{mat.descricao}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL TABELA DE MEDIDAS ══ */}
      {tabelaAberta && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setTabelaAberta(false); }}>
          <div style={{ backgroundColor: t.bgCard, width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", borderRadius: "20px 20px 0 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid " + t.border }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: t.text, fontFamily: "Georgia, serif", display:"flex", alignItems:"center", gap:"10px" }}><IconBadge Icone={RulerIcon} cor={t.text} size={15} box={28} /> Tabela de Medidas</h3>
              <button onClick={() => setTabelaAberta(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.text, display:"flex" }}><CloseIcon size={20} strokeWidth={1.8} /></button>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "12px", color: t.textSecundario, fontFamily: "system-ui", marginBottom: "16px" }}>Medidas em centímetros (cm) da peça plana.</p>

              {/* Tradicional */}
              <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: t.text, fontFamily: "system-ui", marginBottom: "8px" }}>Tradicional</p>
              <div style={{ overflowX: "auto", marginBottom: "20px", border: "1px solid " + t.border, borderRadius: "10px" }}>
                <table style={{ minWidth: "380px", width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: t.bgSecundario }}>
                      {["TAM","Comprimento","Manga","Largura"].map(h => (
                        <th key={h} style={{ padding: "8px", textAlign: "center", fontWeight: "700", color: t.text, borderRight: "1px solid " + t.border, fontFamily: "system-ui" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["PP","64 cm","19 cm","44 cm"],
                      ["P", "68 cm","21 cm","50 cm"],
                      ["M", "71 cm","22 cm","52 cm"],
                      ["G", "73 cm","23 cm","55 cm"],
                      ["G1","81 cm","28 cm","67 cm"],
                      ["G2","84 cm","29 cm","70 cm"],
                      ["G3","87 cm","30 cm","73 cm"],
                      ["GG","75 cm","24.5 cm","58 cm"],
                      ["EXG","77 cm","26 cm","61 cm"],
                      ["EXGG","79 cm","27 cm","64 cm"],
                    ].map(([tam,...vals], i) => (
                      <tr key={tam} style={{ backgroundColor: i%2===0?t.bgCard:t.bgSecundario }}>
                        <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: "700", color: t.text, borderRight: "1px solid " + t.border, fontFamily: "system-ui" }}>{tam}</td>
                        {vals.map((v,j) => <td key={j} style={{ padding: "7px 8px", textAlign: "center", color: t.textSecundario, borderRight: j<2?"1px solid "+t.border:"none", fontFamily: "system-ui" }}>{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Baby Look */}
              <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: t.text, fontFamily: "system-ui", marginBottom: "8px" }}>Baby Look</p>
              <div style={{ overflowX: "auto", marginBottom: "20px", border: "1px solid " + t.border, borderRadius: "10px" }}>
                <table style={{ minWidth: "280px", width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: t.bgSecundario }}>
                      {["TAM","Larg. Peito","Altura"].map(h => (
                        <th key={h} style={{ padding: "8px", textAlign: "center", fontWeight: "700", color: t.text, borderRight: "1px solid " + t.border, fontFamily: "system-ui" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["PP","45 cm","61 cm"],
                      ["P", "47 cm","62 cm"],
                      ["M", "49 cm","64 cm"],
                      ["G", "51 cm","66 cm"],
                      ["GG","53.5 cm","67 cm"],
                      ["EXG","55.5 cm","69 cm"],
                    ].map(([tam,...vals], i) => (
                      <tr key={tam} style={{ backgroundColor: i%2===0?t.bgCard:t.bgSecundario }}>
                        <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: "700", color: t.text, borderRight: "1px solid " + t.border, fontFamily: "system-ui" }}>{tam}</td>
                        {vals.map((v,j) => <td key={j} style={{ padding: "7px 8px", textAlign: "center", color: t.textSecundario, borderRight: j<1?"1px solid "+t.border:"none", fontFamily: "system-ui" }}>{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: "11px", color: t.textSecundario, fontFamily: "system-ui", marginTop: "8px" }}>
                As medidas podem variar ±2 cm dependendo do processo de fabricação.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}