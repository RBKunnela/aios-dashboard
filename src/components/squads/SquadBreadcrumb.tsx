'use client';

import { cn } from '@/lib/utils';
import { ChevronRight } from '@/lib/icons';

export interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface SquadBreadcrumbProps {
  segments: BreadcrumbSegment[];
  className?: string;
}

export function SquadBreadcrumb({ segments, className }: SquadBreadcrumbProps) {
  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-[10px] font-mono', className)}
    >
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-2.5 w-2.5 text-[var(--text-disabled)] shrink-0" />
            )}
            {isLast || !segment.onClick ? (
              <span
                className={cn(
                  isLast
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)]'
                )}
              >
                {segment.label}
              </span>
            ) : (
              <button
                onClick={segment.onClick}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {segment.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
