import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'metzker.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'admin'
email    = 'andremetzkerr@gmail.com'
password = '050402Me'

try:
    # Remove qualquer usuário existente com esse username
    deleted = User.objects.filter(username=username).delete()
    print(f"Usuários deletados: {deleted}")

    # Cria do zero
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        is_staff=True,
        is_superuser=True,
        is_active=True,
    )
    print(f"✅ Superusuário '{username}' criado! is_staff={user.is_staff} is_superuser={user.is_superuser}")
except Exception as e:
    print(f"❌ Erro ao criar superusuário: {e}")