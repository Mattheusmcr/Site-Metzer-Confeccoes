from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.views import (
    ProdutoViewSet, PedidoViewSet, InstitucionalViewSet,
    AdminLoginView, EstoqueViewSet, PedidoPersonalizadoViewSet,
)

router = DefaultRouter()
router.register(r'produtos',               ProdutoViewSet)
router.register(r'pedidos',                PedidoViewSet)
router.register(r'institucional',          InstitucionalViewSet)
router.register(r'estoques',               EstoqueViewSet)
router.register(r'pedidos-personalizados', PedidoPersonalizadoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/admin-login/', AdminLoginView.as_view()),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)