"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { FormatData } from "./FormatCardItem";

interface BriefdSidebarProps {
  formats: FormatData[];
  selectedFormatId: string | null;
  activeTab: "formats" | "calendar" | "table";
  onSelectTab: (tab: "formats" | "calendar" | "table") => void;
  onSelectFormat: (formatId: string | null) => void;
  onSelectCategory: (categoryId: string) => void;
  onResetPlan: () => void;
}

// Geometric Icon Generator based on Aspect Ratio placed on the RIGHT
function GeometricGlyph({ widthRatio, heightRatio }: { widthRatio: number; heightRatio: number }) {
  const ratio = widthRatio / heightRatio;
  
  if (ratio > 1.8) {
    return (
      <span className="inline-block w-3 h-1.5 border border-black bg-white shrink-0" title="Landscape banner" />
    );
  } else if (ratio > 1.05) {
    return (
      <span className="inline-block w-2.5 h-2 border border-black bg-white shrink-0" title="Landscape" />
    );
  } else if (ratio >= 0.95 && ratio <= 1.05) {
    return (
      <span className="inline-block w-2 h-2 border border-black bg-white shrink-0" title="Square (1:1)" />
    );
  } else if (ratio < 0.65) {
    return (
      <span className="inline-block w-1.5 h-3 border border-black bg-white shrink-0" title="Vertical (9:16)" />
    );
  } else {
    return (
      <span className="inline-block w-2 h-2.5 border border-black bg-white shrink-0" title="Portrait" />
    );
  }
}

const CATEGORY_META = [
  { key: "some", name: "Social Media (SoMe)", title: "Social Media (SoMe)" },
  { key: "display", name: "Digital Display & High-Impact", title: "Digital Banners" },
  { key: "ooh", name: "Out of Home (OOH & DOOH)", title: "Out of Home (OOH)" },
  { key: "print", name: "Newsprint & Magazines (Print)", title: "Printed Media" }
];

export function BriefdSidebar({
  formats,
  selectedFormatId,
  activeTab,
  onSelectTab,
  onSelectFormat,
  onSelectCategory,
  onResetPlan
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
          <span className="text-[11px] font-bold text-[#555555] tracking-normal">
            Client &amp; Campaign
          </span>
          <h2 className="text-[30px] font-bold text-black tracking-tight leading-none">
            Bevero
          </h2>
          <p className="text-[11px] font-semibold text-black">
            Black Friday 2026
          </p>
        </div>

        {/* All Overview Link (Clean text, unboxed format count) */}
        <button
          onClick={() => {
            onSelectTab("formats");
            onSelectFormat(null);
          }}
          className="w-full text-left text-[11px] font-bold text-black px-2 py-1.5 hover:bg-black/5 transition-colors flex items-center justify-between cursor-pointer"
        >
          <span className="hover:underline">All campaign formats</span>
          <span className="text-[11px] font-semibold text-[#555555]">{formats.length}</span>
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
              <div className="flex items-center justify-between text-[11px] font-bold text-black py-1.5 px-2 hover:bg-black/5 transition-colors">
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
                >
                  <span className="text-[10px] font-bold text-[#555555]">{catFormats.length}</span>
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
                        className={`w-full text-left px-2.5 py-1 text-[11px] transition-colors flex items-center justify-between gap-3 cursor-pointer ${
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
                            widthRatio={item.widthRatio}
                            heightRatio={item.heightRatio}
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
        <button
          onClick={onResetPlan}
          className="btn-morph w-full py-2.5 text-[11px] font-bold text-black bg-black/5 hover:bg-black/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Upload new spreadsheet</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#555555] text-center pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{formats.length} formats · 32 hidden breaks washed silently</span>
        </div>
      </div>

    </aside>
  );
}
