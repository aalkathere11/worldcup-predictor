import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FlagProps {
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const sizeMap = {
  sm: { w: 24, h: 18 },
  md: { w: 40, h: 28 },
  lg: { w: 56, h: 40 },
  xl: { w: 80, h: 56 },
};

export function Flag({ code, size = 'md', className, alt }: FlagProps) {
  const { w, h } = sizeMap[size];
  const url = `https://flagcdn.com/w${w * 2}/${code.toLowerCase()}.png`;

  return (
    <div
      className={cn('rounded overflow-hidden shadow-sm flex-shrink-0', className)}
      style={{ width: w, height: h }}
    >
      <Image
        src={url}
        alt={alt ?? code}
        width={w * 2}
        height={h * 2}
        className="w-full h-full object-cover"
        unoptimized
      />
    </div>
  );
}

