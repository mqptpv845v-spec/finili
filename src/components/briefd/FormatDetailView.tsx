"use client";

import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import type { FormatData } from "@/lib/briefd/types";
import { formatDeadline, formatDimensions, formatRequirements, ratioLabel } from "@/lib/briefd/format";
import { CATEGORIES } from "@/lib/briefd/categories";
import { Button } from "@/components/atoms/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface Props { format: FormatData; onBack: () => void }

export function FormatDetailView({ format, onBack }: Props) {
  const { copied, copy } = useCopyToClipboard();
  const dimensions = formatDimensions(format.dimensions);
  const maxArtboard = 520;
  const ratio = format.dimensions.width / format.dimensions.height;
  const width = ratio >= 1 ? maxArtboard : Math.max(180, Math.round(maxArtboard * ratio));
  const height = ratio >= 1 ? Math.max(150, Math.round(maxArtboard / ratio)) : maxArtboard;
  const requirementRows = [
    ["Bleed", format.requirements.bleedMm != null ? `${format.requirements.bleedMm} mm` : null],
    ["Text safe area", format.requirements.textSafeMm != null ? `${format.requirements.textSafeMm} mm` : null],
    ["Image safe area", format.requirements.imageSafeMm != null ? `${format.requirements.imageSafeMm} mm` : null],
    ["Visible area", format.dimensions.visibleWidth && format.dimensions.visibleHeight ? `${format.dimensions.visibleWidth} × ${format.dimensions.visibleHeight} mm` : null],
    ["Resolution", format.requirements.resolutionDpi != null ? `${format.requirements.resolutionDpi} dpi` : null],
    ["Maximum file size", format.requirements.maxFileSizeKb != null ? `${format.requirements.maxFileSizeKb} KB` : null],
    ["Colour profile", format.requirements.colorProfile ?? null],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div className="w-full bg-white text-black py-2 flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-label font-bold hover:opacity-70 focus-visible:outline"><ArrowLeft className="w-4 h-4" />Back to campaign formats</button>
        <span className="text-label font-bold text-black/60">{format.sectionCategory}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div><span className="text-label font-bold text-black/60 block mb-1">{format.publisher} · {format.categoryTag}</span><h2 className="text-section font-bold tracking-tight leading-none">{format.formatName}</h2></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="solid" onClick={() => copy(dimensions)}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied" : "Copy dimensions"}</Button>
          {format.source && <Button variant="solid" href={format.source.url} target="_blank" rel="noopener noreferrer">Open source<ExternalLink className="w-4 h-4" /></Button>}
        </div>
      </div>

      <div className="bg-light p-8 sm:p-12 overflow-auto">
        <div className="mx-auto flex flex-col items-center gap-3" style={{ width }}>
          <span className="text-label text-black/60">Width: {format.dimensions.width} {format.dimensions.unit}</span>
          <div className="bg-white border border-black/30 flex items-center justify-center p-5 text-center" style={{ width, height }}>
            <div><span className="text-value block">{dimensions}</span><span className="text-label text-black/60">Aspect ratio {ratioLabel(format.dimensions)}</span></div>
          </div>
          <span className="text-label text-black/60">Height: {format.dimensions.height} {format.dimensions.unit}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="overflow-hidden"><div className={`h-2.5 ${CATEGORIES[format.sectionCategory].stripe}`} /><div className="p-8"><h3 className="text-title font-bold mb-5">Delivery &amp; provenance</h3><dl className="grid gap-4"><div><dt className="text-label font-bold text-black/60">Deadline</dt><dd className="text-value">{formatDeadline(format.deadline, { year: true })}</dd></div><div><dt className="text-label font-bold text-black/60">Trust</dt><dd className="text-value">{format.trust === "verified" ? "Verified against a cited source" : "User-provided for this campaign"}</dd></div>{format.sourceRow && <div><dt className="text-label font-bold text-black/60">Workbook row</dt><dd className="text-value">{format.sourceRow.sheetName}, row {format.sourceRow.rowNumber}</dd></div>}{format.source && <div><dt className="text-label font-bold text-black/60">Evidence checked</dt><dd className="text-value">{format.source.title} · {format.source.verifiedAt}</dd></div>}</dl></div></section>
        <section className="overflow-hidden"><div className={`h-2.5 ${CATEGORIES[format.sectionCategory].stripe}`} /><div className="p-8"><h3 className="text-title font-bold mb-5">Technical specification</h3><dl className="grid gap-4"><div><dt className="text-label font-bold text-black/60">Dimensions</dt><dd className="text-value">{dimensions} ({ratioLabel(format.dimensions)})</dd></div><div><dt className="text-label font-bold text-black/60">File types</dt><dd className="text-value">{format.fileTypes.join(", ") || "Not recorded"}</dd></div>{requirementRows.map(([label, value]) => <div key={label}><dt className="text-label font-bold text-black/60">{label}</dt><dd className="text-value">{value}</dd></div>)}{requirementRows.length === 0 && <div><dt className="text-label font-bold text-black/60">Additional requirements</dt><dd className="text-value">{formatRequirements(format.requirements)}</dd></div>}</dl></div></section>
      </div>
    </div>
  );
}
