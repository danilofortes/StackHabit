# 🚀 Guia de Deploy - StackHabit

Este guia explica como fazer deploy do StackHabit em produção.

## 📋 Arquitetura de Deploy

### Frontend (Vercel)
- ✅ **Vercel** - Hospedagem do frontend React
- ✅ Suporta React + Vite nativamente
- ✅ Deploy automático via Git

### Backend (.NET 8)
- ⚠️ **Vercel NÃO suporta .NET** - Use alternativas:
  - **Railway** (recomendado) - Fácil e gratuito
  - **Render** - Gratuito com sleep
  - **Fly.io** - Boa performance
  - **Azure App Service** - Microsoft
  - **AWS Elastic Beanstalk** - AWS

### Banco de Dados (PostgreSQL)
- ⚠️ **Vercel NÃO oferece banco de dados** - Use serviços gerenciados:
  - **Supabase** (recomendado) - PostgreSQL gratuito
  - **Neon** - PostgreSQL serverless
  - **Railway** - PostgreSQL incluído
  - **Render** - PostgreSQL incluído
  - **ElephantSQL** - PostgreSQL gratuito

## 🎯 Opção Recomendada: Railway (Backend + DB) + Vercel (Frontend)

### 1. Deploy do Backend no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project" → "Deploy from GitHub repo"
4. Selecione seu repositório
5. Railway detectará automaticamente o .NET
6. Adicione um serviço PostgreSQL:
   - Clique em "+ New" → "Database" → "PostgreSQL"
7. Configure as variáveis de ambiente:
   ```
   DATABASE_URL=<connection string do PostgreSQL>
   JWT_KEY=<sua chave secreta de pelo menos 32 caracteres>
   JWT_ISSUER=StackHabit
   JWT_EXPIRY_MINUTES=1440
   CORS_ORIGINS=https://seu-app.vercel.app
   ```
8. Railway gerará uma URL pública (ex: `https://seu-backend.railway.app`)

### 2. Deploy do Frontend no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Importe seu repositório
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/stackhabit-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Adicione variável de ambiente:
   ```
   VITE_API_URL=https://seu-backend.railway.app/api
   ```
7. Clique em "Deploy"

### 3. Atualizar CORS no Backend

Após o deploy do frontend, atualize a variável `CORS_ORIGINS` no Railway com a URL do Vercel:
```
CORS_ORIGINS=https://seu-app.vercel.app
```

## 🔄 Alternativa: Supabase (Banco) + Railway (Backend) + Vercel (Frontend)

### 1. Criar banco no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em "Settings" → "Database"
4. Copie a "Connection String" (URI)
5. Use no Railway como `DATABASE_URL`

### 2. Deploy do Backend no Railway

Siga os mesmos passos acima, mas use a connection string do Supabase.

## 📝 Variáveis de Ambiente

### Backend (Railway/Render/etc)

```env
DATABASE_URL=Host=...;Database=...;Username=...;Password=...
JWT_KEY=sua_chave_secreta_super_longa_de_pelo_menos_32_caracteres
JWT_ISSUER=StackHabit
JWT_EXPIRY_MINUTES=1440
CORS_ORIGINS=https://seu-app.vercel.app
```

### Frontend (Vercel)

```env
VITE_API_URL=https://seu-backend.railway.app/api
```

## 🛠️ Build e Teste Local

### Backend
```bash
cd backend/StackHabit.API
dotnet build
dotnet run
```

### Frontend
```bash
cd frontend/stackhabit-app
npm install
npm run build
npm run preview  # Testa o build de produção
```

## 🔍 Troubleshooting

### CORS Errors
- Verifique se `CORS_ORIGINS` inclui a URL exata do frontend (com https://)
- Certifique-se de que não há barra no final da URL

### Database Connection
- Verifique se a connection string está correta
- Para Supabase/Neon, use a connection string URI completa
- Certifique-se de que o banco permite conexões externas

### Frontend não conecta ao Backend
- Verifique se `VITE_API_URL` está configurada corretamente
- Certifique-se de que a URL termina com `/api`
- Verifique o console do navegador para erros

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Neon Docs](https://neon.tech/docs)

