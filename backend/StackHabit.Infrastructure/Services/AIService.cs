using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using StackHabit.Core.DTOs;
using StackHabit.Core.Interfaces;

namespace StackHabit.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly string? _openAiApiKey;
    private readonly bool _useAI;

    public AIService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _openAiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
            ?? configuration["OpenAI:ApiKey"];
        _useAI = !string.IsNullOrEmpty(_openAiApiKey);
    }

    public async Task<ReviewGuidanceResponse> GetReviewGuidanceAsync(
        string month, 
        List<HabitProgressData> habits, 
        List<string> monthlyMetas,
        List<UnmetGoalData> unmetGoals)
    {
        // Se não tiver API key, retorna guia básico
        if (!_useAI)
        {
            return GenerateBasicGuidance(habits, monthlyMetas, unmetGoals);
        }

        try
        {
            var habitsSummary = string.Join(", ", habits.Select(h => 
                $"{h.Title}: {h.CompletedDays}/{h.TotalDays} dias ({h.CompletionRate:F0}%)"));
            
            var metasSummary = monthlyMetas.Any() 
                ? string.Join(", ", monthlyMetas) 
                : "Nenhuma meta definida";

            var pendingHabits = habits.Where(h => h.CompletionRate < 70).Select(h => h.Title).ToList();
            var pendingHabitsText = pendingHabits.Any() 
                ? $"Hábitos com baixa completação: {string.Join(", ", pendingHabits)}" 
                : "Todos os hábitos tiveram boa completação";

            var unmetGoalsText = unmetGoals.Where(g => !g.IsDone).Select(g => g.Description).ToList();
            var unmetGoalsSummary = unmetGoalsText.Any()
                ? $"Metas não alcançadas: {string.Join(", ", unmetGoalsText)}"
                : "Todas as metas foram alcançadas";

            var prompt = $"O usuário está escrevendo uma review mensal para {month}. " +
                        $"Hábitos do mês: {habitsSummary}. {pendingHabitsText}. " +
                        $"Metas: {metasSummary}. {unmetGoalsSummary}. " +
                        $"NÃO gere o texto da review. Em vez disso, forneça um GUIA de como escrever a review, incluindo: " +
                        $"1. Perguntas reflexivas (array 'questions') que ajudem o usuário a pensar sobre o mês, " +
                        $"2. Dicas práticas (array 'tips') para escrever uma boa review, " +
                        $"3. Uma estrutura sugerida (string 'suggestedStructure') com tópicos a cobrir, " +
                        $"4. Possíveis motivos para pendências (array 'pendingReasons') - por que alguns hábitos não foram completados regularmente, " +
                        $"5. Possíveis motivos para metas não alcançadas (array 'unmetGoalsReasons') - por que algumas metas não foram batidas. " +
                        $"Responda em formato JSON com: questions (array), tips (array), suggestedStructure (string), " +
                        $"pendingReasons (array), unmetGoalsReasons (array). Seja específico e analítico baseado nos dados fornecidos.";

            var response = await CallOpenAIAsync(prompt);
            return ParseGuidanceResponse(response, habits, monthlyMetas, unmetGoals);
        }
        catch
        {
            // Fallback para guia básico em caso de erro
            return GenerateBasicGuidance(habits, monthlyMetas, unmetGoals);
        }
    }

    private async Task<string> CallOpenAIAsync(string prompt)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAiApiKey}");

        var requestBody = new
        {
            model = "gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "system", content = "Você é um assistente especializado em ajudar pessoas a escreverem reviews mensais reflexivas sobre seus hábitos e produtividade. Responda sempre em português brasileiro." },
                new { role = "user", content = prompt }
            },
            max_tokens = 600,
            temperature = 0.7
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync();
        var responseObj = JsonSerializer.Deserialize<JsonElement>(responseJson);
        
        return responseObj.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";
    }

    private async Task<string> CallOpenAIAsyncForImprovement(string prompt)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAiApiKey}");

            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
                    new { role = "system", content = "Você é um editor especializado em transformar textos de reviews mensais em textos corridos bem estruturados, divididos em parágrafos claros e legíveis. Mantenha o tom pessoal e autêntico, corrija erros, melhore a clareza e reorganize o conteúdo em parágrafos bem definidos. Responda sempre em português brasileiro." },
                    new { role = "user", content = prompt }
                },
                max_tokens = 1500, // Mais tokens para textos maiores e reorganizados
                temperature = 0.6 // Temperatura um pouco maior para mais criatividade na reorganização
            };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync();
        var responseObj = JsonSerializer.Deserialize<JsonElement>(responseJson);
        
        return responseObj.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";
    }

    private ReviewGuidanceResponse ParseGuidanceResponse(string response, List<HabitProgressData> habits, List<string> monthlyMetas, List<UnmetGoalData> unmetGoals)
    {
        try
        {
            var json = JsonSerializer.Deserialize<JsonElement>(response);
            return new ReviewGuidanceResponse
            {
                Questions = json.TryGetProperty("questions", out var q) 
                    ? q.EnumerateArray().Select(e => e.GetString() ?? "").ToList() 
                    : GetDefaultQuestions(),
                Tips = json.TryGetProperty("tips", out var t) 
                    ? t.EnumerateArray().Select(e => e.GetString() ?? "").ToList() 
                    : GetDefaultTips(),
                SuggestedStructure = json.TryGetProperty("suggestedStructure", out var s) 
                    ? s.GetString() ?? "" 
                    : GetDefaultStructure(),
                PendingReasons = json.TryGetProperty("pendingReasons", out var pr) 
                    ? pr.EnumerateArray().Select(e => e.GetString() ?? "").ToList() 
                    : GetDefaultPendingReasons(habits),
                UnmetGoalsReasons = json.TryGetProperty("unmetGoalsReasons", out var ugr) 
                    ? ugr.EnumerateArray().Select(e => e.GetString() ?? "").ToList() 
                    : GetDefaultUnmetGoalsReasons(unmetGoals)
            };
        }
        catch
        {
            return GenerateBasicGuidance(habits, monthlyMetas, unmetGoals);
        }
    }

    private ReviewGuidanceResponse GenerateBasicGuidance(List<HabitProgressData> habits, List<string> monthlyMetas, List<UnmetGoalData> unmetGoals)
    {
        return new ReviewGuidanceResponse
        {
            Questions = GetDefaultQuestions(),
            Tips = GetDefaultTips(),
            SuggestedStructure = GetDefaultStructure(),
            PendingReasons = GetDefaultPendingReasons(habits),
            UnmetGoalsReasons = GetDefaultUnmetGoalsReasons(unmetGoals)
        };
    }

    private List<string> GetDefaultQuestions()
    {
        return new List<string>
        {
            "Quais hábitos você manteve com mais consistência este mês?",
            "Quais hábitos foram mais desafiadores? Por quê?",
            "O que funcionou bem na sua rotina?",
            "O que você gostaria de melhorar no próximo mês?",
            "Quais foram suas maiores conquistas?",
            "O que você aprendeu sobre si mesmo este mês?"
        };
    }

    private List<string> GetDefaultTips()
    {
        return new List<string>
        {
            "Seja honesto e específico sobre seus progressos",
            "Identifique padrões - quando você teve mais sucesso?",
            "Reconheça tanto os sucessos quanto as dificuldades",
            "Pense em pequenos ajustes, não grandes mudanças",
            "Use dados concretos (quantos dias completou cada hábito)",
            "Foque no que você pode controlar no próximo mês"
        };
    }

    private string GetDefaultStructure()
    {
        return "1. O que funcionou bem\n" +
               "   - Hábitos mais consistentes\n" +
               "   - Rotinas que ajudaram\n" +
               "   - Conquistas alcançadas\n\n" +
               "2. Desafios enfrentados\n" +
               "   - Hábitos que precisam de atenção\n" +
               "   - Obstáculos encontrados\n" +
               "   - O que não funcionou\n\n" +
               "3. Lições aprendidas\n" +
               "   - Insights sobre seus padrões\n" +
               "   - O que você descobriu sobre si mesmo\n\n" +
               "4. Planos para o próximo mês\n" +
               "   - Ajustes que quer fazer\n" +
               "   - Novos hábitos ou metas\n" +
               "   - Estratégias para melhorar";
    }

    private List<string> GetDefaultPendingReasons(List<HabitProgressData> habits)
    {
        var lowCompletionHabits = habits.Where(h => h.CompletionRate < 70).ToList();
        if (!lowCompletionHabits.Any())
        {
            return new List<string> { "Parabéns! Todos os hábitos tiveram boa completação este mês." };
        }

        var reasons = new List<string>();
        foreach (var habit in lowCompletionHabits)
        {
            reasons.Add($"{habit.Title}: Apenas {habit.CompletionRate:F0}% de completação. Possíveis motivos: falta de rotina estabelecida, falta de motivação, ou obstáculos externos.");
        }
        return reasons;
    }

    private List<string> GetDefaultUnmetGoalsReasons(List<UnmetGoalData> unmetGoals)
    {
        var unmet = unmetGoals.Where(g => !g.IsDone).ToList();
        if (!unmet.Any())
        {
            return new List<string> { "Excelente! Todas as metas foram alcançadas este mês." };
        }

        var reasons = new List<string>();
        foreach (var goal in unmet)
        {
            reasons.Add($"{goal.Description}: Meta não alcançada. Possíveis motivos: falta de planejamento, falta de tempo, ou necessidade de quebrar em etapas menores.");
        }
        return reasons;
    }

    public async Task<string> ImproveReviewTextAsync(
        string currentText, 
        string month, 
        List<HabitProgressData> habits, 
        List<string> monthlyMetas)
    {
        if (!_useAI)
        {
            return GenerateBasicImprovedText(currentText);
        }

        try
        {
            var habitsSummary = string.Join(", ", habits.Select(h => 
                $"{h.Title}: {h.CompletedDays}/{h.TotalDays} dias ({h.CompletionRate:F0}%)"));
            
            var metasSummary = monthlyMetas.Any() 
                ? string.Join(", ", monthlyMetas) 
                : "Nenhuma meta definida";

            var prompt = $"O usuário escreveu uma review mensal para {month}. " +
                        $"Hábitos do mês: {habitsSummary}. " +
                        $"Metas: {metasSummary}. " +
                        $"Texto atual da review:\n\n{currentText}\n\n" +
                        $"TRANSFORME este texto em um texto corrido bem estruturado, dividido em parágrafos claros e legíveis. " +
                        $"Requisitos: " +
                        $"1. Transforme em um texto fluido e corrido (não apenas melhore, mas reorganize completamente), " +
                        $"2. Divida em parágrafos bem definidos (2-4 parágrafos idealmente), " +
                        $"3. Cada parágrafo deve ter um tema/foco claro, " +
                        $"4. Use transições suaves entre parágrafos, " +
                        $"5. Corrija erros de português, " +
                        $"6. Melhore clareza e fluidez, " +
                        $"7. Mantenha o tom pessoal e autêntico, " +
                        $"8. Adicione detalhes quando apropriado para enriquecer o texto. " +
                        $"Retorne APENAS o texto transformado e formatado, sem explicações ou comentários adicionais. " +
                        $"O texto deve estar pronto para leitura, com parágrafos separados por linha em branco.";

            var response = await CallOpenAIAsyncForImprovement(prompt);
            return ExtractTextFromResponse(response);
        }
        catch
        {
            return GenerateBasicImprovedText(currentText);
        }
    }

    private string GenerateBasicImprovedText(string currentText)
    {
        // Retorna o texto original com pequenas melhorias básicas
        // Nota: Sem chave da OpenAI, não há melhorias reais
        var trimmed = currentText.Trim();
        
        // Apenas melhorias básicas sem IA:
        // - Remove espaços duplos
        // - Capitaliza primeira letra de parágrafos
        var lines = trimmed.Split('\n');
        var improvedLines = lines.Select(line =>
        {
            var cleaned = System.Text.RegularExpressions.Regex.Replace(line.Trim(), @"\s+", " ");
            if (!string.IsNullOrEmpty(cleaned) && cleaned.Length > 0)
            {
                cleaned = char.ToUpper(cleaned[0]) + cleaned.Substring(1);
            }
            return cleaned;
        }).Where(l => !string.IsNullOrEmpty(l));
        
        return string.Join("\n\n", improvedLines);
    }

    private string ExtractTextFromResponse(string response)
    {
        // Tenta extrair JSON primeiro, senão retorna o texto direto
        try
        {
            var json = JsonSerializer.Deserialize<JsonElement>(response);
            if (json.TryGetProperty("text", out var text))
                return FormatParagraphs(text.GetString() ?? response);
            if (json.TryGetProperty("content", out var content))
                return FormatParagraphs(content.GetString() ?? response);
        }
        catch { }
        
        // Remove possíveis markdown code blocks
        var cleaned = response.Trim();
        if (cleaned.StartsWith("```"))
        {
            var lines = cleaned.Split('\n');
            cleaned = string.Join("\n", lines.Skip(1).TakeWhile(l => !l.Trim().StartsWith("```")));
        }
        
        return FormatParagraphs(cleaned);
    }

    private string FormatParagraphs(string text)
    {
        // Garante que os parágrafos estejam bem formatados
        // Remove espaços múltiplos e normaliza quebras de linha
        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var paragraphs = new List<string>();
        var currentParagraph = new List<string>();

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                // Linha em branco = fim do parágrafo
                if (currentParagraph.Any())
                {
                    paragraphs.Add(string.Join(" ", currentParagraph));
                    currentParagraph.Clear();
                }
            }
            else
            {
                currentParagraph.Add(trimmed);
            }
        }

        // Adiciona o último parágrafo se houver
        if (currentParagraph.Any())
        {
            paragraphs.Add(string.Join(" ", currentParagraph));
        }

        // Retorna parágrafos separados por linha em branco
        return string.Join("\n\n", paragraphs);
    }
}

