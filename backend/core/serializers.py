from rest_framework import serializers
from .models import Produto, Pedido, Institucional, Estoque, ProdutoImagem


class EstoqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estoque
        fields = ['id', 'tamanho', 'quantidade']



class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = '__all__'


class InstitucionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucional
        fields = '__all__'


class ProdutoImagemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProdutoImagem
        fields = ['id', 'imagem']

class ProdutoSerializer(serializers.ModelSerializer):
    estoques = EstoqueSerializer(many=True, read_only=True)
    imagens = ProdutoImagemSerializer(many=True, read_only=True)

    class Meta:
        model = Produto
        fields = '__all__'
        extra_kwargs = {
            'descricao': {'required': False, 'allow_blank': True}, 
            'imagem': {'required': False, 'allow_null': True},       
        }