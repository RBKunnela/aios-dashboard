'use client';

import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SquadAgent } from '@/types';

interface SquadAgentChipProps {
  agent: SquadAgent;
  onClick?: (agentId: string) => void;
}

export const SquadAgentChip = memo(function SquadAgentChip({ agent, onClick }: SquadAgentChipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isClickable = !!onClick;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        onClick={isClickable ? () => onClick(agent.id) : undefined}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5',
          'bg-[var(--card)] border border-[var(--border)]',
          'hover:bg-[var(--card-hover)] hover:border-[var(--border-medium)]',
          'transition-luxury',
          isClickable ? 'cursor-pointer' : 'cursor-default'
        )}
      >
        <span className="text-[11px] font-mono text-[var(--accent-gold)]">
          {agent.id}
        </span>
        {agent.role && (
          <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[140px]">
            {agent.role}
          </span>
        )}
        {isClickable && (
          <span className="text-[9px] text-[var(--text-disabled)] ml-1">→</span>
        )}
      </div>

      {showTooltip && agent.description && (
        <div
          className={cn(
            'absolute bottom-full left-0 mb-2 z-50',
            'px-3 py-2 max-w-[260px]',
            'bg-[var(--bg-elevated)] border border-[var(--border-medium)]',
            'shadow-lg'
          )}
        >
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {agent.description.trim()}
          </p>
          {isClickable && (
            <p className="text-[9px] text-[var(--accent-gold)] mt-1">Click to see details</p>
          )}
        </div>
      )}
    </div>
  );
});
