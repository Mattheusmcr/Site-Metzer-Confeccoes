# Metzker Soluções — Documentação do Projeto

> Uniformes e Comunicação Visual para empresas · Vila Velha, ES  
> Site: [www.metzkersolucoes.com.br](https://www.metzkersolucoes.com.br)

---

## Stack de Tecnologias

**Backend:** Django 4.2 · Django REST Framework · SimpleJWT · PostgreSQL · Cloudinary · Gunicorn  
**Frontend:** React 19 · Vite 6 · React Router DOM 7 · Axios · Tailwind CSS 3  
**Infraestrutura:** Railway (backend + PostgreSQL) · Vercel (frontend) · GitHub (CI/CD)

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
│   │   ├── settings.py        # Configurações gerais
│   │   └── urls.py
│   ├── core/
│   │   ├── models.py          # Produto, Pedido, Estoque, PedidoPersonalizado
│   │   ├── serializers.py     # Serializers DRF
│   │   ├── views.py           # ViewSets + notificações
│   │   └── notificacoes.py    # Módulo de email
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── public/
    │   ├── sitemap.xml
    │   └── robots.txt
    ├── src/
    │   ├── pages/             # Home, Catalogo, Pedidos, Personalizado, Admin
    │   ├── components/        # Navbar
    │   ├── context/           # Auth, Cart, Theme
    │   └── services/api.js    # Axios
    └── vercel.json
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
# Clone o repositório
git clone https://github.com/Mattheusmcr/Site-Metzer-Confeccoes.git
cd Site-Metzer-Confeccoes/backend

# Crie e ative o ambiente virtual
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# Instale as dependências
pip install -r requirements.txt

# Crie o arquivo backend/.env
# (veja a seção Variáveis de Ambiente abaixo)

# Rode as migrations
python manage.py makemigrations
python manage.py migrate

# Crie o superusuário
python manage.py createsuperuser

# Inicie o servidor
python manage.py runserver
# API disponível em: http://localhost:8000/api/
```

> **SQL Server:** o nome do servidor aparece na tela de login do SSMS.  
> Formato típico: `DESKTOP-XXXXXXX\SQLEXPRESS`

### Frontend

```bash
cd frontend

npm install

# Crie frontend/.env
echo "VITE_API_URL=http://localhost:8000/api/" > .env

npm run dev
# Site disponível em: http://localhost:5173
```

### Rodar os dois simultaneamente

```bash
# Terminal 1 — Backend
cd backend && venv\Scripts\activate && python manage.py runserver

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## Variáveis de Ambiente

### `backend/.env` (desenvolvimento local)

```env
DJANGO_SECRET_KEY=uma-chave-secreta-longa-aqui
DJANGO_DEBUG=True

# SQL Server local
DB_NAME=metzker_db
DB_USER=seu-usuario-sql
DB_PASSWORD=sua-senha-sql
DB_HOST=NOME-DA-MAQUINA\SQLEXPRESS
```

### Railway (produção) — configure em Settings → Variables

| Variável | Descrição |
|---|---|
| `DJANGO_SECRET_KEY` | Chave secreta Django (gere uma aleatória) |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | domínio da API no Railway + domínio próprio |
| `DATABASE_URL` | Gerado automaticamente pelo PostgreSQL do Railway |
| `CORS_ALLOWED_ORIGINS` | URL do frontend (Vercel + domínio próprio) |
| `CLOUDINARY_CLOUD_NAME` | Disponível no painel Cloudinary |
| `CLOUDINARY_API_KEY` | Disponível no painel Cloudinary |
| `CLOUDINARY_API_SECRET` | Disponível no painel Cloudinary |
| `DJANGO_SUPERUSER_USERNAME` | Nome do usuário admin |
| `DJANGO_SUPERUSER_EMAIL` | Email do usuário admin |
| `DJANGO_SUPERUSER_PASSWORD` | Senha do usuário admin |
| `EMAIL_HOST_USER` | Seu email Gmail |
| `EMAIL_HOST_PASSWORD` | Senha de App Gmail (16 caracteres) |

> ⚠️ **Não adicionar** `CLOUDINARY_URL` — usar apenas as 3 variáveis separadas.

### `frontend/.env`

```env
# Desenvolvimento
VITE_API_URL=http://localhost:8000/api/

# Produção — configurar no painel Vercel
VITE_API_URL=https://api.seudominio.com.br/api/
```

---

## Deploy

Todo push na branch `main` dispara CI/CD automático no Railway e Vercel.

```bash
# Deploy padrão
git add .
git commit -m "descrição da mudança"
git push origin main

# Forçar redeploy sem alterações
git commit --allow-empty -m "trigger redeploy"
git push
```

---

## Configurar Email (Gmail SMTP)

O sistema envia notificações automáticas ao dono e ao cliente em cada pedido.

**Passo a passo:**

1. Acesse [myaccount.google.com](https://myaccount.google.com) → **Segurança**
2. Ative **Verificação em 2 etapas** (obrigatório)
3. Pesquise **"Senhas de app"** → crie uma para "Email / Outro"
4. Copie os 16 caracteres gerados (sem espaços)
5. No Railway → Variables, adicione:
   - `EMAIL_HOST_USER` = seu email Gmail
   - `EMAIL_HOST_PASSWORD` = os 16 caracteres copiados
6. Após salvar, o Railway faz redeploy automático

**Verificar nos logs do Railway:**
```
✅ Email enviado ao dono: novo pedido de [Cliente]
✅ Email de confirmação enviado para: [email@cliente.com]
```

---

## Funcionalidades do Painel Admin (`/admin-login`)

| Aba | Funcionalidades |
|---|---|
| **Cadastrar** | Criar produto com múltiplas imagens, categoria e descrição |
| **Produtos** | Ativar/desativar, editar, trocar imagens |
| **Pedidos Portfólio** | Ver itens, preços, status, endereço, atualizar status |
| **Pedidos Personalizados** | Ver combinações, imagens de referência, atualizar status |
| **Estoque** | Gerenciar tamanhos e quantidades |
| **Informações** | Editar galeria da Home |

---

## Endpoints Principais da API

| Método | Endpoint | Acesso |
|---|---|---|
| `GET` | `/api/produtos/` | Público |
| `POST` | `/api/pedidos/` | Público |
| `POST` | `/api/pedidos-personalizados/` | Público |
| `POST` | `/api/admin-login/` | Público |
| `GET/PATCH/DELETE` | `/api/pedidos/{id}/` | Admin |
| `GET/PATCH/DELETE` | `/api/pedidos-personalizados/{id}/` | Admin |
| `POST` | `/api/estoques/atualizar/` | Admin |

---

## Dimensões de Imagens Recomendadas

| Uso | Dimensão | Proporção | Formato |
|---|---|---|---|
| Produto no portfólio | 800×800px | 1:1 quadrada | JPG/WebP |
| Hero (tela cheia) | 1920×1080px | 16:9 paisagem | JPG |
| Foto institucional | 1200×900px | 4:3 | JPG |

---

## Problemas Comuns

| Erro | Solução |
|---|---|
| `No module named 'mssql'` | `pip install django-mssql-backend pyodbc` |
| `Login failed for user` | Verifique DB_USER e DB_PASSWORD no .env |
| `CORS error` no frontend | Confirme que o backend está rodando e CORS está configurado |
| `500 Internal Server Error` | Verifique os logs do Railway — geralmente erro de import |
| Emails não enviando | Confirme EMAIL_HOST_PASSWORD com Senha de App (não senha normal) |
| Imagens não aparecem localmente | Normal — Cloudinary só funciona em produção |

---

*Desenvolvido por [Matheus Costa Rodrigues](https://github.com/Mattheusmcr)*  
*Metzker Soluções © 2026*