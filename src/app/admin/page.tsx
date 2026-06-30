'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Users, CheckSquare, Download, Plus, Trash2, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Flag } from '@/components/ui/Flag';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/i18n';
import {
  adminGetUsers,
  adminCreateUser,
  adminDeleteUser,
  adminResetPassword,
  adminEnterResult,
  adminExportLeaderboard,
  adminExportPredictions,
  getMatches,
} from '@/lib/api';
import { cn, formatMatchDate, formatMatchTime } from '@/lib/utils';
import type { User, Match } from '@/types';

type AdminTab = 'users' | 'results' | 'export';

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) return null;

  return (
    <AppLayout title={t('admin.title')}>
      {/* Tab navigation */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
        {(
          [
            { id: 'users', icon: Users, label: t('admin.users') },
            { id: 'results', icon: CheckSquare, label: t('admin.results') },
            { id: 'export', icon: Download, label: t('admin.export') },
          ] as const
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap',
              'transition-all duration-150 active:scale-95',
              activeTab === id
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <AdminUsersTab />}
      {activeTab === 'results' && <AdminResultsTab />}
      {activeTab === 'export' && <AdminExportTab />}
    </AppLayout>
  );
}

// ─── Users Tab ────────────────────────────────────────────────

function AdminUsersTab() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', temp_password: '' });

  useEffect(() => {
    adminGetUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.email || !form.full_name || !form.temp_password) return;
    setCreating(true);
    try {
      const newUser = await adminCreateUser(form);
      setUsers((prev) => [...prev, newUser]);
      setForm({ email: '', full_name: '', temp_password: '' });
      toast.success(t('admin.user_created'));
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm(t('admin.confirm_delete'))) return;
    try {
      await adminDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => (u as any).id !== userId));
      toast.success(t('admin.user_deleted'));
    } catch {
      toast.error(t('errors.generic'));
    }
  }

  async function handleResetPassword(userId: string) {
    try {
      const { temp_password } = await adminResetPassword(userId);
      toast.success(`${t('admin.password_reset')}: ${temp_password}`);
    } catch {
      toast.error(t('errors.generic'));
    }
  }

  return (
    <div className="space-y-5">
      {/* Create user form */}
      <div className="card p-4 space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white">{t('admin.create_user')}</h3>
        <input
          type="text"
          placeholder={t('admin.full_name')}
          className="input-base"
          value={form.full_name}
          onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
        />
        <input
          type="email"
          placeholder={t('admin.email')}
          className="input-base"
          dir="ltr"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <input
          type="text"
          placeholder={t('admin.temp_password')}
          className="input-base"
          dir="ltr"
          value={form.temp_password}
          onChange={(e) => setForm((p) => ({ ...p, temp_password: e.target.value }))}
        />
        <Button variant="primary" fullWidth loading={creating} onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          {t('admin.create_user')}
        </Button>
      </div>

      {/* Users list */}
      <div className="space-y-2">
        {loading
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          : users.map((u) => (
              <div
                key={(u as any).id}
                className="card flex items-center gap-3 p-3"
              >
                <Avatar src={(u as any).avatar_url} name={(u as any).full_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                    {(u as any).full_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{(u as any).email}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleResetPassword((u as any).id)}
                    className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center"
                    title={t('admin.reset_password')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete((u as any).id)}
                    className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center"
                    title={t('admin.delete_user')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

// ─── Results Tab ──────────────────────────────────────────────

function AdminResultsTab() {
  const { t, locale } = useI18n();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, { a: number; b: number }>>({});

  useEffect(() => {
    getMatches()
      .then((m) => {
        // Only show matches without results
        const pending = m.filter((x) => !x.result_entered);
        setMatches(pending);
        const initial: Record<string, { a: number; b: number }> = {};
        pending.forEach((x) => { initial[x.id] = { a: 0, b: 0 }; });
        setScores(initial);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleEnterResult(matchId: string) {
    const score = scores[matchId];
    if (!score) return;
    setEntering(matchId);
    try {
      await adminEnterResult(matchId, score.a, score.b);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      toast.success(t('admin.result_saved'));
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setEntering(null);
    }
  }

  if (loading) return <Skeleton className="h-40 rounded-2xl" />;

  if (matches.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-400">
        <p className="text-3xl mb-2">✅</p>
        <p className="text-sm font-medium">All results entered</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div key={match.id} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{match.round}</span>
            <span className="text-xs text-slate-400">
              {formatMatchDate(match.kickoff_at, locale)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <Flag code={match.team_a_code} size="sm" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {match.team_a}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={scores[match.id]?.a ?? 0}
                onChange={(e) =>
                  setScores((p) => ({
                    ...p,
                    [match.id]: { ...p[match.id], a: Number(e.target.value) },
                  }))
                }
                className="w-12 text-center input-base px-2 py-2 text-lg font-black"
              />
              <span className="text-slate-400 font-bold">–</span>
              <input
                type="number"
                min={0}
                max={20}
                value={scores[match.id]?.b ?? 0}
                onChange={(e) =>
                  setScores((p) => ({
                    ...p,
                    [match.id]: { ...p[match.id], b: Number(e.target.value) },
                  }))
                }
                className="w-12 text-center input-base px-2 py-2 text-lg font-black"
              />
            </div>

            <div className="flex-1 flex items-center gap-2 justify-end">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate text-right">
                {match.team_b}
              </span>
              <Flag code={match.team_b_code} size="sm" />
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            loading={entering === match.id}
            onClick={() => handleEnterResult(match.id)}
            size="lg"
          >
            {t('admin.enter_result')}
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Export Tab ───────────────────────────────────────────────

function AdminExportTab() {
  const { t } = useI18n();
  const [exportingLb, setExportingLb] = useState(false);
  const [exportingPred, setExportingPred] = useState(false);

  async function handleExport(
    fn: () => Promise<Blob>,
    filename: string,
    setLoading: (v: boolean) => void
  ) {
    setLoading(true);
    try {
      const blob = await fn();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="primary"
        fullWidth
        size="xl"
        loading={exportingLb}
        onClick={() =>
          handleExport(
            adminExportLeaderboard,
            'leaderboard.xlsx',
            setExportingLb
          )
        }
      >
        <Download className="w-5 h-5" />
        {t('admin.export_leaderboard')}
      </Button>
      <Button
        variant="secondary"
        fullWidth
        size="xl"
        loading={exportingPred}
        onClick={() =>
          handleExport(
            adminExportPredictions,
            'predictions.xlsx',
            setExportingPred
          )
        }
      >
        <Download className="w-5 h-5" />
        {t('admin.export_predictions')}
      </Button>
    </div>
  );
}

