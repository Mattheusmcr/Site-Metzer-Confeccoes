from rest_framework import serializers
from .models import Produto, Pedido, ItemPedido, Institucional, Estoque, ProdutoImagem


class EstoqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estoque
        fields = ['id', 'tamanho', 'quantidade']


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
            'descricao':    {'required': False, 'allow_blank': True},
            'imagem':       {'required': False, 'allow_null': True},
            'categoria':    {'required': False, 'allow_blank': True},
            'subcategoria': {'required': False, 'allow_blank': True},
        }


class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome  = serializers.CharField(source='produto.nome', read_only=True)
    produto_preco = serializers.DecimalField(
        source='produto.preco', max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = ItemPedido
        fields = ['id', 'produto', 'produto_nome', 'produto_preco', 'tamanho', 'quantidade']


class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            'id', 'nome_cliente', 'telefone',
            'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
            'forma_pagamento', 'observacao', 'data_pedido', 'itens', 'total',
        ]

    def get_total(self, obj):
        return sum(i.quantidade * i.produto.preco for i in obj.itens.all())


class InstitucionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucional
        fields = '__all__'