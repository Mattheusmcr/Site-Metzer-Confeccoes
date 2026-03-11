FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o projeto
COPY . .

# Coleta arquivos estáticos — usa sqlite temporário só para não precisar do banco real
RUN DATABASE_URL=sqlite:///tmp/build.db python manage.py collectstatic --noinput

# Expõe a porta
EXPOSE 8000

# Script de inicialização: roda migrate e depois sobe o servidor
CMD python manage.py migrate && gunicorn metzker.wsgi --bind 0.0.0.0:$PORT --log-file -