Metzker Soluções
Documentação do Projeto — Sistema Full Stack
E-commerce de confecções e comunicação visual · Vila Velha, ES
1. Visão Geral do Projeto
A Metzker Soluções é um sistema completo de e-commerce e portfólio para uma empresa de confecções e comunicação visual localizada em Vila Velha, ES. O projeto permite que clientes naveguem pelo portfólio de produtos, façam pedidos pelo carrinho ou diretamente pelo WhatsApp, e solicitem pedidos personalizados de logos, impressões e estampas.
O painel administrativo permite que o dono gerencie produtos, pedidos, estoque e galeria de trabalhos sem necessidade de acesso técnico.

2. Stack de Tecnologias
Backend
Tecnologia	Uso
Django 4.2	Framework web principal
Django REST Framework	API REST para comunicação com o frontend
SimpleJWT	Autenticação via token JWT para o painel admin
PostgreSQL	Banco de dados em produção (Railway)
SQL Server	Banco de dados em desenvolvimento local
Cloudinary	Armazenamento de imagens dos produtos em nuvem
Whitenoise	Servir arquivos estáticos em produção
dj-database-url	Configuração do banco via variável de ambiente
Gunicorn	Servidor WSGI para produção
python-dotenv	Leitura do arquivo .env

Frontend
Tecnologia	Uso
React 19	Framework de interface
Vite 6	Build tool e servidor de desenvolvimento
React Router DOM 7	Roteamento de páginas SPA
Axios	Requisições HTTP para a API
Tailwind CSS 3	Classes utilitárias de estilo
Framer Motion	Animações de interface

Infraestrutura
Serviço	Finalidade
Railway (Hobby)	Hospedagem do backend Django + banco PostgreSQL
Vercel (Hobby)	Hospedagem do frontend React
Cloudinary (Free)	Storage de imagens dos produtos
GitHub	Versionamento e CI/CD automático
ViaCEP (API pública)	Preenchimento automático de endereço pelo CEP

3. URLs de Produção
Serviço	URL
Frontend (Vercel)	https://site-metzer-confeccoes.vercel.app
Backend API (Railway)	https://site-metzker-confeccoes-production.up.railway.app
API Produtos	https://site-metzker-confeccoes-production.up.railway.app/api/produtos/
API Pedidos	https://site-metzker-confeccoes-production.up.railway.app/api/pedidos/
Django Admin	https://site-metzker-confeccoes-production.up.railway.app/admin/

4. Estrutura de Pastas
Backend (backend/)
backend/
├── metzker/              # Configurações principais do Django
│   ├── settings.py       # Configurações (DB, Cloudinary, JWT, CORS)
│   ├── urls.py           # Rotas da API
│   └── wsgi.py
├── core/                 # App principal
│   ├── models.py         # Modelos: Produto, Pedido, Estoque, etc.
│   ├── serializers.py    # Serializers DRF
│   ├── views.py          # ViewSets da API
│   └── admin.py
├── create_admin.py       # Script de criação do superusuário
├── Dockerfile            # Build para Railway
├── requirements.txt      # Dependências Python
└── .env                  # Variáveis locais (nunca subir no Git)

Frontend (frontend/)
frontend/
├── public/               # Arquivos estáticos públicos
│   ├── LogoEmpresaMetzker.jpg
│   ├── Galeria1.jpeg / Galeria2.jpeg / Galeria3.jpeg
├── src/
│   ├── components/       # Navbar, RotaAdmin
│   ├── context/          # AuthContext, CartContext, ThemeContext
│   ├── pages/            # Home, Catalogo, ProdutoDetalhe, Pedidos,
│   │                     #   Personalizado, Admin, AdminLogin
│   ├── services/         # api.js (Axios + interceptors JWT)
│   ├── App.jsx           # Rotas principais
│   └── main.jsx
├── vercel.json           # Config de deploy e rewrites
├── vite.config.js
└── .env                  # VITE_API_URL (nunca subir no Git)

5. Modelos do Banco de Dados
Produto
• nome, descricao, preco, imagem, ativo
• categoria: 'roupas' | 'comunicacao'
• subcategoria: gola-polo | camisa-comum | baby-look | infantil | calca | logos-acm | impressoes
• Relacionado com: Estoque (tamanho + quantidade), ProdutoImagem (múltiplas fotos)
Pedido / ItemPedido
• Dados completos do cliente: nome, telefone, endereço
• Itens com produto, tamanho e quantidade
• Desconta estoque automaticamente ao confirmar
PedidoPersonalizado
• Pedidos da aba 'Faça o Seu Personalizado'
• Tipos de produto, cores, material, descrição, fotos de referência
• Status: novo | em_andamento | concluido | cancelado
Institucional
• Textos e imagens do site (sobre, missão, galeria)

6. Variáveis de Ambiente
Backend — arquivo backend/.env (desenvolvimento local)
DJANGO_SECRET_KEY=sua-chave-secreta
DJANGO_DEBUG=True
DB_NAME=metzker_db
DB_USER=metzker-confeccoes
DB_PASSWORD=sua-senha
DB_HOST=DESKTOP-XXXXX\SQLEXPRESS

