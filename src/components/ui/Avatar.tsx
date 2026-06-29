import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ring?: boolean;
  ringColor?: string;
}

const sizeMap = {
  xs: { px: 24, text: 'text-xs' },
  sm: { px: 32, text: 'text-sm' },
  md: { px: 40, text: 'text-base' },
  lg: { px: 56, text: 'text-xl' },
  xl: { px: 80, text: 'text-2xl' },
  '2xl': { px: 112, text: 'text-4xl' },
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, name, size = 'md', className, ring, ringColor }: AvatarProps) {
  const { px, text } = sizeMap[size];
  const ringClass = ring
    ? `ring-2 ${ringColor ?? 'ring-white dark:ring-slate-900'}`
    : '';

  if (src) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex-shrink-0',
          ringClass,
          className
        )}
        style={{ width: px, height: px }}
      >
        <Image
          src={src}
          alt={name ?? 'Avatar'}
          fill
          className="object-cover"
          sizes={`${px}px`}
        />
      </div>
    );
  }

  // Fallback: colored circle with initials
  const colors = [
    'bg-brand-500 text-white',
    'bg-emerald-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
    'bg-purple-500 text-white',
    'bg-cyan-500 text-white',
  ];
  const colorIndex = name
    ? name.charCodeAt(0) % colors.length
    : 0;

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 font-bold',
        text,
        colors[colorIndex],
        ringClass,
        className
      )}
      style={{ width: px, height: px }}
    >
      {getInitials(name)}
    </div>
  );
}
