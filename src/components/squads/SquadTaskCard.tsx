'use client';

import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { AgentTask } from '@/hooks/use-squads';

interface SquadTaskCardProps {
  task: AgentTask;
}

export const SquadTaskCard = memo(function SquadTaskCard({ task }: SquadTaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'bg-[var(--card)] border border-[var(--border)]',
        'transition-luxury',
        'hover:border-[var(--border-medium)]',
        'w-[280px] shrink-0'
      )}
    >
      {/* Task Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 border-b border-[var(--border-subtle)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-[var(--text-primary)] truncate">
            {task.name || task.id}
          </span>
          <span className="text-[9px] text-[var(--text-muted)] ml-2 shrink-0">
            {expanded ? '−' : '+'}
          </span>
        </div>
        {task.category && (
          <span className="text-[9px] uppercase tracking-wider text-[var(--accent-gold)]">
            {task.category}
          </span>
        )}
      </button>

      {/* Input / Output (always visible) */}
      <div className="px-4 py-2.5 space-y-2">
        {task.inputs.length > 0 && (
          <div>
            <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)] block mb-1">
              Input
            </span>
            <ul className="space-y-0.5">
              {task.inputs.slice(0, 3).map((input, i) => (
                <li key={i} className="text-[10px] text-[var(--text-secondary)] leading-snug truncate">
                  {input}
                </li>
              ))}
            </ul>
          </div>
        )}

        {task.outputs.length > 0 && (
          <div>
            <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)] block mb-1">
              Output
            </span>
            <ul className="space-y-0.5">
              {task.outputs.slice(0, 3).map((output, i) => (
                <li key={i} className="text-[10px] text-[var(--text-secondary)] leading-snug truncate">
                  {output}
                </li>
              ))}
            </ul>
          </div>
        )}

        {task.inputs.length === 0 && task.outputs.length === 0 && task.description && (
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-3">
            {task.description}
          </p>
        )}
      </div>

      {/* Expanded: Responsibilities, Anti-patterns, Tools */}
      {expanded && (
        <div className="px-4 pb-3 space-y-2.5 border-t border-[var(--border-subtle)] pt-2.5">
          {task.responsibilities.length > 0 && (
            <div>
              <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--status-success)] block mb-1">
                O que faz
              </span>
              <ul className="space-y-0.5">
                {task.responsibilities.map((r, i) => (
                  <li key={i} className="text-[10px] text-[var(--text-secondary)] leading-snug flex items-start gap-1">
                    <span className="text-[var(--text-muted)] shrink-0 mt-px">-</span>
                    <span className="line-clamp-2">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.antiPatterns.length > 0 && (
            <div>
              <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--status-error)] block mb-1">
                Nao faz
              </span>
              <ul className="space-y-0.5">
                {task.antiPatterns.map((a, i) => (
                  <li key={i} className="text-[10px] text-[var(--text-muted)] leading-snug flex items-start gap-1">
                    <span className="shrink-0 mt-px">-</span>
                    <span className="line-clamp-2">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.tools.length > 0 && (
            <div>
              <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--status-info)] block mb-1">
                Ferramentas
              </span>
              <div className="flex flex-wrap gap-1">
                {task.tools.map((t, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.estimatedDuration && (
            <div className="text-[9px] text-[var(--text-muted)]">
              Duracao: {task.estimatedDuration}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
