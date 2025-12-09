import api from './api';

export interface HabitProgressData {
  title: string;
  completedDays: number;
  totalDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ReviewGuidance {
  questions: string[];
  tips: string[];
  suggestedStructure: string;
  pendingReasons: string[];
  unmetGoalsReasons: string[];
}

export interface UnmetGoalData {
  description: string;
  isDone: boolean;
}

export interface ReviewGuidanceRequest {
  month: string;
  habits: HabitProgressData[];
  monthlyMetas: string[];
  unmetGoals: UnmetGoalData[];
}

export interface ImproveReviewRequest {
  currentText: string;
  month: string;
  habits: HabitProgressData[];
  monthlyMetas: string[];
}

export const aiService = {
  async getReviewGuidance(request: ReviewGuidanceRequest): Promise<ReviewGuidance> {
    const response = await api.post<ReviewGuidance>('/ai/review-guidance', request);
    return response.data;
  },

  async improveReviewText(request: ImproveReviewRequest): Promise<{ improvedText: string; aiAvailable?: boolean }> {
    const response = await api.post<{ improvedText: string; aiAvailable?: boolean }>('/ai/improve-review', request);
    return response.data;
  },
};

