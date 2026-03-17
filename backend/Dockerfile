FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Coleta arquivos estáticos
ARG CACHE_BUST=10
RUN DATABASE_URL=sqlite:///tmp/build.db python manage.py collectstatic --noinput

EXPOSE 8000

# Roda migrations + cria admin + sobe servidor
CMD python manage.py migrate && python create_admin.py && gunicorn metzker.wsgi --bind 0.0.0.0:$PORT --log-file -