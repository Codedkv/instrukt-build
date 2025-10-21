export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  has_perplexity_pro: boolean;
  perplexity_pro_expires_at: string | null;
  telegram_id: number | null;
  telegram_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'student' | 'admin';
}

export interface PromoCode {
  id: string;
  code: string;
  user_id: string;
  status: 'pending' | 'activated' | 'expired';
  perplexity_account_email: string | null;
  activated_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  order_index: number;
  duration_minutes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
