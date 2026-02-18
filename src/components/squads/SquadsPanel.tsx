'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Network, RefreshCw, Loader2 } from '@/lib/icons';
import { useSquads } from '@/hooks/use-squads';
import { useSquadStore } from '@/stores/squad-store';
import { SquadOrganogram } from './SquadOrganogram';
import { SquadDetail } from './SquadDetail';
import { SquadAgentDetail } from './SquadAgentDetail';

export function SquadsPanel() {
  const { squads, domainIndex, summary, isLoading, refresh } =
    useSquads();
  const { selectedSquad, setSelectedSquad } = useSquadStore();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleSquadClick = useCallback(
    (name: string) => {
      setSelectedSquad(name);
      setSelectedAgent(null);
    },
    [setSelectedSquad]
  );

  const handleBackToOrganogram = useCallback(() => {
    setSelectedSquad(null);
    setSelectedAgent(null);
  }, [setSelectedSquad]);

  const handleBackToSquad = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  const handleAgentClick = useCallback((agentId: string) => {
    setSelectedAgent(agentId);
  }, []);

  // Agent detail view (level 3)
  if (selectedSquad && selectedAgent) {
    return (
      <SquadAgentDetail
        squadName={selectedSquad}
        agentId={selectedAgent}
        onBack={handleBackToSquad}
      />
    );
  }

  // Squad detail view (level 2)
  if (selectedSquad) {
    return (
      <SquadDetail
        squadName={selectedSquad}
        onBack={handleBackToOrganogram}
        onAgentClick={handleAgentClick}
      />
    );
  }

  // Organogram view (level 1)
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network
              className="h-4 w-4 text-[var(--accent-gold)]"
            />
            <h1 className="text-sm font-light text-[var(--text-primary)]">
              Squads
            </h1>

            {/* Summary badges */}
            <div className="flex items-center gap-3 ml-4 flex-wrap">
              <span className="text-[10px] text-[var(--text-muted)]">
                <span className="font-mono text-[var(--text-secondary)]">
                  {squads.length}
                </span>{' '}
                squads
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                <span className="font-mono text-[var(--text-secondary)]">
                  {summary.total_agents}
                </span>{' '}
                agents
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                <span className="font-mono text-[var(--text-secondary)]">
                  {summary.total_tasks}
                </span>{' '}
                tasks
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                <span className="font-mono text-[var(--text-secondary)]">
                  {summary.total_workflows}
                </span>{' '}
                workflows
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                <span className="font-mono text-[var(--text-secondary)]">
                  {summary.total_templates}
                </span>{' '}
                templates
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                <span className="font-mono text-[var(--text-secondary)]">
                  {summary.total_checklists}
                </span>{' '}
                checklists
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                <span className="font-mono text-[var(--text-secondary)]">
                  {summary.total_data_files}
                </span>{' '}
                data
              </span>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className={cn(
              'p-1.5 transition-colors',
              'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              isLoading && 'animate-spin'
            )}
            aria-label="Refresh squads"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && squads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-gold)] mx-auto mb-3" />
              <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                Loading squads...
              </span>
            </div>
          </div>
        ) : squads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-[var(--text-muted)]">No squads found</p>
              <p className="text-[11px] text-[var(--text-disabled)] mt-1">
                Check that squads/ directory exists in the project root
              </p>
            </div>
          </div>
        ) : (
          <SquadOrganogram
            squads={squads}
            domainIndex={domainIndex}
            onSquadClick={handleSquadClick}
          />
        )}
      </div>
    </div>
  );
}
