FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# CACHE_BUST — incrementar este número força rebuild completo a partir daqui
ARG CACHE_BUST=20
COPY . .

RUN DATABASE_URL=sqlite:///tmp/build.db python manage.py collectstatic --noinput

EXPOSE 8000

CMD python manage.py migrate && python create_admin.py && gunicorn metzker.wsgi --bind 0.0.0.0:$PORT --log-file -