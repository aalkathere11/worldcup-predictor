# ⚽ FIFA World Cup 2026 Prediction Platform

A premium, mobile-first web application for FIFA World Cup prediction competitions. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- 🌍 **Bilingual** — Arabic (RTL, default) and English (LTR)
- 🌙 **Dark/Light Mode** with smooth transitions
- 📱 **Mobile-first PWA** — installable, offline-capable
- 🔐 **Secure Auth** — forced password change + avatar on first login
- ⚽ **Match Predictions** — with real-time countdown & auto-locking
- 🏆 **Animated Leaderboard** — gold/silver/bronze podium
- 🏅 **Achievements & Badges** — 7 badge types
- 📊 **Performance Charts** — points by round
- 👑 **Admin Panel** — user management, results entry, Excel export
- 🎯 **Smart Scoring** — exact (2pts), winner (1pt), wrong (0pts)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Go to **Storage** → create a bucket named `avatars` (set to **Public**)
4. Add these storage policies to the `avatars` bucket:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "avatar_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatar_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatar_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@yourdomain.com
```

### 4. Create Admin User

1. Go to Supabase → **Authentication** → **Users** → **Add User**
2. Create with email/password, copy the UUID
3. Run in SQL Editor:
```sql
INSERT INTO public.users (id, email, full_name, role, force_password_change, force_avatar_upload)
VALUES ('YOUR_UUID_HERE', 'admin@yourdomain.com', 'Admin', 'admin', false, false);
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── setup/page.tsx      # First-login setup
│   ├── dashboard/page.tsx      # Home dashboard
│   ├── matches/page.tsx        # All matches with filters
│   ├── leaderboard/page.tsx    # Rankings with podium
│   ├── profile/page.tsx        # User profile + stats
│   ├── admin/page.tsx          # Admin panel
│   └── api/                    # API routes
│       ├── auth/
│       ├── matches/
│       ├── predictions/
│       ├── leaderboard/
│       ├── profile/
│       ├── stats/
│       ├── achievements/
│       └── admin/
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── ScoreInput.tsx
│   │   ├── Avatar.tsx
│   │   ├── Flag.tsx
│   │   ├── Countdown.tsx
│   │   └── Skeleton.tsx
│   ├── match/
│   │   └── MatchCard.tsx       # Core prediction card
│   ├── leaderboard/
│   │   └── Leaderboard.tsx     # With animated podium
│   └── layout/
│       ├── AppLayout.tsx
│       ├── TopBar.tsx          # Theme + language toggle
│       └── BottomNav.tsx       # Mobile navigation
├── lib/
│   ├── supabase/               # Supabase client/server/middleware
│   ├── api/                    # Frontend API functions
│   ├── hooks/                  # useAuth, useCountdown, useTheme
│   └── utils/                  # Scoring, dates, formatting
├── i18n/                       # ar.json, en.json, index.tsx
└── types/                      # Full TypeScript types
```

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Profiles, roles, force-setup flags |
| `matches` | Match schedule, teams, results |
| `predictions` | User predictions + calculated points |
| `achievements` | Earned badges per user |

---

## 🏆 Scoring System

| Result | Points |
|--------|--------|
| Exact score | 2 |
| Correct winner | 1 |
| Wrong | 0 |

---

## 🎯 Prediction Rules

- Predictions **auto-lock 5 minutes** before kickoff
- No draws allowed in knockout rounds (Round of 32 and beyond)
- Admin enters official results — points calculate automatically

---

## 🏅 Achievements

| Badge | Trigger |
|-------|---------|
| 🎯 First Prediction | Make your first prediction |
| ✅ First Correct | Get your first correct result |
| 🔥 5 in a Row | 5 consecutive correct predictions |
| 🏅 10 Winner Predictions | Predict the winner 10 times |
| 🏆 Leaderboard #1 | Reach the top spot |
| ⭐ Perfect Round | Get all matches right in one round |
| 📈 Top Weekly | Highest score in a week |

---

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (same as `.env.local`)
4. Deploy!

The PWA will automatically work with the `next-pwa` plugin.

---

## 👑 Admin Capabilities

- **Create users** with temporary passwords
- **Delete users** (with confirmation)
- **Reset passwords** (generates new temp password)
- **Enter match results** → auto-calculates all points
- **Export leaderboard** to Excel (.xlsx)
- **Export all predictions** to Excel (.xlsx)

---

## 🔒 Security

- Row Level Security (RLS) on all Supabase tables
- Server-side auth validation on every API route
- Admin endpoints protected by role check
- Prediction locking enforced server-side
- Input validation with Zod schemas
- File upload validation (type + size)

---

## 📱 PWA Features

- **Add to Home Screen** — full-screen app experience
- **App Icon** — per the manifest
- **Offline caching** — static assets + fonts
- **Splash screen** — via theme-color meta
- **No horizontal scroll** — mobile-first responsive

---

## ⚽ Match Data

The schema seeds **Round of 32** with real teams and approximate dates for FIFA World Cup 2026. Update team codes and exact kickoff times when the official schedule is released.

**Team codes** use ISO 3166-1 alpha-2 (e.g. `sa` = Saudi Arabia, `br` = Brazil). Flags are served from [flagcdn.com](https://flagcdn.com).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS v3 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Charts | Recharts |
| Excel | SheetJS (xlsx) |
| PWA | next-pwa |
| i18n | Custom React context |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |
