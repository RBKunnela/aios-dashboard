'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SectionLabel } from '@/components/ui/section-label';
import { SquadTaskCard } from './SquadTaskCard';
import { useSquadAgentDetail } from '@/hooks/use-squads';

interface SquadAgentDetailProps {
  squadName: string;
  agentId: string;
  onBack: () => void;
  breadcrumb?: ReactNode;
}

export function SquadAgentDetail({ squadName, agentId, onBack, breadcrumb }: SquadAgentDetailProps) {
  const { agent, isLoading, isError } = useSquadAgentDetail(squadName, agentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
          Loading agent...
        </span>
      </div>
    );
  }

  if (isError || !agent) {
    return (
      <div className="p-6">
        {breadcrumb}
        <p className="text-[11px] text-[var(--status-error)]">
          Failed to load agent &quot;{agentId}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        {/* Breadcrumb */}
        {breadcrumb}

        {/* Agent Header Card */}
        <div
          className={cn(
            'bg-[var(--card)] border border-[var(--border)] border-l-2 p-5 mb-8',
            'border-l-[var(--accent-gold)]'
          )}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            {agent.icon && (
              <span className="text-2xl shrink-0">{agent.icon}</span>
            )}

            <div className="flex-1 min-w-0">
              {/* Name + Title */}
              <h2 className="text-lg font-light text-[var(--text-primary)]">
                {agent.name}
              </h2>
              {agent.title && (
                <p className="text-[11px] text-[var(--accent-gold)] mt-0.5">
                  {agent.title}
                </p>
              )}
              {agent.role && agent.role !== agent.title && (
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  {agent.role}
                </p>
              )}

              {/* Description */}
              {agent.description && (
                <p className="text-[11px] text-[var(--text-muted)] mt-2 leading-relaxed">
                  {agent.description}
                </p>
              )}

              {/* Tier badge */}
              {agent.tier && (
                <span className="inline-block mt-2 text-[9px] uppercase tracking-wider px-2 py-0.5 border border-[var(--border)] text-[var(--text-muted)]">
                  {agent.tier}
                </span>
              )}
            </div>
          </div>

          {/* Tools */}
          {agent.tools.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                Ferramentas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.map((tool, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Core Principles */}
        {agent.principles.length > 0 && (
          <div className="mb-8">
            <SectionLabel withLine className="mb-3">Principios</SectionLabel>
            <ul className="space-y-1 ml-1">
              {agent.principles.map((p, i) => (
                <li key={i} className="text-[11px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-2">
                  <span className="text-[var(--accent-gold)] shrink-0 mt-0.5">-</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Task Pipeline */}
        {agent.tasks.length > 0 && (
          <div className="mb-8">
            <SectionLabel withLine className="mb-4">
              Tasks ({agent.tasks.length})
            </SectionLabel>

            {/* Horizontal scrollable pipeline with scroll shadows */}
            <div
              className="overflow-x-auto pb-4 -mx-2 px-2"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
              }}
            >
              <div className="flex items-start gap-3">
                {agent.tasks.map((task, i) => (
                  <div key={task.id} className="flex items-start">
                    <SquadTaskCard task={task} />
                    {/* Connector arrow */}
                    {i < agent.tasks.length - 1 && (
                      <div className="flex items-center shrink-0 self-center px-1">
                        <svg width="24" height="12" viewBox="0 0 24 12" className="text-[var(--border)]">
                          <line x1="0" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.5" />
                          <polyline
                            points="15,2 20,6 15,10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Commands */}
        {agent.commands.length > 0 && (
          <div className="mb-8">
            <SectionLabel withLine className="mb-3">Comandos</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {agent.commands.map((cmd, i) => (
                <div
                  key={i}
                  className="text-[10px] font-mono px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] truncate"
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handoffs */}
        {agent.handoffs.length > 0 && (
          <div className="mb-8">
            <SectionLabel withLine className="mb-3">Handoffs</SectionLabel>
            <div className="space-y-1.5">
              {agent.handoffs.map((h, i) => (
                <div
                  key={i}
                  className="text-[11px] flex items-center gap-2 text-[var(--text-secondary)]"
                >
                  <span className="font-mono text-[var(--accent-gold)]">{h.agent}</span>
                  <span className="text-[var(--text-muted)]">-</span>
                  <span className="text-[var(--text-muted)]">{h.when}</span>
                  {h.squad && (
                    <span className="text-[9px] px-1.5 py-0.5 border border-[var(--border)] text-[var(--text-muted)]">
                      {h.squad}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
