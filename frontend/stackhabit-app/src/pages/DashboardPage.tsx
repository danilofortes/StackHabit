import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isLastDayOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { habitService } from '../services/habitService';
import type { DashboardData, Habit } from '../services/habitService';
import { monthlyMetaService } from '../services/monthlyMetaService';
import { monthlyReviewService } from '../services/monthlyReviewService';
import { CreateHabitModal } from '../components/CreateHabitModal';
import { EditHabitModal } from '../components/EditHabitModal';
import { DayDetailsModal } from '../components/DayDetailsModal';
import { ReviewGuidanceModal } from '../components/ReviewGuidanceModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';
import { PromptModal } from '../components/PromptModal';
import { aiService } from '../services/aiService';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [optimisticLogs, setOptimisticLogs] = useState<Record<string, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthlyReview, setMonthlyReview] = useState('');
  const [showReviewNotification, setShowReviewNotification] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewGuidance, setShowReviewGuidance] = useState(false);
  const [improvingReview, setImprovingReview] = useState(false);
  
  // Modals de confirmação/alerta/prompt
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void; variant?: 'danger' | 'default'; title?: string }>({ isOpen: false, message: '', onConfirm: () => {} });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; variant?: 'success' | 'error' | 'warning' | 'info'; title?: string }>({ isOpen: false, message: '' });
  const [promptModal, setPromptModal] = useState<{ isOpen: boolean; message: string; onConfirm: (value: string) => void; title?: string; placeholder?: string }>({ isOpen: false, message: '', onConfirm: () => {} });

  useEffect(() => {
    loadDashboard();
    loadMonthlyReview();
    checkLastDayOfMonth();
  }, [currentMonth]);

  // Verificar se é o último dia do mês a cada minuto
  useEffect(() => {
    checkLastDayOfMonth();
    const interval = setInterval(() => {
      checkLastDayOfMonth();
    }, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, [currentMonth]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await habitService.getDashboard(currentMonth);
      setDashboardData(data);
      setOptimisticLogs({});
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReview = async () => {
    try {
      const review = await monthlyReviewService.getMonthlyReview(currentMonth);
      if (review) {
        setMonthlyReview(review.content);
      } else {
        setMonthlyReview('');
      }
    } catch (error: any) {
      // Ignorar erros 404 - é esperado quando não há review
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar review:', error);
      }
    }
  };

  const checkLastDayOfMonth = () => {
    const now = new Date();
    const isLastDay = isLastDayOfMonth(now);
    const currentMonthStr = format(now, 'yyyy-MM');
    
    // Mostrar notificação se for o último dia do mês e o mês atual estiver sendo visualizado
    if (isLastDay && currentMonth === currentMonthStr) {
      setShowReviewNotification(true);
    } else {
      setShowReviewNotification(false);
    }
  };

  const handleToggleHabit = async (habitId: number, date: string) => {
    const key = `${habitId}-${date}`;
    const currentState = optimisticLogs[key] ?? dashboardData?.logs[key] ?? false;
    const newState = !currentState;

    // Optimistic UI update
    setOptimisticLogs((prev) => ({ ...prev, [key]: newState }));

    try {
      await habitService.toggleHabit(habitId, date);
      // Atualizar dados reais
      if (dashboardData) {
        if (newState) {
          dashboardData.logs[key] = true;
        } else {
          delete dashboardData.logs[key];
        }
        setDashboardData({ ...dashboardData });
      }
      // Remover do optimistic logs após sucesso
      setOptimisticLogs((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (error) {
      // Reverter em caso de erro
      setOptimisticLogs((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setAlertModal({ isOpen: true, message: 'Erro ao atualizar hábito. Tente novamente.', variant: 'error' });
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowEditModal(true);
  };

  const handleDeleteHabit = async (habitId: number, habitTitle: string) => {
    console.log('handleDeleteHabit chamado:', { habitId, habitTitle });
    
    setConfirmModal({
      isOpen: true,
      message: `Tem certeza que deseja excluir o hábito "${habitTitle}"? Esta ação não pode ser desfeita.`,
      variant: 'danger',
      title: 'Excluir Hábito',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        try {
          console.log('Iniciando exclusão do hábito:', habitId);
          await habitService.deleteHabit(habitId);
          console.log('✅ Hábito excluído com sucesso!');
          await loadDashboard();
          console.log('✅ Dashboard recarregado');
          setAlertModal({ isOpen: true, message: 'Hábito excluído com sucesso!', variant: 'success' });
        } catch (error: any) {
          console.error('❌ Erro completo ao excluir hábito:', error);
          console.error('Status:', error.response?.status);
          console.error('Data:', error.response?.data);
          console.error('Message:', error.message);
          const errorMessage = error.response?.data?.message || error.message || 'Erro ao excluir hábito';
          setAlertModal({ isOpen: true, message: `Erro ao excluir hábito: ${errorMessage}\n\nVerifique o console para mais detalhes.`, variant: 'error' });
        }
      },
    });
  };

  const handleDeleteMeta = async (metaId: number) => {
    try {
      await monthlyMetaService.deleteMeta(metaId);
      await loadDashboard();
      setAlertModal({ isOpen: true, message: 'Meta excluída com sucesso!', variant: 'success' });
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      setAlertModal({ isOpen: true, message: 'Erro ao excluir meta', variant: 'error' });
    }
  };

  const getCompletedHabitsForDay = (date: Date): number[] => {
    if (!dashboardData) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return dashboardData.habits
      .filter((habit) => {
        const key = `${habit.id}-${dateStr}`;
        return optimisticLogs[key] ?? dashboardData.logs[key] ?? false;
      })
      .map((habit) => habit.id);
  };

  const getDayCompletionPercentage = (date: Date): number => {
    if (!dashboardData || dashboardData.habits.length === 0) return 0;
    const dateStr = format(date, 'yyyy-MM-dd');
    const completedCount = dashboardData.habits.filter((habit) => {
      const key = `${habit.id}-${dateStr}`;
      return optimisticLogs[key] ?? dashboardData.logs[key] ?? false;
    }).length;
    return Math.round((completedCount / dashboardData.habits.length) * 100);
  };

  const getDayHeatmapColor = (date: Date): { bg: string; border: string; text: string } => {
    const percentage = getDayCompletionPercentage(date);
    
    if (percentage === 100) {
      return { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white' };
    } else if (percentage >= 60) {
      return { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-gray-900' };
    } else if (percentage >= 30) {
      return { bg: 'bg-gray-400', border: 'border-gray-500', text: 'text-white' };
    } else {
      return { bg: 'bg-black', border: 'border-gray-700', text: 'text-gray-400' };
    }
  };

  const getHabitTotal = (habitId: number): number => {
    if (!dashboardData) return 0;
    const [year, month] = currentMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return days.filter((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const key = `${habitId}-${dateStr}`;
      return optimisticLogs[key] ?? dashboardData.logs[key] ?? false;
    }).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-gray-400">Erro ao carregar dados</div>
      </div>
    );
  }

  const [year, month] = currentMonth.split('-').map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = new Date();
  
  // Calcula o offset correto para o primeiro dia do mês (0 = Domingo, 1 = Segunda, etc.)
  const firstDayOfWeek = monthStart.getDay(); // 0 = Domingo, 6 = Sábado

  const getLogState = (habitId: number, date: string): boolean => {
    const key = `${habitId}-${date}`;
    return optimisticLogs[key] ?? dashboardData.logs[key] ?? false;
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">StackHabit</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reviews')}
              className="px-4 py-2 border border-gray-700 text-white text-sm rounded hover:bg-gray-900 transition-colors"
            >
              Histórico de Reviews
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors"
            >
              + Novo Hábito
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
        {/* Notificação de Review do Mês */}
        {showReviewNotification && (
          <div className="mb-6 bg-yellow-500 border border-yellow-600 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-black">Último dia do mês!</p>
                <p className="text-sm text-black/80">Não esqueça de fazer sua review mensal para refletir sobre o progresso.</p>
              </div>
            </div>
            <button
              onClick={() => setShowReviewNotification(false)}
              className="text-black hover:text-black/70 transition-colors"
              title="Fechar notificação"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Month Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const [y, m] = currentMonth.split('-').map(Number);
                const prevMonth = new Date(y, m - 2, 1);
                setCurrentMonth(format(prevMonth, 'yyyy-MM'));
              }}
              className="px-3 py-1 border border-gray-700 rounded text-sm hover:bg-gray-800 text-white transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold text-white">
              {format(new Date(year, month - 1), 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => {
                const [y, m] = currentMonth.split('-').map(Number);
                const nextMonth = new Date(y, m, 1);
                setCurrentMonth(format(nextMonth, 'yyyy-MM'));
              }}
              className="px-3 py-1 border border-gray-700 rounded text-sm hover:bg-gray-800 text-white transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Calendário Visual com Mapa de Calor - Desktop */}
        <div className="hidden md:block mb-8">
          <div className="bg-black border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Calendário do Mês</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isToday = isSameDay(day, today);
                const percentage = getDayCompletionPercentage(day);
                const colors = getDayHeatmapColor(day);
                const isComplete = percentage === 100;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded border-2 flex flex-col items-center justify-center text-xs relative transition-all hover:scale-105 ${
                      colors.bg
                    } ${colors.border} ${colors.text} ${
                      isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                    }`}
                    title={`${format(day, 'dd/MM/yyyy')} - ${percentage}% completo`}
                  >
                    <span className="font-semibold">{format(day, 'd')}</span>
                    {isComplete && (
                      <svg
                        className="w-3 h-3 absolute top-1 right-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 bg-black border-gray-700" />
                <span>0-29%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 bg-gray-400 border-gray-500" />
                <span>30-59%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 bg-yellow-400 border-yellow-500" />
                <span>60-99%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 bg-green-500 border-green-600 relative">
                  <svg className="w-2 h-2 absolute top-0.5 right-0.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Grid View - hidden on mobile */}
        <div className="hidden md:block overflow-x-auto mb-8">
          <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-black">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Hábito
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-800">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-800">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-black divide-y divide-gray-800">
                {dashboardData.habits.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Nenhum hábito cadastrado. Clique em "Novo Hábito" para começar!
                    </td>
                  </tr>
                ) : (
                  dashboardData.habits.map((habit) => (
                    <tr key={habit.id} className="hover:bg-gray-900 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded mr-2"
                            style={{ backgroundColor: habit.colorHex || '#3B82F6' }}
                          />
                          <span className="text-sm font-medium text-white">{habit.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center border-l border-gray-800 font-semibold text-white">
                        {getHabitTotal(habit.id)}
                      </td>
                      <td className="px-4 py-3 text-center border-l border-gray-800">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditHabit(habit)}
                            className="px-3 py-1 text-white hover:text-black hover:bg-white text-sm cursor-pointer rounded border border-gray-700 hover:border-white transition-colors"
                            title="Editar"
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Botão de excluir clicado:', habit.id);
                              handleDeleteHabit(habit.id, habit.title);
                            }}
                            className="px-3 py-1 text-white hover:text-black hover:bg-white text-sm cursor-pointer rounded border border-gray-700 hover:border-white transition-colors"
                            title="Excluir hábito"
                            type="button"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calendário Visual - Mobile */}
        <div className="md:hidden mb-6">
          <div className="bg-black border border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Calendário do Mês</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isToday = isSameDay(day, today);
                const percentage = getDayCompletionPercentage(day);
                const colors = getDayHeatmapColor(day);
                const isComplete = percentage === 100;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded border-2 flex flex-col items-center justify-center text-xs relative transition-all ${
                      colors.bg
                    } ${colors.border} ${colors.text} ${
                      isToday ? 'ring-2 ring-white ring-offset-black' : ''
                    }`}
                  >
                    <span className="font-semibold">{format(day, 'd')}</span>
                    {isComplete && (
                      <svg
                        className="w-3 h-3 absolute top-1 right-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-400 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border bg-black border-gray-700" />
                <span>0-29%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border bg-gray-400 border-gray-500" />
                <span>30-59%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border bg-yellow-400 border-yellow-500" />
                <span>60-99%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border bg-green-500 border-green-600 relative">
                  <svg className="w-1.5 h-1.5 absolute top-0.5 right-0.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile List View - visible only on mobile */}
        <div className="md:hidden space-y-4 mb-6">
          <div className="bg-black border border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Hoje - {format(today, 'dd/MM/yyyy')}
            </h3>
            <div className="space-y-3">
              {dashboardData.habits.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum hábito cadastrado. Clique em "Novo Hábito" para começar!
                </p>
              ) : (
                dashboardData.habits.map((habit) => {
                  const isCompleted = getLogState(habit.id, format(today, 'yyyy-MM-dd'));
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 border border-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        <div
                          className="w-4 h-4 rounded mr-3"
                          style={{ backgroundColor: habit.colorHex || '#3B82F6' }}
                        />
                        <span className="text-sm font-medium text-white">{habit.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditHabit(habit)}
                          className="px-3 py-1 text-white hover:text-black hover:bg-white text-sm rounded border border-gray-700 hover:border-white transition-colors"
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Botão de excluir clicado (mobile):', habit.id);
                            handleDeleteHabit(habit.id, habit.title);
                          }}
                          className="px-3 py-1 text-white hover:text-black hover:bg-white text-sm cursor-pointer rounded border border-gray-700 hover:border-white transition-colors"
                          type="button"
                          title="Excluir hábito"
                        >
                          Remover
                        </button>
                        <button
                          onClick={() => handleToggleHabit(habit.id, format(today, 'yyyy-MM-dd'))}
                          className={`w-6 h-6 rounded border-2 ${
                            isCompleted
                              ? 'bg-white border-white'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Monthly Goals */}
        <div className="mt-8 bg-black border border-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Metas do Mês</h3>
            <button
              onClick={() => {
                setPromptModal({
                  isOpen: true,
                  message: 'Digite a meta:',
                  title: 'Nova Meta',
                  placeholder: 'Ex: Ler 2 livros',
                  onConfirm: async (description) => {
                    setPromptModal({ isOpen: false, message: '', onConfirm: () => {} });
                    try {
                      await monthlyMetaService.createMonthlyMeta({
                        targetDate: currentMonth,
                        description: description.trim(),
                      });
                      await loadDashboard();
                      setAlertModal({ isOpen: true, message: 'Meta criada com sucesso!', variant: 'success' });
                    } catch (error) {
                      console.error('Erro ao criar meta:', error);
                      setAlertModal({ isOpen: true, message: 'Erro ao criar meta', variant: 'error' });
                    }
                  },
                });
              }}
              className="text-sm text-white hover:text-black hover:bg-white px-3 py-1 rounded border border-gray-700 hover:border-white transition-colors"
            >
              + Adicionar Meta
            </button>
          </div>
          <div className="space-y-2">
            {dashboardData.monthlyMetas.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma meta cadastrada para este mês.</p>
            ) : (
              dashboardData.monthlyMetas.map((meta) => (
                <div key={meta.id} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-900 rounded border border-gray-800">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={meta.isDone}
                      onChange={async () => {
                        try {
                          await monthlyMetaService.toggleMeta(meta.id);
                          await loadDashboard();
                        } catch (error) {
                          console.error('Erro ao atualizar meta:', error);
                        }
                      }}
                      className="w-4 h-4 text-white border-gray-700 rounded bg-black checked:bg-white"
                    />
                    <span className={meta.isDone ? 'line-through text-gray-500' : 'text-white'}>
                      {meta.description}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        message: `Tem certeza que deseja excluir a meta "${meta.description}"?`,
                        variant: 'danger',
                        title: 'Excluir Meta',
                        onConfirm: () => {
                          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                          handleDeleteMeta(meta.id);
                        },
                      });
                    }}
                    className="px-2 py-1 text-white hover:text-black hover:bg-white text-sm rounded border border-gray-700 hover:border-white transition-colors"
                    title="Excluir meta"
                    type="button"
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Review */}
        <div className="mt-8 bg-black border border-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Review do Mês</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReviewGuidance(true)}
                className="text-sm text-white hover:text-black hover:bg-white px-3 py-1 rounded border border-gray-700 hover:border-white transition-colors"
                title="Obter guia de como escrever sua review"
              >
                Guia IA
              </button>
              <button
                onClick={async () => {
                  if (!monthlyReview.trim()) {
                    setAlertModal({ isOpen: true, message: 'Por favor, escreva algo na review antes de melhorar.', variant: 'warning' });
                    return;
                  }

                  setImprovingReview(true);
                  try {
                    const habitProgress = dashboardData.habits.map(habit => {
                      const total = getHabitTotal(habit.id);
                      const [year, month] = currentMonth.split('-').map(Number);
                      const daysInMonth = new Date(year, month, 0).getDate();
                      
                      return {
                        title: habit.title,
                        completedDays: total,
                        totalDays: daysInMonth,
                        completionRate: (total / daysInMonth) * 100,
                        currentStreak: 0,
                        longestStreak: 0,
                      };
                    });

                    const result = await aiService.improveReviewText({
                      currentText: monthlyReview,
                      month: currentMonth,
                      habits: habitProgress,
                      monthlyMetas: dashboardData.monthlyMetas.map(m => m.description),
                    });
                    
                    setMonthlyReview(result.improvedText);
                    
                    if (result.aiAvailable === false) {
                      setAlertModal({ isOpen: true, message: 'IA não configurada: Apenas melhorias básicas foram aplicadas. Para usar a IA completa, configure OPENAI_API_KEY no backend.', variant: 'warning' });
                    } else {
                      setAlertModal({ isOpen: true, message: 'Review melhorada com sucesso pela IA!', variant: 'success' });
                    }
                  } catch (error) {
                    console.error('Erro ao melhorar review:', error);
                    setAlertModal({ isOpen: true, message: 'Erro ao melhorar texto. Tente novamente.', variant: 'error' });
                  } finally {
                    setImprovingReview(false);
                  }
                }}
                disabled={improvingReview || !monthlyReview.trim()}
                className="text-sm text-white hover:text-black hover:bg-white px-3 py-1 rounded border border-gray-700 hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Melhorar texto da review com IA"
              >
                {improvingReview ? 'Melhorando...' : 'Melhorar com IA'}
              </button>
            </div>
          </div>
          <textarea
            value={monthlyReview}
            onChange={(e) => setMonthlyReview(e.target.value)}
            placeholder="Como foi este mês? O que funcionou? O que pode melhorar?"
            className="w-full px-4 py-3 border border-gray-700 rounded-md bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
            rows={4}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={async () => {
                if (!monthlyReview.trim()) {
                  setAlertModal({ isOpen: true, message: 'Por favor, escreva algo na review antes de salvar.', variant: 'warning' });
                  return;
                }

                setReviewLoading(true);
                try {
                  // Verificar se já existe uma review para este mês
                  const existing = await monthlyReviewService.getMonthlyReview(currentMonth);
                  if (existing) {
                    // Atualizar review existente
                    await monthlyReviewService.updateMonthlyReview(currentMonth, {
                      content: monthlyReview.trim(),
                    });
                  } else {
                    // Criar nova review
                    await monthlyReviewService.createMonthlyReview({
                      targetDate: currentMonth,
                      content: monthlyReview.trim(),
                    });
                  }
                  setAlertModal({ isOpen: true, message: 'Review salva com sucesso!', variant: 'success' });
                  setShowReviewNotification(false);
                } catch (error) {
                  console.error('Erro ao salvar review:', error);
                  setAlertModal({ isOpen: true, message: 'Erro ao salvar review. Tente novamente.', variant: 'error' });
                } finally {
                  setReviewLoading(false);
                }
              }}
              disabled={reviewLoading}
              className="flex-1 px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {reviewLoading ? 'Salvando...' : 'Salvar Review'}
            </button>
            {monthlyReview.trim() && (
              <button
                onClick={async () => {
                  const existing = await monthlyReviewService.getMonthlyReview(currentMonth);
                  if (!existing) {
                    // Se não existe no banco, apenas limpa o campo
                    setMonthlyReview('');
                    return;
                  }

                  setConfirmModal({
                    isOpen: true,
                    message: 'Tem certeza que deseja excluir esta review? Esta ação não pode ser desfeita.',
                    variant: 'danger',
                    title: 'Excluir Review',
                    onConfirm: async () => {
                      setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                      try {
                        await monthlyReviewService.deleteMonthlyReview(currentMonth);
                        setMonthlyReview('');
                        setAlertModal({ isOpen: true, message: 'Review excluída com sucesso!', variant: 'success' });
                      } catch (error) {
                        console.error('Erro ao excluir review:', error);
                        setAlertModal({ isOpen: true, message: 'Erro ao excluir review. Tente novamente.', variant: 'error' });
                      }
                    },
                  });
                }}
                className="px-4 py-2 border border-gray-700 text-white rounded-md hover:bg-gray-900 hover:border-gray-600 transition-colors"
              >
                Excluir Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadDashboard}
      />

      <EditHabitModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onSuccess={loadDashboard}
      />

      <DayDetailsModal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        date={selectedDate}
        habits={dashboardData.habits}
        completedHabits={getCompletedHabitsForDay(selectedDate)}
        onToggleHabit={(habitId) => {
          handleToggleHabit(habitId, format(selectedDate, 'yyyy-MM-dd'));
        }}
        onAddHabit={() => setShowCreateModal(true)}
      />

      <ReviewGuidanceModal
        isOpen={showReviewGuidance}
        onClose={() => setShowReviewGuidance(false)}
        month={currentMonth}
        habits={dashboardData.habits.map(habit => {
          const total = getHabitTotal(habit.id);
          const [year, month] = currentMonth.split('-').map(Number);
          const daysInMonth = new Date(year, month, 0).getDate();
          return {
            title: habit.title,
            completedDays: total,
            totalDays: daysInMonth,
            completionRate: (total / daysInMonth) * 100,
          };
        })}
        monthlyMetas={dashboardData.monthlyMetas.map(meta => ({
          description: meta.description,
          isDone: meta.isDone,
        }))}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />

      <PromptModal
        isOpen={promptModal.isOpen}
        title={promptModal.title}
        message={promptModal.message}
        placeholder={promptModal.placeholder}
        onConfirm={promptModal.onConfirm}
        onCancel={() => setPromptModal({ isOpen: false, message: '', onConfirm: () => {} })}
      />
    </div>
  );
};
