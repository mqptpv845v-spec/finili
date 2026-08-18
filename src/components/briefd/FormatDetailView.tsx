"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, ExternalLink, Eye, EyeOff } from "lucide-react";
import type { FormatData } from "@/lib/briefd/types";
import { CATEGORIES } from "@/lib/briefd/categories";
import { Button } from "@/components/atoms/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface FormatDetailViewProps {
  format: FormatData;
  onBack: () => void;
}

export function FormatDetailView({ format, onBack }: FormatDetailViewProps) {
  const { copied, copy } = useCopyToClipboard();
  const [activeDimensions, setActiveDimensions] = useState(format.dimensions);
  const [isResolved, setIsResolved] = useState(false);
  const [showGuides, setShowGuides] = useState(true);

  const handleCopy = () => {
    copy(activeDimensions);
  };

  const stripeColor = CATEGORIES[format.sectionCategory].stripe;

  // Format type identifiers
  const isVertical916 = format.ratioLabel === "9:16";
  const isSocial = format.sectionCategory === "Social Media (SoMe)";
  const isPrint = format.sectionCategory === "Newsprint & Magazines (Print)";
  const isOOH = format.sectionCategory === "Out of Home (OOH & DOOH)";
  const isPanorama = format.formatName.toLowerCase().includes("panorama") || format.widthRatio > 3;

  // Calculate clean proportional pixel dimensions for the single architectural artboard
  const getArtboardWidth = () => {
    if (isPanorama) return 680;
    if (isVertical916) return 260;
    if (isPrint) return 280;
    if (isOOH) return 260;
    if (format.widthRatio === 1) return 300;
    return format.widthRatio > format.heightRatio ? 380 : 260;
  };

  const widthPx = getArtboardWidth();
  const heightPx = Math.round(widthPx / (format.widthRatio / format.heightRatio));

  return (
    <div className="w-full bg-white text-black py-2 flex flex-col gap-8 transition-colors">

      {/* 1. Top Breadcrumb & Back Action */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-label font-bold text-black hover:opacity-70 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all campaign formats</span>
        </button>

        <span className="text-label font-bold text-black/60">
          {format.sectionCategory}
        </span>
      </div>

      {/* 2. Main Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-label font-bold text-black/60 block mb-1">
            {format.publisher} · {format.categoryTag}
          </span>
          <h2 className="text-section font-bold text-black tracking-tight leading-none">
            {format.formatName}
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="soft"
            onClick={() => setShowGuides(!showGuides)}
            title={showGuides ? "Hide technical guides" : "Show technical guides"}
          >
            {showGuides ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showGuides ? "Hide guides" : "Show guides"}</span>
          </Button>

          <Button variant="solid" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4 text-cyan" />
                <span>Copied ({activeDimensions})</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Copy dimensions</span>
              </>
            )}
          </Button>

          <Button
            variant="solid"
            href={format.specsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Official spec</span>
            <ExternalLink className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>

      {/* 3. Discreet Anomaly Verification Banner (Quiet & Calm, No borders, No dot) */}
      {format.anomaly && !isResolved && (
        <div className="p-4 bg-yellow/60 text-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <strong className="block font-bold text-black text-value">{format.anomaly.message}</strong>
            <span className="text-black/60 font-normal text-label">
              Uploaded media plan specified {format.dimensions}. Official publisher standard is {format.anomaly.standard}.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="solid"
              size="sm"
              onClick={() => {
                setActiveDimensions(format.anomaly?.standard || format.dimensions);
                setIsResolved(true);
              }}
            >
              Snap to standard ({format.anomaly.standard})
            </Button>

            <Button variant="soft" size="sm" onClick={() => setIsResolved(true)}>
              Keep custom
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MINIMALIST ARTBOARD CANVAS ("LESS IS MORE" ARCHITECTURAL WIREFRAME)    */}
      {/* ========================================================================= */}
      <div className="w-full bg-light p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center select-none overflow-x-auto">

        <div className="flex items-start justify-center gap-4">

          {/* Main Artboard Column with Exact Top Width Measurement */}
          <div className="flex flex-col items-center shrink-0" style={{ width: `${widthPx}px` }}>

            {/* Top Width Measurement (Matches artboard width exactly with clean end ticks) */}
            <div className="w-full flex items-center justify-between pb-3 text-label font-normal text-black/60 select-none">
              <span className="w-[1px] h-3 bg-black/40 shrink-0" />
              <span className="h-[1px] flex-1 bg-black/25" />
              <span className="px-2.5 text-label font-normal text-black/60 shrink-0">
                Width: {activeDimensions.split("×")[0]?.trim()}
              </span>
              <span className="h-[1px] flex-1 bg-black/25" />
              <span className="w-[1px] h-3 bg-black/40 shrink-0" />
            </div>

            {/* The Clean Artboard Container (No center vertical/horizontal splitting lines) */}
            <div
              className="w-full bg-white border border-black/30 relative flex flex-col justify-between overflow-hidden"
              style={{ height: `${heightPx}px` }}
            >

              {/* ------------------------------------------------------------- */}
              {/* CASE A: META 9:16 REELS & STORIES                             */}
              {/* ------------------------------------------------------------- */}
              {isVertical916 && isSocial ? (
                showGuides ? (
                  <div className="w-full h-full relative flex flex-col justify-between">

                    {/* Top 14% */}
                    <div className="w-full h-[14%] bg-yellow/50 border-b border-dashed border-taupe/50 flex items-center justify-center px-2">
                      <span className="text-label font-normal text-taupe">
                        Top 14% · Profile &amp; Header
                      </span>
                    </div>

                    {/* Middle Section with 6% Margins and Clear Primary Area */}
                    <div className="w-full flex-1 flex items-stretch relative">
                      <div className="w-[6%] bg-yellow/30 border-r border-dashed border-taupe/30 flex items-center justify-center">
                        <span className="text-label font-normal text-taupe -rotate-90">6%</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center text-center p-3">
                        <span className="text-value font-normal text-black leading-snug">
                          Primary Creative Area
                        </span>
                        <span className="text-label font-normal text-black/60 mt-0.5">
                          1080 × 1270 px
                        </span>
                      </div>

                      <div className="w-[6%] bg-yellow/30 border-l border-dashed border-taupe/30 flex items-center justify-center">
                        <span className="text-label font-normal text-taupe rotate-90">6%</span>
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="w-full h-[35%] flex items-end">
                      <div className="w-[79%] h-full bg-yellow/50 border-t border-r border-dashed border-taupe/50 flex flex-col justify-end p-2.5">
                        <span className="text-label font-normal text-taupe">
                          Bottom 35% · Captions &amp; CTA
                        </span>
                      </div>

                      <div className="w-[21%] h-[114%] bg-yellow/70 border-t border-dashed border-taupe/60 flex flex-col items-center justify-center p-1 text-center">
                        <span className="text-label font-normal text-taupe leading-tight">
                          40% UI<br />(21% width)
                        </span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <span className="text-value font-normal text-black">{activeDimensions}</span>
                    <span className="text-label font-normal text-black/60 mt-1">{format.ratioLabel}</span>
                  </div>
                )
              ) : isPrint ? (
                /* ------------------------------------------------------------- */
                /* CASE B: PRINT MEDIA (Tabloid, Magazine, Half page)            */
                /* ------------------------------------------------------------- */
                showGuides ? (
                  /* Outer Bleed Zone with subtle low-opacity paper tint */
                  <div className="w-full h-full bg-black/[0.04] p-3 flex flex-col justify-between">
                    {/* Inner Safe Text Area */}
                    <div className="w-full h-full bg-white border border-dashed border-black/40 flex flex-col items-center justify-between p-3 text-center">
                      <span className="text-label font-normal text-black/60">
                        Safe text area (5 mm margin)
                      </span>
                      <div>
                        <span className="text-value font-normal text-black block">
                          {activeDimensions}
                        </span>
                        <span className="text-label font-normal text-black/60">
                          {format.fileType}
                        </span>
                      </div>
                      <span className="text-label font-normal text-black/60">
                        +3 mm Bleed trim (Outer zone)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <span className="text-value font-normal text-black block">{activeDimensions}</span>
                    <span className="text-label font-normal text-black/60 mt-1">{format.publisher}</span>
                  </div>
                )
              ) : isOOH ? (
                /* ------------------------------------------------------------- */
                /* CASE C: OUT OF HOME (Kulturtavla, Eurosize, Adshel, DOOH)     */
                /* ------------------------------------------------------------- */
                showGuides ? (
                  /* Outer Bleed Zone with category-tinted low opacity (cyan) */
                  <div className="w-full h-full bg-cyan/15 p-3.5 flex flex-col justify-between">
                    {/* Inner Safe Text Area / Visible Glass Area */}
                    <div className="w-full h-full bg-white border border-dashed border-petrol/45 flex flex-col items-center justify-between p-3 text-center">
                      <span className="text-label font-normal text-petrol">
                        {format.dimensions.includes("700")
                          ? "Safe text area (10 mm margin)"
                          : format.dimensions.includes("1185")
                          ? "Visible glass area (1160 × 1720 mm)"
                          : "Safe text area"}
                      </span>

                      <div>
                        <span className="text-value font-normal text-black block leading-snug">
                          {activeDimensions}
                        </span>
                        <span className="text-label font-normal text-black/60 mt-0.5 block">
                          {format.publisher}
                        </span>
                      </div>

                      <span className="text-label font-normal text-petrol">
                        +5 mm Bleed (Outer cyan zone)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <span className="text-value font-normal text-black leading-snug">{activeDimensions}</span>
                    <span className="text-label font-normal text-black/60 mt-1">{format.publisher}</span>
                  </div>
                )
              ) : (
                /* ------------------------------------------------------------- */
                /* CASE D: DIGITAL BANNERS & HIGH-IMPACT                         */
                /* ------------------------------------------------------------- */
                showGuides ? (
                  <div className="w-full h-full bg-magenta/10 p-2.5 flex flex-col justify-between">
                    <div className="w-full h-full bg-white border border-dashed border-plum/35 flex flex-col items-center justify-center text-center p-3">
                      <span className="text-value font-normal text-black leading-snug">
                        {activeDimensions}
                      </span>
                      <span className="text-label font-normal text-black/60 mt-1">
                        {format.safeZone}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <span className="text-value font-normal text-black leading-snug">{activeDimensions}</span>
                    <span className="text-label font-normal text-black/60 mt-1">{format.safeZone}</span>
                  </div>
                )
              )}

            </div>

          </div>

          {/* Right Height Measurement (Matches artboard height exactly with clean end ticks and no line through text) */}
          <div
            className="flex flex-col items-center justify-between text-label font-normal text-black/60 select-none mt-7 shrink-0"
            style={{ height: `${heightPx}px` }}
          >
            {/* Top tick aligning with artboard top edge */}
            <span className="h-[1px] w-3 bg-black/40 shrink-0" />

            {/* Upper vertical line */}
            <span className="w-[1px] flex-1 bg-black/25 min-h-[16px]" />

            {/* Height text with solid background masking line completely */}
            <span
              className="py-3 px-1.5 text-label font-normal text-black/60 bg-light whitespace-nowrap shrink-0 z-10"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Height: {activeDimensions.split("×")[1]?.trim() || activeDimensions}
            </span>

            {/* Lower vertical line */}
            <span className="w-[1px] flex-1 bg-black/25 min-h-[16px]" />

            {/* Bottom tick aligning with artboard bottom edge */}
            <span className="h-[1px] w-3 bg-black/40 shrink-0" />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. Technical Specifications Panels (Strictly font-normal values)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-1">

        {/* Delivery & Placement Box */}
        <div className="bg-white text-black flex flex-col overflow-hidden">
          <div className={`w-full h-2.5 ${stripeColor}`} />
          <div className="p-8 flex flex-col gap-5">
            <h4 className="text-title font-bold text-black leading-tight">
              Delivery &amp; Placement
            </h4>

            <div className="flex flex-col gap-4 text-black">
              <div>
                <span className="block text-label font-bold text-black/60">Submission deadline</span>
                <span className="block text-value font-normal text-black mt-0.5">{format.deadline}</span>
              </div>

              <div>
                <span className="block text-label font-bold text-black/60">Media owner / Publisher</span>
                <span className="block text-value font-normal text-black mt-0.5">{format.publisher}</span>
              </div>

              <div>
                <span className="block text-label font-bold text-black/60">Campaign channel</span>
                <span className="block text-value font-normal text-black mt-0.5">{format.sectionCategory}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Box */}
        <div className="bg-white text-black flex flex-col overflow-hidden">
          <div className={`w-full h-2.5 ${stripeColor}`} />
          <div className="p-8 flex flex-col gap-5">
            <h4 className="text-title font-bold text-black leading-tight">
              Technical Specifications
            </h4>

            <div className="flex flex-col gap-4 text-black">
              <div>
                <span className="block text-label font-bold text-black/60">Exact dimensions</span>
                <span className="block text-value font-normal text-black mt-0.5">{activeDimensions} ({format.ratioLabel})</span>
              </div>

              <div>
                <span className="block text-label font-bold text-black/60">Safe zone</span>
                <span className="block text-value font-normal text-black mt-0.5">{format.safeZone}</span>
              </div>

              <div>
                <span className="block text-label font-bold text-black/60">File type:</span>
                <span className="block text-value font-normal text-black mt-0.5">{format.fileType}</span>
              </div>

              <div>
                <span className="block text-label font-bold text-black/60">Aspect ratio</span>
                <span className="block text-value font-normal text-black mt-0.5">{format.ratioLabel}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
