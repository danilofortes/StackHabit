import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { monthlyReviewService, type MonthlyReview } from '../services/monthlyReviewService';
import { habitService, type DashboardData } from '../services/habitService';
import { monthlyMetaService } from '../services/monthlyMetaService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export const ReviewsHistoryPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<MonthlyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<DashboardData | null>(null);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void; title?: string }>({ isOpen: false, message: '', onConfirm: () => {} });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; variant?: 'success' | 'error' | 'warning' | 'info' }>({ isOpen: false, message: '' });

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadMonthData(selectedMonth);
    }
  }, [selectedMonth]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await monthlyReviewService.getAllMonthlyReviews();
      setReviews(data);
    } catch (error) {
      console.error('Erro ao carregar reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthData = async (month: string) => {
    try {
      setLoadingMonth(true);
      const data = await habitService.getDashboard(month);
      setMonthData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do mês:', error);
    } finally {
      setLoadingMonth(false);
    }
  };

  const formatMonthName = (targetDate: string) => {
    try {
      const [year, month] = targetDate.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return format(date, 'MMMM yyyy');
    } catch {
      return targetDate;
    }
  };

  const getHabitTotal = (habitId: number, month: string): number => {
    if (!monthData) return 0;
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const key = `${habitId}-${dateStr}`;
      if (monthData.logs[key]) {
        count++;
      }
    }
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Histórico de Reviews</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-700 text-white text-sm rounded hover:bg-gray-900 transition-colors"
            >
              Voltar ao Dashboard
            </button>
            <span className="text-sm text-gray-400">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedMonth ? (
          /* Dashboard do Mês Selecionado */
          <div>
            <button
              onClick={() => {
                setSelectedMonth(null);
                setMonthData(null);
              }}
              className="mb-4 text-white hover:text-gray-300 transition-colors"
            >
              ← Voltar para lista
            </button>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {formatMonthName(selectedMonth)}
                </h2>
                {reviews.find(r => r.targetDate === selectedMonth) && (
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        message: 'Tem certeza que deseja excluir esta review? Esta ação não pode ser desfeita.',
                        title: 'Excluir Review',
                        onConfirm: async () => {
                          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                          try {
                            await monthlyReviewService.deleteMonthlyReview(selectedMonth);
                            await loadReviews();
                            setSelectedMonth(null);
                            setMonthData(null);
                            setAlertModal({ isOpen: true, message: 'Review excluída com sucesso!', variant: 'success' });
                          } catch (error) {
                            console.error('Erro ao excluir review:', error);
                            setAlertModal({ isOpen: true, message: 'Erro ao excluir review. Tente novamente.', variant: 'error' });
                          }
                        },
                      });
                    }}
                    className="px-4 py-2 border border-red-700 text-red-400 rounded-md hover:bg-red-900 hover:border-red-600 transition-colors"
                  >
                    Excluir Review
                  </button>
                )}
              </div>
              {reviews.find(r => r.targetDate === selectedMonth) && (
                <div className="mt-4 bg-black border border-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Review do Mês</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {reviews.find(r => r.targetDate === selectedMonth)?.content}
                  </p>
                </div>
              )}
            </div>

            {loadingMonth ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Carregando dados do mês...</div>
              </div>
            ) : monthData ? (
              <div className="space-y-6">
                {/* Calendário Reduzido */}
                <div className="bg-black border border-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Calendário do Mês</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                        {day}
                      </div>
                    ))}
                    {(() => {
                      const [year, month] = selectedMonth.split('-').map(Number);
                      const firstDay = new Date(year, month - 1, 1);
                      const lastDay = new Date(year, month, 0);
                      const firstDayOfWeek = firstDay.getDay();
                      const daysInMonth = lastDay.getDate();
                      const days = [];

                      // Dias vazios no início
                      for (let i = 0; i < firstDayOfWeek; i++) {
                        days.push(null);
                      }

                      // Dias do mês
                      for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        const completedCount = monthData.habits.filter((habit) => {
                          const key = `${habit.id}-${dateStr}`;
                          return monthData.logs[key] ?? false;
                        }).length;
                        const totalHabits = monthData.habits.length;
                        const completionPercentage = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

                        let bgColor = 'bg-black';
                        if (completionPercentage === 100) bgColor = 'bg-green-500';
                        else if (completionPercentage >= 60) bgColor = 'bg-yellow-400';
                        else if (completionPercentage >= 30) bgColor = 'bg-gray-400';

                        days.push({ day, dateStr, bgColor, completionPercentage });
                      }

                      return days.map((item, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded border border-gray-700 flex items-center justify-center text-xs ${item ? item.bgColor : ''} ${item && item.completionPercentage === 100 ? 'text-white' : item ? 'text-gray-800' : ''}`}
                          title={item ? `${item.dateStr} - ${item.completionPercentage.toFixed(0)}%` : ''}
                        >
                          {item && (
                            <>
                              <span className="font-semibold">{item.day}</span>
                              {item.completionPercentage === 100 && (
                                <svg className="w-2 h-2 absolute top-0.5 right-0.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Metas do Mês */}
                {monthData.monthlyMetas.length > 0 && (
                  <div className="bg-black border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Metas do Mês</h3>
                    <div className="space-y-2">
                      {monthData.monthlyMetas.map((meta) => (
                        <div
                          key={meta.id}
                          className="flex items-center gap-3 p-2 border border-gray-800 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={meta.isDone}
                            disabled
                            className="w-4 h-4 text-white border-gray-700 rounded bg-black checked:bg-white"
                          />
                          <span className={meta.isDone ? 'line-through text-gray-500' : 'text-white'}>
                            {meta.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hábitos com Pontuações */}
                {monthData.habits.length > 0 && (
                  <div className="bg-black border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Hábitos e Pontuações</h3>
                    <div className="space-y-3">
                      {monthData.habits.map((habit) => {
                        const total = getHabitTotal(habit.id, selectedMonth);
                        const [year, month] = selectedMonth.split('-').map(Number);
                        const daysInMonth = new Date(year, month, 0).getDate();
                        const percentage = (total / daysInMonth) * 100;

                        return (
                          <div
                            key={habit.id}
                            className="flex items-center justify-between p-3 border border-gray-800 rounded"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: habit.colorHex || '#3B82F6' }}
                              />
                              <span className="text-white font-medium">{habit.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-white font-semibold">{total} / {daysInMonth}</div>
                                <div className="text-xs text-gray-400">{percentage.toFixed(0)}%</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          /* Lista de Reviews */
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Reviews Salvas</h2>
            {reviews.length === 0 ? (
              <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">Nenhuma review salva ainda.</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
                >
                  Ir para Dashboard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-black border border-gray-800 rounded-lg p-6 hover:bg-gray-900 transition-colors"
                  >
                    <button
                      onClick={() => setSelectedMonth(review.targetDate)}
                      className="w-full text-left"
                    >
                      <div className="text-lg font-semibold text-white mb-2">
                        {formatMonthName(review.targetDate)}
                      </div>
                      <div className="text-sm text-gray-400 mb-3">
                        {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-gray-300 text-sm line-clamp-3">
                        {review.content.substring(0, 150)}
                        {review.content.length > 150 ? '...' : ''}
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Clique para ver detalhes
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal({
                          isOpen: true,
                          message: 'Tem certeza que deseja excluir esta review? Esta ação não pode ser desfeita.',
                          title: 'Excluir Review',
                          onConfirm: async () => {
                            setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                            try {
                              await monthlyReviewService.deleteMonthlyReview(review.targetDate);
                              await loadReviews();
                              setAlertModal({ isOpen: true, message: 'Review excluída com sucesso!', variant: 'success' });
                            } catch (error) {
                              console.error('Erro ao excluir review:', error);
                              setAlertModal({ isOpen: true, message: 'Erro ao excluir review. Tente novamente.', variant: 'error' });
                            }
                          },
                        });
                      }}
                      className="mt-4 w-full px-4 py-2 border border-red-700 text-red-400 rounded-md hover:bg-red-900 hover:border-red-600 transition-colors"
                    >
                      Excluir Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          variant="danger"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        />

        <AlertModal
          isOpen={alertModal.isOpen}
          message={alertModal.message}
          variant={alertModal.variant}
          onClose={() => setAlertModal({ isOpen: false, message: '' })}
        />
      </div>
    </div>
  );
};

