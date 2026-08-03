// Estilo e helpers compartilhados pelos comprovantes em PDF (Pedidos, Personalizado, Admin)
// gerados via window.open + print, mantendo a mesma identidade visual do site redesenhado.

export function estiloComprovante() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;1,400;1,500&family=Manrope:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Manrope', system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 24px; color: #161513; }
    .cabecalho { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .cabecalho img { height: 42px; border-radius: 8px; object-fit: contain; }
    .cabecalho .nome { font-family: 'Newsreader', serif; font-style: italic; font-weight: 500; font-size: 22px; }
    .subtitulo { color: #8A877F; font-size: 12px; margin: 6px 0 24px; }
    h2 { font-family: 'Newsreader', serif; font-style: italic; font-weight: 500; font-size: 22px; margin: 24px 0 4px; color: #161513; }
    h3.secao { font-size: 13px; font-weight: 700; margin: 22px 0 10px; color: #161513; }
    .protocolo { font-family: 'Courier New', monospace; font-size: 17px; font-weight: 700; padding: 12px 18px;
      background: #FEF9F0; border: 1px solid #FDE68A; border-radius: 14px; display: inline-block;
      margin: 12px 0 20px; letter-spacing: 0.05em; color: #92400E; }
    .badge { display: inline-block; padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .badge-novo { background: #EFF6FF; color: #2563EB; }
    .badge-andamento { background: #FEF9F0; color: #D97706; }
    .badge-concluido { background: #F0FDF4; color: #16A34A; }
    .badge-cancelado { background: #FEF2F2; color: #DC2626; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 18px 0; }
    .bloco { padding: 14px; background: #FAFAF8; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; }
    .bloco h3 { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: #8A877F; margin: 0 0 6px; font-weight: 700; }
    .bloco p { font-size: 13px; margin: 2px 0; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    th { background: #F4F2EE; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #161513; }
    td { font-size: 13px; padding: 9px 8px; border-bottom: 1px solid rgba(0,0,0,0.06); }
    .total { font-family: 'Newsreader', serif; font-style: italic; font-size: 20px; font-weight: 500;
      text-align: right; padding: 14px 0; border-top: 2px solid #161513; }
    .caixa { margin-top: 12px; padding: 12px 14px; background: #FAFAF8; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; font-size: 13px; }
    .aviso { background: #FEF9F0; border: 1px solid #FDE68A; padding: 14px 16px; border-radius: 14px; font-size: 12px; color: #92400E; margin-top: 20px; }
    .rodape { margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.08); font-size: 11px; color: #8A877F; text-align: center; line-height: 1.7; }
    .btn-imprimir { display: inline-block; margin-top: 22px; padding: 12px 28px; background: #161513; color: white;
      border: none; border-radius: 999px; cursor: pointer; font-size: 14px; font-family: 'Manrope', sans-serif; font-weight: 700; }
    @media print { .no-print { display: none; } }
  `;
}

export function cabecalhoComprovante() {
  const logoUrl = window.location.origin + "/LogoEmpresaMetzker.jpg";
  return `
    <div class="cabecalho">
      <img src="${logoUrl}" alt="Metzker" onerror="this.style.display='none'" />
      <span class="nome">Metzker Soluções</span>
    </div>
    <p class="subtitulo">Vila Velha, ES &middot; (27) 99787-8391 &middot; andremetzkrr@gmail.com</p>
  `;
}

export function classeBadgeStatus(status) {
  if (status === "concluido") return "badge-concluido";
  if (status === "cancelado") return "badge-cancelado";
  if (status === "em_andamento") return "badge-andamento";
  return "badge-novo";
}

export function labelStatus(status) {
  if (status === "concluido") return "Concluído";
  if (status === "cancelado") return "Cancelado";
  if (status === "em_andamento") return "Em andamento";
  return "Novo";
}

// Abre uma nova aba com o HTML do comprovante e dispara a impressão (usuário escolhe "Salvar como PDF").
export function abrirComprovante(corpoHTML, titulo) {
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${titulo}</title>
    <style>${estiloComprovante()}</style></head><body>${corpoHTML}</body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 700);
}
