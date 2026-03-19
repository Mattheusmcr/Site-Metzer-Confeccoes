from django.db import models


class Institucional(models.Model):
    titulo = models.CharField(max_length=200)
    conteudo = models.TextField(default="")
    imagem = models.ImageField(upload_to="institucional/", blank=True, null=True)

    def __str__(self):
        return self.titulo


class Produto(models.Model):

    CATEGORIA_CHOICES = [
        ('roupas', 'Item de Roupa'),
        ('comunicacao', 'Comunicação Visual'),
    ]

    SUBCATEGORIA_CHOICES = [
        ('gola-polo', 'Gola Polo'),
        ('camisa-comum', 'Camisa Comum'),
        ('baby-look', 'Baby Look'),
        ('infantil', 'Infantil'),
        ('calca', 'Calça'),
        ('impressoes', 'Impressões'),
        ('logos-acm', 'Logos ACM'),
    ]

    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, default="")
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    imagem = models.ImageField(upload_to='produtos/', blank=True, null=True)
    ativo = models.BooleanField(default=True)
    categoria = models.CharField(
        max_length=50,
        choices=CATEGORIA_CHOICES,
        blank=True,
        default=""
    )
    subcategoria = models.CharField(
        max_length=50,
        choices=SUBCATEGORIA_CHOICES,
        blank=True,
        default=""
    )

    def __str__(self):
        return self.nome


class Tamanho(models.Model):
    nome = models.CharField(max_length=10)

    def __str__(self):
        return self.nome


class Estoque(models.Model):
    produto = models.ForeignKey(
        'Produto', on_delete=models.CASCADE, related_name='estoques'
    )
    tamanho = models.CharField(max_length=10)
    quantidade = models.IntegerField(default=0)

    class Meta:
        unique_together = ('produto', 'tamanho')

    def __str__(self):
        return f"{self.produto.nome} - {self.tamanho} ({self.quantidade})"


class Pedido(models.Model):
    nome_cliente = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20)
    cep = models.CharField(max_length=10, blank=True, default="")
    rua = models.CharField(max_length=200, blank=True, default="")
    numero = models.CharField(max_length=20, blank=True, default="")
    complemento = models.CharField(max_length=100, blank=True, default="")
    bairro = models.CharField(max_length=100, blank=True, default="")
    cidade = models.CharField(max_length=100, blank=True, default="")
    estado = models.CharField(max_length=2, blank=True, default="")
    forma_pagamento = models.CharField(max_length=50, blank=True, default="")
    observacao = models.TextField(blank=True, default="")
    data_pedido = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pedido #{self.id} - {self.nome_cliente}"


class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    tamanho = models.CharField(max_length=10)
    quantidade = models.IntegerField()

    def __str__(self):
        return f"{self.produto.nome} ({self.tamanho}) x{self.quantidade}"


class ProdutoImagem(models.Model):
    produto = models.ForeignKey(
        Produto, on_delete=models.CASCADE, related_name='imagens'
    )
    imagem = models.ImageField(upload_to='produtos/')

    def __str__(self):
        return f"Imagem de {self.produto.nome}"


class PedidoPersonalizado(models.Model):
    # Dados da empresa
    nome_empresa    = models.CharField(max_length=200)
    slogan          = models.CharField(max_length=200, blank=True, default="")
    ramo            = models.CharField(max_length=200)
    quantidade      = models.IntegerField(default=1)

    # Preferências de design
    estilo          = models.CharField(max_length=50, blank=True, default="")
    paleta          = models.CharField(max_length=50, blank=True, default="")
    aplicacoes      = models.JSONField(default=list)

    # Detalhes extras
    referencia      = models.TextField(blank=True, default="")
    observacoes     = models.TextField(blank=True, default="")

    # Contato do cliente
    nome_cliente    = models.CharField(max_length=200, blank=True, default="")
    telefone        = models.CharField(max_length=30, blank=True, default="")
    email           = models.CharField(max_length=200, blank=True, default="")

    # Status e data
    data_pedido     = models.DateTimeField(auto_now_add=True)
    status          = models.CharField(max_length=30, default="novo",
                        choices=[
                            ("novo",       "Novo"),
                            ("em_andamento", "Em andamento"),
                            ("concluido",  "Concluído"),
                            ("cancelado",  "Cancelado"),
                        ])