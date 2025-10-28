// Video types
export type VideoType = 'youtube' | 'vimeo' | 'bunny' | 'direct';

export interface VideoMetadata {
  url: string;
  type: VideoType;
  thumbnail?: string;
  duration?: number;
}

export interface BunnyUploadResponse {
  url: string;
  guid: string;
  checksum: string;
  size: number;
}

// Quiz types
export type QuestionType = 'single' | 'multiple';

export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  text: string;
  type: QuestionType;
  explanation: string | null;
  order_index: number;
  options: QuizOption[];
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  timer_seconds: number | null;
  passing_score: number; // Always 83
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string[]>; // question_id -> selected_option_ids
  time_taken_seconds: number | null;
  created_at: string;
}

// Form data types for building quiz
export interface QuizFormData {
  title: string;
  description: string;
  instructions: string;
  timer_seconds: number | null;
  questions: QuestionFormData[];
}

export interface QuestionFormData {
  text: string;
  explanation: string;
  options: OptionFormData[];
}

export interface OptionFormData {
  text: string;
  is_correct: boolean;
}

// Validation result
export interface QuizValidationResult {
  isValid: boolean;
  errors: string[];
}
