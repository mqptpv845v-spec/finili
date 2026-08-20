"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, Eye, FileSpreadsheet, Link as LinkIcon, Table as TableIcon } from "lucide-react";
import { CropFrame } from "@/components/atoms/CropFrame";
import { Button } from "@/components/atoms/Button";
import { FormatCardItem } from "@/components/briefd/FormatCardItem";
import { BriefdSidebar } from "@/components/briefd/BriefdSidebar";
import { FormatDetailView } from "@/components/briefd/FormatDetailView";
import { BriefdCalendarView } from "@/components/briefd/BriefdCalendarView";
import { BriefdSpreadsheetView } from "@/components/briefd/BriefdSpreadsheetView";
import { ImportReview } from "@/components/briefd/ImportReview";
import { FinaliAIModal } from "@/components/briefd/FinaliAIModal";
import { ShareLiveBriefModal } from "@/components/briefd/ShareLiveBriefModal";
import type { FormatData } from "@/lib/briefd/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/briefd/categories";
import { mediaSpecs } from "@/lib/briefd/brain";
import { sourceBackedFormat } from "@/lib/briefd/format";
import { mapJobsToFormats, type UnmatchedRow } from "@/lib/briefd/mapJobs";
import { campaignDraftFromImport, workspaceFormatUrl } from "@/lib/briefd/persistence/client-payload";
import type { OwnerCampaignResponse, SharedCampaignResponse } from "@/lib/briefd/persistence/contracts";
import type { MediaPlanColumnMapping, OrchestratedJob, ParsedMediaPlan } from "@/lib/jobOrchestrator";

type ViewState = "loading" | "error" | "dropzone" | "review" | "workspace";
type ActiveTab = "formats" | "calendar" | "table";
type WorkspaceAccess = "local" | "owner" | "shared";

const SAMPLE_FORMATS = mediaSpecs.map((spec, index) => sourceBackedFormat(spec, {
  id: `sample-${spec.id}`,
  deadline: `2026-09-${String(14 + (index % 12)).padStart(2, "0")}`,
  sourceRow: { sheetName: "Source-backed demo", rowNumber: index + 2 },
}));

function buildSections(formats: FormatData[]) {
  return CATEGORY_ORDER.map((category) => ({ ...CATEGORIES[category], id: CATEGORIES[category].key, category, formats: formats.filter((format) => format.sectionCategory === category) }))
    .filter((section) => section.formats.length > 0);
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => null) as { error?: unknown } | null;
  if (!response.ok) {
    throw new Error(typeof payload?.error === "string" ? payload.error : "Briefd could not complete the request.");
  }
  return payload as T;
}

function BriefdApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaign");
  const shareToken = searchParams.get("share");
  const [viewState, setViewState] = useState<ViewState>(() => campaignId || shareToken ? "loading" : "dropzone");
  const [workspaceAccess, setWorkspaceAccess] = useState<WorkspaceAccess>("local");
  const [ownerCampaign, setOwnerCampaign] = useState<OwnerCampaignResponse | null>(null);
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
  const [shareOpen, setShareOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadInProgressRef = useRef(false);
  const loadedResourceRef = useRef<string | null>(null);

  const selectedFormatId = searchParams.get("format");
  const selectedFormat = formats.find((format) => format.id === selectedFormatId) ?? null;
  const sections = useMemo(() => buildSections(formats), [formats]);

  useEffect(() => {
    if (!campaignId && !shareToken) {
      if (loadedResourceRef.current) {
        loadedResourceRef.current = null;
        setFormats([]);
        setUnmatched([]);
        setPlan(null);
        setSourceFile(null);
        setOwnerCampaign(null);
        setWorkspaceAccess("local");
        setActiveTab("formats");
        setLoadError(null);
        setViewState("dropzone");
      }
      return;
    }
    loadedResourceRef.current = campaignId ? `campaign:${campaignId}` : `share:${shareToken}`;
    if (campaignId && shareToken) {
      setLoadError("Use either an owner campaign link or a shared link, not both.");
      setViewState("error");
      return;
    }

    const controller = new AbortController();
    setViewState("loading");
    setLoadError(null);
    const endpoint = campaignId
      ? `/api/campaigns/${encodeURIComponent(campaignId)}`
      : `/api/shares/${encodeURIComponent(shareToken!)}`;

    void requestJson<OwnerCampaignResponse | SharedCampaignResponse>(endpoint, { signal: controller.signal, credentials: "same-origin" })
      .then((response) => {
        if (!response?.campaign || !Array.isArray(response.campaign.formats)) {
          throw new Error("The saved campaign response was incomplete.");
        }
        if (campaignId && response.access !== "edit") throw new Error("The owner campaign response was invalid.");
        if (shareToken && response.access !== "view") throw new Error("The shared campaign response was invalid.");
        if (response.access === "edit" && !Array.isArray(response.shares)) throw new Error("The owner campaign response was incomplete.");

        setFormats(response.campaign.formats);
        setUnmatched([]);
        setPlan(null);
        setSourceFile(null);
        setPlanMeta({ client: response.campaign.clientName, campaign: response.campaign.campaignName });
        setWorkspaceAccess(response.access === "edit" ? "owner" : "shared");
        setOwnerCampaign(response.access === "edit" ? response : null);
        setActiveTab("formats");
        setViewState("workspace");
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setLoadError(cause instanceof Error ? cause.message : "The saved campaign could not be loaded.");
        setViewState("error");
      });

    return () => controller.abort();
  }, [campaignId, shareToken]);

  const selectFormat = (id: string | null) => {
    router.push(workspaceFormatUrl(pathname, searchParams.toString(), id), { scroll: false });
    if (id) window.scrollTo({ top: 0, behavior: "smooth" });
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
    setWorkspaceAccess("local"); setOwnerCampaign(null);
    setViewState("workspace");
  };

  const reset = () => {
    setFormats([]); setUnmatched([]); setPlan(null); setSourceFile(null); setUploadError(null); setLoadError(null); setActiveTab("formats");
    setWorkspaceAccess("local"); setOwnerCampaign(null); setShareOpen(false); setViewState("dropzone");
    router.push(pathname, { scroll: false });
  };

  const resolveRow = (resolved: FormatData) => {
    setFormats((current) => [...current.filter((format) => format.id !== resolved.id), resolved]);
    setUnmatched((current) => current.filter((row) => row.id !== resolved.id));
  };

  const beginCampaignUpdate = () => {
    if (!ownerCampaign) return;
    setFormats([]);
    setUnmatched([]);
    setPlan(null);
    setSourceFile(null);
    setUploadError(null);
    setActiveTab("formats");
    setViewState("dropzone");
    selectFormat(null);
  };

  const cancelCampaignUpdate = () => {
    if (!ownerCampaign) return;
    setFormats(ownerCampaign.campaign.formats);
    setPlanMeta({ client: ownerCampaign.campaign.clientName, campaign: ownerCampaign.campaign.campaignName });
    setUnmatched([]);
    setPlan(null);
    setSourceFile(null);
    setUploadError(null);
    setViewState("workspace");
  };

  const saveImportedCampaign = async () => {
    if (!plan || !sourceFile) return;
    setBusy(true);
    setUploadError(null);
    try {
      const draft = campaignDraftFromImport({
        clientName: planMeta.client,
        campaignName: planMeta.campaign,
        sourceFilename: sourceFile.name,
        plan,
        formats,
      });
      const existingCampaign = ownerCampaign?.campaign ?? null;
      const response = await requestJson<OwnerCampaignResponse>(existingCampaign
        ? `/api/campaigns/${encodeURIComponent(existingCampaign.id)}`
        : "/api/campaigns", {
        method: existingCampaign ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existingCampaign ? { ...draft, id: existingCampaign.id, revision: existingCampaign.revision } : draft),
      });
      if (response.access !== "edit" || !Array.isArray(response.shares)) throw new Error("The saved campaign response was invalid.");
      setFormats(response.campaign.formats);
      setPlanMeta({ client: response.campaign.clientName, campaign: response.campaign.campaignName });
      setWorkspaceAccess("owner");
      setOwnerCampaign(response);
      setPlan(null);
      setSourceFile(null);
      setViewState("workspace");
      const next = new URLSearchParams();
      next.set("campaign", response.campaign.id);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    } catch (cause) {
      setUploadError(cause instanceof Error ? cause.message : "The campaign could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const createShare = async () => {
    if (!ownerCampaign) throw new Error("Only the campaign owner can create a share link.");
    const created = await requestJson<{ id: string; token: string }>(`/api/campaigns/${encodeURIComponent(ownerCampaign.campaign.id)}/shares`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresAt: null }),
    });
    if (typeof created.id !== "string" || typeof created.token !== "string") throw new Error("The new share response was incomplete.");
    try {
      const refreshed = await requestJson<OwnerCampaignResponse>(`/api/campaigns/${encodeURIComponent(ownerCampaign.campaign.id)}`, {
        credentials: "same-origin",
      });
      if (refreshed.access !== "edit" || !Array.isArray(refreshed.shares)) throw new Error("The refreshed campaign response was incomplete.");
      setOwnerCampaign(refreshed);
    } catch {
      setOwnerCampaign((current) => current ? {
        ...current,
        shares: [...current.shares, { id: created.id, createdAt: "", expiresAt: null }],
      } : current);
    }
    return created;
  };

  const revokeShare = async (shareId: string) => {
    if (!ownerCampaign) throw new Error("Only the campaign owner can revoke a share link.");
    await requestJson<unknown>(`/api/campaigns/${encodeURIComponent(ownerCampaign.campaign.id)}/shares/${encodeURIComponent(shareId)}`, {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
    });
    setOwnerCampaign((current) => current ? { ...current, shares: current.shares.filter((share) => share.id !== shareId) } : current);
  };

  const scrollToCategory = (categoryId: string) => {
    selectFormat(null); setActiveTab("formats");
    setTimeout(() => document.getElementById(categoryId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return <div className="w-full min-h-screen bg-white text-black font-sans flex flex-col selection:bg-magenta selection:text-plum">
    <div className="w-full px-5 sm:px-[30px] pt-5"><CropFrame><header className="flex items-center justify-between py-3 sm:py-4 bg-white">
      <Link href="/briefd" className="flex items-center gap-2 hover:opacity-80"><span className="text-title font-bold tracking-tight">Briefd</span><span className="text-label font-semibold">(by finali)</span></Link>
      <nav className="flex items-center gap-3 text-label font-semibold">
        {workspaceAccess === "shared" && viewState === "workspace" && <span className="inline-flex items-center gap-1.5 text-black/60"><Eye className="w-3.5 h-3.5" />View only</span>}
        {ownerCampaign && viewState === "workspace" && <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}><LinkIcon className="w-3.5 h-3.5" />Share view</Button>}
        <Link href="/" className="hover:underline hidden sm:inline">About us</Link>
        <Button variant="outline" size="sm" className="max-md:hidden" onClick={() => setFinaliOpen(true)}>Finali automation: coming soon</Button>
      </nav>
    </header></CropFrame></div>

    <main className="w-full px-5 sm:px-[30px] py-8 flex-1">
      {viewState === "loading" && <div className="min-h-[50vh] grid place-items-center" role="status" aria-live="polite"><div className="text-center"><h1 className="text-title font-bold">Loading campaign…</h1><p className="text-value text-black/60 mt-2">Reading the saved Briefd workspace.</p></div></div>}

      {viewState === "error" && <div className="min-h-[50vh] grid place-items-center"><div className="max-w-xl text-center"><h1 className="text-title font-bold">This campaign could not be opened</h1><p className="text-value text-black/60 mt-3" role="alert">{loadError ?? "The campaign link is unavailable."}</p><Button className="mt-6" onClick={reset}>Return to Briefd</Button></div></div>}

      {viewState === "dropzone" && <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center text-center gap-8">
        <div className="max-w-2xl"><h1 className="text-section sm:text-hero font-bold tracking-tight leading-[1.02]">{ownerCampaign ? <>Update the campaign.<br />Review before saving.</> : <>Drop your spreadsheet.<br />Review every result.</>}</h1><p className="text-value font-medium mt-4 leading-relaxed">{ownerCampaign ? "The current saved campaign remains unchanged until the replacement spreadsheet has been reviewed and saved." : "Briefd translates .xlsx media plans into a traceable format worklist. Its built-in Brain currently contains 12 provisional, cited specifications."}</p></div>
        <input ref={inputRef} id="media-plan-file" type="file" accept=".xlsx" disabled={busy} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void parseFile(file); event.target.value = ""; }} />
        <label htmlFor="media-plan-file" aria-disabled={busy} aria-busy={busy} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(event) => { event.preventDefault(); setDragOver(false); const file = event.dataTransfer.files?.[0]; if (file) void parseFile(file); }} className={`w-full max-w-2xl p-12 sm:p-16 flex flex-col items-center gap-5 border ${busy ? "cursor-wait opacity-70" : "cursor-pointer"} ${dragOver ? "border-black" : "border-black/10"} focus-within:border-black`}>
          <FileSpreadsheet className="w-12 h-12" /><div><h2 className="text-title font-bold">Drop an .xlsx media plan here</h2><p className="text-value mt-1" role="status" aria-live="polite">{busy ? "Reading workbook…" : "or press Enter to choose a file"}</p></div>
        </label>
        <div className="max-w-2xl text-left text-label text-black/60 leading-relaxed">
          <p><strong className="text-black">Expected columns:</strong> publisher and format. Campaign, deadline, and notes are optional; you can map English or Swedish headers after upload.</p>
          <p>.xlsx files only, up to 10 MB.</p>
        </div>
        {ownerCampaign ? <Button variant="outline" size="lg" disabled={busy} onClick={cancelCampaignUpdate}>Cancel update</Button> : <Button variant="soft" size="lg" disabled={busy} onClick={loadSample}>Explore the source-backed demo</Button>}
        {uploadError && <p className="text-value font-semibold text-plum" role="alert">{uploadError}</p>}
        <p className="text-label text-black/60 max-w-xl">Uploads are parsed locally by this running app. Real agency-plan validation and external sharing are not claimed.</p>
      </div>}

      {viewState === "review" && plan && sourceFile && <ImportReview plan={plan} matched={formats} unmatched={unmatched} busy={busy} error={uploadError} onResolve={resolveRow} onContinue={() => void saveImportedCampaign()} onReparse={(settings) => parseFile(sourceFile, settings)} />}

      {viewState === "workspace" && <div className="w-full flex flex-col lg:flex-row items-start gap-8">
        <BriefdSidebar formats={formats} clientName={planMeta.client} campaignName={planMeta.campaign} selectedFormatId={selectedFormatId} onSelectTab={setActiveTab} onSelectFormat={selectFormat} onSelectCategory={scrollToCategory} onReplacePlan={workspaceAccess === "owner" ? beginCampaignUpdate : undefined} onResetPlan={workspaceAccess === "shared" ? undefined : reset} />
        <div className="flex-1 w-full flex flex-col gap-8">
          <div className={`px-4 py-3 text-label font-semibold flex items-center gap-2 ${workspaceAccess === "shared" ? "bg-cyan/20 text-petrol" : workspaceAccess === "owner" ? "bg-light text-black/70" : "bg-yellow/30 text-black/70"}`} role="status">
            {workspaceAccess === "shared" ? <><Eye className="w-3.5 h-3.5" />View-only shared campaign</> : workspaceAccess === "owner" ? <>Saved campaign · owner access</> : <>Source-backed demo · not saved</>}
          </div>
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
    {ownerCampaign && <ShareLiveBriefModal
      isOpen={shareOpen}
      onClose={() => setShareOpen(false)}
      campaignName={ownerCampaign.campaign.campaignName}
      shares={ownerCampaign.shares}
      onCreate={createShare}
      onRevoke={revokeShare}
    />}
  </div>;
}

export default function BriefdPage() { return <Suspense fallback={null}><BriefdApp /></Suspense>; }
