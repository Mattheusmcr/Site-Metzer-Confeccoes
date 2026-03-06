from rest_framework import viewsets
from .models import Produto, Pedido, Institucional
from .serializers import ProdutoSerializer, PedidoSerializer, InstitucionalSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from .models import Produto, Pedido, Estoque, ItemPedido


from rest_framework.exceptions import ValidationError
from .models import Estoque

def perform_create(self, serializer):
    pedido = serializer.save()

    for item in pedido.itens.all():
        try:
            estoque = Estoque.objects.get(
                produto=item.produto,
                tamanho=item.tamanho
            )
        except Estoque.DoesNotExist:
            raise ValidationError("Estoque não encontrado")

        if estoque.quantidade < item.quantidade:
            raise ValidationError("Estoque insuficiente")

        estoque.quantidade -= item.quantidade
        estoque.save()

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.filter(ativo=True)
    serializer_class = ProdutoSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_context(self):
        return {'request': self.request}


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
   


class InstitucionalViewSet(viewsets.ModelViewSet):
    queryset = Institucional.objects.all()
    serializer_class = InstitucionalSerializer




