import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'metzker.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email    = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'andremetzkerr@gmail.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '050402Me')

# Apaga qualquer usuário admin existente e cria do zero
User.objects.filter(username=username).delete()
User.objects.create_superuser(username=username, email=email, password=password)
print(f"Superusuário '{username}' criado com sucesso!")