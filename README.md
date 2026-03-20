# Metzker Soluções — Documentação do Projeto

> E-commerce de confecções e comunicação visual · Vila Velha, ES

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack de Tecnologias](#2-stack-de-tecnologias)
3. [URLs de Produção](#3-urls-de-produção)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Modelos do Banco de Dados](#5-modelos-do-banco-de-dados)
6. [Variáveis de Ambiente](#6-variáveis-de-ambiente)
7. [Como Rodar Localmente](#7-como-rodar-localmente)
8. [Fluxo de Deploy](#8-fluxo-de-deploy)
9. [Painel Administrativo](#9-painel-administrativo)
10. [Endpoints da API](#10-endpoints-da-api)
11. [Segurança](#11-segurança)
12. [Contatos e Referências](#12-contatos-e-referências)

---

## 1. Visão Geral

A **Metzker Soluções** é um sistema completo de e-commerce e portfólio para uma empresa de confecções e comunicação visual localizada em Vila Velha, ES.

O projeto permite que clientes:
- Naveguem pelo portfólio de produtos por categoria e subcategoria
- Adicionem itens ao carrinho e finalizem pedidos com endereço e pagamento
- Solicitem pedidos personalizados de roupas (com tamanhos e quantidades exatas) ou comunicação visual (logos ACM, impressões digitais)
- Enviem pedidos diretamente pelo WhatsApp ou registrem no painel

O painel administrativo permite que o dono gerencie produtos, pedidos, estoque e galeria de trabalhos sem necessidade de acesso técnico.

---

## 2. Stack de Tecnologias

### Backend

| Tecnologia | Uso |
|---|---|
| Django 4.2 | Framework web principal |
| Django REST Framework | API REST para comunicação com o frontend |
| SimpleJWT | Autenticação via token JWT para o painel admin |
| PostgreSQL | Banco de dados em produção (Railway) |
| SQL Server | Banco de dados em desenvolvimento local |
| Cloudinary | Armazenamento de imagens dos produtos em nuvem |
| Whitenoise | Servir arquivos estáticos em produção |
| dj-database-url | Configuração do banco via variável de ambiente |
| Gunicorn | Servidor WSGI para produção |
| python-dotenv | Leitura do arquivo `.env` |

### Frontend

| Tecnologia | Uso |
|---|---|
| React 19 | Framework de interface |
| Vite 6 | Build tool e servidor de desenvolvimento |
| React Router DOM 7 | Roteamento de páginas SPA |
| Axios | Requisições HTTP para a API |
| Tailwind CSS 3 | Classes utilitárias de estilo |

### Infraestrutura

| Serviço | Finalidade |
|---|---|
| Railway (Hobby) | Hospedagem do backend Django + banco PostgreSQL |
| Vercel (Hobby) | Hospedagem do frontend React |
| Cloudinary (Free) | Storage de imagens dos produtos |
| GitHub | Versionamento e CI/CD automático |
| ViaCEP (API pública) | Preenchimento automático de endereço pelo CEP |

---

## 3. URLs de Produção

| Serviço | URL |
|---|---|
| Frontend (Vercel) | https://site-metzer-confeccoes.vercel.app |
| Backend API (Railway) | https://site-metzker-confeccoes-production.up.railway.app |
| API Produtos | `/api/produtos/` |
| API Pedidos | `/api/pedidos/` |
| API Personalizados | `/api/pedidos-personalizados/` |
| Django Admin | `/admin/` |

---

## 4. Estrutura de Pastas

```
metzker-confeccoes/
│
├── backend/
│   ├── metzker/                  # Configurações principais do Django
│   │   ├── settings.py           # DB, Cloudinary, JWT, CORS, static
│   │   ├── urls.py               # Rotas da API
│   │   └── wsgi.py
│   ├── core/                     # App principal
│   │   ├── models.py             # Produto, Pedido, Estoque, PedidoPersonalizado...
│   │   ├── serializers.py        # Serializers DRF
│   │   ├── views.py              # ViewSets da API
│   │   └── admin.py
│   ├── create_admin.py           # Script de criação do superusuário (via env vars)
│   ├── Dockerfile                # Build para Railway
│   ├── requirements.txt          # Dependências Python
│   └── .env                      # Variáveis locais (nunca subir no Git)
│
└── frontend/
    ├── public/
    │   ├── LogoEmpresaMetzker.jpg
    │   ├── Galeria1.jpeg
    │   ├── Galeria2.jpeg
    │   └── Galeria3.jpeg
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Menu com hamburguer mobile + carrinho
    │   │   └── RotaAdmin.jsx     # Proteção de rotas admin
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Login/logout admin via JWT
    │   │   ├── CartContext.jsx   # Estado global do carrinho
    │   │   └── ThemeContext.jsx  # Tema fixo claro
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Catalogo.jsx
    │   │   ├── ProdutoDetalhe.jsx
    │   │   ├── Pedidos.jsx
    │   │   ├── Personalizado.jsx
    │   │   ├── Admin.jsx
    │   │   └── AdminLogin.jsx
    │   ├── services/
    │   │   └── api.js            # Axios + interceptors JWT
    │   ├── App.jsx               # Rotas principais
    │   └── main.jsx
    ├── vercel.json               # Rewrites para React Router
    ├── vite.config.js
    └── .env                      # VITE_API_URL (nunca subir no Git)
```

---

## 5. Modelos do Banco de Dados

### Produto
- `nome`, `descricao`, `preco`, `imagem`, `ativo`
- `categoria`: `roupas` | `comunicacao`
- `subcategoria`: `gola-polo` | `camisa-comum` | `calca` | `logos-acm` | `impressoes`
- Relacionado com: `Estoque` (tamanho + quantidade), `ProdutoImagem` (múltiplas fotos)

### Pedido / ItemPedido
- Dados completos do cliente: nome, telefone, endereço completo
- Itens com produto, tamanho e quantidade
- Forma de pagamento e observações

### PedidoPersonalizado
- Pedidos da aba *Faça o Seu Personalizado*
- Categoria (roupas ou comunicação visual)
- Tipos de produto, quantidades por tamanho, material, dimensões
- Dados completos do cliente + endereço
- `status`: `novo` | `em_andamento` | `concluido` | `cancelado`

### Institucional
- Imagens e textos institucionais (galeria da Home)

### Estoque
- Quantidade disponível por produto e tamanho

---

## 6. Variáveis de Ambiente

### Backend — `backend/.env` (desenvolvimento local)

```env
DJANGO_SECRET_KEY=sua-chave-secreta-longa
DJANGO_DEBUG=True
DB_NAME=metzker_db
DB_USER=metzker-confeccoes
DB_PASSWORD=sua-senha
DB_HOST=DESKTOP-XXXXX\SQLEXPRESS
```

### Backend — variáveis no Railway (produção)

| Variável | Descrição |
|---|---|
| `DJANGO_SECRET_KEY` | Chave secreta do Django (string longa e aleatória) |
| `DJANGO_DEBUG` | `False` em produção |
| `DJANGO_ALLOWED_HOSTS` | Domínio do Railway |
| `DATABASE_URL` | URL do PostgreSQL (referência automática Railway) |
| `CORS_ALLOWED_ORIGINS` | URL do frontend Vercel |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud Cloudinary |
| `CLOUDINARY_API_KEY` | Chave pública Cloudinary |
| `CLOUDINARY_API_SECRET` | Chave secreta Cloudinary |
| `DJANGO_SUPERUSER_USERNAME` | Username do admin |
| `DJANGO_SUPERUSER_EMAIL` | Email do admin |
| `DJANGO_SUPERUSER_PASSWORD` | Senha do admin |

> **Não adicionar** `CLOUDINARY_URL` — causou conflito com as 3 variáveis separadas acima.

### Frontend — `frontend/.env`

```env
# Desenvolvimento local
VITE_API_URL=http://localhost:8000/api/

# Produção (configurar no painel da Vercel)
VITE_API_URL=https://site-metzker-confeccoes-production.up.railway.app/api/
```

---

## 7. Como Rodar Localmente

### Pré-requisitos

- Python 3.10+
- Node.js 20+
- SQL Server Express instalado e rodando
- Git

### Backend

```bash
# 1. Clone o repositório
git clone https://github.com/Mattheusmcr/Site-Metzer-Confeccoes.git
cd Site-Metzer-Confeccoes/backend

# 2. Crie e ative o ambiente virtual
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure o .env (crie o arquivo backend/.env com as variáveis acima)

# 5. Crie o banco no SQL Server Management Studio com o nome metzker_db

# 6. Rode as migrations
python manage.py makemigrations
python manage.py migrate

# 7. Crie o superusuário
python manage.py createsuperuser

# 8. Inicie o servidor
python manage.py runserver
# API disponível em http://localhost:8000/api/
```

### Frontend

```bash
# 1. Entre na pasta frontend
cd ../frontend

# 2. Instale as dependências
npm install

# 3. Configure o .env
# Crie frontend/.env com VITE_API_URL=http://localhost:8000/api/

# 4. Inicie o servidor de desenvolvimento
npm run dev
# Frontend disponível em http://localhost:5173
```

---

## 8. Fluxo de Deploy

O projeto usa **CI/CD automático via GitHub**. Todo push na branch `main` dispara novos deploys:

- **Railway** detecta mudanças no backend e executa o `Dockerfile` automaticamente
- **Vercel** detecta mudanças no frontend e faz novo build automaticamente
- Não é necessário fazer deploy manual — apenas `git push`

### Para fazer deploy de uma atualização

```bash
git add .
git commit -m "descrição da mudança"
git push origin main
```

### Para forçar redeploy sem alterações

```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

### O Dockerfile executa em ordem

1. Instala dependências Python (`pip install`)
2. Roda `collectstatic` (arquivos estáticos)
3. No startup: `migrate` → cria admin → inicia Gunicorn

### Para forçar rebuild completo (limpar cache Docker)

Incremente o número em `ARG CACHE_BUST=XX` no `Dockerfile` e faça push.

---

## 9. Painel Administrativo

Acesse em `/admin-login` no frontend.

| Aba | Funcionalidade |
|---|---|
| Cadastrar | Adicionar novo produto com imagens, categoria e subcategoria |
| Produtos | Ativar/desativar, editar produto, trocar imagens |
| Pedidos — Portfólio | Ver pedidos do carrinho com itens, endereço e pagamento |
| Pedidos — Personalizados | Ver pedidos da aba Personalizado, atualizar status (Novo / Em andamento / Concluído / Cancelado) |
| Estoque | Gerenciar tamanhos e quantidades por produto |
| Informações | Editar galeria de trabalhos da Home (fotos) |

---

## 10. Endpoints da API

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/produtos/` | Público | Lista produtos ativos |
| `POST` | `/api/produtos/` | Admin | Cria produto com imagens |
| `PATCH` | `/api/produtos/{id}/` | Admin | Atualiza produto |
| `DELETE` | `/api/produtos/{id}/` | Admin | Remove produto |
| `GET` | `/api/pedidos/` | Admin | Lista todos os pedidos |
| `POST` | `/api/pedidos/` | Público | Cria pedido do carrinho |
| `DELETE` | `/api/pedidos/{id}/` | Admin | Remove pedido |
| `GET` | `/api/pedidos-personalizados/` | Admin | Lista pedidos personalizados |
| `POST` | `/api/pedidos-personalizados/` | Público | Cria pedido personalizado |
| `PATCH` | `/api/pedidos-personalizados/{id}/` | Admin | Atualiza status |
| `DELETE` | `/api/pedidos-personalizados/{id}/` | Admin | Remove pedido |
| `GET` | `/api/estoques/` | Admin | Lista estoque |
| `POST` | `/api/admin-login/` | Público | Login admin — retorna JWT |
| `POST` | `/api/token/refresh/` | Público | Renova token JWT |

---

## 11. Segurança

- **Nunca suba o `.env`** no GitHub — ele está no `.gitignore`
- O `create_admin.py` lê as credenciais **via variáveis de ambiente**, sem senhas no código
- Em produção, `DJANGO_DEBUG=False` desativa mensagens de erro detalhadas
- **CORS** configurado para aceitar apenas o domínio da Vercel em produção
- Tokens **JWT** expiram em 2 horas (configurável em `settings.py → SIMPLE_JWT`)
- Imagens armazenadas no **Cloudinary** — o servidor Railway não guarda arquivos
- Não adicionar `CLOUDINARY_URL` nas variáveis do Railway — usar apenas as 3 separadas
- Para trocar a senha do admin: Railway → Variables → `DJANGO_SUPERUSER_PASSWORD`

### Remover arquivo sensível do histórico do Git

```bash
pip install git-filter-repo
git filter-repo --path backend/create_admin.py --invert-paths
git push origin main --force
```

---

## 12. Contatos e Referências

| Item | Valor |
|---|---|
| WhatsApp | (27) 99787-8391 |
| Email | andremetzkrr@gmail.com |
| Localização | Polo Têxtil Santa Inês, Vila Velha — ES |
| Repositório | github.com/Mattheusmcr/Site-Metzer-Confeccoes |
| Cloudinary Dashboard | cloudinary.com/console — cloud: `dywfismgs` |
| Railway Dashboard | railway.app |
| Vercel Dashboard | vercel.com |

---

*Metzker Soluções © 2026*