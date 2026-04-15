# backend/core/mercadopago_views.py

# Tenta importar o SDK do Mercado Pago — se não estiver instalado, desativa graciosamente
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
import os
import json
import time
import logging


logger = logging.getLogger(__name__)

# CORREÇÃO 1: Removida a leitura do token no nível do módulo.
# Antes: MP_ACCESS_TOKEN = getattr(settings, "MP_ACCESS_TOKEN", "")
# Problema: era lido uma única vez no boot do Django, antes das variáveis
# de ambiente do Railway serem garantidamente injetadas, resultando em string vazia.
# Agora o token é lido dentro de get_sdk(), em cada chamada, garantindo
# que sempre pega o valor atual do ambiente.


def get_sdk():
    """
    Instancia o SDK do Mercado Pago lendo o token em tempo de execução.
    Lê primeiro do settings (que por sua vez lê do os.environ via Railway),
    com fallback direto para os.environ caso settings não tenha o valor.
    Lança exceção clara se o token não estiver configurado.
    """
    if not MP_DISPONIVEL:
        raise ImportError("Mercado Pago não instalado. Execute: pip install mercadopago")

    # CORREÇÃO 1 (continuação): leitura do token dentro da função
    token = getattr(settings, "MP_ACCESS_TOKEN", "") or os.environ.get("MP_ACCESS_TOKEN", "")

    if not token:
        raise ValueError(
            "MP_ACCESS_TOKEN não configurado. "
            "Adicione a variável de ambiente no Railway."
        )

    return mercadopago.SDK(token)


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

        # Monta os items no formato esperado pela API do MP
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

        # URL base do frontend para redirecionamento após pagamento
        frontend_url = getattr(settings, "FRONTEND_URL", "https://www.metzkersolucoes.com.br")

        # Limpa o telefone para enviar somente números à API do MP
        tel_raw = (
            cliente.get("telefone", "")
            .replace(" ", "")
            .replace("(", "")
            .replace(")", "")
            .replace("-", "")
        )
        # Separa DDD (2 primeiros dígitos) do número, se o telefone tiver 10+ dígitos
        tel_num = tel_raw[2:] if len(tel_raw) >= 10 else tel_raw
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
            # URLs para onde o comprador é redirecionado após o pagamento
            "back_urls": {
                "success": f"{frontend_url}/pedidos?status=aprovado",
                "failure": f"{frontend_url}/pedidos?status=falhou",
                "pending": f"{frontend_url}/pedidos?status=pendente",
            },
            # Redireciona automaticamente apenas quando aprovado
            "auto_return": "approved",
            # URL do webhook no Railway que receberá as notificações do MP
            "notification_url": (
                f"{getattr(settings, 'BACKEND_URL', 'https://api.metzkersolucoes.com.br')}"
                f"/api/mp-webhook/"
            ),
            "statement_descriptor": "METZKER",
            # binary_mode False: permite pagamentos pendentes (boleto, pix, etc.)
            "binary_mode": False,
            # Armazena todos os dados do pedido no external_reference
            # para reconstruir o pedido quando o webhook chegar
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
                "installments": 12,  # Permite parcelamento em até 12x
            },
        }

        result = sdk.preference().create(preference_data)
        preference = result["response"]

        if result["status"] not in [200, 201] or "id" not in result.get("response", {}):
            logger.error(
                f"Erro MP ao criar preferência: status={result['status']} response={preference}"
            )
            return Response(
                {"erro": f"Erro ao criar pagamento. Status: {result['status']}"},
                status=500,
            )

        return Response({
            "preference_id": preference["id"],
            "init_point": preference["init_point"],                          # URL de produção
            "sandbox_init_point": preference.get("sandbox_init_point", ""), # URL de testes
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
    Sempre responde 200 para que o MP não fique reenviando a notificação.
    """
    try:
        # O MP pode enviar o tipo via query string (?topic=payment)
        # ou via body JSON ({"type": "payment", "data": {"id": "..."}})
        topic = request.GET.get("topic") or request.data.get("type", "")
        payment_id = request.GET.get("id") or request.data.get("data", {}).get("id")

        # CORREÇÃO 2: Removido "merchant_order" do filtro.
        # merchant_order não contém payment_id diretamente — só contém uma lista
        # de pagamentos associados, e tentar fazer .get(payment_id) com um
        # merchant_order ID causava 404. Processamos apenas notificações de "payment".
        if not payment_id or topic not in ("payment",):
            logger.info(f"Webhook ignorado: topic='{topic}' payment_id='{payment_id}'")
            return HttpResponse(status=200)

        # CORREÇÃO 3: Adicionado sleep antes de consultar o pagamento.
        # O MP dispara o webhook quase instantaneamente após o pagamento,
        # mas a API deles pode demorar alguns segundos para ter o pagamento
        # disponível para consulta. Sem essa espera, o GET /payments retornava
        # 404 — que era exatamente o erro de 161 ocorrências no painel de monitoramento.
        time.sleep(3)

        sdk = get_sdk()
        payment_info = sdk.payment().get(payment_id)

        # CORREÇÃO 3 (continuação): Retry caso o pagamento ainda não esteja disponível
        if payment_info.get("status") == 404:
            logger.warning(
                f"Payment {payment_id} ainda não disponível na API do MP. "
                f"Aguardando 5s para nova tentativa..."
            )
            time.sleep(5)
            payment_info = sdk.payment().get(payment_id)

        payment = payment_info["response"]
        status = payment.get("status")
        logger.info(f"Webhook MP: payment_id={payment_id} status={status}")

        # Só cria o pedido se o pagamento foi aprovado
        if status == "approved":
            external_ref = payment.get("external_reference", "{}")
            try:
                dados = json.loads(external_ref)
            except Exception:
                dados = {}

            _criar_pedido_apos_pagamento(dados, payment_id, payment)

        return HttpResponse(status=200)

    except Exception as e:
        logger.exception(f"Erro webhook MP: {e}")
        # Sempre retorna 200 mesmo em erro para o MP não reenviar infinitamente
        return HttpResponse(status=200)


def _criar_pedido_apos_pagamento(dados, payment_id, payment):
    """
    Cria o pedido no banco de dados após pagamento aprovado pelo MP.
    Os dados do pedido vêm do external_reference que foi salvo na preference.
    """
    try:
        from .models import Pedido, ItemPedido, Produto, Estoque
        from .notificacoes import notificar_pedido_catalogo

        # Proteção contra duplicatas: verifica se já existe um pedido
        # com este payment_id antes de criar um novo
        if Pedido.objects.filter(observacao__contains=payment_id).exists():
            logger.info(f"Pedido com payment_id {payment_id} já existe. Ignorando.")
            return

        # Cria o pedido principal com os dados do cliente
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
            # O payment_id é salvo na observação para checagem de duplicatas acima
            observacao=dados.get("observacao", "") + f" | MP: {payment_id}",
            status="novo",
        )

        # Cria os itens do pedido e desconta o estoque
        for item in dados.get("itens", []):
            try:
                produto = Produto.objects.get(id=item.get("produto_id"))
                qtd = int(item.get("quantidade", 1))
                tamanho = item.get("tamanho", "Único")

                ItemPedido.objects.create(
                    pedido=pedido,
                    produto=produto,
                    tamanho=tamanho,
                    quantidade=qtd,
                )

                # Desconta o estoque, nunca deixando negativo (max 0)
                try:
                    est = Estoque.objects.get(produto=produto, tamanho=tamanho)
                    est.quantidade = max(0, est.quantidade - qtd)
                    est.save()
                except Estoque.DoesNotExist:
                    # Se não houver registro de estoque para esse tamanho, ignora
                    logger.warning(
                        f"Estoque não encontrado: produto={produto.id} tamanho={tamanho}"
                    )

            except Exception as e:
                logger.error(f"Erro ao criar item do pedido: {e}")

        # Envia notificações para o dono da loja e para o cliente
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
                    {
                        "produto_nome": i.produto.nome,
                        "tamanho": i.tamanho,
                        "quantidade": i.quantidade,
                    }
                    for i in pedido.itens.all()
                ],
            })
        except Exception as e:
            logger.error(f"Erro ao enviar notificação do pedido: {e}")

        logger.info(f"Pedido #{pedido.id} criado com sucesso após pagamento MP aprovado.")

    except Exception as e:
        logger.exception(f"Erro ao criar pedido após pagamento MP: {e}")