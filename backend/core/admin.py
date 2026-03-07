from django.contrib import admin
from .models import Produto, Pedido, Estoque, Tamanho, ItemPedido, ProdutoImagem
admin.site.register(ProdutoImagem)

admin.site.register(Produto)
admin.site.register(Pedido)
admin.site.register(Estoque)
admin.site.register(Tamanho)
