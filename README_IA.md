# Configuração da IA (OpenAI)

## Status Atual

O botão "Melhorar com IA" está **integrado com a OpenAI**, mas precisa de uma chave de API configurada para funcionar completamente.

**Sem a chave da API:**
- O sistema funciona, mas apenas aplica melhorias básicas (formatação, espaços, etc.)
- Não há melhorias inteligentes de texto

**Com a chave da API:**
- O sistema usa GPT-3.5-turbo da OpenAI
- Melhora gramática, clareza e fluidez
- Mantém o tom pessoal e autêntico
- Adiciona detalhes quando apropriado

## Como Configurar

### Opção 1: Variável de Ambiente (Recomendado)

```bash
export OPENAI_API_KEY="sua-chave-aqui"
```

Depois, reinicie o backend:
```bash
cd backend/StackHabit.API
dotnet run
```

### Opção 2: Arquivo appsettings.json

Adicione no arquivo `backend/StackHabit.API/appsettings.json`:

```json
{
  "OpenAI": {
    "ApiKey": "sua-chave-aqui"
  }
}
```

## Como Obter uma Chave da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave gerada
5. Configure conforme uma das opções acima

## Custos

- O uso da API da OpenAI tem custos baseados em tokens
- GPT-3.5-turbo é relativamente barato (~$0.0015 por 1K tokens)
- Cada melhoria de review usa aproximadamente 500-1000 tokens
- Configure limites de uso na sua conta OpenAI se necessário

## Teste

Após configurar, teste o botão "Melhorar com IA" na página de Dashboard. Se a chave estiver configurada corretamente, você verá melhorias significativas no texto.

