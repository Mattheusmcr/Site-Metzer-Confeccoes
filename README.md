# Metzker Soluções — Documentação do Projeto

> Uniformes e Comunicação Visual para empresas · Vila Velha, ES  
> Site: [www.metzkersolucoes.com.br](https://www.metzkersolucoes.com.br)

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
11. [Sistema de Notificações por Email](#11-sistema-de-notificações-por-email)
12. [Segurança](#12-segurança)
13. [Contatos e Referências](#13-contatos-e-referências)

---

## 1. Visão Geral

Sistema completo de e-commerce e portfólio para a **Metzker Soluções**, empresa de confecções e comunicação visual em Vila Velha, ES.

**Funcionalidades principais:**
- Portfólio de produtos com catálogo, carrinho e finalização de pedidos
- Pedidos do catálogo com controle de estoque automático
- Pedidos personalizados com combinações de cor + tamanho + material
- Upload de imagens de referência pelo cliente
- Painel administrativo completo (produtos, estoque, pedidos, galeria)
- Notificações automáticas por email ao dono e ao cliente
- Tabela de medidas interativa (Tradicional e Baby Look)
- SEO configurado com sitemap.xml e robots.txt
- Domínio próprio: metzkersolucoes.com.br

---

## 2. Stack de Tecnologias

### Backend

| Tecnologia | Uso |
|---|---|
| Django 4.2 | Framework web principal |
| Django REST Framework | API REST |
| SimpleJWT | Autenticação JWT para o admin |
| PostgreSQL | Banco de dados em produção (Railway) |
| SQL Server | Banco de dados em desenvolvimento local |
| Cloudinary | Storage de imagens (produtos e referências) |
| Whitenoise | Arquivos estáticos em produção |
| dj-database-url | Configuração do banco via env var |
| Gunicorn | Servidor WSGI em produção |
| python-dotenv | Leitura do `.env` local |

### Frontend

| Tecnologia | Uso |
|---|---|
| React 19 | Framework de interface |
| Vite 6 | Build tool e dev server |
| React Router DOM 7 | Roteamento SPA com ScrollToTop |
| Axios | Requisições HTTP com interceptors JWT |
| Tailwind CSS 3 | Classes utilitárias de estilo |

### Infraestrutura

| Serviço | Finalidade |
|---|---|
| Railway (Hobby) | Backend Django + PostgreSQL |
| Vercel (Hobby) | Frontend React |
| Cloudinary (Free) | Storage de imagens |
| GitHub | CI/CD automático |
| ViaCEP | Auto-preenchimento de endereço por CEP |
| Gmail SMTP | Envio de emails de notificação |

---

## 3. URLs de Produção

| Serviço | URL |
|---|---|
| Site (frontend) | https://www.metzkersolucoes.com.br |
| API (backend) | https://api.metzkersolucoes.com.br |
| API Produtos | https://api.metzkersolucoes.com.br/api/produtos/ |
| API Pedidos | https://api.metzkersolucoes.com.br/api/pedidos/ |
| API Personalizados | https://api.metzkersolucoes.com.br/api/pedidos-personalizados/ |
| Django Admin | https://api.metzkersolucoes.com.br/admin/ |

---

## 4. Estrutura de Pastas

```
metzker-confeccoes/
│
├── backend/
│   ├── metzker/
│   │   ├── settings.py        # DB, Cloudinary, JWT, CORS, Email SMTP
│   │   ├── urls.py            # Rotas da API + domínio próprio
│   │   └── wsgi.py
│   ├── core/
│   │   ├── models.py          # Produto, Pedido, Estoque, PedidoPersonalizado...
│   │   ├── serializers.py     # Serializers DRF com criação de itens e estoque
│   │   ├── views.py           # ViewSets + notificações
│   │   ├── notificacoes.py    # Módulo de email (dono + cliente)
│   │   └── admin.py
│   ├── create_admin.py        # Cria superusuário via env vars
│   ├── Dockerfile             # Build Railway
│   ├── requirements.txt
│   └── .env                   # Variáveis locais (não subir no Git)
│
└── frontend/
    ├── public/
    │   ├── LogoEmpresaMetzker.jpg
    │   ├── FotoMetkzerepai.jpg    # Foto da missão
    │   ├── ImagemPrincipal.jpg    # Hero slides (1-4)
    │   ├── Galeria1.jpeg          # Portfólio (3 fotos)
    │   ├── sitemap.xml            # SEO
    │   └── robots.txt             # SEO
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Menu + carrinho + hamburguer mobile
    │   │   └── RotaAdmin.jsx      # Proteção de rotas
    │   ├── context/
    │   │   ├── AuthContext.jsx    # JWT login/logout
    │   │   ├── CartContext.jsx    # Carrinho global
    │   │   └── ThemeContext.jsx   # Tema fixo claro
    │   ├── pages/
    │   │   ├── Home.jsx           # Landing page B2B
    │   │   ├── Catalogo.jsx       # Grid de produtos com filtros
    │   │   ├── ProdutoDetalhe.jsx # Página do produto + tabela de medidas
    │   │   ├── Pedidos.jsx        # Checkout com email obrigatório
    │   │   ├── Personalizado.jsx  # Wizard de pedido personalizado
    │   │   ├── Admin.jsx          # Painel administrativo completo
    │   │   └── AdminLogin.jsx     # Login do admin
    │   ├── services/api.js        # Axios + interceptors JWT
    │   ├── App.jsx                # Rotas + ScrollToTop
    │   └── main.jsx
    ├── vercel.json                # Rewrites SPA + headers SEO
    └── .env                       # VITE_API_URL (não subir no Git)
```

---

## 5. Modelos do Banco de Dados

### Produto
- `nome`, `descricao`, `preco`, `ativo`
- `categoria`: `roupas` | `comunicacao`
- `subcategoria`: `gola-polo` | `camisa-comum` | `calca` | `logos-acm` | `impressoes`
- Relacionado com: `Estoque` (tamanho + quantidade), `ProdutoImagem` (múltiplas fotos)

### Pedido (catálogo)
- Dados do cliente: nome, telefone, **email**, endereço completo
- Itens com produto, tamanho e quantidade
- Desconta estoque automaticamente ao confirmar
- Forma de pagamento e observações

### PedidoPersonalizado
- Categoria: `roupas` ou `comunicacao`
- Combinações com cor, material, tamanhos por grupo (Adulto/Baby Look/Infantil)
- Mínimo de 20 unidades para roupas
- **5 campos de imagem** (`imagem1..5`) salvos no Cloudinary
- Status: `novo` | `em_andamento` | `concluido` | `cancelado`

### Estoque
- Quantidade disponível por produto e tamanho
- Descontado automaticamente ao confirmar pedido

---

## 6. Variáveis de Ambiente

### Backend — `backend/.env` (desenvolvimento local)

```env
DJANGO_SECRET_KEY=qualquer-chave-longa
DJANGO_DEBUG=True
DB_NAME=metzker_db
DB_USER=metzker-confeccoes
DB_PASSWORD=sua-senha
DB_HOST=DESKTOP-XXXXX\SQLEXPRESS
```

### Backend — Railway (produção)

| Variável | Descrição |
|---|---|
| `DJANGO_SECRET_KEY` | Chave secreta Django |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `site-metzker-confeccoes-production.up.railway.app,api.metzkersolucoes.com.br` |
| `DATABASE_URL` | URL PostgreSQL (automático Railway) |
| `CORS_ALLOWED_ORIGINS` | `https://www.metzkersolucoes.com.br,https://site-metzer-confeccoes.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | `dywfismgs` |
| `CLOUDINARY_API_KEY` | Chave pública Cloudinary |
| `CLOUDINARY_API_SECRET` | Chave secreta Cloudinary |
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_EMAIL` | `andremetzkrr@gmail.com` |
| `DJANGO_SUPERUSER_PASSWORD` | Senha do admin |
| `EMAIL_HOST_USER` | `andremetzkrr@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Senha de App Gmail (16 chars) |

> ⚠️ **Não adicionar** `CLOUDINARY_URL` — causa conflito.

### Frontend — `frontend/.env`

```env
# Desenvolvimento local
VITE_API_URL=http://localhost:8000/api/

# Produção (configurar no painel Vercel)
VITE_API_URL=https://api.metzkersolucoes.com.br/api/
```

---

## 7. Como Rodar Localmente

### Pré-requisitos

- Python 3.10+
- Node.js 20+
- SQL Server Express + SSMS
- Git

### Backend

```bash
# 1. Clone o repositório
git clone https://github.com/Mattheusmcr/Site-Metzer-Confeccoes.git
cd Site-Metzer-Confeccoes/backend

# 2. Crie e ative o ambiente virtual
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Crie o arquivo backend/.env (copie o modelo acima)

# 5. Crie o banco metzker_db no SSMS
#    No SSMS: clique direito em Databases → New Database → metzker_db

# 6. Rode as migrations
python manage.py makemigrations
python manage.py migrate

# 7. Crie o superusuário
python manage.py createsuperuser

# 8. Inicie o servidor
python manage.py runserver
# API disponível em: http://localhost:8000/api/
```

> **Dica**: O nome do servidor SQL está na tela de login do SSMS.  
> Formato: `DESKTOP-XXXXXXX\SQLEXPRESS`

### Frontend

```bash
# 1. Entre na pasta frontend
cd ../frontend

# 2. Instale as dependências
npm install

# 3. Crie frontend/.env com VITE_API_URL=http://localhost:8000/api/

# 4. Inicie o servidor de desenvolvimento
npm run dev
# Site disponível em: http://localhost:5173
```

### Rodar os dois ao mesmo tempo

Abra **dois terminais**:

```bash
# Terminal 1 — Backend
cd backend && venv\Scripts\activate && python manage.py runserver

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Problemas comuns

| Erro | Solução |
|---|---|
| `No module named 'mssql'` | `pip install django-mssql-backend pyodbc` |
| `Login failed for user` | Verifique DB_USER e DB_PASSWORD no .env |
| `Cannot open database` | Confirme que criou `metzker_db` no SSMS |
| `CORS error` no frontend | Backend precisa estar rodando na porta 8000 |
| `ModuleNotFoundError: cloudinary` | `pip install cloudinary django-cloudinary-storage` |
| Imagens não aparecem localmente | Normal — Cloudinary só funciona em produção |

---

## 8. Fluxo de Deploy

O projeto usa **CI/CD automático via GitHub**. Todo push na branch `main` dispara:
- **Railway** → novo build do backend via Dockerfile
- **Vercel** → novo build do frontend

### Deploy de uma atualização

```bash
git add .
git commit -m "descrição da mudança"
git push origin main
```

### Forçar redeploy sem alterações

```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

### Forçar rebuild completo (limpar cache Docker)

Incremente o número em `ARG CACHE_BUST=XX` no `Dockerfile` e faça push.

### O Dockerfile executa em ordem

1. Instala dependências Python
2. Roda `collectstatic`
3. No startup: `migrate` → cria admin → inicia Gunicorn

---

## 9. Painel Administrativo

Acesse em `/admin-login` no site.

| Aba | Funcionalidades |
|---|---|
| **Cadastrar** | Adicionar produto com múltiplas imagens, categoria, subcategoria e descrição justificada |
| **Produtos** | Ativar/desativar, editar, trocar imagens (upload acumulativo) |
| **Pedidos — Portfólio** | Ver pedidos com itens, preço unitário, total, endereço, pagamento |
| **Pedidos — Personalizados** | Ver combinações cor+material+tamanhos, imagens de referência, atualizar status |
| **Estoque** | Gerenciar tamanhos e quantidades (produtos de roupa e formatos de comunicação visual) |
| **Informações** | Editar galeria de trabalhos da Home |

---

## 10. Endpoints da API

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/produtos/` | Público | Lista produtos ativos |
| `POST` | `/api/produtos/` | Admin | Cria produto com imagens |
| `PATCH` | `/api/produtos/{id}/` | Admin | Atualiza produto |
| `DELETE` | `/api/produtos/{id}/` | Admin | Remove produto |
| `GET` | `/api/pedidos/` | Admin | Lista pedidos do catálogo |
| `POST` | `/api/pedidos/` | Público | Cria pedido (salva itens + desconta estoque) |
| `DELETE` | `/api/pedidos/{id}/` | Admin | Remove pedido |
| `GET` | `/api/pedidos-personalizados/` | Admin | Lista pedidos personalizados |
| `POST` | `/api/pedidos-personalizados/` | Público | Cria pedido + salva imagens (multipart) |
| `PATCH` | `/api/pedidos-personalizados/{id}/` | Admin | Atualiza status |
| `DELETE` | `/api/pedidos-personalizados/{id}/` | Admin | Remove pedido |
| `GET` | `/api/estoques/` | Admin | Lista estoque |
| `POST` | `/api/estoques/atualizar/` | Admin | Atualiza estoque |
| `POST` | `/api/admin-login/` | Público | Login admin → retorna JWT |
| `POST` | `/api/token/refresh/` | Público | Renova token JWT |

---

## 11. Sistema de Notificações por Email

Ao criar um pedido (catálogo ou personalizado), o sistema envia automaticamente:

- **Para o dono**: email com todos os detalhes do pedido
- **Para o cliente**: email de confirmação no endereço informado

### Configurar Gmail SMTP no Railway

1. Acesse [myaccount.google.com](https://myaccount.google.com) → **Segurança**
2. Ative **Verificação em 2 etapas**
3. Acesse [Senhas de app](https://myaccount.google.com/apppasswords)
4. Crie uma senha para "Email / Outro" → copie os 16 caracteres
5. No Railway → Variables, adicione:

```
EMAIL_HOST_USER     = andremetzkrr@gmail.com
EMAIL_HOST_PASSWORD = (16 caracteres sem espaços)
```

### Verificar funcionamento

Nos logs do Railway após um pedido:
```
✅ Email enviado ao dono: novo pedido de João
✅ Email de confirmação enviado para: joao@email.com
```

---

## 12. Segurança

- **`.env` nunca sobe no Git** — está no `.gitignore`
- **`create_admin.py`** lê credenciais via variáveis de ambiente, sem senhas no código
- `DJANGO_DEBUG=False` em produção
- **CORS** aceita apenas os domínios configurados
- **JWT** expira em 2 horas
- Imagens no **Cloudinary** — Railway não armazena arquivos
- Não usar `CLOUDINARY_URL` — usar apenas as 3 variáveis separadas

### Remover arquivo sensível do histórico Git

```bash
pip install git-filter-repo
git filter-repo --path backend/create_admin.py --invert-paths
git push origin main --force
```

---

## 13. Contatos e Referências

| Item | Valor |
|---|---|
| WhatsApp | (27) 99787-8391 |
| Email | andremetzkrr@gmail.com |
| Localização | Polo Têxtil Santa Inês, Vila Velha — ES |
| Repositório | github.com/Mattheusmcr/Site-Metzer-Confeccoes |
| Cloudinary | cloudinary.com — cloud: `dywfismgs` |
| Railway | railway.app |
| Vercel | vercel.com |
| Desenvolvido por | Matheus Costa Rodrigues — github.com/Mattheusmcr |

---

*Metzker Soluções © 2026 — Desenvolvido por Matheus Costa Rodrigues*