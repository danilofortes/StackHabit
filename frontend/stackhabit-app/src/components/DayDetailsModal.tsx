import React from 'react';
import { format } from 'date-fns';
import type { Habit } from '../services/habitService';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  habits: Habit[];
  completedHabits: number[];
  onToggleHabit: (habitId: number) => void;
  onAddHabit: () => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  date,
  habits,
  completedHabits,
  onToggleHabit,
  onAddHabit,
}) => {
  if (!isOpen) return null;

  const dateStr = format(date, 'yyyy-MM-dd');
  const formattedDate = format(date, "EEEE, dd 'de' MMMM 'de' yyyy");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Checklist do Dia</h2>
            <p className="text-sm text-gray-400 mt-1 capitalize">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Nenhum hábito cadastrado ainda.
              </p>
              <button
                onClick={() => {
                  onAddHabit();
                  onClose();
                }}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                + Adicionar Primeiro Hábito
              </button>
            </div>
          ) : (
            <>
              {habits.map((habit) => {
                const isCompleted = completedHabits.includes(habit.id);
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
                    <button
                      onClick={() => onToggleHabit(habit.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-white border-white'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => {
                  onAddHabit();
                  onClose();
                }}
                className="w-full mt-3 px-4 py-2 border border-gray-700 text-white rounded-md hover:bg-gray-900 hover:border-gray-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Novo Hábito
              </button>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total completado:</span>
            <span className="font-semibold text-white">
              {completedHabits.length} / {habits.length}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

