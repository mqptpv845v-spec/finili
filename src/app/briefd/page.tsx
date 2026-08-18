"use client";

import { useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CropFrame } from "@/components/atoms/CropFrame";
import { Button } from "@/components/atoms/Button";
import type { FormatData } from "@/lib/briefd/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/briefd/categories";
import { mapJobsToFormats, type UnmatchedRow } from "@/lib/briefd/mapJobs";
import type { OrchestratedJob } from "@/lib/jobOrchestrator";
import { FormatCardItem } from "@/components/briefd/FormatCardItem";
import { BriefdSidebar } from "@/components/briefd/BriefdSidebar";
import { FormatDetailView } from "@/components/briefd/FormatDetailView";
import { BriefdCalendarView } from "@/components/briefd/BriefdCalendarView";
import { BriefdSpreadsheetView } from "@/components/briefd/BriefdSpreadsheetView";
import { ShareLiveBriefModal } from "@/components/briefd/ShareLiveBriefModal";
import { PreflightLoader } from "@/components/briefd/PreflightLoader";
import { FinaliAIModal } from "@/components/briefd/FinaliAIModal";
import { FileSpreadsheet, Calendar as CalendarIcon, Table as TableIcon, Share2, Globe, X } from "lucide-react";

// The 21 campaign formats (Bevero Black Friday 2026 Campaign)
const CAMPAIGN_FORMATS: FormatData[] = [
  // 1. Social Media (SoMe)
  {
    id: "some-1",
    categoryTag: "SoMe",
    publisher: "Meta",
    formatName: "Meta 9:16",
    sectionCategory: "Social Media (SoMe)",
    dimensions: "1080 × 1920 px",
    widthRatio: 9,
    heightRatio: 16,
    ratioLabel: "9:16",
    safeZone: "250 px top / 400 px bottom / 50px sides",
    fileType: "JPG, PNG, MP4",
    specsLabel: "www.meta.com/guidelines",
    specsUrl: "https://www.facebook.com/business/ads-guide/update/instagram-story",
    deadline: "24 Sep"
  },
  {
    id: "some-2",
    categoryTag: "SoMe",
    publisher: "Meta",
    formatName: "Meta 4:5",
    sectionCategory: "Social Media (SoMe)",
    dimensions: "1080 × 1350 px",
    widthRatio: 4,
    heightRatio: 5,
    ratioLabel: "4:5",
    safeZone: "250 px top / 400 px bottom / 50px sides",
    fileType: "JPG, PNG, MP4",
    specsLabel: "www.meta.com/guidelines",
    specsUrl: "https://www.facebook.com/business/ads-guide/update/instagram-feed",
    deadline: "24 Sep"
  },
  {
    id: "some-3",
    categoryTag: "SoMe",
    publisher: "Meta",
    formatName: "Meta 1:1",
    sectionCategory: "Social Media (SoMe)",
    dimensions: "1080 × 1080 px",
    widthRatio: 1,
    heightRatio: 1,
    ratioLabel: "1:1",
    safeZone: "250 px top / 400 px bottom / 50px sides",
    fileType: "JPG, PNG, MP4",
    specsLabel: "www.meta.com/guidelines",
    specsUrl: "https://www.facebook.com/business/ads-guide",
    deadline: "24 Sep"
  },
  {
    id: "some-4",
    categoryTag: "SoMe",
    publisher: "Snapchat",
    formatName: "Snapchat 9:16",
    sectionCategory: "Social Media (SoMe)",
    dimensions: "1080 × 1920 px",
    widthRatio: 9,
    heightRatio: 16,
    ratioLabel: "9:16",
    safeZone: "250 px top / 400 px bottom / 50px sides",
    fileType: "JPG, PNG, MP4",
    specsLabel: "www.snapchat.com/guidelines",
    specsUrl: "https://forbusiness.snapchat.com/ad-specs",
    deadline: "24 Sep"
  },
  {
    id: "some-5",
    categoryTag: "SoMe",
    publisher: "LinkedIn",
    formatName: "Linkedin 1:1",
    sectionCategory: "Social Media (SoMe)",
    dimensions: "1080 × 1080 px",
    widthRatio: 1,
    heightRatio: 1,
    ratioLabel: "1:1",
    safeZone: "250 px top / 400 px bottom / 50px sides",
    fileType: "JPG, PNG, MP4",
    specsLabel: "www.linkedin.com/guidelines",
    specsUrl: "https://business.linkedin.com/marketing-solutions",
    deadline: "24 Sep"
  },

  // 2. Out of Home (OOH & DOOH)
  {
    id: "ooh-1",
    categoryTag: "OOH",
    publisher: "Bauer Media / JCDecaux",
    formatName: "Eurosize Classic",
    sectionCategory: "Out of Home (OOH & DOOH)",
    dimensions: "1185 × 1750 mm",
    widthRatio: 1,
    heightRatio: 1.48,
    ratioLabel: "1:1.48",
    safeZone: "Visible area: 1160 × 1720 mm · +5 mm bleed",
    fileType: "PDF/X-4 (CMYK 300 dpi)",
    specsLabel: "bauermediaoutdoor.se/adshel",
    specsUrl: "https://bauermediaoutdoor.se/specifikationer/adshel",
    deadline: "17 Sep"
  },
  {
    id: "ooh-2",
    categoryTag: "OOH",
    publisher: "Bauer Media",
    formatName: "Adshel Move Bus",
    sectionCategory: "Out of Home (OOH & DOOH)",
    dimensions: "1450 × 2144 mm",
    widthRatio: 1,
    heightRatio: 1.48,
    ratioLabel: "1:1.48",
    safeZone: "+5 mm bleed on all edges",
    fileType: "PDF/X-4 (CMYK 300 dpi)",
    specsLabel: "bauermediaoutdoor.se/bus",
    specsUrl: "https://bauermediaoutdoor.se/specifikationer/adshel-move",
    deadline: "16 Sep"
  },
  {
    id: "ooh-3",
    categoryTag: "DOOH",
    publisher: "Ocean Outdoor",
    formatName: "Ocean Digital Series",
    sectionCategory: "Out of Home (OOH & DOOH)",
    dimensions: "1080 × 1920 px",
    widthRatio: 9,
    heightRatio: 16,
    ratioLabel: "9:16",
    safeZone: "Full canvas / No safe zone needed",
    fileType: "MP4, MOV (H.264), JPG",
    specsLabel: "oceanoutdoor.se/specs",
    specsUrl: "https://oceanoutdoor.se/tekniska-specifikationer",
    deadline: "18 Sep"
  },
  {
    id: "ooh-4",
    categoryTag: "OOH",
    publisher: "Stockholms stad / Kulturtavlor",
    formatName: "Kulturtavla (70×100)",
    sectionCategory: "Out of Home (OOH & DOOH)",
    dimensions: "700 × 1000 mm",
    widthRatio: 7,
    heightRatio: 10,
    ratioLabel: "7:10 (B1)",
    safeZone: "+5 mm bleed / 10 mm text margin",
    fileType: "PDF/X-4 (Fogra39 / CMYK)",
    specsLabel: "stockholm.se/kulturtavlor",
    specsUrl: "https://foretag.stockholm/tillstand/reklam-och-evenemang/affischera-pa-kulturtavlor/",
    deadline: "21 Sep"
  },

  // 3. Newsprint & Magazines (Print)
  {
    id: "prt-1",
    categoryTag: "Print",
    publisher: "Dagens industri",
    formatName: "Full Page Tabloid",
    sectionCategory: "Newsprint & Magazines (Print)",
    dimensions: "252 × 365 mm",
    widthRatio: 1,
    heightRatio: 1.45,
    ratioLabel: "1:1.45",
    safeZone: "Type area 5 mm from trim / No bleed",
    fileType: "PDF/X-1a (ISOnewspaper26v4)",
    specsLabel: "bonniernews.se/tabloid",
    specsUrl: "https://bonniernews.se/materialspecifikationer",
    deadline: "11 Sep"
  },
  {
    id: "prt-2",
    categoryTag: "Print",
    publisher: "Dagens industri",
    formatName: "Half Page Landscape",
    sectionCategory: "Newsprint & Magazines (Print)",
    dimensions: "252 × 180 mm",
    widthRatio: 1.4,
    heightRatio: 1,
    ratioLabel: "1.4:1",
    safeZone: "Type area 5 mm from trim",
    fileType: "PDF/X-1a (ISOnewspaper26v4)",
    specsLabel: "bonniernews.se/halfpage",
    specsUrl: "https://bonniernews.se/materialspecifikationer",
    deadline: "11 Sep"
  },
  {
    id: "prt-3",
    categoryTag: "Print",
    publisher: "Dagens industri Weekend",
    formatName: "Full Page Magazine",
    sectionCategory: "Newsprint & Magazines (Print)",
    dimensions: "215 × 280 mm",
    widthRatio: 1,
    heightRatio: 1.30,
    ratioLabel: "1:1.30",
    safeZone: "+3 mm bleed / 5 mm text margin",
    fileType: "PDF/X-4 (PSO Coated v3)",
    specsLabel: "bonniernews.se/magazine",
    specsUrl: "https://bonniernews.se/materialspecifikationer",
    deadline: "10 Sep"
  },

  // 4. Digital Display & High-Impact
  {
    id: "disp-1",
    categoryTag: "Display",
    publisher: "Schibsted / Bonnier",
    formatName: "Desktop Panorama",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "980 × 240 px",
    widthRatio: 4.08,
    heightRatio: 1,
    ratioLabel: "4.08:1",
    safeZone: "Full bleed / Max 200 KB",
    fileType: "HTML5, JPG, PNG",
    specsLabel: "schibstedforbusiness.se/specs",
    specsUrl: "https://schibstedforbusiness.se/annonsformat",
    deadline: "28 Sep"
  },
  {
    id: "disp-2",
    categoryTag: "Display",
    publisher: "Bonnier News",
    formatName: "Desktop Widescreen",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "980 × 360 px",
    widthRatio: 2.72,
    heightRatio: 1,
    ratioLabel: "2.72:1",
    safeZone: "Full bleed / Max 250 KB",
    fileType: "HTML5, Video, JPG",
    specsLabel: "annons.bonniernews.se/board",
    specsUrl: "https://annons.bonniernews.se/specifikationer/",
    deadline: "28 Sep",
    anomaly: {
      message: "Dimensions deviate from Bonnier standard – click to verify",
      standard: "980 × 300 px"
    }
  },
  {
    id: "disp-3",
    categoryTag: "Display",
    publisher: "Schibsted / Aftonbladet",
    formatName: "Mega Leaderboard",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "980 × 120 px",
    widthRatio: 8.17,
    heightRatio: 1,
    ratioLabel: "8.17:1",
    safeZone: "Full bleed / Max 150 KB",
    fileType: "HTML5, JPG, PNG",
    specsLabel: "schibstedforbusiness.se/specs",
    specsUrl: "https://schibstedforbusiness.se/annonsformat",
    deadline: "28 Sep"
  },
  {
    id: "disp-4",
    categoryTag: "Display",
    publisher: "Programmatic / IAB",
    formatName: "Medium Rectangle (MPU)",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "300 × 250 px",
    widthRatio: 6,
    heightRatio: 5,
    ratioLabel: "6:5",
    safeZone: "Full bleed / Max 150 KB",
    fileType: "HTML5, JPG, PNG",
    specsLabel: "adformhelp.com/specs",
    specsUrl: "https://adformhelp.com/specs",
    deadline: "29 Sep"
  },
  {
    id: "disp-5",
    categoryTag: "Display",
    publisher: "Aller Media / Bonnier",
    formatName: "Half Page Skyscraper",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "300 × 600 px",
    widthRatio: 1,
    heightRatio: 2,
    ratioLabel: "1:2",
    safeZone: "Full bleed / Max 200 KB",
    fileType: "HTML5, JPG, PNG",
    specsLabel: "allermedia.se/specs",
    specsUrl: "https://allermedia.se/annonsera/annonsmaterial/",
    deadline: "29 Sep"
  },
  {
    id: "disp-6",
    categoryTag: "Display",
    publisher: "Bonnier / Programmatic",
    formatName: "Sticky Mobile Banner",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "320 × 480 px",
    widthRatio: 2,
    heightRatio: 3,
    ratioLabel: "2:3",
    safeZone: "Full bleed / Max 150 KB",
    fileType: "HTML5, JPG, PNG",
    specsLabel: "adformhelp.com/sticky",
    specsUrl: "https://adformhelp.com/specs",
    deadline: "29 Sep"
  },
  {
    id: "disp-7",
    categoryTag: "Display",
    publisher: "Dagens Industri / Expressen",
    formatName: "Mobile Square Banner",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "320 × 320 px",
    widthRatio: 1,
    heightRatio: 1,
    ratioLabel: "1:1",
    safeZone: "Full bleed / Max 150 KB",
    fileType: "HTML5, JPG, PNG",
    specsLabel: "annons.bonniernews.se/mobile",
    specsUrl: "https://annons.bonniernews.se/specifikationer/",
    deadline: "28 Sep"
  },
  {
    id: "disp-8",
    categoryTag: "Display",
    publisher: "Schibsted / Aftonbladet",
    formatName: "Mobile Double Banner",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "320 × 160 px",
    widthRatio: 2,
    heightRatio: 1,
    ratioLabel: "2:1",
    safeZone: "Full bleed / Max 100 KB",
    fileType: "HTML5, JPG, PNG",
    specsLabel: "schibstedforbusiness.se/specs",
    specsUrl: "https://schibstedforbusiness.se/annonsformat",
    deadline: "28 Sep"
  },
  {
    id: "disp-9",
    categoryTag: "High-Impact",
    publisher: "Adnami",
    formatName: "Mobile Topscroll",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "1080 × 1920 px",
    widthRatio: 9,
    heightRatio: 16,
    ratioLabel: "9:16",
    safeZone: "Safe zone 250 px top / bottom",
    fileType: "MP4 (50 MB) / 200 KB static",
    specsLabel: "adnami.io/topscroll",
    specsUrl: "https://adnami.io/specs/topscroll-mobile",
    deadline: "25 Sep"
  },
  {
    id: "disp-10",
    categoryTag: "High-Impact",
    publisher: "Adnami / Readpeak",
    formatName: "Desktop Midscroll",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: "1920 × 1080 px",
    widthRatio: 16,
    heightRatio: 9,
    ratioLabel: "16:9",
    safeZone: "Viewport scroll takeover",
    fileType: "HTML5, Video, MP4",
    specsLabel: "adnami.io/midscroll",
    specsUrl: "https://adnami.io/specs/midscroll-desktop",
    deadline: "25 Sep"
  }
];

