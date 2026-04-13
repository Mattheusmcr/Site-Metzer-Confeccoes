# backend/core/mercadopago_views.py
try:
    import mercadopago
    MP_DISPONIVEL = True
except ImportError:
    MP_DISPONIVEL = False
    mercadopago = None

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import json, logging

logger = logging.getLogger(__name__)

MP_ACCESS_TOKEN = getattr(settings, "MP_ACCESS_TOKEN", "")

def get_sdk():
    if not MP_DISPONIVEL:
        raise ImportError("Mercado Pago não instalado. Execute: pip install mercadopago")
    return mercadopago.SDK(MP_ACCESS_TOKEN)


@api_view(["POST"])
@permission_classes([AllowAny])
def criar_preferencia(request):
    """
    Recebe os itens do carrinho e dados do cliente,
    cria uma preferência no Mercado Pago e retorna o preference_id.
    """
    try:
        data = request.data
        itens = data.get("itens", [])
        cliente = data.get("cliente", {})
        
        if not itens:
            return Response({"erro": "Nenhum item informado."}, status=400)

        sdk = get_sdk()

        # Monta os items no formato MP
        mp_items = []
        for item in itens:
            mp_items.append({
                "id": str(item.get("produto_id", "")),
                "title": item.get("nome", "Produto Metzker"),
                "quantity": int(item.get("quantidade", 1)),
                "unit_price": round(float(item.get("preco", 0)), 2),
                "currency_id": "BRL",
                "description": f"Tamanho: {item.get('tamanho', '')}",
            })

        # URLs de retorno
        frontend_url = getattr(settings, "FRONTEND_URL", "https://www.metzkersolucoes.com.br")

        # Limpa telefone para enviar só números
        tel_raw = cliente.get("telefone", "").replace(" ","").replace("(","").replace(")","").replace("-","")
        tel_num = tel_raw[2:] if len(tel_raw) >= 10 else tel_raw  # Remove DDD se tiver
        area = tel_raw[:2] if len(tel_raw) >= 10 else "27"

        preference_data = {
            "items": mp_items,
            "payer": {
                "name": cliente.get("nome", "Cliente"),
                "email": cliente.get("email", ""),
                "phone": {
                    "area_code": area,
                    "number": tel_num,
                },
            },
            "back_urls": {
                "success": f"{frontend_url}/pedidos?status=aprovado",
                "failure": f"{frontend_url}/pedidos?status=falhou",
                "pending": f"{frontend_url}/pedidos?status=pendente",
            },
            "auto_return": "approved",
            "notification_url": f"{getattr(settings, 'BACKEND_URL', 'https://api.metzkersolucoes.com.br')}/api/mp-webhook/",
            "statement_descriptor": "METZKER",
            "binary_mode": False,
            "external_reference": json.dumps({
                "nome": cliente.get("nome"),
                "email": cliente.get("email"),
                "telefone": cliente.get("telefone"),
                "cep": cliente.get("cep"),
                "rua": cliente.get("rua"),
                "numero": cliente.get("numero"),
                "bairro": cliente.get("bairro"),
                "cidade": cliente.get("cidade"),
                "estado": cliente.get("estado"),
                "complemento": cliente.get("complemento", ""),
                "observacao": cliente.get("observacao", ""),
                "itens": itens,
            }, ensure_ascii=False),
            "payment_methods": {
                "installments": 12,
            },
        }

        result = sdk.preference().create(preference_data)
        preference = result["response"]

        if result["status"] not in [200, 201] or "id" not in result.get("response", {}):
            logger.error(f"Erro MP ao criar preferência: status={result['status']} response={preference}")
            return Response({"erro": f"Erro ao criar pagamento. Status: {result['status']}"}, status=500)

        return Response({
            "preference_id": preference["id"],
            "init_point": preference["init_point"],
            "sandbox_init_point": preference.get("sandbox_init_point", ""),
        })

    except Exception as e:
        logger.exception(f"Erro criar_preferencia: {e}")
        return Response({"erro": str(e)}, status=500)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def mp_webhook(request):
    """
    Recebe notificações do Mercado Pago sobre pagamentos.
    Quando aprovado, registra o pedido automaticamente.
    """
    try:
        topic = request.GET.get("topic") or request.data.get("type", "")
        payment_id = request.GET.get("id") or request.data.get("data", {}).get("id")

        if not payment_id or topic not in ("payment", "merchant_order"):
            return HttpResponse(status=200)

        sdk = get_sdk()
        payment_info = sdk.payment().get(payment_id)
        payment = payment_info["response"]

        status = payment.get("status")
        logger.info(f"Webhook MP: payment_id={payment_id} status={status}")

        if status == "approved":
            external_ref = payment.get("external_reference", "{}")
            try:
                dados = json.loads(external_ref)
            except Exception:
                dados = {}

            # Registrar o pedido automaticamente
            _criar_pedido_apos_pagamento(dados, payment_id, payment)

        return HttpResponse(status=200)

    except Exception as e:
        logger.exception(f"Erro webhook MP: {e}")
        return HttpResponse(status=200)  # Sempre 200 para o MP não reenviar


