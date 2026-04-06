from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
import threading

# Import email notifications (fails gracefully if not configured)
NOTIFICACOES_OK = False
notificar_pedido_catalogo = None
notificar_pedido_personalizado = None
try:
    from .notificacoes import notificar_pedido_catalogo as _npc, notificar_pedido_personalizado as _npp
    notificar_pedido_catalogo = _npc
    notificar_pedido_personalizado = _npp
    NOTIFICACOES_OK = True
    print("✅ Sistema de notificações por email ativo")
except Exception as _e:
    print(f"⚠️ Notificações por email desativadas: {_e}")

def enviar_notificacoes(pedido_data, tipo="catalogo"):
    """Envia notificação via WhatsApp (wa.me link) logando para o admin ver nos logs."""
    try:
        if tipo == "catalogo":
            nome = pedido_data.get("nome_cliente", "Cliente")
            tel = pedido_data.get("telefone", "")
            msg = f"Novo pedido recebido! Cliente: {nome} | Tel: {tel}"
        else:
            nome = pedido_data.get("nome_cliente", "Cliente")
            tel = pedido_data.get("telefone", "")
            ramo = pedido_data.get("ramo", "")
            qtd = pedido_data.get("quantidade", 0)
            msg = f"Novo pedido personalizado! Cliente: {nome} | Tel: {tel} | Produto: {ramo} | Qtd: {qtd}"
        print(f"🔔 NOTIFICAÇÃO NOVO PEDIDO: {msg}")
    except Exception as e:
        print(f"Erro ao enviar notificação: {e}")
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Produto, Pedido, Institucional, Estoque, ItemPedido, ProdutoImagem, PedidoPersonalizado
from .serializers import ProdutoSerializer, PedidoSerializer, InstitucionalSerializer, EstoqueSerializer, PedidoPersonalizadoSerializer


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.filter(ativo=True)
    serializer_class = ProdutoSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    # Lista TODOS os produtos para o admin (incluindo inativos)
    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Produto.objects.all()
        return Produto.objects.filter(ativo=True)

    def create(self, request, *args, **kwargs):
        imagens = request.FILES.getlist('imagens')
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("ERROS DO SERIALIZER:", serializer.errors)
            return Response(serializer.errors, status=400)
        produto = serializer.save()
        for imagem in imagens:
            ProdutoImagem.objects.create(produto=produto, imagem=imagem)
        return Response(serializer.data, status=201)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        produto = serializer.save()

        novas_imagens = request.FILES.getlist('imagens')
        if novas_imagens:
            ProdutoImagem.objects.filter(produto=produto).delete()
            for imagem in novas_imagens:
                ProdutoImagem.objects.create(produto=produto, imagem=imagem)

        return Response(serializer.data)


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def perform_create(self, serializer):
        pedido = serializer.save()
        # Notificar dono e cliente por email (estoque já descontado pelo serializer)
        if NOTIFICACOES_OK and notificar_pedido_catalogo:
            try:
                pedido_dict = {
                    "nome_cliente": pedido.nome_cliente,
                    "telefone": pedido.telefone,
                    "email": getattr(pedido, "email", ""),
                    "rua": getattr(pedido, "rua", ""),
                    "numero": getattr(pedido, "numero", ""),
                    "bairro": getattr(pedido, "bairro", ""),
                    "cidade": getattr(pedido, "cidade", ""),
                    "estado": getattr(pedido, "estado", ""),
                    "forma_pagamento": getattr(pedido, "forma_pagamento", ""),
                    "itens_resumo": [{"produto_nome": str(i.produto), "tamanho": i.tamanho, "quantidade": i.quantidade} for i in pedido.itens.all()],
                }
                notificar_pedido_catalogo(pedido_dict)
            except Exception as e:
                print(f"Notificação erro: {e}")

    def _old_stock_deduction(self):
        for item in []:
            try:
                estoque = Estoque.objects.get(produto=item.produto, tamanho=item.tamanho)
            except Estoque.DoesNotExist:
                raise ValidationError("Estoque não encontrado")
            if estoque.quantidade < item.quantidade:
                raise ValidationError("Estoque insuficiente")
            estoque.quantidade -= item.quantidade
            estoque.save()


class InstitucionalViewSet(viewsets.ModelViewSet):
    queryset = Institucional.objects.all()
    serializer_class = InstitucionalSerializer


class EstoqueViewSet(viewsets.ModelViewSet):
    queryset = Estoque.objects.all()
    serializer_class = EstoqueSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'], url_path='atualizar')
    def atualizar(self, request):
        produto_id = request.data.get('produto')
        tamanho = request.data.get('tamanho')
        quantidade = request.data.get('quantidade')

        if not produto_id or not tamanho or quantidade is None:
            return Response({'erro': 'produto, tamanho e quantidade são obrigatórios'}, status=400)

        estoque, criado = Estoque.objects.update_or_create(
            produto_id=produto_id,
            tamanho=tamanho,
            defaults={'quantidade': int(quantidade)}
        )
        return Response(EstoqueSerializer(estoque).data)

    @action(detail=False, methods=['delete'], url_path='remover')
    def remover(self, request):
        produto_id = request.data.get('produto')
        tamanho = request.data.get('tamanho')

        if not produto_id or not tamanho:
            return Response({'erro': 'produto e tamanho são obrigatórios'}, status=400)

        deleted, _ = Estoque.objects.filter(
            produto_id=produto_id,
            tamanho=tamanho
        ).delete()

        if deleted:
            return Response({'ok': True})
        return Response({'erro': 'Estoque não encontrado'}, status=404)


class AdminTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_staff:
            raise serializers.ValidationError("Acesso restrito a administradores.")
        return data


class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminTokenSerializer


class PedidoPersonalizadoViewSet(viewsets.ModelViewSet):
    queryset = PedidoPersonalizado.objects.all().order_by('-data_pedido')
    serializer_class = PedidoPersonalizadoSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        # Salva imagens separadamente (campos imagem1..5)
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        files = request.FILES
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print("Erros PedidoPersonalizado:", serializer.errors)
            return Response(serializer.errors, status=400)
        pedido = serializer.save(
            imagem1=files.get('imagem1'),
            imagem2=files.get('imagem2'),
            imagem3=files.get('imagem3'),
            imagem4=files.get('imagem4'),
            imagem5=files.get('imagem5'),
        )
        if NOTIFICACOES_OK and notificar_pedido_personalizado:
            try:
                pedido_dict = {
                    "nome_cliente": pedido.nome_cliente,
                    "telefone": pedido.telefone,
                    "email": pedido.email,
                    "ramo": pedido.ramo,
                    "quantidade": pedido.quantidade,
                    "referencia": pedido.referencia,
                    "observacoes": pedido.observacoes,
                }
                notificar_pedido_personalizado(pedido_dict)
            except Exception as e:
                print(f"Notificação personalizado erro: {e}")
        return Response(serializer.data, status=201)