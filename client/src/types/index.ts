export type ModelResponses = { [modelName: string]: string };
export type Ratings = { [modelName: string]: number };
export type Comments = { [modelName: string]: string };

export interface Evaluation {
  id: string;
  prompt: string;
  imageUrl: string;
  responses: ModelResponses;
  ratings: Ratings;
  comments: Comments;
  timestamp: number;
  promptVersion?: string;
  abTestGroup?: string;
  metrics?: {
    toxicity: { [model: string]: number };
    readability: { [model: string]: number };
    length: { [model: string]: number };
    responseTime: { [model: string]: number };
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  description: string;
  variables: string[];
  tags: string[];
  createdAt: number;
  usageCount: number;
  averageRating: number;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: string;
  content: string;
  changelog: string;
  createdAt: number;
  performance?: {
    averageRating: number;
    totalEvaluations: number;
    successRate: number;
  };
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    prompt: string;
    weight: number;
  }[];
  status: 'draft' | 'running' | 'completed';
  createdAt: number;
  results?: {
    [variantId: string]: {
      evaluations: number;
      averageRating: number;
      metrics: any;
    };
  };
}

export interface PerformanceMetric {
  timestamp: number;
  model: string;
  metric: string;
  value: number;
  promptId?: string;
}