def _criar_pedido_apos_pagamento(dados, payment_id, payment):
    """Cria o pedido no banco após pagamento aprovado pelo MP."""
    try:
        from .models import Pedido, ItemPedido, Produto, Estoque
        from .notificacoes import notificar_pedido_catalogo

        # Verifica se já existe pedido com este payment_id (evita duplicatas)
        if Pedido.objects.filter(observacao__contains=payment_id).exists():
            logger.info(f"Pedido com payment_id {payment_id} já existe.")
            return

        pedido = Pedido.objects.create(
            nome_cliente=dados.get("nome", ""),
            telefone=dados.get("telefone", ""),
            email=dados.get("email", ""),
            cep=dados.get("cep", ""),
            rua=dados.get("rua", ""),
            numero=dados.get("numero", ""),
            complemento=dados.get("complemento", ""),
            bairro=dados.get("bairro", ""),
            cidade=dados.get("cidade", ""),
            estado=dados.get("estado", ""),
            forma_pagamento=f"Mercado Pago (ID: {payment_id})",
            observacao=dados.get("observacao", "") + f" | MP: {payment_id}",
            status="novo",
        )

        for item in dados.get("itens", []):
            try:
                produto = Produto.objects.get(id=item.get("produto_id"))
                qtd = int(item.get("quantidade", 1))
                tamanho = item.get("tamanho", "Único")
                ItemPedido.objects.create(
                    pedido=pedido, produto=produto,
                    tamanho=tamanho, quantidade=qtd,
                )
                # Descontar estoque
                try:
                    est = Estoque.objects.get(produto=produto, tamanho=tamanho)
                    est.quantidade = max(0, est.quantidade - qtd)
                    est.save()
                except Estoque.DoesNotExist:
                    pass
            except Exception as e:
                logger.error(f"Erro ao criar item pedido: {e}")

        # Notificar dono e cliente
        try:
            notificar_pedido_catalogo({
                "nome_cliente": pedido.nome_cliente,
                "telefone": pedido.telefone,
                "email": pedido.email,
                "rua": pedido.rua,
                "numero": pedido.numero,
                "bairro": pedido.bairro,
                "cidade": pedido.cidade,
                "estado": pedido.estado,
                "forma_pagamento": pedido.forma_pagamento,
                "itens_resumo": [
                    {"produto_nome": i.produto.nome, "tamanho": i.tamanho, "quantidade": i.quantidade}
                    for i in pedido.itens.all()
                ],
            })
        except Exception as e:
            logger.error(f"Erro ao notificar: {e}")

        logger.info(f"Pedido #{pedido.id} criado após pagamento MP aprovado.")

    except Exception as e:
        logger.exception(f"Erro ao criar pedido após MP: {e}")