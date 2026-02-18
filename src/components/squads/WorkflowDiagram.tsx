'use client';

import { useMemo, useState, useCallback } from 'react';
import { Mermaid } from '@/components/mermaidcn/mermaid';
import { ZoomPan } from '@/components/mermaidcn/zoom-pan';
import { yamlToMermaid } from '@/lib/yaml-to-mermaid';

interface WorkflowDiagramProps {
  yamlContent: string;
}

/**
 * Convert an SVG string to a PNG data URL via canvas for ZoomPan rendering.
 */
function svgToDataUrl(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // Retina quality
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG as image'));
    };

    img.src = url;
  });
}

export function WorkflowDiagram({ yamlContent }: WorkflowDiagramProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Attempt to convert YAML to Mermaid syntax
  const { mermaidString, conversionError } = useMemo(() => {
    try {
      const result = yamlToMermaid(yamlContent);
      return { mermaidString: result, conversionError: null };
    } catch (err) {
      return {
        mermaidString: null,
        conversionError: err instanceof Error ? err.message : 'Failed to convert workflow to diagram',
      };
    }
  }, [yamlContent]);

  const handleSuccess = useCallback((svg: string) => {
    setRenderError(null);
    svgToDataUrl(svg)
      .then(setImageSrc)
      .catch(() => {
        // If data URL conversion fails, still show inline SVG (no zoom/pan)
        setImageSrc(null);
      });
  }, []);

  const handleError = useCallback((error: string) => {
    setRenderError(error);
    setImageSrc(null);
  }, []);

  // Error fallback: show error message + raw YAML code
  if (conversionError) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-status-error/20 bg-status-error/5 p-3">
          <p className="text-sm text-status-error">
            Failed to generate diagram: {conversionError}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Showing raw YAML below.
          </p>
        </div>
        <pre className="overflow-auto rounded-md bg-surface-secondary p-4 text-xs text-text-primary font-mono leading-relaxed">
          {yamlContent}
        </pre>
      </div>
    );
  }

  if (!mermaidString) return null;

  return (
    <div className="w-full">
      {/* ZoomPan view when image is ready */}
      {imageSrc && !renderError ? (
        <div className="w-full h-[500px] rounded-md border border-border-primary bg-surface-secondary">
          <ZoomPan
            imageSrc={imageSrc}
            initialScale={0.8}
            minScale={0.1}
            maxScale={4}
            controls={({ zoomIn, zoomOut, resetZoom, centerView, scalePercent }) => (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border-primary bg-surface-primary/50">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="px-2 py-1 text-xs rounded border border-border-primary hover:bg-surface-secondary text-text-secondary"
                >
                  -
                </button>
                <span className="text-xs text-text-secondary w-12 text-center">
                  {scalePercent}%
                </span>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="px-2 py-1 text-xs rounded border border-border-primary hover:bg-surface-secondary text-text-secondary"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={centerView}
                  className="px-2 py-1 text-xs rounded border border-border-primary hover:bg-surface-secondary text-text-secondary"
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="px-2 py-1 text-xs rounded border border-border-primary hover:bg-surface-secondary text-text-secondary"
                >
                  Reset
                </button>
              </div>
            )}
          />
        </div>
      ) : (
        /* Inline Mermaid while ZoomPan image loads (or if conversion fails) */
        <div className="w-full overflow-auto rounded-md border border-border-primary bg-surface-secondary p-4">
          <Mermaid
            chart={mermaidString}
            config={{ theme: 'dark' }}
            onSuccess={handleSuccess}
            onError={handleError}
            debounceTime={100}
          />
        </div>
      )}

      {/* Render error fallback */}
      {renderError && (
        <div className="mt-3 space-y-3">
          <div className="rounded-md border border-status-error/20 bg-status-error/5 p-3">
            <p className="text-sm text-status-error">
              Diagram render error: {renderError}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Showing raw YAML below.
            </p>
          </div>
          <pre className="overflow-auto rounded-md bg-surface-secondary p-4 text-xs text-text-primary font-mono leading-relaxed">
            {yamlContent}
          </pre>
        </div>
      )}
    </div>
  );
}
