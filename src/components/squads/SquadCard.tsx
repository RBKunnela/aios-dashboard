'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { getDomainColor, getDomainBg, getDomainBorder } from '@/lib/domain-taxonomy';
import { formatSquadScore, formatSquadVersion, getScoreColor } from '@/lib/squad-metadata';
import type { Squad } from '@/types';

interface SquadCardProps {
  squad: Squad;
  onClick?: () => void;
}

export const SquadCard = memo(function SquadCard({ squad, onClick }: SquadCardProps) {
  const domainColor = getDomainColor(squad.domain);
  const domainBg = getDomainBg(squad.domain);
  const domainBorder = getDomainBorder(squad.domain);

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
            className="text-caption uppercase tracking-wider font-medium px-2 py-0.5 border shrink-0 ml-2"
            style={{
              backgroundColor: domainBg,
              borderColor: domainBorder,
              color: domainColor,
            }}
          >
            {squad.status}
          </span>
        </div>

        {/* Description */}
        {squad.description && (
          <p className="text-label text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-3">
            {squad.description}
          </p>
        )}

        {/* Footer: counts + score + version */}
        <div className="flex items-center gap-3 text-detail text-[var(--text-muted)]">
          <span><span className="font-mono text-[var(--text-tertiary)]">{squad.agentCount}</span> agentes</span>
          <span><span className="font-mono text-[var(--text-tertiary)]">{squad.taskCount}</span> tarefas</span>
          {squad.checklistCount > 0 && (
            <span><span className="font-mono text-[var(--text-tertiary)]">{squad.checklistCount}</span> checklists</span>
          )}
          {squad.workflowCount > 0 && (
            <span><span className="font-mono text-[var(--text-tertiary)]">{squad.workflowCount}</span> workflows</span>
          )}
          <span className="ml-auto flex items-center gap-2 font-mono">
            <span
              className="flex items-center gap-1.5"
              title={`Score: ${formatSquadScore(squad.score)}/10`}
            >
              <span style={{ color: getScoreColor(squad.score) }}>
                {formatSquadScore(squad.score)}
              </span>
              <span
                className="inline-block w-[40px] h-[3px] rounded-full bg-[var(--border-subtle)] overflow-hidden"
                aria-hidden="true"
              >
                <span
                  className="block h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(squad.score / 10) * 100}%`,
                    backgroundColor: getScoreColor(squad.score),
                  }}
                />
              </span>
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
