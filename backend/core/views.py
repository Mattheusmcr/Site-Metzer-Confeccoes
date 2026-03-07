from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Produto, Pedido, Institucional, Estoque, ItemPedido, ProdutoImagem
from .serializers import ProdutoSerializer, PedidoSerializer, InstitucionalSerializer, EstoqueSerializer


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.filter(ativo=True)
    serializer_class = ProdutoSerializer
    parser_classes = (MultiPartParser, FormParser)

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
        for item in pedido.itens.all():
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