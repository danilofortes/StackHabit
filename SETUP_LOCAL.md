# 🛠️ Configuração Local - StackHabit

## ✅ PostgreSQL Configurado

O PostgreSQL foi instalado e configurado com:
- **Database**: `stackhabit`
- **Usuário**: `postgres`
- **Senha**: `postgres`
- **Host**: `localhost`
- **Porta**: `5432`

## 🚀 Como Iniciar o Projeto

### 1. Iniciar Backend

```bash
cd backend/StackHabit.API
dotnet run
```

O backend estará disponível em: **http://localhost:5000**
- Swagger: http://localhost:5000/swagger

### 2. Iniciar Frontend

Em outro terminal:

```bash
cd frontend/stackhabit-app
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

## 🔧 Variáveis de Ambiente (Opcional)

Se quiser usar variáveis de ambiente ao invés do `appsettings.json`:

### Backend
Crie um arquivo `.env` ou exporte as variáveis:

```bash
export DATABASE_URL="Host=localhost;Database=stackhabit;Username=postgres;Password=postgres"
export JWT_KEY="YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!"
export JWT_ISSUER="StackHabit"
export JWT_EXPIRY_MINUTES="1440"
export CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

### Frontend
Crie um arquivo `.env` na pasta `frontend/stackhabit-app`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### PostgreSQL não conecta
```bash
# Verificar se está rodando
sudo systemctl status postgresql

# Reiniciar se necessário
sudo systemctl restart postgresql

# Testar conexão
PGPASSWORD=postgres psql -h localhost -U postgres -d stackhabit
```

### Porta já em uso
```bash
# Verificar processos
lsof -i :5000  # Backend
lsof -i :5173  # Frontend

# Matar processo se necessário
kill -9 <PID>
```

### Banco de dados não existe
```bash
sudo -u postgres psql -c "CREATE DATABASE stackhabit;"
```

## 📝 Próximos Passos

Após testar localmente, consulte o arquivo `DEPLOY.md` para fazer deploy em produção.

