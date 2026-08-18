"use client";

import React, { useState, useMemo } from "react";
import { FormatData } from "./FormatCardItem";
import { Search, ArrowUpDown, Download, Copy, Check, ExternalLink } from "lucide-react";

interface BriefdSpreadsheetViewProps {
  formats: FormatData[];
  onSelectFormat: (formatId: string) => void;
}

const CATEGORY_STYLES: Record<string, { dot: string; hoverBg: string }> = {
  "Social Media (SoMe)": { dot: "bg-[#7C705A]", hoverBg: "hover:bg-[#FFFFA8]/60" },
  "Digital Display & High-Impact": { dot: "bg-[#520037]", hoverBg: "hover:bg-[#FFADEB]/35" },
  "Out of Home (OOH & DOOH)": { dot: "bg-[#173537]", hoverBg: "hover:bg-[#84CCEF]/30" },
  "Newsprint & Magazines (Print)": { dot: "bg-[#191A1C]", hoverBg: "hover:bg-[#F5F5F5]" }
};

type SortField = "deadline" | "formatName" | "publisher" | "category" | "dimensions";

export function BriefdSpreadsheetView({ formats, onSelectFormat }: BriefdSpreadsheetViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("deadline");
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);

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
    const headers = ["Format", "Kanal", "Publicist", "Mått", "Ratio", "Safe Zone", "Filformat", "Deadline", "Spec URL"];
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
    navigator.clipboard.writeText("Format\tPublicist\tMått\tSafe zone\tFilformat\tDeadline\n" + textData);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
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
            <h2 className="text-[30px] font-bold text-black tracking-tight leading-none">
              Kalkylarksvy
            </h2>
            <p className="text-[14px] font-normal text-[#555555] mt-1">
              Alla {formats.length} format strukturerade i en rå mediedatatabell
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTable}
              className="px-3 py-1.5 text-[11px] font-bold text-black bg-black/5 hover:bg-black/10 transition-colors flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Kopierad</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-black" />
                  <span>Kopiera tabell</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-[11px] font-bold text-black bg-black/5 hover:bg-black/10 transition-colors flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Exportera CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-black text-white"
                  : "bg-black/5 text-[#555555] hover:bg-black/10"
              }`}
            >
              Alla ({formats.length})
            </button>

            <button
              onClick={() => setSelectedCategory("Social Media (SoMe)")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                selectedCategory === "Social Media (SoMe)"
                  ? "bg-[#7C705A] text-[#FFFFA8]"
                  : "bg-black/5 text-[#555555] hover:bg-black/10"
              }`}
            >
              SoMe ({categoryCounts["Social Media (SoMe)"] || 0})
            </button>

            <button
              onClick={() => setSelectedCategory("Digital Display & High-Impact")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                selectedCategory === "Digital Display & High-Impact"
                  ? "bg-[#520037] text-[#FFADEB]"
                  : "bg-black/5 text-[#555555] hover:bg-black/10"
              }`}
            >
              Digital Display ({categoryCounts["Digital Display & High-Impact"] || 0})
            </button>

            <button
              onClick={() => setSelectedCategory("Out of Home (OOH & DOOH)")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                selectedCategory === "Out of Home (OOH & DOOH)"
                  ? "bg-[#173537] text-[#84CCEF]"
                  : "bg-black/5 text-[#555555] hover:bg-black/10"
              }`}
            >
              OOH ({categoryCounts["Out of Home (OOH & DOOH)"] || 0})
            </button>

            <button
              onClick={() => setSelectedCategory("Newsprint & Magazines (Print)")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                selectedCategory === "Newsprint & Magazines (Print)"
                  ? "bg-black text-white"
                  : "bg-black/5 text-[#555555] hover:bg-black/10"
              }`}
            >
              Print ({categoryCounts["Newsprint & Magazines (Print)"] || 0})
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#555555] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrera format eller publisher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-[11px] bg-black/[0.03] border border-black/[0.08] focus:border-black focus:outline-none rounded-xs placeholder:text-[#555555] text-black font-medium"
            />
          </div>

        </div>

      </div>

      <div className="w-full border border-black/[0.08] bg-white overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse min-w-[900px]">
          
          <thead>
            <tr className="border-b border-black/[0.08] bg-black/[0.02] text-[11px] font-bold text-[#555555] select-none">
              <th className="py-2.5 px-3 w-10 text-center font-normal text-[#555555]">#</th>
              <th 
                onClick={() => handleSort("formatName")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Format</span>
                  <ArrowUpDown className="w-3 h-3 text-[#555555]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("category")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Kanal</span>
                  <ArrowUpDown className="w-3 h-3 text-[#555555]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("publisher")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Publicist</span>
                  <ArrowUpDown className="w-3 h-3 text-[#555555]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("dimensions")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Mått (Ratio)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#555555]" />
                </div>
              </th>
              <th className="py-2.5 px-3">Safe zone / Marginal</th>
              <th className="py-2.5 px-3">Filformat</th>
              <th 
                onClick={() => handleSort("deadline")}
                className="py-2.5 px-3 cursor-pointer hover:text-black transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Deadline</span>
                  <ArrowUpDown className="w-3 h-3 text-[#555555]" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Spec</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/[0.05] text-[12px] font-normal text-black">
            {filteredFormats.map((f, idx) => {
              const catStyle = CATEGORY_STYLES[f.sectionCategory] || {
                dot: "bg-black",
                text: "text-black",
                bg: "bg-black/5"
              };

              return (
                <tr
                  key={f.id}
                  onClick={() => onSelectFormat(f.id)}
                  className={`${catStyle.hoverBg} transition-colors cursor-pointer group`}
                >
                  <td className="py-2.5 px-3 text-center text-[10px] text-[#555555] select-none">
                    {idx + 1}
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-black group-hover:underline flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${catStyle.dot} shrink-0`} />
                    <span className="truncate">{f.formatName}</span>
                  </td>

                  <td className="py-2.5 px-3 text-[11px] font-normal text-[#555555]">
                    {f.categoryTag}
                  </td>

                  <td className="py-2.5 px-3 font-normal text-black">
                    {f.publisher}
                  </td>

                  <td className="py-2.5 px-3 font-normal text-black whitespace-nowrap">
                    <span>{f.dimensions}</span>
                    <span className="text-[10px] font-normal text-[#555555] ml-1">({f.ratioLabel})</span>
                    {f.anomaly && (
                      <span 
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#FFFFA8]/60 border border-[#7C705A]/30 text-[9px] font-bold text-black rounded-xs ml-2 cursor-pointer hover:bg-[#FFFFA8]"
                        title={f.anomaly.message}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C705A]" />
                        <span>Verify Bonnier</span>
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-[11px] text-[#555555] max-w-[180px] truncate" title={f.safeZone}>
                    {f.safeZone}
                  </td>

                  <td className="py-2.5 px-3 text-[11px] text-[#555555]">
                    {f.fileType}
                  </td>

                  <td className="py-2.5 px-3 text-[11px] font-normal text-black whitespace-nowrap">
                    {f.deadline}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <a
                      href={f.specsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#0066CC] hover:text-[#004499] inline-flex items-center gap-1 text-[11px] font-normal underline"
                      title={f.specsLabel}
                    >
                      <span>Spec</span>
                      <ExternalLink className="w-3 h-3 text-[#0066CC]" />
                    </a>
                  </td>
                </tr>
              );
            })}

            {filteredFormats.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#555555] text-[12px]">
                  Inga format matchade din sökning &ldquo;{searchQuery}&rdquo;
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#555555] pt-1">
        <span>Visar {filteredFormats.length} av {formats.length} format</span>
        <span className="font-semibold text-black">Briefd Media Sheet Engine</span>
      </div>

    </div>
  );
}
