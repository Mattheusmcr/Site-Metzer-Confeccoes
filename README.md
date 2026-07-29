# Metzker Soluções - Documentação do Projeto

> Uniformes e Comunicação Visual para empresas · Vila Velha, ES  
> Site: [www.metzkersolucoes.com.br](https://www.metzkersolucoes.com.br)

---

## Stack de Tecnologias

**Backend:** Django 4.2 · Django REST Framework · SimpleJWT · PostgreSQL · Cloudinary · Gunicorn  
**Frontend:** React 19 · Vite 6 · React Router DOM 7 · Axios · Tailwind CSS 4  
**Infraestrutura:** Railway (backend + PostgreSQL) · Vercel (frontend) · GitHub (CI/CD)  
**Pagamentos:** Mercado Pago (Checkout Pro)

---

## URLs de Produção

| Serviço | URL |
|---|---|
| Site | https://www.metzkersolucoes.com.br |
| API | https://api.metzkersolucoes.com.br/api/ |
| Admin Django | https://api.metzkersolucoes.com.br/admin/ |

---

## Estrutura de Pastas

```
metzker-confeccoes/
├── backend/
│   ├── metzker/
│   │   ├── settings.py        # Configurações gerais + MP
│   │   └── urls.py            # Inclui rotas do Mercado Pago
│   ├── core/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── mercadopago_views.py  # Checkout Pro + Webhook
│   │   └── notificacoes.py
│   └── requirements.txt       # Inclui mercadopago
└── frontend/
    ├── public/
    └── src/
        ├── pages/
        │   ├── Pedidos.jsx    # Checkout com Mercado Pago
        │   └── ...
        └── ...
```

---

## Como Rodar Localmente

### Pré-requisitos

- Python 3.10+
- Node.js 20+
- SQL Server Express + SSMS (ou PostgreSQL)
- Git

### Backend

```bash
git clone https://github.com/Mattheusmcr/Site-Metzer-Confeccoes.git
cd Site-Metzer-Confeccoes/backend

python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements.txt

# Crie backend/.env (veja seção Variáveis de Ambiente)

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# API em: http://localhost:8000/api/
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api/" > .env
npm run dev
# Site em: http://localhost:5173
```

---

## Variáveis de Ambiente

### `backend/.env` (desenvolvimento local)

```env
DJANGO_SECRET_KEY=uma-chave-secreta-longa
DJANGO_DEBUG=True
DB_NAME=metzker_db
DB_USER=seu-usuario-sql
DB_PASSWORD=sua-senha-sql
DB_HOST=NOME-DA-MAQUINA\SQLEXPRESS
```

### Railway (produção)

| Variável | Descrição |
|---|---|
| `DJANGO_SECRET_KEY` | Chave secreta Django |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | Domínio da API |
| `DATABASE_URL` | Gerado automaticamente pelo PostgreSQL Railway |
| `CORS_ALLOWED_ORIGINS` | URLs do frontend |
| `CLOUDINARY_CLOUD_NAME` | Painel Cloudinary |
| `CLOUDINARY_API_KEY` | Painel Cloudinary |
| `CLOUDINARY_API_SECRET` | Painel Cloudinary |
| `DJANGO_SUPERUSER_USERNAME` | Usuário admin |
| `DJANGO_SUPERUSER_EMAIL` | Email admin |
| `DJANGO_SUPERUSER_PASSWORD` | Senha admin |
| `EMAIL_HOST_USER` | Seu Gmail |
| `EMAIL_HOST_PASSWORD` | Senha de App Gmail (16 chars) |
| `MP_ACCESS_TOKEN` | Mercado Pago Access Token |
| `MP_PUBLIC_KEY` | Mercado Pago Public Key |
| `FRONTEND_URL` | `https://www.metzkersolucoes.com.br` |
| `BACKEND_URL` | `https://api.metzkersolucoes.com.br` |

> ⚠️ **Não adicionar** `CLOUDINARY_URL` usar as 3 variáveis separadas.

### `frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api/
# Produção: configurar no painel Vercel
```

---

## Deploy

```bash
# Deploy padrão
git add .
git commit -m "descrição"
git push origin main

# Forçar redeploy
git commit --allow-empty -m "trigger redeploy"
git push
```

---

## Mercado Pago Checkout Pro

### Fluxo de pagamento

1. Cliente preenche dados no formulário de pedido
2. Clica em **"✅ Confirmar Pedido"**
3. Frontend chama `POST /api/mp-criar-preferencia/` com itens e dados do cliente
4. Backend cria preferência no Mercado Pago e retorna `init_point`
5. Cliente é redirecionado para o checkout seguro do Mercado Pago
6. Paga com cartão, Pix ou boleto
7. Mercado Pago chama `POST /api/mp-webhook/` notificando o pagamento
8. Backend cria o pedido, desconta estoque e envia emails

### Configurar no Railway

```
MP_ACCESS_TOKEN = APP_USR-xxxx...   (NÃO compartilhe)
MP_PUBLIC_KEY   = APP_USR-xxxx...
FRONTEND_URL    = https://www.metzkersolucoes.com.br
BACKEND_URL     = https://api.metzkersolucoes.com.br
```

### Ativar Pix no Mercado Pago

Acesse: painel Mercado Pago → Configurações → Meios de pagamento → ative o Pix.

### Endpoints

| Endpoint | Descrição |
|---|---|
| `POST /api/mp-criar-preferencia/` | Cria preferência e retorna URL de pagamento |
| `POST /api/mp-webhook/` | Recebe notificações do MP (pagamento aprovado) |

---

## Painel Admin (`/admin-login`)

| Aba | Funcionalidades |
|---|---|
| **Dashboard** | Métricas: total pedidos, faturamento, status separado por tipo |
| **Cadastrar** | Criar produto com imagens, categoria, descrição |
| **Produtos** | Ativar/desativar, editar, trocar imagens |
| **Pedidos Portfólio** | Itens, preços, status, protocolo, histórico de status |
| **Pedidos Personalizados** | Combinações, imagens de referência, status |
| **Estoque** | Quantidades por tamanho/formato |
| **Informações** | Galeria da Home |

---

## Endpoints Principais da API

| Método | Endpoint | Acesso |
|---|---|---|
| `GET` | `/api/produtos/` | Público |
| `POST` | `/api/pedidos/` | Público |
| `POST` | `/api/pedidos-personalizados/` | Público |
| `POST` | `/api/mp-criar-preferencia/` | Público |
| `POST` | `/api/mp-webhook/` | Mercado Pago |
| `POST` | `/api/admin-login/` | Público |
| `GET/PATCH/DELETE` | `/api/pedidos/{id}/` | Admin |
| `GET/PATCH/DELETE` | `/api/pedidos-personalizados/{id}/` | Admin |
| `POST` | `/api/estoques/atualizar/` | Admin |

---

## Dimensões de Imagens

| Uso | Dimensão | Proporção |
|---|---|---|
| Produto no portfólio | 800×800px | 1:1 |
| Hero (tela cheia) | 1920×1080px | 16:9 paisagem |
| Foto institucional | 1200×900px | 4:3 |

---

## Problemas Comuns

| Erro | Solução |
|---|---|
| `No module named 'mercadopago'` | Adicionar `mercadopago` ao `requirements.txt` |
| `500` no MP webhook | Verificar `MP_ACCESS_TOKEN` no Railway |
| Pix não aparece no MP | Ativar nas configurações da conta Mercado Pago |
| CORS bloqueando | Backend caiu - verificar logs Railway |
| Emails não enviando | Verificar `EMAIL_HOST_PASSWORD` (Senha de App Gmail) |
| Imagens não aparecem localmente | Normal - Cloudinary só funciona em produção |

---

*Desenvolvido por [Matheus Costa Rodrigues](https://github.com/Mattheusmcr)*  
*Metzker Soluções © 2026*