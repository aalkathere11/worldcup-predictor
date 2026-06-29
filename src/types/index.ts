// ============================================================
// DATABASE TYPES
// ============================================================

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  role: UserRole;
  force_password_change: boolean;
  force_avatar_upload: boolean;
  created_at: string;
  updated_at: string;
}

export type MatchRound =
  | 'Group Stage'
  | 'Round of 32'
  | 'Round of 16'
  | 'Quarter Final'
  | 'Semi Final'
  | 'Third Place'
  | 'Final';

export interface Match {
  id: string;
  round: MatchRound;
  match_number: number;
  team_a: string;
  team_b: string;
  team_a_code: string; // ISO 3166-1 alpha-2 for flag
  team_b_code: string;
  kickoff_at: string; // ISO timestamp in UTC
  score_a: number | null;
  score_b: number | null;
  result_entered: boolean;
  created_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  score_a: number;
  score_b: number;
  points: number | null;
  created_at: string;
  updated_at: string;
}

export interface PredictionWithMatch extends Prediction {
  match: Match;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  total_points: number;
  exact_predictions: number;
  winner_predictions: number;
  wrong_predictions: number;
  total_predictions: number;
  accuracy: number;
  rank: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_key: string;
  earned_at: string;
}

export interface RoundStats {
  round: MatchRound;
  points: number;
}

// ============================================================
// UI / APPLICATION TYPES
// ============================================================

export type Locale = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface MatchCardData extends Match {
  user_prediction?: Prediction | null;
  is_locked: boolean;
  time_until_lock: number; // ms
}

export type PredictionStatus = 'pending' | 'saved' | 'locked' | 'correct_exact' | 'correct_winner' | 'wrong';

export interface Notification {
  id: string;
  type: 'rank_change' | 'achievement' | 'top_scorer' | 'prediction_result';
  message_ar: string;
  message_en: string;
  icon: string;
  created_at: string;
}

// ============================================================
// BADGE / ACHIEVEMENT DEFINITIONS
// ============================================================

export type BadgeKey =
  | 'first_prediction'
  | 'first_correct'
  | 'five_streak'
  | 'ten_winners'
  | 'leaderboard_1'
  | 'perfect_round'
  | 'top_weekly';

export interface BadgeDefinition {
  key: BadgeKey;
  icon: string;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// ============================================================
// FORM TYPES
// ============================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface ChangePasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileUpdateForm {
  nickname: string;
}

export interface AdminCreateUserForm {
  email: string;
  full_name: string;
  temp_password: string;
}

export interface AdminResultForm {
  match_id: string;
  score_a: number;
  score_b: number;
}

// ============================================================
// SUPABASE TYPES
// ============================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at'>>;
      };
      predictions: {
        Row: Prediction;
        Insert: Omit<Prediction, 'id' | 'created_at' | 'updated_at' | 'points'>;
        Update: Partial<Omit<Prediction, 'id' | 'created_at' | 'user_id' | 'match_id'>>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'earned_at'>;
        Update: never;
      };
    };
    Views: {
      leaderboard: {
        Row: LeaderboardEntry;
      };
    };
    Functions: {
      calculate_points: {
        Args: {
          pred_a: number;
          pred_b: number;
          actual_a: number;
          actual_b: number;
        };
        Returns: number;
      };
    };
  };
}
