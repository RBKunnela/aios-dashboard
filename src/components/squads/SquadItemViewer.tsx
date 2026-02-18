'use client';

import { ArrowLeft, Loader2 } from '@/lib/icons';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useSquadItemContent } from '@/hooks/use-squads';

interface SquadItemViewerProps {
  squadName: string;
  section: string;
  slug: string;
  onBack: () => void;
}

export function SquadItemViewer({
  squadName,
  section,
  slug,
  onBack,
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
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Back</span>
        </button>
        <p className="text-[11px] text-[var(--status-error)]">
          Failed to load item
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl">
        {/* Back + Breadcrumb */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Back to {section}</span>
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)] font-mono mb-4">
          <span>{section}</span>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{item.filePath}</span>
        </div>

        {/* Title */}
        <h2 className="text-base font-light text-[var(--text-primary)] mb-6">
          {item.title}
        </h2>

        {/* Content */}
        {item.isYaml ? (
          <pre className="bg-[var(--bg-tertiary)] border border-[var(--border)] p-4 overflow-x-auto font-mono text-[10px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {item.content}
          </pre>
        ) : (
          <MarkdownRenderer content={item.content} hideFirstH1 />
        )}
      </div>
    </div>
  );
}
