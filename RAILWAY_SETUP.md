# Configuração do Railway - Backend

## ⚠️ Problema: Root Directory

O Railway precisa saber onde está o projeto .NET. Existem duas soluções:

## Solução 1: Configurar Root Directory (Recomendado)

1. No Railway, vá para o serviço Backend
2. Settings → Root Directory
3. Configure: `backend/StackHabit.API`
4. Salve

## Solução 2: Usar nixpacks.toml na raiz do backend

Se não conseguir configurar Root Directory:

1. O Railway vai usar o `nixpacks.toml` em `backend/nixpacks.toml`
2. Este arquivo já está criado e configurado
3. Ele faz `cd StackHabit.API` antes de executar os comandos

## 📋 Estrutura de Diretórios

```
StackHabit/
├── backend/
│   ├── nixpacks.toml          ← Usado se Root Directory = backend/
│   ├── StackHabit.API/
│   │   ├── nixpacks.toml      ← Usado se Root Directory = backend/StackHabit.API
│   │   ├── railway.json
│   │   └── StackHabit.API.csproj
│   ├── StackHabit.Core/
│   └── StackHabit.Infrastructure/
```

## ✅ Verificação

Após configurar, o build deve:
1. ✅ Instalar .NET SDK 8
2. ✅ Fazer `dotnet restore` no projeto correto
3. ✅ Fazer `dotnet publish` e gerar `out/`
4. ✅ Executar `./StackHabit.API` do diretório `out/`

## 🔧 Comandos de Build

Se Root Directory = `backend/StackHabit.API`:
- Usa: `backend/StackHabit.API/nixpacks.toml`

Se Root Directory = `backend/`:
- Usa: `backend/nixpacks.toml`

Se Root Directory = raiz do projeto:
- Precisa criar `nixpacks.toml` na raiz apontando para `backend/StackHabit.API`
