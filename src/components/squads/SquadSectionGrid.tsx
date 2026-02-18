'use client';

import { cn } from '@/lib/utils';
import { useSquadSectionItems } from '@/hooks/use-squads';
import { Loader2 } from '@/lib/icons';

interface SquadSectionGridProps {
  squadName: string;
  section: string;
  onItemClick: (slug: string) => void;
  onAgentClick?: (agentId: string) => void;
}

export function SquadSectionGrid({
  squadName,
  section,
  onItemClick,
  onAgentClick,
}: SquadSectionGridProps) {
  const { items, isLoading, isError } = useSquadSectionItems(squadName, section);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-gold)]" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-[11px] text-[var(--status-error)] py-6">
        Failed to load {section} items
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-[11px] text-[var(--text-muted)] py-6">
        No items in {section}
      </p>
    );
  }

  const handleClick = (slug: string) => {
    if (section === 'agents' && onAgentClick) {
      onAgentClick(slug);
    } else {
      onItemClick(slug);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item) => (
        <button
          key={item.slug}
          onClick={() => handleClick(item.slug)}
          className={cn(
            'text-left p-3 border border-[var(--border)]',
            'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]',
            'hover:border-[var(--accent-gold)]/40',
            'transition-all duration-150 group'
          )}
        >
          <span className="block text-[11px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
            {item.name}
          </span>
          <span className="block text-[9px] text-[var(--text-muted)] font-mono mt-0.5">
            {item.relativePath}
          </span>
        </button>
      ))}
    </div>
  );
}
