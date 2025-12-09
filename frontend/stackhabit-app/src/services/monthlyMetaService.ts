import api from './api';

export interface MonthlyMeta {
  id: number;
  targetDate: string;
  description: string;
  isDone: boolean;
}

export interface CreateMonthlyMetaData {
  targetDate: string;
  description: string;
}

export const monthlyMetaService = {
  async getMonthlyMetas(targetDate: string): Promise<MonthlyMeta[]> {
    const response = await api.get<MonthlyMeta[]>(`/monthlymetas/${targetDate}`);
    return response.data;
  },

  async createMonthlyMeta(data: CreateMonthlyMetaData): Promise<MonthlyMeta> {
    const response = await api.post<MonthlyMeta>('/monthlymetas', data);
    return response.data;
  },

  async toggleMeta(id: number): Promise<MonthlyMeta> {
    const response = await api.patch<MonthlyMeta>(`/monthlymetas/${id}/toggle`);
    return response.data;
  },

  async deleteMeta(id: number): Promise<void> {
    await api.delete(`/monthlymetas/${id}`);
  },
};

