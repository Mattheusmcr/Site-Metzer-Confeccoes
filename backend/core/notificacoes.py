# backend/core/notificacoes.py
# Uses Brevo (formerly Sendinblue) HTTP API instead of SMTP
# SMTP is blocked on Railway free tier - HTTP API works fine
# Add BREVO_API_KEY to Railway environment variables
# Get free key at: https://app.brevo.com -> Settings -> API Keys (300 emails/day free)

import threading
import logging
import json
from django.conf import settings

logger = logging.getLogger(__name__)

OWNER_EMAIL = getattr(settings, 'OWNER_EMAIL', 'andremetzkrr@gmail.com')
BREVO_API_KEY = getattr(settings, 'BREVO_API_KEY', '')
FROM_EMAIL = getattr(settings, 'EMAIL_HOST_USER', 'andremetzkrr@gmail.com')
FROM_NAME = "Metzker Soluções"


def _enviar_brevo(destinatario_email, destinatario_nome, assunto, html_body):
    """Send email via Brevo HTTP API (works on Railway, no SMTP port needed)."""
    if not BREVO_API_KEY:
        # Fallback to Django SMTP if no Brevo key
        try:
            from django.core.mail import send_mail
            send_mail(
                subject=assunto,
                message="",
                html_message=html_body,
                from_email=FROM_EMAIL,
                recipient_list=[destinatario_email],
                fail_silently=False,
            )
            logger.info(f"✅ Email enviado via SMTP para {destinatario_email}")
        except Exception as e:
            logger.error(f"❌ Erro SMTP para {destinatario_email}: {e}")
        return

    try:
        import urllib.request
        payload = json.dumps({
            "sender": {"name": FROM_NAME, "email": FROM_EMAIL},
            "to": [{"email": destinatario_email, "name": destinatario_nome}],
            "subject": assunto,
            "htmlContent": html_body,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.brevo.com/v3/smtp/email",
            data=payload,
            headers={
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                logger.info(f"✅ Email Brevo enviado para {destinatario_email}")
            else:
                logger.error(f"❌ Brevo status {resp.status} para {destinatario_email}")
    except Exception as e:
        logger.error(f"❌ Erro Brevo para {destinatario_email}: {e}")


def _send_async(func, *args, **kwargs):
    """Execute email function in background thread."""
    t = threading.Thread(target=func, args=args, kwargs=kwargs, daemon=True)
    t.start()


def _html_base(titulo, corpo_html):
    return f"""<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<style>
  body{{font-family:system-ui,sans-serif;background:#f9fafb;margin:0;padding:20px}}
  .card{{background:white;max-width:560px;margin:0 auto;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}}
  .header{{background:#1a1a1a;color:white;padding:24px;text-align:center}}
  .logo{{font-size:24px;font-weight:300;letter-spacing:2px}}
  .logo span{{color:#c41e3a;font-weight:700}}
  .body{{padding:28px}}
  h2{{color:#1a1a1a;font-size:18px;margin:0 0 16px}}
  .row{{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px}}
  .label{{color:#6b7280;font-weight:500}}
  .value{{color:#1a1a1a;font-weight:600;text-align:right}}
  .footer{{background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#9ca3af}}
</style></head><body>
<div class="card">
  <div class="header"><div class="logo"><span>m</span>etzker soluções</div></div>
  <div class="body">
    <h2>{titulo}</h2>
    {corpo_html}
  </div>
  <div class="footer">Vila Velha, ES · (27) 99787-8391 · andremetzkrr@gmail.com</div>
</div></body></html>"""


def notificar_pedido_catalogo(dados, protocolo=None):
    """Notify owner and client about a new catalog order."""

    itens_html = "".join([
        f'<div class="row"><span class="label">{i.get("produto_nome","Produto")} ({i.get("tamanho","")})</span><span class="value">x{i.get("quantidade",1)}</span></div>'
        for i in dados.get("itens_resumo", [])
    ])

    frete_tipo = dados.get("frete_tipo", "retirada")
    frete_label = (
        "🏪 Retirada no local (Grátis)" if frete_tipo == "retirada"
        else f"🛵 Motoboy - estimativa R$ {dados.get('frete_valor',0)}" if frete_tipo == "motoboy"
        else "📬 Correios - valor a confirmar"
    )

    prot_html = f'<div style="background:#f0fdf4;border:1px solid #86efac;padding:12px;border-radius:6px;font-family:monospace;font-size:16px;font-weight:700;margin-bottom:16px">🔖 {protocolo}</div>' if protocolo else ""

    corpo_dono = f"""{prot_html}
    <div class="row"><span class="label">👤 Cliente</span><span class="value">{dados.get('nome_cliente','-')}</span></div>
    <div class="row"><span class="label">📱 Telefone</span><span class="value">{dados.get('telefone','-')}</span></div>
    <div class="row"><span class="label">✉️ Email</span><span class="value">{dados.get('email','-')}</span></div>
    <div class="row"><span class="label">📍 Endereço</span><span class="value">{dados.get('rua','-')}, {dados.get('numero','s/n')} - {dados.get('cidade','-')}/{dados.get('estado','-')}</span></div>
    <div class="row"><span class="label">💳 Pagamento</span><span class="value">{dados.get('forma_pagamento','-')}</span></div>
    <div class="row"><span class="label">🚚 Entrega</span><span class="value">{frete_label}</span></div>
    <div style="margin-top:16px"><b>Itens:</b>{itens_html}</div>"""

    corpo_cliente = f"""{prot_html}
    <p style="font-size:14px;color:#374151;margin-bottom:16px">Olá, <strong>{dados.get('nome_cliente','')}</strong>! Recebemos seu pedido. Nossa equipe entrará em contato em breve pelo WhatsApp para confirmar.</p>
    <div class="row"><span class="label">💳 Pagamento</span><span class="value">{dados.get('forma_pagamento','-')}</span></div>
    <div class="row"><span class="label">🚚 Entrega</span><span class="value">{frete_label}</span></div>
    <div style="margin-top:16px"><b>Itens:</b>{itens_html}</div>"""

    def _send():
        _enviar_brevo(OWNER_EMAIL, "Metzker Soluções", f"🛍️ Novo pedido catálogo - {protocolo or dados.get('nome_cliente','')}", _html_base("Novo pedido recebido!", corpo_dono))
        email_cliente = dados.get("email", "")
        if email_cliente:
            _enviar_brevo(email_cliente, dados.get("nome_cliente", "Cliente"), f"✅ Pedido confirmado - Metzker Soluções", _html_base("Pedido confirmado!", corpo_cliente))

    _send_async(_send)


def notificar_pedido_personalizado(dados, protocolo=None):
    """Notify about a new custom order."""

    prot_html = f'<div style="background:#fef9f0;border:1px solid #fde68a;padding:12px;border-radius:6px;font-family:monospace;font-size:16px;font-weight:700;margin-bottom:16px">🔖 {protocolo}</div>' if protocolo else ""

    frete_tipo = dados.get("frete_tipo", "")
    frete_label = (
        "🏪 Retirada no local (Grátis)" if frete_tipo == "retirada"
        else f"🛵 Motoboy - apenas Grande Vitória/ES" if frete_tipo == "motoboy"
        else "📬 Correios - valor a confirmar" if frete_tipo == "correios"
        else "A definir"
    )

    corpo_dono = f"""{prot_html}
    <div class="row"><span class="label">🏢 Empresa</span><span class="value">{dados.get('nome_cliente','-')}</span></div>
    <div class="row"><span class="label">📱 Telefone</span><span class="value">{dados.get('telefone','-')}</span></div>
    <div class="row"><span class="label">✉️ Email</span><span class="value">{dados.get('email','-')}</span></div>
    <div class="row"><span class="label">🛍️ Produto</span><span class="value">{dados.get('ramo','-')}</span></div>
    <div class="row"><span class="label">📦 Quantidade</span><span class="value">{dados.get('quantidade','-')} unidades</span></div>
    <div class="row"><span class="label">🚚 Entrega</span><span class="value">{frete_label}</span></div>
    <div class="row"><span class="label">📝 Obs</span><span class="value">{str(dados.get('observacoes','-'))[:200]}</span></div>"""

    corpo_cliente = f"""{prot_html}
    <p style="font-size:14px;color:#374151;margin-bottom:16px">Olá, <strong>{dados.get('nome_cliente','')}</strong>! Recebemos seu pedido personalizado. Nossa equipe entrará em contato pelo WhatsApp para confirmar detalhes, prazo e valor.</p>
    <div class="row"><span class="label">🛍️ Produto</span><span class="value">{dados.get('ramo','-')}</span></div>
    <div class="row"><span class="label">📦 Quantidade</span><span class="value">{dados.get('quantidade','-')} unidades</span></div>
    <div class="row"><span class="label">🚚 Entrega</span><span class="value">{frete_label}</span></div>"""

    def _send():
        _enviar_brevo(OWNER_EMAIL, "Metzker Soluções", f"🎨 Novo pedido personalizado - {protocolo or dados.get('nome_cliente','')}", _html_base("Novo pedido personalizado!", corpo_dono))
        email_cliente = dados.get("email", "")
        if email_cliente:
            _enviar_brevo(email_cliente, dados.get("nome_cliente", "Cliente"), "✅ Pedido personalizado registrado - Metzker Soluções", _html_base("Pedido personalizado registrado!", corpo_cliente))

    _send_async(_send)


def notificar_pagamento_aprovado(nome, email, protocolo):
    """Notify when Mercado Pago payment is approved."""
    corpo = f"""
    <p style="font-size:14px;color:#374151;margin-bottom:16px">🎉 <strong>{nome}</strong>, seu pagamento foi aprovado!</p>
    <div style="background:#f0fdf4;border:1px solid #86efac;padding:12px;border-radius:6px;font-family:monospace;font-size:16px;font-weight:700;margin-bottom:16px">🔖 {protocolo}</div>
    <p style="font-size:14px;color:#374151">Nossa equipe já está preparando seu pedido. Em breve entraremos em contato pelo WhatsApp.</p>"""

    def _send():
        _enviar_brevo(OWNER_EMAIL, "Metzker Soluções", f"💳 Pagamento aprovado - {protocolo}", _html_base("Pagamento aprovado!", corpo))
        if email:
            _enviar_brevo(email, nome, "💳 Pagamento aprovado - Metzker Soluções", _html_base("Pagamento aprovado!", corpo))

    _send_async(_send)