'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopBar title={title} />
      
      <main
        className={cn(
          'max-w-lg mx-auto px-4 py-4',
          'pb-24' // Space for bottom nav
        )}
      >
        {children}
      </main>
      
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}

