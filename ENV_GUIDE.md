# Guia de Uso dos Arquivos .env

## 📋 Arquivos Criados

### Backend
- **`.env.example`** - Template com exemplos (será commitado)
- **`.env`** - Configuração local (NÃO será commitado, está no .gitignore)

### Frontend
- **`.env.example`** - Template com exemplos (será commitado)
- **`.env.local`** - Configuração local (NÃO será commitado, está no .gitignore)

## 🔧 Como Usar

### Backend (.NET)

**.NET não lê arquivos `.env` nativamente**, mas o projeto está configurado para usar variáveis de ambiente.

#### Desenvolvimento Local

O backend já está configurado para usar `appsettings.Development.json` que contém a connection string do Railway.

**Opções para usar variáveis de ambiente localmente:**

1. **Usar appsettings.Development.json** (já configurado) ✅
   - A connection string já está configurada
   - Funciona imediatamente

2. **Usar dotnet user-secrets** (recomendado para secrets locais):
   ```bash
   cd backend/StackHabit.API
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "sua-connection-string"
   dotnet user-secrets set "Jwt:Key" "sua-chave-jwt"
   ```

3. **Exportar variáveis manualmente** (Linux/Mac):
   ```bash
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/stackhabit"
   export JWT_KEY="sua-chave-jwt"
   dotnet run
   ```

4. **Usar um pacote DotNetEnv** (se preferir):
   ```bash
   dotnet add package DotNetEnv
   ```
   E adicionar no `Program.cs`:
   ```csharp
   DotNetEnv.Env.Load();
   ```

#### Produção (Railway)

No Railway, configure as variáveis de ambiente no painel:
- `DATABASE_URL` (injetada automaticamente pelo Railway)
- `JWT_KEY`
- `JWT_ISSUER`
- `CORS_ORIGINS`
- `OPENAI_API_KEY`

### Frontend (Vite)

O Vite lê automaticamente arquivos `.env.local` e `.env`.

#### Desenvolvimento Local

O arquivo `.env.local` já está criado e vazio, o que significa que o frontend usará o proxy do `vite.config.ts` (redireciona `/api` para `http://localhost:5000`).

**Para usar uma URL específica:**
```env
VITE_API_URL=http://localhost:5000
```

#### Produção (Railway)

Configure a variável de ambiente no Railway:
```
VITE_API_URL=https://seu-backend.railway.app
```

**Importante:** No Vite, variáveis de ambiente devem começar com `VITE_` para serem expostas ao código do frontend.

## 🔒 Segurança

- ✅ Arquivos `.env` e `.env.local` estão no `.gitignore`
- ✅ Apenas `.env.example` será commitado (sem secrets)
- ✅ Nunca commite arquivos `.env` com secrets reais

## 📝 Estrutura dos Arquivos

### Backend `.env.example`
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/stackhabit
JWT_KEY=YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!
JWT_ISSUER=StackHabit
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
OPENAI_API_KEY=
ASPNETCORE_ENVIRONMENT=Development
PORT=5000
```

### Frontend `.env.example`
```env
VITE_API_URL=http://localhost:5000
PORT=5173
```

## 🚀 Próximos Passos

1. **Desenvolvimento Local:**
   - Backend: Já configurado via `appsettings.Development.json`
   - Frontend: Já configurado via proxy do Vite

2. **Produção (Railway):**
   - Configure todas as variáveis de ambiente no painel do Railway
   - O Railway injeta automaticamente `DATABASE_URL` e `PORT`

3. **Para novos desenvolvedores:**
   - Copie `.env.example` para `.env` ou `.env.local`
   - Preencha com seus valores locais
   - Nunca commite o `.env` com secrets reais

