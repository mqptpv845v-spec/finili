"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export interface FormatData {
  id: string;
  categoryTag: "SoMe" | "OOH" | "DOOH" | "Print" | "Display" | "High-Impact";
  publisher: string;
  formatName: string;
  sectionCategory: "Social Media (SoMe)" | "Out of Home (OOH & DOOH)" | "Newsprint & Magazines (Print)" | "Digital Display & High-Impact";
  dimensions: string;
  widthRatio: number;
  heightRatio: number;
  ratioLabel: string;
  deadline: string;
  safeZone: string;
  fileType: string;
  specsLabel: string;
  specsUrl: string;
  metadata?: string;
  anomaly?: {
    message: string;
    standard: string;
  };
}

interface FormatCardItemProps {
  format: FormatData;
  onSelect?: (id: string) => void;
}

// 10px Ljus topprand på de vita korten
const SECTION_STRIPES: Record<string, string> = {
  "Social Media (SoMe)": "bg-[#FFFFA8]",                 // Ljusgul rand
  "Digital Display & High-Impact": "bg-[#FFADEB]",       // Ljusrosa rand
  "Out of Home (OOH & DOOH)": "bg-[#84CCEF]",            // Ljusblå rand
  "Newsprint & Magazines (Print)": "bg-[#F5F5F5] border-b border-black/10" // Ljusgrå/vit rand
};

// Geometric Icon Generator based on Aspect Ratio for top right of card
function CardGeometricGlyph({ 
  widthRatio, 
  heightRatio 
}: { 
  widthRatio: number; 
  heightRatio: number;
}) {
  const ratio = widthRatio / heightRatio;
  
  if (ratio > 2.5) {
    return (
      <div className="w-10 h-3.5 border border-black bg-transparent shrink-0" title="Landscape banner" />
    );
  } else if (ratio > 1.05) {
    return (
      <div className="w-8 h-5.5 border border-black bg-transparent shrink-0" title="Landscape" />
    );
  } else if (ratio >= 0.95 && ratio <= 1.05) {
    return (
      <div className="w-6 h-6 border border-black bg-transparent shrink-0" title="Square (1:1)" />
    );
  } else if (ratio < 0.65) {
    return (
      <div className="w-4.5 h-8 border border-black bg-transparent shrink-0" title="Vertical (9:16)" />
    );
  } else {
    return (
      <div className="w-5.5 h-7 border border-black bg-transparent shrink-0" title="Portrait" />
    );
  }
}

export function FormatCardItem({ format, onSelect }: FormatCardItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(format.dimensions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ljus topprand
  const stripeColor = SECTION_STRIPES[format.sectionCategory] || "bg-[#F5F5F5]";

  return (
    <div 
      id={format.id}
      onClick={() => onSelect?.(format.id)}
      className="w-full bg-white text-black flex flex-col justify-between cursor-pointer group transition-all hover:shadow-md relative overflow-hidden scroll-mt-24"
    >
      {/* 1. 10px Ljus topprand (h-2.5) */}
      <div className={`w-full h-2.5 ${stripeColor} shrink-0`} />
      
      <div className="p-7 sm:p-8 flex flex-col justify-between gap-6 flex-1">
        {/* 1. Header Row (Publisher / Category) */}
        <div className="flex items-center justify-between text-[11px] font-bold text-[#555555] tracking-normal">
          <span>{format.publisher}</span>
          <span>{format.categoryTag}</span>
        </div>

        {/* 2. Format Title (30px — Golden Ratio Scale) & Clean Proportional Aspect Icon */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-black font-bold text-[30px] tracking-tight leading-none group-hover:text-black transition-colors">
            {format.formatName}
          </h3>
          
          <div className="pt-1 shrink-0">
            <CardGeometricGlyph
              widthRatio={format.widthRatio}
              heightRatio={format.heightRatio}
            />
          </div>
        </div>

        {/* 3. Structured Field Stack (11px Labels / 18px Values — Golden Ratio Scale) */}
        <div className="flex flex-col gap-4 text-black">
          
          {/* Dimensions */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[#555555] text-[11px] tracking-normal">
              Dimensions
            </span>
            <span className="text-black font-normal text-[18px] leading-snug">
              {format.dimensions} ({format.ratioLabel})
            </span>
          </div>

          {/* Discreet Yellow Verification Anomaly Flag (Quiet & Calm, No dot) */}
          {format.anomaly && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(format.id);
              }}
              className="p-2.5 bg-[#FFFFA8]/70 text-black flex items-center justify-between gap-2 text-[11px] rounded-xs hover:bg-[#FFFFA8] transition-colors"
              title="Click to inspect and verify dimension anomaly"
            >
              <span className="font-semibold text-black truncate">
                {format.anomaly.message}
              </span>
              <span className="font-bold text-[#7C705A] underline shrink-0">
                Verify
              </span>
            </div>
          )}

          {/* Specs Link */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[#555555] text-[11px] tracking-normal">
              Specs
            </span>
            <a
              href={format.specsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#0066CC] hover:text-[#004499] underline text-[18px] font-normal truncate flex items-center gap-1.5"
            >
              <span>{format.specsLabel || "www.meta.com/guidelines"}</span>
              <ExternalLink className="w-4 h-4 text-[#0066CC] inline shrink-0" />
            </a>
          </div>

          {/* Safe Zone */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[#555555] text-[11px] tracking-normal">
              Safe zone
            </span>
            <span className="text-black text-[18px] leading-snug font-normal">
              {format.safeZone}
            </span>
          </div>

          {/* File Type */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[#555555] text-[11px] tracking-normal">
              File type:
            </span>
            <span className="text-black text-[18px] font-normal leading-snug">
              {format.fileType}
            </span>
          </div>

          {/* Delivery / Deadline (Clean, No Dot, Regular text) */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[#555555] text-[11px] tracking-normal">
              Delivery
            </span>
            <div className="flex items-center gap-2">
              <span className="text-black text-[18px] font-normal leading-snug">
                {format.deadline}
              </span>
              {format.deadline === "10 Sep" && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#7C705A] text-[#FFFFA8] tracking-tight">
                  1st deliverable
                </span>
              )}
              {format.deadline === "11 Sep" && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/5 text-black tracking-tight">
                  2nd deliverable
                </span>
              )}
            </div>
          </div>

        </div>

        {/* 4. Footer Action: Quick Copy Dimensions (11px, No decorative border line) */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-bold text-black hover:opacity-70 transition-opacity cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied ({format.dimensions})</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-black" />
                <span>Copy dimensions</span>
              </>
            )}
          </button>

          <span className="text-[11px] font-bold text-[#555555] group-hover:text-black transition-colors">
            View details →
          </span>
        </div>
      </div>

    </div>
  );
}
