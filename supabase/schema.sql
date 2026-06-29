-- ============================================================
-- FIFA World Cup Predictor — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  force_password_change BOOLEAN NOT NULL DEFAULT true,
  force_avatar_upload BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MATCHES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round TEXT NOT NULL CHECK (round IN (
    'Group Stage', 'Round of 32', 'Round of 16',
    'Quarter Final', 'Semi Final', 'Third Place', 'Final'
  )),
  match_number INTEGER NOT NULL,
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  team_a_code TEXT NOT NULL, -- ISO 3166-1 alpha-2 (e.g. 'sa', 'br')
  team_b_code TEXT NOT NULL,
  kickoff_at TIMESTAMPTZ NOT NULL,
  score_a INTEGER,
  score_b INTEGER,
  result_entered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(round, match_number)
);

-- ============================================================
-- PREDICTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  score_a INTEGER NOT NULL CHECK (score_a >= 0),
  score_b INTEGER NOT NULL CHECK (score_b >= 0),
  points INTEGER CHECK (points IN (0, 1, 2)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- ============================================================
-- ACHIEVEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL CHECK (badge_key IN (
    'first_prediction', 'first_correct', 'five_streak',
    'ten_winners', 'leaderboard_1', 'perfect_round', 'top_weekly'
  )),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_predictions_user ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON public.predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_points ON public.predictions(points);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON public.matches(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_matches_round ON public.matches(round);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read; only auth users can update their own row
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_service" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_delete_service" ON public.users FOR DELETE USING (true);

-- Matches: anyone authenticated can read
CREATE POLICY "matches_select" ON public.matches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "matches_insert_service" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "matches_update_service" ON public.matches FOR UPDATE USING (true);

-- Predictions: users can read all (for leaderboard), write own
CREATE POLICY "predictions_select_all" ON public.predictions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "predictions_insert_own" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_own" ON public.predictions FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "predictions_delete_service" ON public.predictions FOR DELETE USING (true);

-- Achievements: users can read all
CREATE POLICY "achievements_select" ON public.achievements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "achievements_insert_service" ON public.achievements FOR INSERT WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET (run separately in Storage settings or SQL)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ============================================================
-- STORAGE POLICIES
-- ============================================================
-- CREATE POLICY "avatar_upload" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "avatar_update" ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "avatar_select" ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- ============================================================
-- SEED: FIFA World Cup 2026 Matches
-- Replace with actual match schedule when confirmed.
-- Team codes are ISO 3166-1 alpha-2.
-- All times in UTC (Makkah is UTC+3).
-- ============================================================

-- Round of 32 sample data (adjust as needed)
INSERT INTO public.matches (round, match_number, team_a, team_b, team_a_code, team_b_code, kickoff_at)
VALUES
  ('Round of 32', 1,  'Brazil',       'South Korea',  'br', 'kr', '2026-06-21T17:00:00Z'),
  ('Round of 32', 2,  'France',       'Australia',    'fr', 'au', '2026-06-21T20:00:00Z'),
  ('Round of 32', 3,  'Argentina',    'Ecuador',      'ar', 'ec', '2026-06-22T00:00:00Z'),
  ('Round of 32', 4,  'England',      'Senegal',      'gb-eng', 'sn', '2026-06-22T17:00:00Z'),
  ('Round of 32', 5,  'Spain',        'Morocco',      'es', 'ma', '2026-06-22T20:00:00Z'),
  ('Round of 32', 6,  'Germany',      'Japan',        'de', 'jp', '2026-06-23T00:00:00Z'),
  ('Round of 32', 7,  'Portugal',     'Mexico',       'pt', 'mx', '2026-06-23T17:00:00Z'),
  ('Round of 32', 8,  'Netherlands',  'USA',          'nl', 'us', '2026-06-23T20:00:00Z'),
  ('Round of 32', 9,  'Belgium',      'Colombia',     'be', 'co', '2026-06-24T00:00:00Z'),
  ('Round of 32', 10, 'Italy',        'Nigeria',      'it', 'ng', '2026-06-24T17:00:00Z'),
  ('Round of 32', 11, 'Croatia',      'Egypt',        'hr', 'eg', '2026-06-24T20:00:00Z'),
  ('Round of 32', 12, 'Uruguay',      'Poland',       'uy', 'pl', '2026-06-25T00:00:00Z'),
  ('Round of 32', 13, 'Switzerland',  'Cameroon',     'ch', 'cm', '2026-06-25T17:00:00Z'),
  ('Round of 32', 14, 'Denmark',      'Côte d''Ivoire','dk', 'ci', '2026-06-25T20:00:00Z'),
  ('Round of 32', 15, 'Canada',       'Algeria',      'ca', 'dz', '2026-06-26T00:00:00Z'),
  ('Round of 32', 16, 'Saudi Arabia', 'Ghana',        'sa', 'gh', '2026-06-26T17:00:00Z')
ON CONFLICT DO NOTHING;

-- Round of 16 (TBD matchups — placeholder dates)
INSERT INTO public.matches (round, match_number, team_a, team_b, team_a_code, team_b_code, kickoff_at)
VALUES
  ('Round of 16', 1, 'TBD', 'TBD', 'xx', 'xx', '2026-06-30T17:00:00Z'),
  ('Round of 16', 2, 'TBD', 'TBD', 'xx', 'xx', '2026-06-30T21:00:00Z'),
  ('Round of 16', 3, 'TBD', 'TBD', 'xx', 'xx', '2026-07-01T17:00:00Z'),
  ('Round of 16', 4, 'TBD', 'TBD', 'xx', 'xx', '2026-07-01T21:00:00Z'),
  ('Round of 16', 5, 'TBD', 'TBD', 'xx', 'xx', '2026-07-02T17:00:00Z'),
  ('Round of 16', 6, 'TBD', 'TBD', 'xx', 'xx', '2026-07-02T21:00:00Z'),
  ('Round of 16', 7, 'TBD', 'TBD', 'xx', 'xx', '2026-07-03T17:00:00Z'),
  ('Round of 16', 8, 'TBD', 'TBD', 'xx', 'xx', '2026-07-03T21:00:00Z')
ON CONFLICT DO NOTHING;

-- Quarter Finals
INSERT INTO public.matches (round, match_number, team_a, team_b, team_a_code, team_b_code, kickoff_at)
VALUES
  ('Quarter Final', 1, 'TBD', 'TBD', 'xx', 'xx', '2026-07-07T17:00:00Z'),
  ('Quarter Final', 2, 'TBD', 'TBD', 'xx', 'xx', '2026-07-07T21:00:00Z'),
  ('Quarter Final', 3, 'TBD', 'TBD', 'xx', 'xx', '2026-07-08T17:00:00Z'),
  ('Quarter Final', 4, 'TBD', 'TBD', 'xx', 'xx', '2026-07-08T21:00:00Z')
ON CONFLICT DO NOTHING;

-- Semi Finals
INSERT INTO public.matches (round, match_number, team_a, team_b, team_a_code, team_b_code, kickoff_at)
VALUES
  ('Semi Final', 1, 'TBD', 'TBD', 'xx', 'xx', '2026-07-14T21:00:00Z'),
  ('Semi Final', 2, 'TBD', 'TBD', 'xx', 'xx', '2026-07-15T21:00:00Z')
ON CONFLICT DO NOTHING;

-- Third Place & Final
INSERT INTO public.matches (round, match_number, team_a, team_b, team_a_code, team_b_code, kickoff_at)
VALUES
  ('Third Place', 1, 'TBD', 'TBD', 'xx', 'xx', '2026-07-18T20:00:00Z'),
  ('Final', 1,       'TBD', 'TBD', 'xx', 'xx', '2026-07-19T20:00:00Z')
ON CONFLICT DO NOTHING;

-- ============================================================
-- CREATE ADMIN USER (update with your actual details)
-- ============================================================
-- After creating the admin in Supabase Auth, run:
-- INSERT INTO public.users (id, email, full_name, role, force_password_change, force_avatar_upload)
-- VALUES ('YOUR_AUTH_USER_ID', 'admin@example.com', 'Admin', 'admin', false, false);
