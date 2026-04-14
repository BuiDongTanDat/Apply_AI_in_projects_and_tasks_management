export interface PerformanceDashboardPayload {
  teamId: number;
  fromAt: number; // unix seconds
  toAt: number; // unix seconds
}

export interface PerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  onTimeCompletedTasks: number;
  completionRate: number; // %
  onTimeCompletionRate: number; // %
  totalStoryPoints: number;
  storyPointsAchieved: number;
}

export interface PerformanceDashboardUserRow {
  user: {
    id: number;
    name?: string | null;
    email: string;
    avatar?: string | null;
    position?: string | null;
    skills?: string[] | null;
    yearOfExperience?: number | null;
  };
  metrics: PerformanceMetrics;
}

export interface PerformanceDashboardMetadata {
  period: { fromAt: number; toAt: number };
  teamId: number;
  totals: PerformanceMetrics;
  users: PerformanceDashboardUserRow[];
}

export interface PerformanceDashboardResponse {
  message: string;
  code: number;
  metadata: PerformanceDashboardMetadata;
}

export interface AiReviewPerformancePayload {
  userId: number;
  teamId: number;
  fromAt: number; // unix seconds
  toAt: number; // unix seconds
}

export interface AiUsage {
  completion_tokens?: number;
  prompt_tokens?: number;
  total_tokens?: number;
}

export interface AiReview {
  performance_review: string;
  improvement_suggestions: string;
  usage?: AiUsage;
}

export interface AiReviewPerformanceMetadata {
  review: AiReview;
  sourceData?: {
    user?: { id: number; name?: string; skills?: string[] };
    period?: { fromAt: number; toAt: number };
    tasks?: any[];
  };
}

export interface AiReviewPerformanceResponse {
  message: string;
  code: number;
  metadata: AiReviewPerformanceMetadata;
}

