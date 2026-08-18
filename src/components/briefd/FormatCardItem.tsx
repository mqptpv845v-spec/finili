"use client";

import React from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import type { FormatData } from "@/lib/briefd/types";
import { CATEGORIES } from "@/lib/briefd/categories";
import { GeometricGlyph } from "@/components/atoms/GeometricGlyph";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

// Re-exported so existing importers of FormatData from this file keep working.
export type { FormatData } from "@/lib/briefd/types";

// Demo-data logic: the sample Bevero media plan has two fixed delivery waves,
// so cards flag these two literal dates. Real campaign data replaces this in a
// follow-on phase.
const FIRST_DELIVERABLE_DATE = "10 Sep";
const SECOND_DELIVERABLE_DATE = "11 Sep";

interface FormatCardItemProps {
  format: FormatData;
  onSelect?: (id: string) => void;
}

export function FormatCardItem({ format, onSelect }: FormatCardItemProps) {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(format.dimensions);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(format.id);
    }
  };

  const stripeColor = CATEGORIES[format.sectionCategory].stripe;

  return (
    <div
      id={format.id}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(format.id)}
      onKeyDown={handleKeyDown}
      className="w-full bg-white text-black flex flex-col justify-between cursor-pointer group transition-colors border border-transparent hover:border-black/30 relative overflow-hidden scroll-mt-24"
    >
      {/* 10px light top stripe (h-2.5), colored per category */}
      <div className={`w-full h-2.5 ${stripeColor} shrink-0`} />

      <div className="p-7 sm:p-8 flex flex-col justify-between gap-6 flex-1">
        {/* 1. Header Row (Publisher / Category) */}
        <div className="flex items-center justify-between text-label font-bold text-black/60 tracking-normal">
          <span>{format.publisher}</span>
          <span>{format.categoryTag}</span>
        </div>

        {/* 2. Format Title & Clean Proportional Aspect Icon */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-black font-bold text-title tracking-tight leading-none">
            {format.formatName}
          </h3>

          <div className="pt-1 shrink-0">
            <GeometricGlyph
              widthRatio={format.widthRatio}
              heightRatio={format.heightRatio}
              size="card"
            />
          </div>
        </div>

        {/* 3. Structured Field Stack (Labels / Values) */}
        <div className="flex flex-col gap-4 text-black">

          {/* Dimensions */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-black/60 text-label tracking-normal">
              Dimensions
            </span>
            <span className="text-black font-normal text-value leading-snug">
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
              className="p-2.5 bg-yellow/70 text-black flex items-center justify-between gap-2 text-label rounded-xs hover:bg-yellow transition-colors"
              title="Click to inspect and verify dimension anomaly"
            >
              <span className="font-semibold text-black truncate">
                {format.anomaly.message}
              </span>
              <span className="font-bold text-taupe underline shrink-0">
                Verify
              </span>
            </div>
          )}

          {/* Specs Link */}
          {format.specsUrl && (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-black/60 text-label tracking-normal">
                Specs
              </span>
              <a
                href={format.specsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-petrol underline text-value font-normal truncate flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              >
                <span>{format.specsLabel || format.specsUrl}</span>
                <ExternalLink className="w-4 h-4 text-petrol inline shrink-0" />
              </a>
            </div>
          )}

          {/* Safe Zone */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-black/60 text-label tracking-normal">
              Safe zone
            </span>
            <span className="text-black text-value leading-snug font-normal">
              {format.safeZone}
            </span>
          </div>

          {/* File Type */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-black/60 text-label tracking-normal">
              File type:
            </span>
            <span className="text-black text-value font-normal leading-snug">
              {format.fileType}
            </span>
          </div>

          {/* Delivery / Deadline (Clean, No Dot, Regular text) */}
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-black/60 text-label tracking-normal">
              Delivery
            </span>
            <div className="flex items-center gap-2">
              <span className="text-black text-value font-normal leading-snug">
                {format.deadline}
              </span>
              {format.deadline === FIRST_DELIVERABLE_DATE && (
                <span className="text-label font-bold px-1.5 py-0.5 bg-taupe text-yellow tracking-tight">
                  1st deliverable
                </span>
              )}
              {format.deadline === SECOND_DELIVERABLE_DATE && (
                <span className="text-label font-bold px-1.5 py-0.5 bg-black/5 text-black tracking-tight">
                  2nd deliverable
                </span>
              )}
            </div>
          </div>

        </div>

        {/* 4. Footer Action: Quick Copy Dimensions */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-label font-bold text-black hover:opacity-70 transition-opacity cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-petrol" />
                <span className="text-petrol">Copied ({format.dimensions})</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-black" />
                <span>Copy dimensions</span>
              </>
            )}
          </button>

          <span className="text-label font-bold text-black/60 group-hover:text-black transition-colors">
            View details →
          </span>
        </div>
      </div>

    </div>
  );
}
