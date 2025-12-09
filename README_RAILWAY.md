# Deploy no Railway - Guia Completo

Este guia explica como fazer deploy do StackHabit no Railway (frontend, backend e banco de dados).

## 📋 Pré-requisitos

1. Conta no Railway: https://railway.app
2. Conta no GitHub (para conectar o repositório)
3. Banco de dados PostgreSQL no Railway (já configurado)

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que seu código está no GitHub.

### 2. Criar Projeto no Railway

1. Acesse https://railway.app
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha seu repositório

### 3. Configurar Banco de Dados (PostgreSQL)

O Railway já fornece as variáveis de ambiente automaticamente quando você adiciona um serviço PostgreSQL:

- `DATABASE_URL`: URL **privada** do banco (para uso dentro do Railway - **SEM custos de egress**)
- `DATABASE_PUBLIC_URL`: URL pública externa (para desenvolvimento local - **gera custos de egress**)

**⚠️ IMPORTANTE:**
- **Produção (Railway)**: Use sempre `DATABASE_URL` (endpoint privado, sem custos)
- **Desenvolvimento Local**: Use `DATABASE_PUBLIC_URL` apenas se necessário (gera custos de egress)

**Variáveis do seu banco:**
```
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
DATABASE_PUBLIC_URL=postgresql://postgres:password@shortline.proxy.rlwy.net:35094/railway
```

**💡 Recomendação:**
Para desenvolvimento local, use um banco PostgreSQL local ou configure `DATABASE_URL` no `appsettings.Development.json` apenas quando necessário testar com o banco do Railway.

### 4. Adicionar Serviço Backend

1. No projeto Railway, clique em "+ New" → "GitHub Repo"
2. Selecione o mesmo repositório
3. Configure:
   - **Root Directory**: `backend/StackHabit.API`
   - **Build Command**: `dotnet restore && dotnet build`
   - **Start Command**: `dotnet run --urls http://0.0.0.0:$PORT`

4. **Variáveis de Ambiente** (Settings → Variables):
   
   **⚠️ IMPORTANTE**: Todas as API keys e secrets devem ser configuradas como variáveis de ambiente no Railway. NÃO coloque valores sensíveis no código!
   
   O Railway já injeta automaticamente:
   - `DATABASE_URL` (do serviço PostgreSQL)
   - `PORT` (porta do serviço)
   
   Você precisa adicionar manualmente:
   ```
   JWT_KEY=sua-chave-jwt-secreta-aqui-minimo-32-caracteres
   JWT_ISSUER=StackHabit
   CORS_ORIGINS=https://seu-frontend.railway.app
   OPENAI_API_KEY=sua-chave-openai-aqui
   ASPNETCORE_ENVIRONMENT=Production
   ```
   
   **Como adicionar variáveis no Railway**:
   1. No serviço (Backend ou Frontend), clique em "Variables"
   2. Clique em "+ New Variable"
   3. Adicione o nome e valor
   4. Salve (o serviço será reiniciado automaticamente)
   
   **Nota**: O código está configurado para usar variáveis de ambiente primeiro, e só usa `appsettings.json` como fallback para desenvolvimento local.

5. **Generate Domain** para obter a URL do backend (ex: `backend-production.up.railway.app`)

### 5. Adicionar Serviço Frontend

1. No projeto Railway, clique em "+ New" → "GitHub Repo"
2. Selecione o mesmo repositório
3. Configure:
   - **Root Directory**: `frontend/stackhabit-app`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

4. **Variáveis de Ambiente** (Settings → Variables):
   ```
   VITE_API_URL=https://seu-backend.railway.app
   PORT=4173
   NODE_ENV=production
   ```

5. **Generate Domain** para obter a URL do frontend

### 6. Atualizar CORS no Backend

Após obter a URL do frontend, atualize a variável `CORS_ORIGINS` no backend:
```
CORS_ORIGINS=https://seu-frontend.railway.app
```

### 7. Executar Migrations

O backend usa `EnsureCreated()` que cria o banco automaticamente na primeira execução. Se preferir usar migrations:

```bash
# Localmente, antes do deploy:
cd backend/StackHabit.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 🔧 Configurações Importantes

### Backend (.NET)

- **Porta**: Railway injeta a variável `PORT` automaticamente
- **Database**: Connection string do Railway via variável `DATABASE_URL` (injetada automaticamente)
- **CORS**: Deve incluir a URL do frontend no Railway via variável `CORS_ORIGINS`
- **Secrets**: Todas as API keys via variáveis de ambiente (não hardcoded)

### Frontend (React/Vite)

- **API URL**: Deve apontar para a URL do backend no Railway
- **Build**: Railway executa `npm run build` automaticamente
- **Preview**: Usa `vite preview` para servir os arquivos estáticos

## 📝 Checklist de Deploy

- [ ] Backend deployado e rodando
- [ ] Frontend deployado e rodando
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado com URL do frontend
- [ ] Banco de dados acessível (Railway PostgreSQL)
- [ ] URLs geradas e funcionando
- [ ] Testar login/registro
- [ ] Testar criação de hábitos

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se `DATABASE_URL` está sendo injetada automaticamente pelo Railway
- Verifique se `JWT_KEY` tem pelo menos 32 caracteres
- Verifique os logs no Railway

### Frontend não conecta ao backend
- Verifique se `VITE_API_URL` está correto
- Verifique se CORS está configurado no backend
- Verifique se o backend está rodando

### Erro de conexão com banco
- Verifique se a connection string do Railway está correta
- Verifique se o serviço PostgreSQL está rodando no Railway
- Para desenvolvimento local, use um banco PostgreSQL local (recomendado)
- ⚠️ Evite usar `DATABASE_PUBLIC_URL` - gera custos de egress

## 💰 Custos

- **Railway Hobby**: $5/mês (inclui $5 de crédito)
- **PostgreSQL no Railway**: Incluído no plano Hobby
- **Total**: ~$5/mês ou grátis se usar créditos do Railway

## 🔗 URLs

Após o deploy, você terá:
- Frontend: `https://seu-frontend.railway.app`
- Backend: `https://seu-backend.railway.app`
- API Docs: `https://seu-backend.railway.app/swagger` (se habilitado)

## 🔒 Segurança

- ✅ Todas as API keys são gerenciadas via variáveis de ambiente
- ✅ Connection strings não estão hardcoded no código
- ✅ JWT keys são configuradas via variáveis de ambiente
- ✅ CORS está configurado para permitir apenas o frontend autorizado
