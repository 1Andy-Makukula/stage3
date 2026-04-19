import { BadgeCheck } from 'lucide-react';
import { cn } from '../ui/utils';

interface KithLyVerifiedBadgeProps {
  className?: string;
  compact?: boolean;
}

/** Trust chip for system-verified merchants (TPIN / onboarding). */
export function KithLyVerifiedBadge({ className, compact }: KithLyVerifiedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2 py-0.5 text-[11px] font-light text-emerald-800',
        compact ? 'text-[10px] px-1.5' : '',
        className
      )}
      title="KithLy verified merchant"
    >
      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
      <span>KithLy Verified</span>
    </span>
  );
}
