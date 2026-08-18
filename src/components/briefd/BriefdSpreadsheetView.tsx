"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Download, Copy, Check, ExternalLink } from "lucide-react";
import type { FormatData, SectionCategory } from "@/lib/briefd/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/briefd/categories";
import { Button } from "@/components/atoms/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface BriefdSpreadsheetViewProps {
  formats: FormatData[];
  onSelectFormat: (formatId: string) => void;
}

type SortField = "deadline" | "formatName" | "publisher" | "category" | "dimensions";

export function BriefdSpreadsheetView({ formats, onSelectFormat }: BriefdSpreadsheetViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SectionCategory | "all">("all");
  const [sortField, setSortField] = useState<SortField>("deadline");
  const [sortAsc, setSortAsc] = useState(true);
  const { copied: copiedAll, copy: copyTable } = useCopyToClipboard();

  // Filtered & Sorted formats
  const filteredFormats = useMemo(() => {
    return formats
      .filter((f) => {
        const matchesCategory = selectedCategory === "all" || f.sectionCategory === selectedCategory;
        const matchesSearch =
          f.formatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.dimensions.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.fileType.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let valA = "";
        let valB = "";

        if (sortField === "deadline") {
          // Parse e.g. "10 Sep" -> day number
          const dayA = parseInt(a.deadline.split(" ")[0], 10) || 0;
          const dayB = parseInt(b.deadline.split(" ")[0], 10) || 0;
          return sortAsc ? dayA - dayB : dayB - dayA;
        } else if (sortField === "formatName") {
          valA = a.formatName;
          valB = b.formatName;
        } else if (sortField === "publisher") {
          valA = a.publisher;
          valB = b.publisher;
        } else if (sortField === "category") {
          valA = a.sectionCategory;
          valB = b.sectionCategory;
        } else if (sortField === "dimensions") {
          valA = a.dimensions;
          valB = b.dimensions;
        }

        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [formats, searchQuery, selectedCategory, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Format", "Channel", "Publisher", "Dimensions", "Ratio", "Safe Zone", "File Format", "Deadline", "Spec URL"];
    const rows = formats.map((f) => [
      `"${f.formatName}"`,
      `"${f.sectionCategory}"`,
      `"${f.publisher}"`,
      `"${f.dimensions}"`,
      `"${f.ratioLabel}"`,
      `"${f.safeZone}"`,
      `"${f.fileType}"`,
      `"${f.deadline}"`,
      `"${f.specsUrl}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bevero_Black_Friday_2026_MediaPlan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTable = () => {
    const textData = formats.map(f =>
      `${f.formatName}\t${f.publisher}\t${f.dimensions} (${f.ratioLabel})\t${f.safeZone}\t${f.fileType}\t${f.deadline}`
    ).join("\n");
    copyTable("Format\tPublisher\tDimensions\tSafe zone\tFile format\tDeadline\n" + textData);
  };

  const categoryCounts = formats.reduce((acc, f) => {
    acc[f.sectionCategory] = (acc[f.sectionCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full bg-white flex flex-col gap-6">

      <div className="flex flex-col gap-4 pb-2">

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h2 className="text-title font-bold text-black tracking-tight leading-none">
              Spreadsheet view
            </h2>
            <p className="text-value font-normal text-black/60 mt-1">
              All {formats.length} formats structured in a raw media data table
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="soft" size="sm" onClick={handleCopyTable}>
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-petrol" />
                  <span className="text-petrol">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-black" />
                  <span>Copy table</span>
                </>
              )}
            </Button>

            <Button variant="soft" size="sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 text-label font-bold rounded-xs transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-black text-white"
                  : "bg-black/5 text-black/60 hover:bg-black/10"
              }`}
            >
              All ({formats.length})
            </button>

            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-label font-bold rounded-xs transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? `${CATEGORIES[cat].sectionBg} ${CATEGORIES[cat].titleColor}`
                    : "bg-black/5 text-black/60 hover:bg-black/10"
                }`}
              >
                {CATEGORIES[cat].shortLabel} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-black/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter formats or publishers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-label bg-black/[0.03] border border-black/[0.08] focus:border-black focus:outline-none rounded-xs placeholder:text-black/60 text-black font-medium"
            />
          </div>

        </div>

      </div>

      <div className="w-full border border-black/[0.08] bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">

          <thead>
            <tr className="border-b border-black/[0.08] bg-black/[0.02] text-label font-bold text-black/60 select-none">
              <th className="py-2.5 px-3 w-10 text-center font-normal text-black/60">#</th>
              <th
                onClick={() => handleSort("formatName")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Format</span>
                  <ArrowUpDown className="w-3 h-3 text-black/60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("category")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Channel</span>
                  <ArrowUpDown className="w-3 h-3 text-black/60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("publisher")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Publisher</span>
                  <ArrowUpDown className="w-3 h-3 text-black/60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("dimensions")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Dimensions (Ratio)</span>
                  <ArrowUpDown className="w-3 h-3 text-black/60" />
                </div>
              </th>
              <th className="py-2.5 px-3">Safe zone / Margin</th>
              <th className="py-2.5 px-3">File format</th>
              <th
                onClick={() => handleSort("deadline")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Deadline</span>
                  <ArrowUpDown className="w-3 h-3 text-black/60" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Spec</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/[0.05] text-label font-normal text-black">
            {filteredFormats.map((f, idx) => {
              const catStyle = CATEGORIES[f.sectionCategory];

              return (
                <tr
                  key={f.id}
                  onClick={() => onSelectFormat(f.id)}
                  className={`${catStyle.hoverBg} transition-colors cursor-pointer group`}
                >
                  <td className="py-2.5 px-3 text-center text-label text-black/60 select-none">
                    {idx + 1}
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-black group-hover:underline flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${catStyle.dot} shrink-0`} />
                    <span className="truncate">{f.formatName}</span>
                  </td>

                  <td className="py-2.5 px-3 text-label font-normal text-black/60">
                    {f.categoryTag}
                  </td>

                  <td className="py-2.5 px-3 font-normal text-black">
                    {f.publisher}
                  </td>

                  <td className="py-2.5 px-3 font-normal text-black whitespace-nowrap">
                    <span>{f.dimensions}</span>
                    <span className="text-label font-normal text-black/60 ml-1">({f.ratioLabel})</span>
                    {f.anomaly && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow/60 border border-taupe/30 text-label font-bold text-black rounded-xs ml-2 cursor-pointer hover:bg-yellow"
                        title={f.anomaly.message}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-taupe" />
                        <span>Verify Bonnier</span>
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-label text-black/60 max-w-[180px] truncate" title={f.safeZone}>
                    {f.safeZone}
                  </td>

                  <td className="py-2.5 px-3 text-label text-black/60">
                    {f.fileType}
                  </td>

                  <td className="py-2.5 px-3 text-label font-normal text-black whitespace-nowrap">
                    {f.deadline}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <a
                      href={f.specsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-petrol hover:opacity-70 inline-flex items-center gap-1 text-label font-normal underline transition-opacity"
                      title={f.specsLabel}
                    >
                      <span>Spec</span>
                      <ExternalLink className="w-3 h-3 text-petrol" />
                    </a>
                  </td>
                </tr>
              );
            })}

            {filteredFormats.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-black/60 text-label">
                  No formats matched your search &ldquo;{searchQuery}&rdquo;
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      <div className="flex items-center justify-between text-label text-black/60 pt-1">
        <span>Showing {filteredFormats.length} of {formats.length} formats</span>
        <span className="font-semibold text-black">Briefd Media Sheet Engine</span>
      </div>

    </div>
  );
}