// Workspace sections, derived from the single category source of truth.
function buildSections(formats: FormatData[]) {
  return CATEGORY_ORDER.map((category) => {
    const meta = CATEGORIES[category];
    return {
      ...meta,
      id: meta.key,
      category,
      formats: formats.filter((f) => f.sectionCategory === category),
    };
  }).filter((section) => section.formats.length > 0);
}

function BriefdApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewState, setViewState] = useState<"dropzone" | "loading" | "workspace">("dropzone");
  const [activeTab, setActiveTab] = useState<"formats" | "calendar" | "table">("formats");
  const [isFinaliModalOpen, setIsFinaliModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // The active plan: the bundled sample campaign, or a parsed upload.
  const [formats, setFormats] = useState<FormatData[]>(CAMPAIGN_FORMATS);
  const [planMeta, setPlanMeta] = useState<{ client: string; campaign: string } | null>(null);
  const [unmatched, setUnmatched] = useState<UnmatchedRow[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSamplePlan = () => {
    setFormats(CAMPAIGN_FORMATS);
    setPlanMeta(null);
    setUnmatched([]);
    setUploadError(null);
    setViewState("loading");
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setUploadError("Only .xlsx media plans are supported right now.");
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("mediaPlan", file);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "The media plan could not be parsed.");
      }
      const mapped = mapJobsToFormats(data.jobs as OrchestratedJob[]);
      if (mapped.formats.length === 0) {
        setUploadError(
          "No rows matched a known publisher spec. The Brain currently covers SvD, DN, Dagens Industri, JCDecaux, Clear Channel and Wall Street Media."
        );
        return;
      }
      setFormats(mapped.formats);
      setUnmatched(mapped.unmatched);
      setPlanMeta({
        client: file.name.replace(/\.xlsx$/i, ""),
        campaign: mapped.campaignName,
      });
      setViewState("loading");
    } catch (err) {
      console.error("Media plan upload failed:", err);
      setUploadError(err instanceof Error ? err.message : "The media plan could not be parsed.");
    } finally {
      setIsUploading(false);
    }
  };

  // The URL is the single source of truth for the open format detail view,
  // so browser back/forward buttons work naturally.
  const selectedFormatId = searchParams.get("format");

  const handleSelectFormat = (id: string | null) => {
    if (id !== null) {
      router.push(`${pathname}?format=${encodeURIComponent(id)}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const prevId = selectedFormatId;
      router.push(pathname, { scroll: false });
      if (prevId) {
        setTimeout(() => {
          const el = document.getElementById(prevId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 80);
      }
    }
  };

  const selectedFormat = formats.find(f => f.id === selectedFormatId) || null;
  const sections = useMemo(() => buildSections(formats), [formats]);

  const scrollToCategory = (categoryId: string) => {
    handleSelectFormat(null);
    setActiveTab("formats");
    setTimeout(() => {
      const el = document.getElementById(categoryId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans flex flex-col justify-between selection:bg-magenta selection:text-plum">

      {/* 1. Header (Briefd: title, by finali: label, Nav: label — 1.618 Scale) */}
      <div className="w-full px-5 sm:px-[30px] pt-5">
        <CropFrame className="w-full">
          <header className="w-full flex items-center justify-between px-0 py-3 sm:py-4 bg-white">
            <Link href="/briefd" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-black">
              <span className="text-title font-bold text-black tracking-tight leading-none">Briefd</span>
              <span className="text-label font-semibold text-black leading-none">(by finali)</span>
            </Link>

            <nav className="flex items-center gap-4 text-label font-semibold text-black">
              <Link href="/" className="hover:underline transition-opacity hidden sm:inline">
                About us
              </Link>
              <a href="#about" className="hover:underline transition-opacity hidden sm:inline">
                What we do
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShareModalOpen(true)}
                title="Copy zero-login share link for agency, client or freelancers"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share live brief</span>
              </Button>
              <Button variant="solid" size="sm" onClick={() => setIsFinaliModalOpen(true)}>
                <span>Automate final art</span>
              </Button>
            </nav>
          </header>
        </CropFrame>
      </div>

      {/* 2. Main Content Stage */}
      <main className="w-full px-5 sm:px-[30px] py-8 flex-1 flex flex-col">
        
        {/* VIEW 1: INITIAL DROPZONE (Hero: Display / Body — 1.618 Scale) */}
        {viewState === "dropzone" && (
          <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center justify-center text-center gap-8">
            <div className="flex flex-col gap-3 max-w-2xl">
              <h1 className="text-section sm:text-hero font-bold text-black tracking-tight leading-[1.02]">
                Drop your spreadsheet.<br />
                See your campaign.
              </h1>
              <p className="text-value font-medium text-black mt-2 leading-relaxed">
                Translate messy media plans into clean format cards and technical specs for creative teams.
              </p>
            </div>

            {/* Clickable Drop Area (Title / Subtitle) */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={`w-full max-w-2xl p-12 sm:p-16 flex flex-col items-center justify-center gap-5 transition-all cursor-pointer group border ${
                isDragOver ? "border-black" : "border-transparent"
              }`}
            >
              <div className="w-16 h-16 flex items-center justify-center group-hover:opacity-70 transition-opacity">
                <FileSpreadsheet className="w-12 h-12 text-black" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-title font-bold text-black leading-tight">
                  Drop your media plan here (.xlsx)
                </h3>
                <p className="text-value font-medium text-black">
                  {isUploading ? "Parsing your media plan..." : "Or click anywhere to choose a file"}
                </p>
              </div>

              <Button
                variant="solid"
                size="lg"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSamplePlan();
                }}
              >
                Load sample media plan: Bevero Black Friday 2026
              </Button>
            </div>

            {uploadError && (
              <p className="text-value font-semibold text-plum max-w-2xl">{uploadError}</p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 text-label font-bold text-black">
              <span>Supports all agency formats</span>
              <span>·</span>
              <span>Zero template restrictions</span>
              <span>·</span>
              <span>100% free utility</span>
            </div>
          </div>
        )}

        {/* VIEW 2: CMYK PRE-FLIGHT LOADER */}
        {viewState === "loading" && (
          <div className="w-full py-16 flex items-center justify-center">
            <PreflightLoader onComplete={() => setViewState("workspace")} />
          </div>
        )}

        {/* VIEW 3: ACTIVE 2-COLUMN STUDIO WORKSPACE */}
        {viewState === "workspace" && (
          <div className="w-full flex flex-col gap-6">
            {unmatched.length > 0 && (
              <div className="w-full bg-taupe text-yellow p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-value font-bold">
                    {unmatched.length} {unmatched.length === 1 ? "row" : "rows"} could not be matched to a known spec
                  </span>
                  <ul className="text-label font-semibold flex flex-col gap-0.5">
                    {unmatched.map((row, i) => (
                      <li key={i}>
                        {row.publisher} — {row.format}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setUnmatched([])}
                  title="Dismiss"
                  className="p-1 text-yellow/80 hover:text-yellow cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

          <div className="w-full flex flex-col lg:flex-row items-start gap-8">
            
            {/* Left Navigation Sidebar */}
            <BriefdSidebar
              formats={formats}
              clientName={planMeta?.client}
              campaignName={planMeta?.campaign}
              selectedFormatId={selectedFormatId}
              onSelectTab={setActiveTab}
              onSelectFormat={handleSelectFormat}
              onSelectCategory={scrollToCategory}
              onResetPlan={() => setViewState("dropzone")}
            />

            {/* Right Main Stage */}
            <div className="flex-1 w-full flex flex-col gap-8">
              
              {/* Primary View Switcher Top Bar (Clean segmented control, no decorative lines) */}
              {selectedFormat === null && (
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                  <div className="inline-flex p-0.5 bg-black/[0.04] rounded-xs">
                    <button
                      onClick={() => setActiveTab("formats")}
                      className={`px-3 py-1.5 text-label font-bold transition-all flex items-center gap-1.5 cursor-pointer rounded-xs ${
                        activeTab === "formats"
                          ? "bg-white text-black"
                          : "text-black/60 hover:text-black"
                      }`}
                    >
                      <span>All formats ({formats.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("calendar")}
                      className={`px-3 py-1.5 text-label font-bold transition-all flex items-center gap-1.5 cursor-pointer rounded-xs ${
                        activeTab === "calendar"
                          ? "bg-white text-black"
                          : "text-black/60 hover:text-black"
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Calendar</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("table")}
                      className={`px-3 py-1.5 text-label font-bold transition-all flex items-center gap-1.5 cursor-pointer rounded-xs ${
                        activeTab === "table"
                          ? "bg-white text-black"
                          : "text-black/60 hover:text-black"
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Spreadsheet</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => setIsShareModalOpen(true)}
                      title="Share zero-login live brief URL"
                    >
                      <Globe className="w-3.5 h-3.5 text-black" />
                      <span>Share live brief</span>
                    </Button>

                    <span className="text-label font-normal text-black/60 hidden lg:inline">
                      {activeTab === "formats"
                        ? `${formats.length} formats in ${sections.length} ${sections.length === 1 ? "category" : "categories"}`
                        : activeTab === "calendar"
                        ? "Delivery schedule September 2026"
                        : "Structured media table with export"}
                    </span>
                  </div>
                </div>
              )}

              {/* Detailed Format Inspection View */}
              {selectedFormat !== null ? (
                <FormatDetailView
                  format={selectedFormat}
                  onBack={() => handleSelectFormat(null)}
                />
              ) : activeTab === "calendar" ? (
                /* Production Calendar View */
                <BriefdCalendarView
                  formats={formats}
                  onSelectFormat={handleSelectFormat}
                />
              ) : activeTab === "table" ? (
                /* Spreadsheet / Table View */
                <BriefdSpreadsheetView
                  formats={formats}
                  onSelectFormat={handleSelectFormat}
                />
              ) : (
                /* Overview Stage (Proposal 3: Rich Dark Saturated Section Containers with Crisp White Format Cards) */
                <div className="w-full flex flex-col gap-12">
                  {sections.map((sec) => (
                    <div 
                      key={sec.id} 
                      id={sec.id} 
                      className={`w-full flex flex-col gap-8 p-6 sm:p-10 md:p-12 ${sec.sectionBg} scroll-mt-6`}
                    >
                      
                      {/* Section Headline & Description Lockup (No borders, unboxed clean counter) */}
                      <div className="flex flex-col gap-1.5 pb-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <h2 className={`text-section font-bold ${sec.titleColor} tracking-tight leading-none`}>
                            {sec.title}
                          </h2>
                          <span className={`text-label font-bold ${sec.descColor} shrink-0`}>
                            {sec.formats.length} formats
                          </span>
                        </div>
                        <p className={`text-label font-semibold ${sec.descColor} tracking-normal`}>
                          {sec.description}
                        </p>
                      </div>

                      {/* Format Cards Grid (3 Columns with Crisp White Cards inside the Rich Section) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                        {sec.formats.map((format) => (
                          <FormatCardItem
                            key={format.id}
                            format={format}
                            onSelect={handleSelectFormat}
                          />
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
          </div>
        )}

      </main>

      {/* 3. Bottom Section: Automated Artwork Delivery (Section Headline / Value Body) */}
      <div className="w-full px-5 sm:px-[30px] pb-10">
        <section className="w-full bg-plum text-magenta p-8 sm:p-12 md:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h3 className="text-title sm:text-section font-bold text-magenta leading-tight tracking-tight">
              From approved layout to {formats.length} production-ready files in seconds.
            </h3>
            <p className="text-value text-magenta mt-2 max-w-xl leading-relaxed">
              Finali connects directly to your master design file and automatically exports validated PDF/X files, DOOH sequences, and social banners matching exact publisher requirements.
            </p>
          </div>

          <Button
            variant="contrast"
            size="lg"
            onClick={() => setIsFinaliModalOpen(true)}
            className="shrink-0"
          >
            Request early access
          </Button>
        </section>
      </div>

      {/* 4. Footer (Framed with Crop Marks) */}
      <div className="w-full px-5 sm:px-[30px] pb-5">
        <CropFrame className="w-full">
          <footer id="footer" className="w-full bg-taupe text-yellow px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-label font-semibold">
            <div className="flex items-center gap-3">
              <span className="font-bold text-label">Briefd</span>
              <span>(by Finali Technologies AB)</span>
              <span>·</span>
              <span>Stockholm, Sweden</span>
            </div>

            <div className="flex items-center gap-6 text-yellow text-label">
              <Link href="/" className="hover:underline">Home</Link>
              <a href="#about" className="hover:underline">About</a>
              <button
                onClick={() => setIsFinaliModalOpen(true)}
                className="hover:underline cursor-pointer font-bold text-yellow"
              >
                Automated Delivery
              </button>
            </div>
          </footer>
        </CropFrame>
      </div>

      {/* Finali AI Modal */}
      <FinaliAIModal 
        isOpen={isFinaliModalOpen} 
        onClose={() => setIsFinaliModalOpen(false)} 
      />

      {/* Share Zero-Login Live Brief Modal (PLG) */}
      <ShareLiveBriefModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        clientName="Bevero"
        formatCount={formats.length}
      />

    </div>
  );
}

// useSearchParams() requires a Suspense boundary on statically rendered pages.
export default function BriefdPage() {
  return (
    <Suspense fallback={null}>
      <BriefdApp />
    </Suspense>
  );
}
