'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckCircle2, Camera, Eye, EyeOff, KeyRound } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { changePassword, uploadAvatar } from '@/lib/api';

export default function SetupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordDone, setPasswordDone] = useState(false);
  const [avatarDone, setAvatarDone] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  function validatePassword() {
    const errs: Record<string, string> = {};
    if (!pwForm.current) errs.current = 'Required';
    if (pwForm.newPw.length < 8) errs.newPw = t('auth.password_too_short');
    if (pwForm.newPw !== pwForm.confirm) errs.confirm = t('auth.password_mismatch');
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePassword()) return;
    setSavingPassword(true);
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      setPasswordDone(true);
      toast.success(t('auth.save_password'));
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setSavingPassword(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    handleAvatarUpload(file);
  }

  async function handleAvatarUpload(file: File) {
    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
      setAvatarDone(true);
      toast.success(t('auth.save_avatar'));
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleFinish() {
    if (!passwordDone || !avatarDone) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('users').update({ force_password_change: false, force_avatar_upload: false }).eq('id', user.id);
    }
    toast.success(t('auth.setup_complete'));
    router.replace('/dashboard');
  }

  const cardBase = 'card p-5 transition-all';
  const cardDone = 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-brand-800 px-4 py-8 flex flex-col">
      <div className="flex flex-col items-center gap-2 mb-8 animate-fade-in">
        <span className="text-5xl">🔐</span>
        <h1 className="text-2xl font-black text-white text-center">{t('auth.setup_title')}</h1>
        <p className="text-brand-200 text-sm text-center max-w-xs">{t('auth.setup_subtitle')}</p>
      </div>

      <div className="w-full max-w-sm mx-auto space-y-4 animate-slide-up">
        {/* Password */}
        <div className={`${cardBase} ${passwordDone ? cardDone : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${passwordDone ? 'bg-emerald-500' : 'bg-brand-100 dark:bg-brand-900'}`}>
              {passwordDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <KeyRound className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('auth.change_password')}</h2>
          </div>

          {!passwordDone ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-3" noValidate>
              <div>
                <label className="label-base">{t('auth.current_password')}</label>
                <div className="relative">
                  <input type={showCurrent ? 'text' : 'password'} value={pwForm.current}
                    onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                    className="input-base pr-11" dir="ltr" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwErrors.current && <p className="text-xs text-red-500 mt-1">{pwErrors.current}</p>}
              </div>
              <div>
                <label className="label-base">{t('auth.new_password')}</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={pwForm.newPw}
                    onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                    className="input-base pr-11" dir="ltr" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwErrors.newPw && <p className="text-xs text-red-500 mt-1">{pwErrors.newPw}</p>}
              </div>
              <div>
                <label className="label-base">{t('auth.confirm_password')}</label>
                <input type="password" value={pwForm.confirm}
                  onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  className="input-base" dir="ltr" />
                {pwErrors.confirm && <p className="text-xs text-red-500 mt-1">{pwErrors.confirm}</p>}
              </div>
              <Button type="submit" variant="primary" size="lg" fullWidth loading={savingPassword}>
                {t('auth.save_password')}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium text-center">✓ {t('auth.save_password')}</p>
          )}
        </div>

        {/* Avatar */}
        <div className={`${cardBase} ${avatarDone ? cardDone : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${avatarDone ? 'bg-emerald-500' : 'bg-brand-100 dark:bg-brand-900'}`}>
              {avatarDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Camera className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('auth.upload_avatar')}</h2>
          </div>

          {!avatarDone ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Preview" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{t('auth.avatar_hint')}</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              <Button variant="secondary" size="lg" fullWidth loading={avatarUploading} onClick={() => fileInputRef.current?.click()}>
                {t('auth.save_avatar')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {avatarPreview && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-400">
                  <Image src={avatarPreview} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                </div>
              )}
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">✓ {t('auth.save_avatar')}</p>
            </div>
          )}
        </div>

        {passwordDone && avatarDone && (
          <Button variant="success" size="xl" fullWidth onClick={handleFinish} className="animate-scale-in">
            {t('auth.setup_complete')} 🎉
          </Button>
        )}
      </div>
    </div>
  );
}

