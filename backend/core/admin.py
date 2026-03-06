from django.contrib import admin
from .models import Produto, Pedido, Institucional, Estoque, Tamanho, ItemPedido

admin.site.register(Produto)
admin.site.register(Pedido)
admin.site.register(Estoque)
admin.site.register(Tamanho)
