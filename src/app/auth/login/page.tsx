'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!email || !email.includes('@')) errs.email = 'Invalid email';
    if (!password) errs.password = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(t('auth.invalid_credentials'));
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('force_password_change, force_avatar_upload')
        .eq('id', user.id)
        .single();
      if ((profile as any)?.force_password_change || (profile as any)?.force_avatar_upload) {
        router.replace('/auth/setup');
      } else {
        router.replace('/dashboard');
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-brand-800 flex flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-3 mb-8 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <span className="text-5xl">⚽</span>
        </div>
        <h1 className="text-2xl font-black text-white text-center">{t('app.name')}</h1>
        <p className="text-brand-200 text-sm text-center">{t('app.tagline')}</p>
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 animate-slide-up">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          {t('auth.login')}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label-base">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              className="input-base"
              placeholder="your@email.com"
              dir="ltr"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="label-base">{t('auth.password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="input-base pr-11"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <Button type="submit" variant="primary" size="xl" fullWidth loading={loading} className="mt-2">
            {loading ? t('auth.logging_in') : t('auth.login_button')}
          </Button>
        </form>
      </div>

      <p className="text-brand-300/60 text-xs mt-8 text-center">FIFA World Cup 2026™</p>
    </div>
  );
}

