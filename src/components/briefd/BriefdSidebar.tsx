"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileUp, RotateCcw } from "lucide-react";
import type { FormatData } from "@/lib/briefd/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/briefd/categories";
import { GeometricGlyph } from "@/components/atoms/GeometricGlyph";
import { Button } from "@/components/atoms/Button";

interface BriefdSidebarProps {
  formats: FormatData[];
  selectedFormatId: string | null;
  onSelectTab: (tab: "formats" | "calendar" | "table") => void;
  onSelectFormat: (formatId: string | null) => void;
  onSelectCategory: (categoryId: string) => void;
  onReplacePlan?: () => void;
  onResetPlan?: () => void;
  clientName: string;
  campaignName: string;
}

// Sidebar tree entries, derived from the single category source of truth.
const CATEGORY_META = CATEGORY_ORDER.map((name) => ({
  key: CATEGORIES[name].key,
  name,
  title: CATEGORIES[name].title,
}));

export function BriefdSidebar({
  formats,
  selectedFormatId,
  onSelectTab,
  onSelectFormat,
  onSelectCategory,
  onReplacePlan,
  onResetPlan,
  clientName,
  campaignName,
}: BriefdSidebarProps) {
  // ALL CATEGORIES CLOSED BY DEFAULT
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catName: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  return (
    <aside className="w-full lg:w-72 bg-white flex flex-col justify-between shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-100px)] lg:max-h-[calc(100vh-100px)] overflow-hidden">

      {/* 1. Top Section (Client, Campaign & All Formats Link) */}
      <div className="flex flex-col gap-3 shrink-0 pt-1 pb-2">
        <div className="flex flex-col gap-0.5 pb-1">
          <span className="text-label font-bold text-black/60 tracking-normal">
            Client &amp; Campaign
          </span>
          <h2 className="text-title font-bold text-black tracking-tight leading-none">
            {clientName}
          </h2>
          <p className="text-label font-semibold text-black">
            {campaignName}
          </p>
        </div>

        {/* All Overview Link (Clean text, unboxed format count) */}
        <button
          onClick={() => {
            onSelectTab("formats");
            onSelectFormat(null);
          }}
          className="w-full text-left text-label font-bold text-black px-2 py-1.5 hover:bg-black/5 transition-colors flex items-center justify-between cursor-pointer"
        >
          <span className="hover:underline">All campaign formats</span>
          <span className="text-label font-semibold text-black/60">{formats.length}</span>
        </button>
      </div>

      {/* 2. Middle Scrollable Category Tree (Pure Monochrome Black/White) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1 py-1">
        {CATEGORY_META.map((cat) => {
          const catFormats = formats.filter((f) => f.sectionCategory === cat.name);
          const isOpen = !!openCategories[cat.name];

          return (
            <div key={cat.key} className="flex flex-col gap-0.5">
              {/* Category Header */}
              <div className="flex items-center justify-between text-label font-bold text-black py-1.5 px-2 hover:bg-black/5 transition-colors">
                <button
                  onClick={() => {
                    onSelectTab("formats");
                    onSelectCategory(cat.key);
                    onSelectFormat(null);
                  }}
                  className="flex-1 text-left cursor-pointer text-black font-bold truncate hover:underline"
                >
                  {cat.title}
                </button>

                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="p-1 text-black hover:opacity-60 cursor-pointer flex items-center gap-1 shrink-0"
                  title={isOpen ? "Collapse section" : "Expand section"}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${cat.title}`}
                >
                  <span className="text-label font-bold text-black/60">{catFormats.length}</span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-black" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-black" />
                  )}
                </button>
              </div>

              {/* Format Items List under Category (Clean indentation, no vertical line) */}
              {isOpen && (
                <div className="flex flex-col gap-0.5 pl-2 my-0.5">
                  {catFormats.map((item) => {
                    const isSelected = selectedFormatId === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab("formats");
                          onSelectFormat(item.id);
                        }}
                        className={`w-full text-left px-2.5 py-1 text-label transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-black text-white font-semibold"
                            : "text-black hover:bg-black/5 font-medium"
                        }`}
                      >
                        {/* Format Name on the Left */}
                        <span className="truncate">{item.formatName}</span>

                        {/* Geometric Symbol on the Right */}
                        <div className="shrink-0">
                          <GeometricGlyph
                            widthRatio={item.dimensions.width}
                            heightRatio={item.dimensions.height}
                            size="inline"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Pinned Bottom Footer (No harsh border line, clean button) */}
      <div className="shrink-0 pt-3 pb-2 bg-white flex flex-col gap-1.5">
        {onReplacePlan && (
          <Button
            variant="soft"
            size="sm"
            onClick={onReplacePlan}
            className="w-full"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Update from spreadsheet</span>
          </Button>
        )}
        {onResetPlan && (
          <Button
            variant={onReplacePlan ? "outline" : "soft"}
            size="sm"
            onClick={onResetPlan}
            className="w-full"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start a new import</span>
          </Button>
        )}

        <div className="flex items-center justify-center gap-1.5 text-label text-black/60 text-center pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-petrol shrink-0" />
          <span>{formats.length} resolved formats</span>
        </div>
      </div>

    </aside>
  );
}
