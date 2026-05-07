from rest_framework import serializers
from .models import Produto, Pedido, ItemPedido, Institucional, Estoque, ProdutoImagem, PedidoPersonalizado


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
    # Write-only field to receive itens on creation
    itens_input = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = Pedido
        fields = [
            'id', 'nome_cliente', 'telefone', 'email',
            'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
            'forma_pagamento', 'observacao', 'data_pedido', 'itens', 'itens_input', 'total',
            'frete_tipo', 'frete_valor', 'status',
        ]
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
        }

    def get_total(self, obj):
        return sum(i.quantidade * i.produto.preco for i in obj.itens.all())

    def create(self, validated_data):
        from .models import Produto, ItemPedido, Estoque
        itens_data = validated_data.pop('itens_input', [])
        pedido = Pedido.objects.create(**validated_data)
        for item_data in itens_data:
            try:
                produto = Produto.objects.get(id=item_data['produto'])
                qtd = int(item_data.get('quantidade', 1))
                tamanho = item_data.get('tamanho', 'Único')
                ItemPedido.objects.create(
                    pedido=pedido,
                    produto=produto,
                    tamanho=tamanho,
                    quantidade=qtd,
                )
                # Desconta estoque
                try:
                    est = Estoque.objects.get(produto=produto, tamanho=tamanho)
                    est.quantidade = max(0, est.quantidade - qtd)
                    est.save()
                except Estoque.DoesNotExist:
                    pass
            except Exception as e:
                print(f"Erro ao criar item pedido: {e}")
        return pedido


class InstitucionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucional
        fields = '__all__'


class PedidoPersonalizadoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PedidoPersonalizado
        fields = [
            'id', 'nome_empresa', 'slogan', 'ramo', 'quantidade',
            'estilo', 'paleta', 'aplicacoes',
            'referencia', 'observacoes',
            'nome_cliente', 'telefone', 'email',
            'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
            'frete_tipo', 'frete_valor',
            'imagem1', 'imagem2', 'imagem3', 'imagem4', 'imagem5',
            'data_pedido', 'status',
        ]
        extra_kwargs = {
            'nome_cliente':  {'required': False, 'allow_blank': True},
            'telefone':      {'required': False, 'allow_blank': True},
            'email':         {'required': False, 'allow_blank': True},
            'slogan':        {'required': False, 'allow_blank': True},
            'referencia':    {'required': False, 'allow_blank': True},
            'observacoes':   {'required': False, 'allow_blank': True},
            'cep':           {'required': False, 'allow_blank': True},
            'rua':           {'required': False, 'allow_blank': True},
            'numero':        {'required': False, 'allow_blank': True},
            'complemento':   {'required': False, 'allow_blank': True},
            'bairro':        {'required': False, 'allow_blank': True},
            'cidade':        {'required': False, 'allow_blank': True},
            'estado':        {'required': False, 'allow_blank': True},
            'frete_tipo':    {'required': False, 'allow_blank': True},
            'frete_valor':   {'required': False},
            'imagem1':       {'required': False, 'allow_null': True},
            'imagem2':       {'required': False, 'allow_null': True},
            'imagem3':       {'required': False, 'allow_null': True},
            'imagem4':       {'required': False, 'allow_null': True},
            'imagem5':       {'required': False, 'allow_null': True},
        }