from rest_framework import serializers
from .models import Produto, Pedido, Institucional, Estoque


class EstoqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estoque
        fields = ['id', 'tamanho', 'quantidade']


class ProdutoSerializer(serializers.ModelSerializer):
    estoques = EstoqueSerializer(many=True, read_only=True)

    class Meta:
        model = Produto
        fields = '__all__'


class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = '__all__'


class InstitucionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucional
        fields = '__all__'