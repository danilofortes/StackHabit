import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import type { Habit, UpdateHabitData } from '../services/habitService';
import { ConfirmModal } from './ConfirmModal';

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  onSuccess: () => void;
}

const HABIT_COLORS = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Amarelo', value: '#F59E0B' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Laranja', value: '#F97316' },
];

export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  isOpen,
  onClose,
  habit,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [colorHex, setColorHex] = useState('#3B82F6');
  const [isArchived, setIsArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setColorHex(habit.colorHex || '#3B82F6');
      setIsArchived(habit.isArchived);
    }
  }, [habit]);

  if (!isOpen || !habit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O nome do hábito é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData: UpdateHabitData = {
        title: title.trim(),
        colorHex,
        isArchived,
      };
      await habitService.updateHabit(habit.id, updateData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar hábito');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Excluindo hábito:', habit.id);
      await habitService.deleteHabit(habit.id);
      console.log('Hábito excluído com sucesso');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao excluir hábito:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao excluir hábito';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Editar Hábito</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
              Nome do Hábito
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Cor
            </label>
            <div className="grid grid-cols-4 gap-3">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setColorHex(color.value)}
                  className={`h-12 rounded-md border-2 transition-all ${
                    colorHex === color.value
                      ? 'border-white scale-110'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="archived"
              type="checkbox"
              checked={isArchived}
              onChange={(e) => setIsArchived(e.target.checked)}
              className="w-4 h-4 text-white border-gray-700 rounded bg-black checked:bg-white"
            />
            <label htmlFor="archived" className="ml-2 text-sm text-gray-400">
              Arquivar hábito
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirmDelete(true);
              }}
              disabled={loading}
              className="px-4 py-2 bg-red-900 border border-red-700 text-white rounded-md hover:bg-red-800 disabled:opacity-50 cursor-pointer transition-colors"
            >
              Excluir
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 rounded-md text-white hover:bg-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

        <ConfirmModal
          isOpen={showConfirmDelete}
          title="Excluir Hábito"
          message={`Tem certeza que deseja excluir o hábito "${habit.title}"? Esta ação não pode ser desfeita.`}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      </div>
    </div>
  );
};

