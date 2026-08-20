"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Check, Copy, Download, ExternalLink, Search } from "lucide-react";
import type { FormatData, SectionCategory } from "@/lib/briefd/types";
import { formatDeadline, formatDimensions, formatRequirements, ratioLabel } from "@/lib/briefd/format";
import { formatsToCsv, formatsToTsv, safeExportName, sortFormats } from "@/lib/briefd/table";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/briefd/categories";
import { Button } from "@/components/atoms/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface Props { formats: FormatData[]; onSelectFormat: (id: string) => void; campaignName?: string }
type SortField = "deadline" | "formatName" | "publisher" | "category" | "dimensions";

export function BriefdSpreadsheetView({ formats, onSelectFormat, campaignName = "Briefd campaign" }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SectionCategory | "all">("all");
  const [sortField, setSortField] = useState<SortField>("deadline");
  const [ascending, setAscending] = useState(true);
  const { copied, copy } = useCopyToClipboard();
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = formats.filter((format) => (category === "all" || format.sectionCategory === category) && (!needle || [format.formatName, format.publisher, formatDimensions(format.dimensions), format.fileTypes.join(" ")].some((value) => value.toLowerCase().includes(needle))));
    return sortFormats(filtered, sortField, ascending);
  }, [formats, query, category, sortField, ascending]);

  const sort = (field: SortField) => {
    if (sortField === field) setAscending((value) => !value);
    else { setSortField(field); setAscending(true); }
  };
  const download = () => {
    const blob = new Blob([formatsToCsv(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = safeExportName(campaignName); anchor.click();
    URL.revokeObjectURL(url);
  };
  const counts = formats.reduce<Record<string, number>>((result, format) => ({ ...result, [format.sectionCategory]: (result[format.sectionCategory] ?? 0) + 1 }), {});
  const header = (label: string, field: SortField) => (
    <button type="button" onClick={() => sort(field)} className="inline-flex items-center gap-1 hover:text-black focus-visible:outline" aria-label={`Sort by ${label}`}>
      {label}<ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="w-full bg-white flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div><h2 className="text-title font-bold">Spreadsheet view</h2><p className="text-value text-black/60 mt-1">Structured campaign data with source and trust labels.</p></div>
        <div className="flex gap-2">
          <Button variant="soft" size="sm" onClick={() => copy(formatsToTsv(visible))}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "Copied" : "Copy visible rows"}</Button>
          <Button variant="soft" size="sm" onClick={download}><Download className="w-3.5 h-3.5" />Export visible CSV</Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setCategory("all")} className={`px-2.5 py-1 text-label font-bold ${category === "all" ? "bg-black text-white" : "bg-black/5"}`}>All ({formats.length})</button>
          {CATEGORY_ORDER.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`px-2.5 py-1 text-label font-bold ${category === item ? `${CATEGORIES[item].sectionBg} ${CATEGORIES[item].titleColor}` : "bg-black/5"}`}>{CATEGORIES[item].shortLabel} ({counts[item] ?? 0})</button>)}
        </div>
        <label className="relative sm:w-64"><span className="sr-only">Filter formats</span><Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black/60" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter formats or publishers…" className="w-full pl-8 pr-3 py-1.5 text-label bg-black/[0.03] border border-black/10 focus-visible:outline" /></label>
      </div>
      <div className="w-full border border-black/[0.08] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead><tr className="border-b border-black/[0.08] bg-black/[0.02] text-label font-bold text-black/60">
            <th className="p-3">#</th><th className="p-3" aria-sort={sortField === "formatName" ? (ascending ? "ascending" : "descending") : "none"}>{header("Format", "formatName")}</th><th className="p-3">Channel</th><th className="p-3">{header("Publisher", "publisher")}</th><th className="p-3">{header("Dimensions", "dimensions")}</th><th className="p-3">Requirements</th><th className="p-3">File types</th><th className="p-3">{header("Deadline", "deadline")}</th><th className="p-3">Trust</th><th className="p-3 text-right">Source</th>
          </tr></thead>
          <tbody className="divide-y divide-black/[0.05] text-label">
            {visible.map((format, index) => <tr key={format.id} className={`${CATEGORIES[format.sectionCategory].hoverBg}`}>
              <td className="p-3 text-black/60">{index + 1}</td><td className="p-3"><button type="button" onClick={() => onSelectFormat(format.id)} className="font-semibold hover:underline focus-visible:outline">{format.formatName}</button></td><td className="p-3 text-black/60">{format.categoryTag}</td><td className="p-3">{format.publisher}</td><td className="p-3 whitespace-nowrap">{formatDimensions(format.dimensions)} <span className="text-black/60">({ratioLabel(format.dimensions)})</span></td><td className="p-3 text-black/60">{formatRequirements(format.requirements)}</td><td className="p-3 text-black/60">{format.fileTypes.join(", ") || "Not recorded"}</td><td className="p-3 whitespace-nowrap">{formatDeadline(format.deadline, { year: true })}</td><td className="p-3">{format.trust === "verified" ? "Verified" : "User-provided"}</td><td className="p-3 text-right">{format.source ? <a href={format.source.url} target="_blank" rel="noopener noreferrer" className="text-petrol underline inline-flex items-center gap-1">Spec<ExternalLink className="w-3 h-3" /></a> : "—"}</td>
            </tr>)}
            {visible.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-black/60">No formats match the current filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-label text-black/60" aria-live="polite">Showing {visible.length} of {formats.length} formats.</p>
    </div>
  );
}
