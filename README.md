# StackHabit - Habit Tracker Full Stack

Aplicação Web Full Stack para digitalizar o método de Bullet Journal/Habit Tracker, focando na consistência do usuário através da visualização gráfica do progresso mensal.

## 🛠️ Stack Tecnológica

### Backend
- **.NET 8** / ASP.NET Core Web API
- **Entity Framework Core** (Code-First)
- **PostgreSQL**
- **JWT** para autenticação
- **BCrypt.Net-Next** para hash de senhas

### Frontend
- **React 18** com **TypeScript**
- **Vite** como build tool
- **Tailwind CSS** para estilização
- **Axios** para requisições HTTP
- **React Router** para navegação
- **date-fns** para manipulação de datas

## 📋 Pré-requisitos

- .NET 8 SDK
- Node.js 18+ e npm
- PostgreSQL 12+

## 🚀 Como Executar

### 1. Configurar o Banco de Dados

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE stackhabit;
```

Atualize a connection string no arquivo `backend/StackHabit.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=stackhabit;Username=seu_usuario;Password=sua_senha"
  }
}
```

### 2. Executar o Backend

```bash
cd backend/StackHabit.API
dotnet restore
dotnet run
```

O backend estará disponível em `http://localhost:5000` (ou porta configurada).

### 3. Executar o Frontend

```bash
cd frontend/stackhabit-app
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## 📁 Estrutura do Projeto

```
StackHabit/
├── backend/
│   ├── StackHabit.API/          # Camada de API (Controllers, Program.cs)
│   ├── StackHabit.Core/         # Domínio (Entities, DTOs, Interfaces)
│   └── StackHabit.Infrastructure/  # Acesso a dados (Repositories, Services, DbContext)
├── frontend/
│   └── stackhabit-app/
│       └── src/
│           ├── components/     # Componentes React
│           ├── pages/          # Páginas da aplicação
│           ├── services/       # Serviços de API
│           └── contexts/       # Context API (Auth)
└── README.md
```

## 🔑 Funcionalidades

- ✅ Autenticação com JWT (Registro e Login)
- ✅ CRUD de Hábitos
- ✅ Check-in diário de hábitos (Toggle)
- ✅ Visualização em Grid (Desktop) e Lista (Mobile)
- ✅ Metas Mensais
- ✅ Optimistic UI para feedback instantâneo
- ✅ Design Responsivo (Tailwind CSS)

## 📱 Responsividade

- **Desktop**: Exibe uma matriz temporal (Grid) com hábitos no eixo Y e dias do mês no eixo X
- **Mobile**: Exibe uma lista vertical focada no dia atual ("Hoje")

## 🔐 Autenticação

A aplicação usa JWT (JSON Web Tokens) para autenticação. O token é armazenado no `localStorage` e enviado automaticamente em todas as requisições através do interceptor do Axios.

## 📝 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login

### Dashboard
- `GET /api/dashboard?month=YYYY-MM` - Obter dados do dashboard (hábitos, logs, metas)

### Hábitos
- `GET /api/habits` - Listar hábitos
- `POST /api/habits` - Criar hábito
- `PUT /api/habits/{id}` - Atualizar hábito
- `DELETE /api/habits/{id}` - Deletar hábito
- `PATCH /api/habits/{id}/toggle` - Toggle check-in (Body: `{ date: "YYYY-MM-DD" }`)

### Metas Mensais
- `GET /api/monthlymetas/{targetDate}` - Listar metas do mês
- `POST /api/monthlymetas` - Criar meta
- `PATCH /api/monthlymetas/{id}/toggle` - Toggle meta
- `DELETE /api/monthlymetas/{id}` - Deletar meta

## 🎨 Design

O design é minimalista e funcional, seguindo padrões comuns de UX/UI:
- Cores neutras (cinza, branco)
- Botões simples e claros
- Feedback visual imediato
- Sem elementos 3D ou animações complexas

## 📄 Licença

Este projeto é de uso pessoal/educacional.

