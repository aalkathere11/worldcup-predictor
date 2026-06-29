'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, User, Settings, Zap } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: Home },
  { href: '/matches', labelKey: 'nav.matches', icon: Zap },
  { href: '/leaderboard', labelKey: 'nav.leaderboard', icon: Trophy },
  { href: '/profile', labelKey: 'nav.profile', icon: User },
];

const ADMIN_ITEM: NavItem = {
  href: '/admin',
  labelKey: 'nav.admin',
  icon: Settings,
  adminOnly: true,
};

interface BottomNavProps {
  isAdmin?: boolean;
}

export function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md',
        'border-t border-slate-200 dark:border-slate-700',
        'pb-safe-bottom',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 h-16">
        {items.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl',
                'transition-all duration-150 min-w-[52px]',
                'active:scale-95 select-none',
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-150',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold transition-all',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}
              >
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
