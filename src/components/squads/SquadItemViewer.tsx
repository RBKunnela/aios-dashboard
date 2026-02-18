'use client';

import { type ReactNode } from 'react';
import { Loader2 } from '@/lib/icons';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useSquadItemContent } from '@/hooks/use-squads';

interface SquadItemViewerProps {
  squadName: string;
  section: string;
  slug: string;
  onBack: () => void;
  breadcrumb?: ReactNode;
}

export function SquadItemViewer({
  squadName,
  section,
  slug,
  onBack,
  breadcrumb,
}: SquadItemViewerProps) {
  const { item, isLoading, isError } = useSquadItemContent(squadName, section, slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-gold)]" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-6">
        {breadcrumb}
        <p className="text-[11px] text-[var(--status-error)]">
          Failed to load item
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl">
        {/* Breadcrumb */}
        {breadcrumb}

        {/* Title */}
        <h2 className="text-base font-light text-[var(--text-primary)] mb-6">
          {item.title}
        </h2>

        {/* Content */}
        {item.isYaml ? (
          <MarkdownRenderer
            content={`\`\`\`${item.filePath.endsWith('.json') ? 'json' : 'yaml'}\n${item.content}\n\`\`\``}
          />
        ) : (
          <MarkdownRenderer content={item.content} hideFirstH1 />
        )}
      </div>
    </div>
  );
}
