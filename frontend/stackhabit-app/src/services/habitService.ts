import api from './api';
import type { MonthlyMeta } from './monthlyMetaService';

export interface Habit {
  id: number;
  title: string;
  colorHex?: string;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateHabitData {
  title: string;
  colorHex?: string;
}

export interface UpdateHabitData {
  title: string;
  colorHex?: string;
  isArchived: boolean;
}

export interface DailyLog {
  id: number;
  habitId: number;
  date: string;
  isCompleted: boolean;
}

export interface DashboardData {
  month: string;
  habits: Habit[];
  logs: Record<string, boolean>; // "habitId-date" -> boolean
  monthlyMetas: MonthlyMeta[];
}

export const habitService = {
  async getHabits(includeArchived = false): Promise<Habit[]> {
    const response = await api.get<Habit[]>('/habits', {
      params: { includeArchived },
    });
    return response.data;
  },

  async createHabit(data: CreateHabitData): Promise<Habit> {
    const response = await api.post<Habit>('/habits', data);
    return response.data;
  },

  async updateHabit(id: number, data: UpdateHabitData): Promise<Habit> {
    const response = await api.put<Habit>(`/habits/${id}`, data);
    return response.data;
  },

  async deleteHabit(id: number): Promise<void> {
    try {
      const response = await api.delete(`/habits/${id}`);
      // NoContent (204) é uma resposta válida para DELETE
      return;
    } catch (error: any) {
      console.error('Erro na requisição DELETE:', error);
      throw error;
    }
  },

  async toggleHabit(habitId: number, date: string): Promise<DailyLog> {
    const response = await api.patch<DailyLog>(`/habits/${habitId}/toggle`, {
      date,
    });
    return response.data;
  },

  async getDashboard(month: string): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/dashboard', {
      params: { month },
    });
    return response.data;
  },
};

