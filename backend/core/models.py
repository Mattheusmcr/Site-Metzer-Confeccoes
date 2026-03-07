from django.db import models

class Institucional(models.Model):
    titulo = models.CharField(max_length=200)
    conteudo = models.TextField()
    conteudo = models.TextField(default="")
    imagem = models.ImageField(upload_to="institucional/", blank=True, null=True)

from django.db import models

class Produto(models.Model):
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    imagem = models.ImageField(upload_to='produtos/', blank=True, null=True)
    ativo = models.BooleanField(default=True)  # 👈 ativo/inativo

    def __str__(self):
        return self.nome

class Tamanho(models.Model):
    nome = models.CharField(max_length=10)

    def __str__(self):
        return self.nome


class Estoque(models.Model):
    produto = models.ForeignKey(
        'Produto',
        on_delete=models.CASCADE,
        related_name='estoques'
    )
    tamanho = models.CharField(max_length=5)
    quantidade = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.produto.nome} - {self.tamanho} ({self.quantidade})"

class Pedido(models.Model):
    nome_cliente = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20)
    data_pedido = models.DateTimeField(auto_now_add=True)
    

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    tamanho = models.ForeignKey(Tamanho, on_delete=models.CASCADE)
    quantidade = models.IntegerField()

class ProdutoImagem(models.Model):
    produto = models.ForeignKey(
        Produto,
        on_delete=models.CASCADE,
        related_name='imagens'
    )
    imagem = models.ImageField(upload_to='produtos/')

    def __str__(self):
        return f"Imagem de {self.produto.nome}"