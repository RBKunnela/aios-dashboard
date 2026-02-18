'use client';

import { cn } from '@/lib/utils';
import { useSquadSectionItems } from '@/hooks/use-squads';
import { Loader2, FileText, FileCode, FolderOpen, type LucideIcon } from '@/lib/icons';

function getFileIcon(path: string): LucideIcon {
  if (path.endsWith('.md')) return FileText;
  if (path.endsWith('.yaml') || path.endsWith('.yml')) return FileCode;
  if (path.endsWith('.json') || path.endsWith('.jsonc')) return FileCode;
  return FolderOpen;
}

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
      <p className="text-label text-[var(--status-error)] py-6">
        Failed to load {section} items
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-label text-[var(--text-muted)] py-6">
        No items in {section}
      </p>
    );
  }

  const handleClick = (slug: string, relativePath: string) => {
    if (section === 'agents' && onAgentClick) {
      const normalized = relativePath.replace(/\\/g, '/').replace(/\.md$/i, '');
      const agentId = normalized.split('/').pop() || normalized;
      onAgentClick(agentId);
    } else {
      onItemClick(slug);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item) => (
        <button
          key={item.slug}
          onClick={() => handleClick(item.slug, item.relativePath)}
          className={cn(
            'text-left p-3 border border-[var(--border)]',
            'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]',
            'hover:border-[var(--accent-gold)]/40',
            'transition-all duration-150 group'
          )}
        >
          <span className="flex items-center gap-1.5 text-label font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
            {(() => {
              const Icon = getFileIcon(item.relativePath || item.name);
              return <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent-gold)] transition-colors" />;
            })()}
            <span className="truncate">{item.name}</span>
          </span>
          <span className="block text-caption text-[var(--text-muted)] font-mono mt-0.5 pl-5">
            {item.relativePath}
          </span>
        </button>
      ))}
    </div>
  );
}
