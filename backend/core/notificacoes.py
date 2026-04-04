# backend/core/notificacoes.py
# Sistema de notificações por email para pedidos
import threading
from django.core.mail import send_mail
from django.conf import settings

OWNER_EMAIL = "andremetzkrr@gmail.com"
OWNER_PHONE = "5527997878391"  # com DDI

def _send_async(func, *args, **kwargs):
    """Executa em thread separada para não bloquear a resposta"""
    t = threading.Thread(target=func, args=args, kwargs=kwargs)
    t.daemon = True
    t.start()

# ── EMAIL PARA O DONO ─────────────────────────────────────────────────────

def email_dono_pedido_catalogo(pedido):
    try:
        itens = "\n".join([
            f"  • {i.get('produto_nome', i.get('produto'))} | {i.get('tamanho')} | x{i.get('quantidade')}"
            for i in pedido.get("itens_resumo", [])
        ])
        msg = f"""
Novo pedido recebido no site!

👤 Cliente: {pedido.get('nome_cliente')}
📱 Telefone: {pedido.get('telefone')}
📍 Endereço: {pedido.get('rua')}, {pedido.get('numero')} - {pedido.get('bairro')}, {pedido.get('cidade')}/{pedido.get('estado')}
💳 Pagamento: {pedido.get('forma_pagamento')}

🛍️ Itens:
{itens}

Acesse o painel para ver os detalhes completos.
        """.strip()

        send_mail(
            subject="🛍️ Novo Pedido — Metzker Soluções",
            message=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[OWNER_EMAIL],
            fail_silently=True,
        )
        print(f"✅ Email enviado ao dono: novo pedido de {pedido.get('nome_cliente')}")
    except Exception as e:
        print(f"⚠️ Erro ao enviar email ao dono: {e}")


def email_dono_pedido_personalizado(pedido):
    try:
        msg = f"""
Novo pedido personalizado recebido!

👤 Cliente: {pedido.get('nome_cliente')}
📱 Telefone: {pedido.get('telefone')}
📧 Email: {pedido.get('email')}
📦 Produto: {pedido.get('ramo')}
📊 Quantidade: {pedido.get('quantidade')} unidades

📝 Detalhes:
{pedido.get('referencia', '—')}

Observações: {pedido.get('observacoes', '—')}

Acesse o painel admin para ver e atualizar o status.
        """.strip()

        send_mail(
            subject="🎨 Novo Pedido Personalizado — Metzker Soluções",
            message=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[OWNER_EMAIL],
            fail_silently=True,
        )
        print(f"✅ Email enviado ao dono: pedido personalizado de {pedido.get('nome_cliente')}")
    except Exception as e:
        print(f"⚠️ Erro ao enviar email ao dono: {e}")


# ── EMAIL PARA O CLIENTE ────────────────────────────────────────────────────

def email_cliente_confirmacao(nome, email_cliente, tipo="catalogo", detalhes=""):
    if not email_cliente:
        return
    try:
        if tipo == "catalogo":
            assunto = "✅ Pedido recebido — Metzker Soluções"
            msg = f"""Olá, {nome}!

Recebemos seu pedido com sucesso. Nossa equipe irá entrar em contato em breve pelo WhatsApp para confirmar os detalhes.

Qualquer dúvida, fale conosco:
📱 WhatsApp: (27) 99787-8391
📧 Email: andremetzkrr@gmail.com

Obrigado pela confiança!
Equipe Metzker Soluções"""
        else:
            assunto = "✅ Pedido Personalizado recebido — Metzker Soluções"
            msg = f"""Olá, {nome}!

Recebemos seu pedido personalizado com sucesso!

{detalhes}

Nossa equipe irá analisar seu pedido e entrar em contato em breve pelo WhatsApp para confirmar detalhes, prazo e orçamento.

Qualquer dúvida:
📱 WhatsApp: (27) 99787-8391
📧 Email: andremetzkrr@gmail.com

Obrigado pela confiança!
Equipe Metzker Soluções"""

        send_mail(
            subject=assunto,
            message=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email_cliente],
            fail_silently=True,
        )
        print(f"✅ Email de confirmação enviado para: {email_cliente}")
    except Exception as e:
        print(f"⚠️ Erro ao enviar email ao cliente: {e}")


# ── FUNÇÕES PÚBLICAS (chamadas nas views) ────────────────────────────────────

def notificar_pedido_catalogo(pedido_dict):
    _send_async(email_dono_pedido_catalogo, pedido_dict)
    nome = pedido_dict.get("nome_cliente", "")
    email = pedido_dict.get("email", "")
    _send_async(email_cliente_confirmacao, nome, email, "catalogo")


def notificar_pedido_personalizado(pedido_dict):
    _send_async(email_dono_pedido_personalizado, pedido_dict)
    nome = pedido_dict.get("nome_cliente", "")
    email = pedido_dict.get("email", "")
    ramo = pedido_dict.get("ramo", "")
    qtd = pedido_dict.get("quantidade", 0)
    detalhes = f"Produto: {ramo}\nQuantidade: {qtd} unidades"
    _send_async(email_cliente_confirmacao, nome, email, "personalizado", detalhes)