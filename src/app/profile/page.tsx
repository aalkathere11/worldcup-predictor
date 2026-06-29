'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Edit2, Check, X, LogOut, Camera } from 'lucide-react';
import Image from 'next/image';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/i18n';
import {
  getUserStats,
  getUserAchievements,
  updateProfile,
  uploadAvatar,
} from '@/lib/api';
import { getBadgeByKey } from '@/lib/utils/badges';
import { createClient } from '@/lib/supabase/client';
import { cn, calculateAccuracy } from '@/lib/utils';
import type { Achievement, RoundStats } from '@/types';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [stats, setStats] = useState<Awaited<ReturnType<typeof getUserStats>> | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setNickname(user.nickname ?? '');

    Promise.all([getUserStats(user.id), getUserAchievements(user.id)])
      .then(([s, a]) => {
        setStats(s);
        setAchievements(a);
        setLoading(false);
      })
      .catch(console.error);
  }, [user]);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await updateProfile({ nickname });
      setEditing(false);
      toast.success(t('common.save'));
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      toast.success(t('auth.save_avatar'));
      window.location.reload();
    } catch {
      toast.error(t('errors.generic'));
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/auth/login');
  }

  if (authLoading || !user) {
    return (
      <AppLayout title={t('profile.title')}>
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const accuracy = stats
    ? calculateAccuracy(
        stats.exact_predictions + stats.winner_predictions,
        stats.total_predictions
      )
    : 0;

  return (
    <AppLayout title={t('profile.title')}>
      <div className="space-y-5">
        {/* Profile header */}
        <div className="card p-5">
          <div className="flex items-start gap-4">
            {/* Avatar with change button */}
            <div className="relative">
              <Avatar src={user.avatar_url} name={user.full_name} size="xl" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center shadow-lg text-white active:scale-95 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">
                {user.full_name}
              </h2>

              {/* Nickname edit */}
              {editing ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input-base py-1.5 text-sm flex-1"
                    placeholder={t('profile.nickname')}
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setNickname(user.nickname ?? '');
                    }}
                    className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {user.nickname ? `@${user.nickname}` : t('profile.nickname')}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-brand-500 dark:text-brand-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {stats && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300">
                    #{stats.rank}
                  </span>
                  <span className="badge bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                    {stats.total_points} pts
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="section-title">{t('profile.stats')}</h3>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <ProfileStat
                label={t('profile.exact_predictions')}
                value={String(stats?.exact_predictions ?? 0)}
                color="emerald"
              />
              <ProfileStat
                label={t('profile.winner_predictions')}
                value={String(stats?.winner_predictions ?? 0)}
                color="amber"
              />
              <ProfileStat
                label={t('profile.wrong_predictions')}
                value={String(stats?.wrong_predictions ?? 0)}
                color="red"
              />
              <ProfileStat
                label={t('profile.accuracy')}
                value={`${accuracy}%`}
                color="purple"
              />
            </div>
          )}
        </div>

        {/* Performance chart */}
        {stats && stats.round_stats.length > 0 && (
          <div>
            <h3 className="section-title">{t('profile.points_by_round')}</h3>
            <div className="card p-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.round_stats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="round"
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                    tickFormatter={(v: string) => v.replace('Round of ', 'R').replace(' Final', 'F').replace('Semi', 'SF').replace('Quarter', 'QF')}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                    {stats.round_stats.map((_, i) => (
                      <Cell
                        key={i}
                        fill={`hsl(${220 + i * 20}, 80%, 55%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div>
          <h3 className="section-title">{t('profile.achievements')}</h3>
          {loading ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : achievements.length === 0 ? (
            <div className="card p-6 text-center text-slate-400">
              <p className="text-3xl mb-2">🏅</p>
              <p className="text-sm font-medium">{t('profile.no_achievements')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((a) => {
                const badge = getBadgeByKey(a.badge_key);
                if (!badge) return null;
                return (
                  <div
                    key={a.id}
                    className="card p-3 flex flex-col items-center gap-1 text-center"
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                      {locale === 'ar' ? badge.label_ar : badge.label_en}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Log out */}
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={handleLogout}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </Button>
      </div>
    </AppLayout>
  );
}

function ProfileStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'emerald' | 'amber' | 'red' | 'purple';
}) {
  const colorMap = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
  };

  return (
    <div className={cn('rounded-xl p-4', colorMap[color])}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-medium opacity-80 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
