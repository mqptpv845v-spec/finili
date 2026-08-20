"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import type { FormatData } from "@/lib/briefd/types";
import { formatDeadline, formatDimensions, formatRequirements, ratioLabel } from "@/lib/briefd/format";
import { CATEGORIES } from "@/lib/briefd/categories";
import { GeometricGlyph } from "@/components/atoms/GeometricGlyph";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export type { FormatData } from "@/lib/briefd/types";

interface FormatCardItemProps {
  format: FormatData;
  onSelect?: (id: string) => void;
}

export function FormatCardItem({ format, onSelect }: FormatCardItemProps) {
  const { copied, copy } = useCopyToClipboard();
  const dimensions = formatDimensions(format.dimensions);

  return (
    <article id={format.id} className="w-full bg-white text-black flex flex-col border border-transparent hover:border-black/30 overflow-hidden scroll-mt-24">
      <div className={`w-full h-2.5 ${CATEGORIES[format.sectionCategory].stripe} shrink-0`} />
      <div className="p-7 sm:p-8 flex flex-col gap-6 flex-1">
        <div className="flex items-center justify-between gap-3 text-label font-bold text-black/60">
          <span>{format.publisher}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${format.trust === "verified" ? "bg-petrol" : "bg-taupe"}`} />
            {format.trust === "verified" ? "Verified source" : "User-provided"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => onSelect?.(format.id)}
            className="text-left text-title font-bold tracking-tight leading-none hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {format.formatName}
          </button>
          <GeometricGlyph widthRatio={format.dimensions.width} heightRatio={format.dimensions.height} size="card" />
        </div>

        <dl className="flex flex-col gap-4">
          <div>
            <dt className="font-bold text-black/60 text-label">Dimensions</dt>
            <dd className="text-value">{dimensions} ({ratioLabel(format.dimensions)})</dd>
          </div>
          <div>
            <dt className="font-bold text-black/60 text-label">Production requirements</dt>
            <dd className="text-value">{formatRequirements(format.requirements)}</dd>
          </div>
          <div>
            <dt className="font-bold text-black/60 text-label">File types</dt>
            <dd className="text-value">{format.fileTypes.length > 0 ? format.fileTypes.join(", ") : "Not recorded"}</dd>
          </div>
          <div>
            <dt className="font-bold text-black/60 text-label">Delivery</dt>
            <dd className="text-value">{formatDeadline(format.deadline)}</dd>
          </div>
          {format.sourceRow && (
            <div>
              <dt className="font-bold text-black/60 text-label">Imported from</dt>
              <dd className="text-value">{format.sourceRow.sheetName}, row {format.sourceRow.rowNumber}</dd>
            </div>
          )}
        </dl>

        <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => copy(dimensions)}
            className="flex items-center gap-1.5 text-label font-bold hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            aria-live="polite"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-petrol" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Dimensions copied" : "Copy dimensions"}</span>
          </button>
          {format.source ? (
            <a
              href={format.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-label font-bold text-petrol underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Source <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-label text-black/60">No external source</span>
          )}
        </div>
      </div>
    </article>
  );
}
