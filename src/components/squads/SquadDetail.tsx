'use client';

import { cn } from '@/lib/utils';
import { ArrowLeft } from '@/lib/icons';
import { SectionLabel } from '@/components/ui/section-label';
import { formatSquadScore, formatSquadVersion } from '@/lib/squad-metadata';
import { getDomainColor, getDomainLabel } from '@/lib/domain-taxonomy';
import { SquadTierTree } from './SquadTierTree';
import { useSquadDetail } from '@/hooks/use-squads';
import type { Squad } from '@/types';

interface SquadDetailProps {
  squadName: string;
  onBack: () => void;
  onAgentClick?: (agentId: string) => void;
}

function getScoreColor(score: number): string {
  if (score < 5.0) return 'var(--status-error)';
  if (score < 7.0) return 'var(--status-warning)';
  return 'var(--status-success)';
}

export function SquadDetail({ squadName, onBack, onAgentClick }: SquadDetailProps) {
  const { squad, isLoading, isError } = useSquadDetail(squadName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
          Loading squad...
        </span>
      </div>
    );
  }

  if (isError || !squad) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Back</span>
        </button>
        <p className="text-[11px] text-[var(--status-error)]">
          Failed to load squad &quot;{squadName}&quot;
        </p>
      </div>
    );
  }

  const domainColor = getDomainColor(squad.domain);
  const extSquad = squad as Squad & { objectives?: string[]; keyCapabilities?: string[] };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-3xl">
        {/* Back + Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Back to Squads</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-light text-[var(--text-primary)]">
            {squad.displayName}
          </h2>
          <span
            className="text-[10px] font-mono"
            style={{ color: getScoreColor(squad.score) }}
          >
            {formatSquadScore(squad.score)}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {formatSquadVersion(squad.version)}
          </span>
          <span
            className="text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 border"
            style={{
              backgroundColor: `${domainColor}15`,
              borderColor: `${domainColor}30`,
              color: domainColor,
            }}
          >
            {getDomainLabel(squad.domain)}
          </span>
        </div>

        {/* Description */}
        {squad.description && (
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-6 whitespace-pre-line">
            {squad.description.trim()}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-[var(--border)]">
          <Stat label="Agents" value={squad.agentCount} />
          <Stat label="Tasks" value={squad.taskCount} />
          <Stat label="Workflows" value={squad.workflowCount} />
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-base font-mono"
              style={{ color: getScoreColor(squad.score) }}
            >
              {formatSquadScore(squad.score)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Score
            </span>
          </div>
        </div>

        {/* Objectives */}
        {extSquad.objectives && extSquad.objectives.length > 0 && (
          <div className="mb-8">
            <SectionLabel withLine className="mb-3">Objectives</SectionLabel>
            <ul className="space-y-1.5 ml-1">
              {extSquad.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-gold)] mt-0.5 shrink-0">-</span>
                  <span className="leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dependencies */}
        {squad.dependencies.length > 0 && (
          <div className="mb-8">
            <SectionLabel withLine className="mb-3">Dependencies</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {squad.dependencies.map((dep) => (
                <span
                  key={`${dep.from}-${dep.to}`}
                  className={cn(
                    'text-[10px] px-2 py-1 border',
                    dep.type === 'required'
                      ? 'border-[var(--accent-gold)] text-[var(--accent-gold)] bg-[var(--accent-gold)]/5'
                      : 'border-[var(--border)] text-[var(--text-muted)]'
                  )}
                >
                  {dep.to}
                  {dep.type === 'optional' && ' (optional)'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tier Tree */}
        <div className="mb-8">
          <SectionLabel withLine className="mb-4">Agent Hierarchy</SectionLabel>
          <SquadTierTree tiers={squad.tiers || []} onAgentClick={onAgentClick} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-base font-mono text-[var(--text-primary)]">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
    </div>
  );
}
