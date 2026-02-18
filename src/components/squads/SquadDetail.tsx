'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft } from '@/lib/icons';
import { SectionLabel } from '@/components/ui/section-label';
import { formatSquadScore, formatSquadVersion, getScoreColor } from '@/lib/squad-metadata';
import { getDomainColor, getDomainLabel } from '@/lib/domain-taxonomy';
import { SquadTierTree } from './SquadTierTree';
import { SquadSectionGrid } from './SquadSectionGrid';
import { SquadItemViewer } from './SquadItemViewer';
import { useSquadDetail } from '@/hooks/use-squads';
import type { Squad } from '@/types';

type TabId = 'overview' | 'agents' | 'tasks' | 'workflows' | 'checklists' | 'templates' | 'data';

interface TabDef {
  id: TabId;
  label: string;
  section?: string; // maps to API section name
  countKey?: keyof Squad;
}

const TAB_DEFS: TabDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'agents', label: 'Agents', section: 'agents', countKey: 'agentCount' },
  { id: 'tasks', label: 'Tasks', section: 'tasks', countKey: 'taskCount' },
  { id: 'workflows', label: 'Workflows', section: 'workflows', countKey: 'workflowCount' },
  { id: 'checklists', label: 'Checklists', section: 'checklists', countKey: 'checklistCount' },
  { id: 'templates', label: 'Templates', section: 'templates', countKey: 'templateCount' },
  { id: 'data', label: 'Data', section: 'data', countKey: 'dataCount' },
];

interface SquadDetailProps {
  squadName: string;
  onBack: () => void;
  onAgentClick?: (agentId: string) => void;
}

export function SquadDetail({ squadName, onBack, onAgentClick }: SquadDetailProps) {
  const { squad, isLoading, isError } = useSquadDetail(squadName);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedItem, setSelectedItem] = useState<{ section: string; slug: string } | null>(null);

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

  // If viewing an item, show the item viewer
  if (selectedItem) {
    return (
      <SquadItemViewer
        squadName={squadName}
        section={selectedItem.section}
        slug={selectedItem.slug}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  const domainColor = getDomainColor(squad.domain);
  const extSquad = squad as Squad & { objectives?: string[]; keyCapabilities?: string[] };

  // Filter tabs to only show ones with items (overview always shows)
  const visibleTabs = TAB_DEFS.filter((tab) => {
    if (tab.id === 'overview') return true;
    if (!tab.countKey) return true;
    return (squad[tab.countKey] as number) > 0;
  });

  const currentTab = TAB_DEFS.find((t) => t.id === activeTab);

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
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[var(--border)]">
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

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-px border-b border-[var(--border)]">
          {visibleTabs.map((tab) => {
            const count = tab.countKey ? (squad[tab.countKey] as number) : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 py-2 text-[10px] uppercase tracking-wider font-medium whitespace-nowrap transition-colors',
                  'border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {tab.label}
                {count !== null && count > 0 && (
                  <span className="ml-1.5 font-mono text-[9px] opacity-60">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' ? (
          <OverviewContent squad={extSquad} onAgentClick={onAgentClick} />
        ) : currentTab?.section ? (
          <SquadSectionGrid
            squadName={squadName}
            section={currentTab.section}
            onItemClick={(slug) => {
              if (currentTab.section === 'agents' && onAgentClick) {
                onAgentClick(slug);
              } else {
                setSelectedItem({ section: currentTab.section!, slug });
              }
            }}
            onAgentClick={onAgentClick}
          />
        ) : null}
      </div>
    </div>
  );
}

function OverviewContent({
  squad,
  onAgentClick,
}: {
  squad: Squad & { objectives?: string[]; keyCapabilities?: string[] };
  onAgentClick?: (agentId: string) => void;
}) {
  return (
    <>
      {/* Objectives */}
      {squad.objectives && squad.objectives.length > 0 && (
        <div className="mb-8">
          <SectionLabel withLine className="mb-3">Objectives</SectionLabel>
          <ul className="space-y-1.5 ml-1">
            {squad.objectives.map((obj, i) => (
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
    </>
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
