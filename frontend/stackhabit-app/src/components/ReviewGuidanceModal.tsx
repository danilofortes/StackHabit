import React, { useState } from 'react';
import { aiService, type ReviewGuidance } from '../services/aiService';

interface ReviewGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  habits: Array<{ title: string; completedDays: number; totalDays: number; completionRate: number }>;
  monthlyMetas: Array<{ description: string; isDone: boolean }>;
}

export const ReviewGuidanceModal: React.FC<ReviewGuidanceModalProps> = ({
  isOpen,
  onClose,
  month,
  habits,
  monthlyMetas,
}) => {
  const [guidance, setGuidance] = useState<ReviewGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const loadGuidance = async () => {
    setLoading(true);
    setError(null);
    try {
      const habitProgress = habits.map(h => ({
        title: h.title,
        completedDays: h.completedDays,
        totalDays: h.totalDays,
        completionRate: h.completionRate,
        currentStreak: 0,
        longestStreak: 0,
      }));

      const data = await aiService.getReviewGuidance({
        month,
        habits: habitProgress,
        monthlyMetas: monthlyMetas.map(m => m.description),
        unmetGoals: monthlyMetas.map(m => ({
          description: m.description,
          isDone: m.isDone,
        })),
      });
      setGuidance(data);
    } catch (err: any) {
      console.error('Erro ao carregar guia:', err);
      let errorMessage = 'Erro ao carregar sugestões';
      
      if (err.response?.status === 404) {
        errorMessage = 'Endpoint de IA não encontrado. O backend precisa ser reiniciado para carregar o AIController.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Guia para Escrever sua Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {!guidance && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Obtenha sugestões personalizadas de como escrever sua review mensal</p>
            <button
              onClick={loadGuidance}
              className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
            >
              Obter Sugestões
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-400">Gerando sugestões personalizadas...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {guidance && (
          <div className="space-y-6">
            {/* Perguntas Reflexivas */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Perguntas para Reflexão</h3>
              <ul className="space-y-2">
                {guidance.questions.map((question, index) => (
                  <li key={index} className="text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dicas */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Dicas para Escrever</h3>
              <ul className="space-y-2">
                {guidance.tips.map((tip, index) => (
                  <li key={index} className="text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Estrutura Sugerida */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Estrutura Sugerida</h3>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <pre className="text-gray-300 whitespace-pre-wrap text-sm font-mono">
                  {guidance.suggestedStructure}
                </pre>
              </div>
            </div>

            {/* Motivos de Pendências */}
            {guidance.pendingReasons.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Análise de Pendências</h3>
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <ul className="space-y-2">
                    {guidance.pendingReasons.map((reason, index) => (
                      <li key={index} className="text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Motivos de Metas Não Alcançadas */}
            {guidance.unmetGoalsReasons.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Análise de Metas Não Alcançadas</h3>
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <ul className="space-y-2">
                    {guidance.unmetGoalsReasons.map((reason, index) => (
                      <li key={index} className="text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-6">
          {guidance && (
            <button
              onClick={loadGuidance}
              className="flex-1 px-4 py-2 border border-gray-700 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Atualizar Sugestões
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

