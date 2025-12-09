#!/bin/bash

echo "🚀 Iniciando StackHabit..."

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL não encontrado. Instalando..."
    echo "Por favor, instale o PostgreSQL:"
    echo "  Fedora/RHEL: sudo dnf install postgresql postgresql-server"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo ""
    echo "Depois, configure o banco:"
    echo "  sudo postgresql-setup --initdb  # Fedora"
    echo "  sudo systemctl start postgresql"
    echo "  sudo systemctl enable postgresql"
    echo "  sudo -u postgres psql -c \"CREATE DATABASE stackhabit;\""
    echo "  sudo -u postgres psql -c \"CREATE USER postgres WITH PASSWORD 'postgres';\""
    echo "  sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE stackhabit TO postgres;\""
    exit 1
fi

# Verificar se PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL não está rodando. Iniciando..."
    sudo systemctl start postgresql || echo "Erro ao iniciar PostgreSQL"
fi

# Iniciar Backend
echo "📦 Iniciando Backend..."
cd backend/StackHabit.API
dotnet run &
BACKEND_PID=$!
cd ../..

# Aguardar backend iniciar
sleep 5

# Verificar se backend está rodando
if curl -s http://localhost:5000/swagger/index.html > /dev/null; then
    echo "✅ Backend rodando em http://localhost:5000"
else
    echo "⚠️  Backend pode ter problemas. Verifique os logs."
fi

# Iniciar Frontend
echo "🎨 Iniciando Frontend..."
cd frontend/stackhabit-app
npm run dev &
FRONTEND_PID=$!
cd ../..

# Aguardar frontend iniciar
sleep 3

if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend rodando em http://localhost:5173"
else
    echo "⚠️  Frontend pode ter problemas."
fi

echo ""
echo "✨ StackHabit está rodando!"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:5000"
echo "   Swagger: http://localhost:5000/swagger"
echo ""
echo "Pressione Ctrl+C para parar os serviços"

# Aguardar
wait

