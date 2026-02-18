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
          'bg-card border border-border',
          'hover:bg-card-hover hover:border-border-medium',
          'transition-luxury',
          isClickable ? 'cursor-pointer' : 'cursor-default'
        )}
      >
        <span className="text-label font-mono text-gold">
          {agent.id}
        </span>
        {agent.role && (
          <span className="text-detail text-text-muted truncate max-w-[140px]">
            {agent.role}
          </span>
        )}
        {isClickable && (
          <span className="text-caption text-text-disabled ml-1">→</span>
        )}
      </div>

      {showTooltip && agent.description && (
        <div
          className={cn(
            'absolute bottom-full left-0 mb-2 z-50',
            'px-3 py-2 max-w-[260px]',
            'bg-bg-elevated border border-border-medium',
            'shadow-lg'
          )}
        >
          <p className="text-label text-text-secondary leading-relaxed whitespace-pre-line">
            {agent.description.trim()}
          </p>
          {isClickable && (
            <p className="text-caption text-gold mt-1">Click to see details</p>
          )}
        </div>
      )}
    </div>
  );
});
