# backend/core/notificacoes.py
import threading
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

OWNER_EMAIL = getattr(settings, 'OWNER_EMAIL', 'andremetzkrr@gmail.com')


def _send_async(func, *args, **kwargs):
    """Executa em thread separada para não bloquear a resposta."""
    t = threading.Thread(target=func, args=args, kwargs=kwargs)
    t.daemon = True
    t.start()


def _verificar_email_config():
    """Verifica se o email está configurado."""
    host_user = getattr(settings, 'EMAIL_HOST_USER', '')
    host_pass = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
    if not host_user or not host_pass:
        logger.warning("⚠️  EMAIL não configurado (EMAIL_HOST_USER ou EMAIL_HOST_PASSWORD vazio)")
        return False
    return True


# ── EMAIL PARA O DONO ─────────────────────────────────────────────────────────

def _email_dono_catalogo(pedido):
    if not _verificar_email_config():
        return
    try:
        itens = "\n".join([
            f"  • {i.get('produto_nome', '?')} | Tam: {i.get('tamanho')} | x{i.get('quantidade')}"
            for i in pedido.get("itens_resumo", [])
        ])
        msg = f"""Novo pedido recebido no site Metzker!

👤 Cliente: {pedido.get('nome_cliente')}
📱 Telefone: {pedido.get('telefone')}
📧 Email: {pedido.get('email')}
📍 {pedido.get('rua')}, {pedido.get('numero')} — {pedido.get('bairro')}, {pedido.get('cidade')}/{pedido.get('estado')}
💳 Pagamento: {pedido.get('forma_pagamento')}

🛍️ Itens:
{itens}

Acesse o painel admin para ver os detalhes:
https://www.metzkersolucoes.com.br/admin-login"""

        send_mail(
            subject="🛍️ Novo Pedido — Metzker Soluções",
            message=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[OWNER_EMAIL],
            fail_silently=False,
        )
        logger.info(f"✅ Email enviado ao dono: novo pedido de {pedido.get('nome_cliente')}")
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email ao dono (catálogo): {e}")


def _email_dono_personalizado(pedido):
    if not _verificar_email_config():
        return
    try:
        ref = pedido.get('referencia', '—')
        msg = f"""Novo pedido personalizado recebido!

👤 Cliente: {pedido.get('nome_cliente')}
📱 Telefone: {pedido.get('telefone')}
📧 Email: {pedido.get('email')}
📦 Produto: {pedido.get('ramo')}
📊 Quantidade: {pedido.get('quantidade')} unidades

📝 Combinações:
{ref}

Obs: {pedido.get('observacoes', '—')}

Acesse o painel admin para ver e atualizar o status:
https://www.metzkersolucoes.com.br/admin-login"""

        send_mail(
            subject="🎨 Novo Pedido Personalizado — Metzker Soluções",
            message=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[OWNER_EMAIL],
            fail_silently=False,
        )
        logger.info(f"✅ Email enviado ao dono: pedido personalizado de {pedido.get('nome_cliente')}")
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email ao dono (personalizado): {e}")


# ── EMAIL PARA O CLIENTE ───────────────────────────────────────────────────────

def _email_cliente(nome, email_cliente, assunto, mensagem):
    if not email_cliente or not _verificar_email_config():
        return
    try:
        send_mail(
            subject=assunto,
            message=mensagem,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email_cliente],
            fail_silently=False,
        )
        logger.info(f"✅ Email enviado ao cliente: {email_cliente}")
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email ao cliente {email_cliente}: {e}")


def _email_cliente_catalogo(nome, email_cliente, protocolo=""):
    msg = f"""Olá, {nome}!

Seu pedido foi recebido com sucesso pela Metzker Soluções.

{f"🔖 Protocolo: {protocolo}" if protocolo else ""}

Nossa equipe entrará em contato pelo WhatsApp para confirmar os detalhes e a entrega.

📱 WhatsApp: (27) 99787-8391
📧 Email: andremetzkrr@gmail.com

Obrigado pela confiança!
Equipe Metzker Soluções
www.metzkersolucoes.com.br"""

    _email_cliente(nome, email_cliente, "✅ Pedido recebido — Metzker Soluções", msg)


def _email_cliente_personalizado(nome, email_cliente, ramo="", protocolo=""):
    msg = f"""Olá, {nome}!

Seu pedido personalizado foi recebido com sucesso!

{f"🔖 Protocolo: {protocolo}" if protocolo else ""}
📦 Produto: {ramo}

Nossa equipe irá analisar seu pedido e entrar em contato pelo WhatsApp para confirmar detalhes, prazo e orçamento.

📱 WhatsApp: (27) 99787-8391
📧 Email: andremetzkrr@gmail.com

Obrigado pela confiança!
Equipe Metzker Soluções
www.metzkersolucoes.com.br"""

    _email_cliente(nome, email_cliente, "✅ Pedido Personalizado recebido — Metzker Soluções", msg)


def _email_pagamento_aprovado(nome, email_cliente, protocolo=""):
    if not email_cliente:
        return
    msg = f"""Olá, {nome}!

Seu pagamento foi aprovado! 🎉

{f"🔖 Protocolo: {protocolo}" if protocolo else ""}

Nossa equipe já recebeu a confirmação e irá entrar em contato para confirmar os detalhes da entrega.

📱 WhatsApp: (27) 99787-8391

Obrigado pela compra!
Equipe Metzker Soluções"""

    _email_cliente(nome, email_cliente, "💳 Pagamento aprovado — Metzker Soluções", msg)


# ── FUNÇÕES PÚBLICAS ───────────────────────────────────────────────────────────

def notificar_pedido_catalogo(pedido_dict, protocolo=""):
    _send_async(_email_dono_catalogo, pedido_dict)
    nome = pedido_dict.get("nome_cliente", "")
    email = pedido_dict.get("email", "")
    _send_async(_email_cliente_catalogo, nome, email, protocolo)


def notificar_pedido_personalizado(pedido_dict, protocolo=""):
    _send_async(_email_dono_personalizado, pedido_dict)
    nome = pedido_dict.get("nome_cliente", "")
    email = pedido_dict.get("email", "")
    ramo = pedido_dict.get("ramo", "")
    _send_async(_email_cliente_personalizado, nome, email, ramo, protocolo)


def notificar_pagamento_aprovado(nome, email, protocolo=""):
    """Chamado pelo webhook do Mercado Pago após pagamento aprovado."""
    _send_async(_email_dono_catalogo, {
        "nome_cliente": nome,
        "email": email,
        "telefone": "",
        "rua": "", "numero": "", "bairro": "", "cidade": "", "estado": "",
        "forma_pagamento": "Mercado Pago (aprovado)",
        "itens_resumo": [],
    })
    _send_async(_email_pagamento_aprovado, nome, email, protocolo)