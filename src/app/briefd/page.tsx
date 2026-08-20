"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, FileSpreadsheet, Table as TableIcon } from "lucide-react";
import { CropFrame } from "@/components/atoms/CropFrame";
import { Button } from "@/components/atoms/Button";
import { FormatCardItem } from "@/components/briefd/FormatCardItem";
import { BriefdSidebar } from "@/components/briefd/BriefdSidebar";
import { FormatDetailView } from "@/components/briefd/FormatDetailView";
import { BriefdCalendarView } from "@/components/briefd/BriefdCalendarView";
import { BriefdSpreadsheetView } from "@/components/briefd/BriefdSpreadsheetView";
import { ImportReview } from "@/components/briefd/ImportReview";
import { FinaliAIModal } from "@/components/briefd/FinaliAIModal";
import type { FormatData } from "@/lib/briefd/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/briefd/categories";
import { mediaSpecs } from "@/lib/briefd/brain";
import { sourceBackedFormat } from "@/lib/briefd/format";
import { mapJobsToFormats, type UnmatchedRow } from "@/lib/briefd/mapJobs";
import type { MediaPlanColumnMapping, OrchestratedJob, ParsedMediaPlan } from "@/lib/jobOrchestrator";

type ViewState = "dropzone" | "review" | "workspace";
type ActiveTab = "formats" | "calendar" | "table";

const SAMPLE_FORMATS = mediaSpecs.map((spec, index) => sourceBackedFormat(spec, {
  id: `sample-${spec.id}`,
  deadline: `2026-09-${String(14 + (index % 12)).padStart(2, "0")}`,
  sourceRow: { sheetName: "Source-backed demo", rowNumber: index + 2 },
}));

function buildSections(formats: FormatData[]) {
  return CATEGORY_ORDER.map((category) => ({ ...CATEGORIES[category], id: CATEGORIES[category].key, category, formats: formats.filter((format) => format.sectionCategory === category) }))
    .filter((section) => section.formats.length > 0);
}

function BriefdApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewState, setViewState] = useState<ViewState>("dropzone");
  const [activeTab, setActiveTab] = useState<ActiveTab>("formats");
  const [formats, setFormats] = useState<FormatData[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedRow[]>([]);
  const [plan, setPlan] = useState<ParsedMediaPlan | null>(null);
  const [planMeta, setPlanMeta] = useState({ client: "", campaign: "" });
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [finaliOpen, setFinaliOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadInProgressRef = useRef(false);

  const selectedFormatId = searchParams.get("format");
  const selectedFormat = formats.find((format) => format.id === selectedFormatId) ?? null;
  const sections = useMemo(() => buildSections(formats), [formats]);

  const selectFormat = (id: string | null) => {
    if (id) { router.push(`${pathname}?format=${encodeURIComponent(id)}`, { scroll: false }); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else router.push(pathname, { scroll: false });
  };

  const parseFile = async (file: File, settings?: { sheetName: string; headerRow?: number; mapping?: MediaPlanColumnMapping }) => {
    if (uploadInProgressRef.current) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) { setUploadError("Choose an .xlsx media plan."); return; }
    uploadInProgressRef.current = true;
    setBusy(true); setUploadError(null);
    try {
      const body = new FormData(); body.append("mediaPlan", file);
      if (settings) {
        body.append("sheetName", settings.sheetName);
        if (settings.headerRow != null) body.append("headerRow", String(settings.headerRow));
        if (settings.mapping) body.append("mapping", JSON.stringify(settings.mapping));
      }
      const response = await fetch("/api/parse", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The media plan could not be parsed.");
      const mapped = mapJobsToFormats(data.jobs as OrchestratedJob[]);
      setSourceFile(file); setPlan(data.plan as ParsedMediaPlan); setFormats(mapped.formats); setUnmatched(mapped.unmatched);
      setPlanMeta({ client: file.name.replace(/\.xlsx$/i, ""), campaign: mapped.campaignName });
      setViewState("review");
    } catch (cause) { setUploadError(cause instanceof Error ? cause.message : "The media plan could not be parsed."); }
    finally { uploadInProgressRef.current = false; setBusy(false); }
  };

  const loadSample = () => {
    setFormats(SAMPLE_FORMATS); setUnmatched([]); setPlan(null);
    setPlanMeta({ client: "Briefd demo", campaign: "Source-backed format demo" });
    setViewState("workspace");
  };

  const reset = () => {
    setFormats([]); setUnmatched([]); setPlan(null); setSourceFile(null); setUploadError(null); setActiveTab("formats"); selectFormat(null); setViewState("dropzone");
  };

  const resolveRow = (resolved: FormatData) => {
    setFormats((current) => [...current.filter((format) => format.id !== resolved.id), resolved]);
    setUnmatched((current) => current.filter((row) => row.id !== resolved.id));
  };

  const scrollToCategory = (categoryId: string) => {
    selectFormat(null); setActiveTab("formats");
    setTimeout(() => document.getElementById(categoryId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return <div className="w-full min-h-screen bg-white text-black font-sans flex flex-col selection:bg-magenta selection:text-plum">
    <div className="w-full px-5 sm:px-[30px] pt-5"><CropFrame><header className="flex items-center justify-between py-3 sm:py-4 bg-white">
      <Link href="/briefd" className="flex items-center gap-2 hover:opacity-80"><span className="text-title font-bold tracking-tight">Briefd</span><span className="text-label font-semibold">(by finali)</span></Link>
      <nav className="flex items-center gap-4 text-label font-semibold"><Link href="/" className="hover:underline hidden sm:inline">About us</Link><Button variant="outline" size="sm" onClick={() => setFinaliOpen(true)}>Finali automation: coming soon</Button></nav>
    </header></CropFrame></div>

    <main className="w-full px-5 sm:px-[30px] py-8 flex-1">
      {viewState === "dropzone" && <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center text-center gap-8">
        <div className="max-w-2xl"><h1 className="text-section sm:text-hero font-bold tracking-tight leading-[1.02]">Drop your spreadsheet.<br />Review every result.</h1><p className="text-value font-medium mt-4 leading-relaxed">Briefd translates .xlsx media plans into a traceable format worklist. Its built-in Brain currently contains 12 provisional, cited specifications.</p></div>
        <input ref={inputRef} id="media-plan-file" type="file" accept=".xlsx" disabled={busy} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void parseFile(file); event.target.value = ""; }} />
        <label htmlFor="media-plan-file" aria-disabled={busy} aria-busy={busy} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(event) => { event.preventDefault(); setDragOver(false); const file = event.dataTransfer.files?.[0]; if (file) void parseFile(file); }} className={`w-full max-w-2xl p-12 sm:p-16 flex flex-col items-center gap-5 border ${busy ? "cursor-wait opacity-70" : "cursor-pointer"} ${dragOver ? "border-black" : "border-black/10"} focus-within:border-black`}>
          <FileSpreadsheet className="w-12 h-12" /><div><h2 className="text-title font-bold">Drop an .xlsx media plan here</h2><p className="text-value mt-1" role="status" aria-live="polite">{busy ? "Reading workbook…" : "or press Enter to choose a file"}</p></div>
        </label>
        <div className="max-w-2xl text-left text-label text-black/60 leading-relaxed">
          <p><strong className="text-black">Expected columns:</strong> publisher and format. Campaign, deadline, and notes are optional; you can map English or Swedish headers after upload.</p>
          <p>.xlsx files only, up to 10 MB.</p>
        </div>
        <Button variant="soft" size="lg" disabled={busy} onClick={loadSample}>Explore the source-backed demo</Button>
        {uploadError && <p className="text-value font-semibold text-plum" role="alert">{uploadError}</p>}
        <p className="text-label text-black/60 max-w-xl">Uploads are parsed locally by this running app. Real agency-plan validation and external sharing are not yet claimed.</p>
      </div>}

      {viewState === "review" && plan && sourceFile && <ImportReview plan={plan} matched={formats} unmatched={unmatched} busy={busy} error={uploadError} onResolve={resolveRow} onContinue={() => setViewState("workspace")} onReparse={(settings) => parseFile(sourceFile, settings)} />}

      {viewState === "workspace" && <div className="w-full flex flex-col lg:flex-row items-start gap-8">
        <BriefdSidebar formats={formats} clientName={planMeta.client} campaignName={planMeta.campaign} selectedFormatId={selectedFormatId} onSelectTab={setActiveTab} onSelectFormat={selectFormat} onSelectCategory={scrollToCategory} onResetPlan={reset} />
        <div className="flex-1 w-full flex flex-col gap-8">
          {!selectedFormat && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div role="tablist" aria-label="Campaign views" className="inline-flex p-0.5 bg-black/[0.04]">
            {(["formats", "calendar", "table"] as ActiveTab[]).map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-label font-bold flex items-center gap-1.5 ${activeTab === tab ? "bg-white text-black" : "text-black/60"}`}>{tab === "calendar" && <CalendarIcon className="w-3.5 h-3.5" />}{tab === "table" && <TableIcon className="w-3.5 h-3.5" />}{tab === "formats" ? `All formats (${formats.length})` : tab === "table" ? "Spreadsheet" : "Calendar"}</button>)}
          </div><span className="text-label text-black/60">{formats.filter((format) => format.trust === "verified").length} verified · {formats.filter((format) => format.trust === "user-provided").length} user-provided</span></div>}
          {selectedFormat ? <FormatDetailView format={selectedFormat} onBack={() => selectFormat(null)} /> : activeTab === "calendar" ? <BriefdCalendarView formats={formats} onSelectFormat={(id) => selectFormat(id)} /> : activeTab === "table" ? <BriefdSpreadsheetView formats={formats} campaignName={planMeta.campaign} onSelectFormat={(id) => selectFormat(id)} /> : <div className="flex flex-col gap-12">{sections.map((section) => <section key={section.id} id={section.id} className={`p-6 sm:p-10 md:p-12 ${section.sectionBg} scroll-mt-6`}><div className="flex items-baseline justify-between gap-4 mb-8"><div><h2 className={`text-section font-bold ${section.titleColor}`}>{section.title}</h2><p className={`text-label font-semibold ${section.descColor} mt-1`}>{section.description}</p></div><span className={`text-label font-bold ${section.descColor}`}>{section.formats.length} formats</span></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{section.formats.map((format) => <FormatCardItem key={format.id} format={format} onSelect={(id) => selectFormat(id)} />)}</div></section>)}</div>}
        </div>
      </div>}
    </main>

    <div className="w-full px-5 sm:px-[30px] pb-10"><section className="bg-plum text-magenta p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"><div className="max-w-2xl"><h2 className="text-title sm:text-section font-bold tracking-tight">Production automation is a separate Finali product direction.</h2><p className="text-value mt-3">Briefd currently interprets and documents media-plan requirements. It does not generate or validate finished artwork.</p></div><Button variant="contrast" size="lg" onClick={() => setFinaliOpen(true)}>What is planned</Button></section></div>
    <div className="w-full px-5 sm:px-[30px] pb-5"><CropFrame><footer className="bg-taupe text-yellow px-6 sm:px-10 py-6 flex flex-col sm:flex-row justify-between gap-4 text-label font-semibold"><span><strong>Briefd</strong> by Finali Technologies AB · Stockholm</span><span>Local utility · provisional source coverage</span></footer></CropFrame></div>
    <FinaliAIModal isOpen={finaliOpen} onClose={() => setFinaliOpen(false)} />
  </div>;
}

export default function BriefdPage() { return <Suspense fallback={null}><BriefdApp /></Suspense>; }
