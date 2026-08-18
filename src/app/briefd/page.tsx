"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CropFrame } from "@/components/CropFrame";
import { FormatCardItem, FormatData } from "@/components/briefd/FormatCardItem";
import { BriefdSidebar } from "@/components/briefd/BriefdSidebar";
import { FormatDetailView } from "@/components/briefd/FormatDetailView";
import { BriefdCalendarView } from "@/components/briefd/BriefdCalendarView";
import { BriefdSpreadsheetView } from "@/components/briefd/BriefdSpreadsheetView";
import { ShareLiveBriefModal } from "@/components/briefd/ShareLiveBriefModal";
import { PreflightLoader } from "@/components/briefd/PreflightLoader";
import { FinaliAIModal } from "@/components/briefd/FinaliAIModal";
import { FileSpreadsheet, Calendar as CalendarIcon, Table as TableIcon, Share2, Globe } from "lucide-react";

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

const SECTIONS = [
  {
    number: "01",
    id: "some",
    title: "Social Media (SoMe)",
    category: "Social Media (SoMe)",
    formats: CAMPAIGN_FORMATS.filter(f => f.sectionCategory === "Social Media (SoMe)"),
    description: "Meta, Snapchat & LinkedIn stories, feed and video formats",
    sectionBg: "bg-[#7C705A]",
    titleColor: "text-[#FFFFA8]",
    descColor: "text-[#FFFFA8]/80",
    badgeBorder: "border-[#FFFFA8]/40 text-[#FFFFA8]",
    dividerColor: "border-[#FFFFA8]/20"
  },
  {
    number: "02",
    id: "display",
    title: "Digital Banners",
    category: "Digital Display & High-Impact",
    formats: CAMPAIGN_FORMATS.filter(f => f.sectionCategory === "Digital Display & High-Impact"),
    description: "Programmatic, desktop panorama and mobile topscroll",
    sectionBg: "bg-[#520037]",
    titleColor: "text-[#FFADEB]",
    descColor: "text-[#FFADEB]/80",
    badgeBorder: "border-[#FFADEB]/40 text-[#FFADEB]",
    dividerColor: "border-[#FFADEB]/20"
  },
  {
    number: "03",
    id: "ooh",
    title: "Out of Home (OOH)",
    category: "Out of Home (OOH & DOOH)",
    formats: CAMPAIGN_FORMATS.filter(f => f.sectionCategory === "Out of Home (OOH & DOOH)"),
    description: "Classic printed outdoor placements and digital series",
    sectionBg: "bg-[#173537]",
    titleColor: "text-[#84CCEF]",
    descColor: "text-[#84CCEF]/80",
    badgeBorder: "border-[#84CCEF]/40 text-[#84CCEF]",
    dividerColor: "border-[#84CCEF]/20"
  },
  {
    number: "04",
    id: "print",
    title: "Printed Media",
    category: "Newsprint & Magazines (Print)",
    formats: CAMPAIGN_FORMATS.filter(f => f.sectionCategory === "Newsprint & Magazines (Print)"),
    description: "Dagens industri tabloid, half page and magazine with ICC profiles",
    sectionBg: "bg-[#191A1C]",
    titleColor: "text-white",
    descColor: "text-white/70",
    badgeBorder: "border-white/30 text-white",
    dividerColor: "border-white/20"
  }
];

function BriefdApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewState, setViewState] = useState<"dropzone" | "loading" | "workspace">("workspace");
  const [activeTab, setActiveTab] = useState<"formats" | "calendar" | "table">("formats");
  const [isFinaliModalOpen, setIsFinaliModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  const selectedFormat = CAMPAIGN_FORMATS.find(f => f.id === selectedFormatId) || null;

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
    <div className="w-full min-h-screen bg-white text-black font-sans flex flex-col justify-between selection:bg-[#FFADEB] selection:text-[#520037]">
      
      {/* 1. Header (Briefd: 30px, by finali: 11px, Nav: 11px — 1.618 Scale) */}
      <div className="w-full px-5 sm:px-[30px] pt-5">
        <CropFrame className="w-full">
          <header className="w-full flex items-center justify-between px-0 py-3 sm:py-4 bg-white">
            <Link href="/briefd" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-black">
              <span className="text-[30px] font-bold text-black tracking-tight leading-none" style={{ color: "#000000" }}>Briefd</span>
              <span className="text-[11px] font-semibold text-black leading-none" style={{ color: "#000000" }}>(by finali)</span>
            </Link>

            <nav className="flex items-center gap-4 text-[11px] font-semibold text-black">
              <Link href="/" className="hover:underline transition-opacity hidden sm:inline">
                About us
              </Link>
              <a href="#about" className="hover:underline transition-opacity hidden sm:inline">
                What we do
              </a>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="btn-morph flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold text-black border border-black/[0.15] hover:border-black cursor-pointer"
                title="Copy zero-login share link for agency, client or freelancers"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share live brief</span>
              </button>
              <button
                onClick={() => setIsFinaliModalOpen(true)}
                className="btn-morph bg-black text-white px-4 py-2 text-[11px] font-semibold cursor-pointer"
              >
                <span>Automate final art</span>
              </button>
            </nav>
          </header>
        </CropFrame>
      </div>

      {/* 2. Main Content Stage */}
      <main className="w-full px-5 sm:px-[30px] py-8 flex-1 flex flex-col">
        
        {/* VIEW 1: INITIAL DROPZONE (Hero: 78px Display / 18px Body — 1.618 Scale) */}
        {viewState === "dropzone" && (
          <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center justify-center text-center gap-8">
            <div className="flex flex-col gap-3 max-w-2xl">
              <h1 className="text-[48px] sm:text-[78px] font-bold text-black tracking-tight leading-[1.02]">
                Drop your spreadsheet.<br />
                See your campaign.
              </h1>
              <p className="text-[18px] font-medium text-black mt-2 leading-relaxed">
                Translate messy media plans into clean format cards and technical specs for creative teams.
              </p>
            </div>

            {/* Clickable Drop Area (30px Title / 18px Subtitle) */}
            <div
              onClick={() => setViewState("loading")}
              className="w-full max-w-2xl p-12 sm:p-16 flex flex-col items-center justify-center gap-5 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-12 h-12 text-black" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[30px] font-bold text-black leading-tight">
                  Drop your media plan here (.xlsx, .numbers)
                </h3>
                <p className="text-[18px] font-medium text-black">
                  Or click anywhere to load and test with a sample campaign
                </p>
              </div>

              <button
                type="button"
                className="mt-2 bg-black text-white px-8 py-3.5 text-[18px] font-bold rounded-none hover:opacity-80 transition-opacity cursor-pointer"
              >
                Load sample media plan: Bevero Black Friday 2026
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold text-black">
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
          <div className="w-full flex flex-col lg:flex-row items-start gap-8">
            
            {/* Left Navigation Sidebar */}
            <BriefdSidebar
              formats={CAMPAIGN_FORMATS}
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
                      className={`px-3 py-1.5 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer rounded-xs ${
                        activeTab === "formats"
                          ? "bg-white text-black shadow-xs"
                          : "text-[#555555] hover:text-black"
                      }`}
                    >
                      <span>Alla format ({CAMPAIGN_FORMATS.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("calendar")}
                      className={`px-3 py-1.5 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer rounded-xs ${
                        activeTab === "calendar"
                          ? "bg-white text-black shadow-xs"
                          : "text-[#555555] hover:text-black"
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Kalender</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("table")}
                      className={`px-3 py-1.5 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer rounded-xs ${
                        activeTab === "table"
                          ? "bg-white text-black shadow-xs"
                          : "text-[#555555] hover:text-black"
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Kalkylark</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="btn-morph flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold text-black bg-black/[0.04] hover:bg-black/10 cursor-pointer"
                      title="Share zero-login live brief URL"
                    >
                      <Globe className="w-3.5 h-3.5 text-black" />
                      <span>Share live brief</span>
                    </button>

                    <span className="text-[11px] font-normal text-[#555555] hidden lg:inline">
                      {activeTab === "formats" 
                        ? `${CAMPAIGN_FORMATS.length} format i 4 kategorier` 
                        : activeTab === "calendar"
                        ? "Leveransschema september 2026"
                        : "Strukturerad medietabell med export"}
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
                  formats={CAMPAIGN_FORMATS}
                  onSelectFormat={handleSelectFormat}
                />
              ) : activeTab === "table" ? (
                /* Spreadsheet / Table View */
                <BriefdSpreadsheetView
                  formats={CAMPAIGN_FORMATS}
                  onSelectFormat={handleSelectFormat}
                />
              ) : (
                /* Overview Stage (Proposal 3: Rich Dark Saturated Section Containers with Crisp White Format Cards) */
                <div className="w-full flex flex-col gap-12">
                  {SECTIONS.map((sec) => (
                    <div 
                      key={sec.id} 
                      id={sec.id} 
                      className={`w-full flex flex-col gap-8 p-6 sm:p-10 md:p-12 ${sec.sectionBg} scroll-mt-6`}
                    >
                      
                      {/* Section Headline & Description Lockup (No borders, unboxed clean counter) */}
                      <div className="flex flex-col gap-1.5 pb-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <h2 className={`text-[48px] font-bold ${sec.titleColor} tracking-tight leading-none`}>
                            {sec.title}
                          </h2>
                          <span className={`text-[11px] font-bold ${sec.descColor} shrink-0`}>
                            {sec.formats.length} formats
                          </span>
                        </div>
                        <p className={`text-[11px] font-semibold ${sec.descColor} tracking-normal`}>
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
        )}

      </main>

      {/* 3. Bottom Section: Automated Artwork Delivery (48px Headline / 18px Body) */}
      <div className="w-full px-5 sm:px-[30px] pb-10">
        <section className="w-full bg-[#520037] text-[#FFADEB] p-8 sm:p-12 md:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h3 className="text-[30px] sm:text-[48px] font-bold text-[#FFADEB] leading-tight tracking-tight">
              From approved layout to {CAMPAIGN_FORMATS.length} production-ready files in seconds.
            </h3>
            <p className="text-[18px] text-[#FFADEB] mt-2 max-w-xl leading-relaxed">
              Finali connects directly to your master design file and automatically exports validated PDF/X files, DOOH sequences, and social banners matching exact publisher requirements.
            </p>
          </div>

          <button
            onClick={() => setIsFinaliModalOpen(true)}
            className="btn-morph bg-[#FFADEB] text-[#520037] hover:bg-white px-8 py-4 text-[18px] font-bold cursor-pointer shrink-0 shadow-lg"
          >
            Request early access
          </button>
        </section>
      </div>

      {/* 4. Footer (Framed with Crop Marks) */}
      <div className="w-full px-5 sm:px-[30px] pb-5">
        <CropFrame className="w-full">
          <footer id="footer" className="w-full bg-[#7C705A] text-[#FFFFA8] px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] font-semibold">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[11px]">Briefd</span>
              <span>(by Finali Technologies AB)</span>
              <span>·</span>
              <span>Stockholm, Sweden</span>
            </div>

            <div className="flex items-center gap-6 text-[#FFFFA8] text-[11px]">
              <Link href="/" className="hover:underline">Home</Link>
              <a href="#about" className="hover:underline">About</a>
              <button 
                onClick={() => setIsFinaliModalOpen(true)} 
                className="hover:underline cursor-pointer font-bold text-[#FFFFA8]"
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
        formatCount={CAMPAIGN_FORMATS.length}
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
