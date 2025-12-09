import api from './api';

export interface MonthlyReview {
  id: number;
  targetDate: string; // "YYYY-MM"
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMonthlyReviewData {
  targetDate: string; // "YYYY-MM"
  content: string;
}

export interface UpdateMonthlyReviewData {
  content: string;
}

export const monthlyReviewService = {
  async getAllMonthlyReviews(): Promise<MonthlyReview[]> {
    const response = await api.get<MonthlyReview[]>('/monthlyreviews');
    return response.data;
  },

  async getMonthlyReview(targetDate: string): Promise<MonthlyReview | null> {
    try {
      const response = await api.get<MonthlyReview>(`/monthlyreviews/${targetDate}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createMonthlyReview(data: CreateMonthlyReviewData): Promise<MonthlyReview> {
    const response = await api.post<MonthlyReview>('/monthlyreviews', data);
    return response.data;
  },

  async updateMonthlyReview(targetDate: string, data: UpdateMonthlyReviewData): Promise<MonthlyReview> {
    const response = await api.put<MonthlyReview>(`/monthlyreviews/${targetDate}`, data);
    return response.data;
  },

  async deleteMonthlyReview(targetDate: string): Promise<void> {
    await api.delete(`/monthlyreviews/${targetDate}`);
  },
};