Backend — variáveis no Railway (produção)
Variável	Descrição
DJANGO_SECRET_KEY	Chave secreta do Django (senha longa)
DJANGO_DEBUG	False em produção
DJANGO_ALLOWED_HOSTS	Domínio do Railway (ex: metzker.railway.app)
DATABASE_URL	URL do PostgreSQL (referência automática Railway)
CORS_ALLOWED_ORIGINS	URL do frontend Vercel
CLOUDINARY_CLOUD_NAME	Nome do cloud Cloudinary
CLOUDINARY_API_KEY	Chave pública Cloudinary
CLOUDINARY_API_SECRET	Chave secreta Cloudinary
DJANGO_SUPERUSER_USERNAME	Username do admin
DJANGO_SUPERUSER_EMAIL	Email do admin
DJANGO_SUPERUSER_PASSWORD	Senha do admin

Frontend — arquivo frontend/.env
VITE_API_URL=http://localhost:8000/api/
Em produção, a Vercel usa a variável configurada no painel:
VITE_API_URL=https://site-metzker-confeccoes-production.up.railway.app/api/

7. Como Rodar o Projeto Localmente
Pré-requisitos
• Python 3.10+ instalado
• Node.js 20+ instalado
• SQL Server Express instalado e rodando
• Git instalado

Backend
1. Clone o repositório e entre na pasta backend:
git clone https://github.com/SEU_USUARIO/metzker-confeccoes.git
cd metzker-confeccoes/backend
2. Crie e ative o ambiente virtual:
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate       # Linux/Mac
3. Instale as dependências:
pip install -r requirements.txt
4. Configure o arquivo .env (copie o exemplo abaixo):
DJANGO_SECRET_KEY=qualquer-chave-longa
DJANGO_DEBUG=True
DB_NAME=metzker_db
DB_USER=metzker-confeccoes
DB_PASSWORD=sua-senha
DB_HOST=DESKTOP-XXXXX\SQLEXPRESS
5. Crie o banco no SQL Server Management Studio com o nome metzker_db
6. Rode as migrations e crie o superusuário:
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
7. Inicie o servidor:
python manage.py runserver
API disponível em: http://localhost:8000/api/

Frontend
1. Entre na pasta frontend:
cd ../frontend
2. Instale as dependências:
npm install
3. Configure o arquivo .env:
VITE_API_URL=http://localhost:8000/api/
4. Inicie o servidor de desenvolvimento:
npm run dev
Frontend disponível em: http://localhost:5173

8. Fluxo de Deploy (CI/CD)
O projeto usa CI/CD automático via GitHub. Todo push na branch main dispara novos deploys:
• Railway detecta mudanças no backend e executa o Dockerfile automaticamente
• Vercel detecta mudanças no frontend e faz novo build automaticamente
• Não é necessário fazer deploy manual — apenas git push

Para fazer deploy de uma atualização:
git add .
git commit -m "descrição da mudança"
git push origin main

O Dockerfile executa em ordem:
• Instala dependências Python
• Roda collectstatic (arquivos estáticos)
• No startup: migrate → cria admin → inicia Gunicorn

9. Painel Administrativo
Acesse em: /admin-login no frontend ou /admin/ no backend Django
Aba	Funcionalidade
Cadastrar	Adicionar novo produto com imagens, categoria e subcategoria
Produtos	Ativar/desativar, editar produto, trocar imagens
Pedidos — Portfólio	Ver pedidos do carrinho com itens, endereço e pagamento
Pedidos — Personalizados	Ver pedidos da aba Personalizado, atualizar status
Estoque	Gerenciar tamanhos e quantidades por produto
Informações	Editar galeria de trabalhos da Home (fotos)

10. Endpoints da API
Endpoint	Descrição
GET /api/produtos/	Lista produtos ativos
POST /api/produtos/	Cria produto (admin)
PATCH /api/produtos/{id}/	Atualiza produto (admin)
DELETE /api/produtos/{id}/	Remove produto (admin)
GET /api/pedidos/	Lista pedidos (admin)
POST /api/pedidos/	Cria pedido (público)
GET /api/pedidos-personalizados/	Lista pedidos personalizados (admin)
POST /api/pedidos-personalizados/	Cria pedido personalizado (público)
POST /api/estoques/atualizar/	Atualiza estoque (admin)
POST /api/admin-login/	Login do admin — retorna JWT
POST /api/token/refresh/	Renova token JWT

11. Boas Práticas e Segurança
• Nunca suba o arquivo .env no GitHub — ele está no .gitignore
• O arquivo create_admin.py lê as credenciais via variáveis de ambiente, sem senhas no código
• Em produção, DJANGO_DEBUG=False desativa mensagens de erro detalhadas
• CORS configurado para aceitar apenas o domínio da Vercel em produção
• Tokens JWT expiram em 2 horas (configurável em settings.py › SIMPLE_JWT)
• Imagens são armazenadas no Cloudinary — o servidor Railway não guarda arquivos
• Trocar senha do admin: Railway › Variables › DJANGO_SUPERUSER_PASSWORD

12. Contatos e Referências
Item	Valor
WhatsApp	(27) 99787-8391
Email	andremetzkrr@gmail.com
Localização	Polo Têxtil Santa Inês, Vila Velha — ES
Repositório	github.com/Mattheusmcr/Site-Metzer-Confeccoes
Cloudinary Dashboard	cloudinary.com/console — cloud: dywfismgs
Railway Dashboard	railway.app — projeto: prosperidade-contentamento
Vercel Dashboard	vercel.com — projeto: site-metzer-confeccoes

