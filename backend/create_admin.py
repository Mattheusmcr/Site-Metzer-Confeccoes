import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'metzker.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email    = os.environ.get('DJANGO_SUPERUSER_EMAIL', '') # lê do Railway
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '') # lê do Railway

if not password:
    print("DJANGO_SUPERUSER_PASSWORD não definida — admin não criado.")
else:
    try:
        User.objects.filter(username=username).delete()
        user = User.objects.create_superuser(
            username=username, email=email, password=password,
            is_staff=True, is_superuser=True, is_active=True,
        )
        print(f"✅ Superusuário '{username}' criado!")
    except Exception as e:
        print(f"❌ Erro: {e}")