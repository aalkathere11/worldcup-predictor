import type {
  Match,
  Prediction,
  LeaderboardEntry,
  User,
  Achievement,
  RoundStats,
} from '@/types';

const API_BASE = '/api';

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ============================================================
// MATCHES
// ============================================================

export async function getMatches(round?: string): Promise<Match[]> {
  const query = round ? `?round=${encodeURIComponent(round)}` : '';
  return fetchApi<Match[]>(`/matches${query}`);
}

export async function getUpcomingMatches(limit = 3): Promise<Match[]> {
  return fetchApi<Match[]>(`/matches/upcoming?limit=${limit}`);
}

// ============================================================
// PREDICTIONS
// ============================================================

export async function getUserPredictions(): Promise<Prediction[]> {
  return fetchApi<Prediction[]>('/predictions');
}

export async function savePrediction(
  matchId: string,
  scoreA: number,
  scoreB: number
): Promise<Prediction> {
  return fetchApi<Prediction>('/predictions', {
    method: 'POST',
    body: JSON.stringify({ match_id: matchId, score_a: scoreA, score_b: scoreB }),
  });
}

// ============================================================
// LEADERBOARD
// ============================================================

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return fetchApi<LeaderboardEntry[]>('/leaderboard');
}

// ============================================================
// PROFILE
// ============================================================

export async function getProfile(userId?: string): Promise<User> {
  const path = userId ? `/profile/${userId}` : '/profile';
  return fetchApi<User>(path);
}

export async function updateProfile(data: { nickname: string }): Promise<User> {
  return fetchApi<User>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`${API_BASE}/profile/avatar`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  return fetchApi('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

// ============================================================
// USER STATS
// ============================================================

export async function getUserStats(userId: string): Promise<{
  exact_predictions: number;
  winner_predictions: number;
  wrong_predictions: number;
  total_predictions: number;
  accuracy: number;
  rank: number;
  total_points: number;
  round_stats: RoundStats[];
}> {
  return fetchApi(`/stats/${userId}`);
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  return fetchApi(`/achievements/${userId}`);
}

// ============================================================
// ADMIN
// ============================================================

export async function adminGetUsers(): Promise<User[]> {
  return fetchApi<User[]>('/admin/users');
}

export async function adminCreateUser(data: {
  email: string;
  full_name: string;
  temp_password: string;
}): Promise<User> {
  return fetchApi<User>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteUser(userId: string): Promise<void> {
  return fetchApi(`/admin/users/${userId}`, { method: 'DELETE' });
}

export async function adminResetPassword(userId: string): Promise<{ temp_password: string }> {
  return fetchApi(`/admin/users/${userId}/reset-password`, { method: 'POST' });
}

export async function adminEnterResult(
  matchId: string,
  scoreA: number,
  scoreB: number
): Promise<void> {
  return fetchApi('/admin/results', {
    method: 'POST',
    body: JSON.stringify({ match_id: matchId, score_a: scoreA, score_b: scoreB }),
  });
}

export async function adminExportLeaderboard(): Promise<Blob> {
  const res = await fetch(`${API_BASE}/admin/export/leaderboard`);
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}

export async function adminExportPredictions(): Promise<Blob> {
  const res = await fetch(`${API_BASE}/admin/export/predictions`);
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}

