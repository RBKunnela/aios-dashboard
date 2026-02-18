'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { getDomainColor } from '@/lib/domain-taxonomy';
import { formatSquadScore, formatSquadVersion } from '@/lib/squad-metadata';
import type { Squad } from '@/types';

function getScoreColor(score: number): string {
  if (score < 5.0) return 'var(--status-error)';
  if (score < 7.0) return 'var(--status-warning)';
  return 'var(--status-success)';
}

interface SquadCardProps {
  squad: Squad;
  onClick?: () => void;
}

export const SquadCard = memo(function SquadCard({ squad, onClick }: SquadCardProps) {
  const domainColor = getDomainColor(squad.domain);

  return (
    <div
      data-squad={squad.name}
      onClick={onClick}
      className={cn(
        'group relative',
        'bg-[var(--card)] border border-[var(--border)] border-l-2',
        'transition-luxury hover-lift',
        'hover:bg-[var(--card-hover)] hover:border-[var(--border-medium)]',
        'cursor-pointer'
      )}
      style={{ borderLeftColor: domainColor }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-light text-[var(--text-primary)] truncate">
            {squad.displayName}
          </span>
          <span
            className="text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 border shrink-0 ml-2"
            style={{
              backgroundColor: `${domainColor}15`,
              borderColor: `${domainColor}30`,
              color: domainColor,
            }}
          >
            {squad.status}
          </span>
        </div>

        {/* Description */}
        {squad.description && (
          <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-3">
            {squad.description}
          </p>
        )}

        {/* Footer: counts + score + version */}
        <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
          <span><span className="font-mono text-[var(--text-tertiary)]">{squad.agentCount}</span> agentes</span>
          <span><span className="font-mono text-[var(--text-tertiary)]">{squad.taskCount}</span> tarefas</span>
          {squad.checklistCount > 0 && (
            <span><span className="font-mono text-[var(--text-tertiary)]">{squad.checklistCount}</span> checklists</span>
          )}
          {squad.workflowCount > 0 && (
            <span><span className="font-mono text-[var(--text-tertiary)]">{squad.workflowCount}</span> workflows</span>
          )}
          <span className="ml-auto flex items-center gap-2 font-mono">
            <span style={{ color: getScoreColor(squad.score) }}>
              {formatSquadScore(squad.score)}
            </span>
            <span className="text-[var(--text-disabled)]">
              {formatSquadVersion(squad.version)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
});
