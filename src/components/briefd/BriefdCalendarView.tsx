"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FormatData } from "@/lib/briefd/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/briefd/categories";

interface BriefdCalendarViewProps {
  formats: FormatData[];
  onSelectFormat: (formatId: string) => void;
}

interface CalendarCell {
  dayNumber: number;
  isCurrentMonth: boolean;
  dateKey: string; // e.g. "10 Sep"
  isFirstDeadline?: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// September 2026 full grid (5 weeks) with leading/trailing days like Apple Calendar.
// Hardcoded to match the demo media plan — a follow-on phase wires real data.
const WEEKS_DATA: { weekNum: number; days: CalendarCell[] }[] = [
  {
    weekNum: 36,
    days: [
      { dayNumber: 31, isCurrentMonth: false, dateKey: "31 Aug" },
      { dayNumber: 1, isCurrentMonth: true, dateKey: "1 Sep" },
      { dayNumber: 2, isCurrentMonth: true, dateKey: "2 Sep" },
      { dayNumber: 3, isCurrentMonth: true, dateKey: "3 Sep" },
      { dayNumber: 4, isCurrentMonth: true, dateKey: "4 Sep" },
      { dayNumber: 5, isCurrentMonth: true, dateKey: "5 Sep" },
      { dayNumber: 6, isCurrentMonth: true, dateKey: "6 Sep" }
    ]
  },
  {
    weekNum: 37,
    days: [
      { dayNumber: 7, isCurrentMonth: true, dateKey: "7 Sep" },
      { dayNumber: 8, isCurrentMonth: true, dateKey: "8 Sep" },
      { dayNumber: 9, isCurrentMonth: true, dateKey: "9 Sep" },
      { dayNumber: 10, isCurrentMonth: true, dateKey: "10 Sep", isFirstDeadline: true },
      { dayNumber: 11, isCurrentMonth: true, dateKey: "11 Sep" },
      { dayNumber: 12, isCurrentMonth: true, dateKey: "12 Sep" },
      { dayNumber: 13, isCurrentMonth: true, dateKey: "13 Sep" }
    ]
  },
  {
    weekNum: 38,
    days: [
      { dayNumber: 14, isCurrentMonth: true, dateKey: "14 Sep" },
      { dayNumber: 15, isCurrentMonth: true, dateKey: "15 Sep" },
      { dayNumber: 16, isCurrentMonth: true, dateKey: "16 Sep" },
      { dayNumber: 17, isCurrentMonth: true, dateKey: "17 Sep" },
      { dayNumber: 18, isCurrentMonth: true, dateKey: "18 Sep" },
      { dayNumber: 19, isCurrentMonth: true, dateKey: "19 Sep" },
      { dayNumber: 20, isCurrentMonth: true, dateKey: "20 Sep" }
    ]
  },
  {
    weekNum: 39,
    days: [
      { dayNumber: 21, isCurrentMonth: true, dateKey: "21 Sep" },
      { dayNumber: 22, isCurrentMonth: true, dateKey: "22 Sep" },
      { dayNumber: 23, isCurrentMonth: true, dateKey: "23 Sep" },
      { dayNumber: 24, isCurrentMonth: true, dateKey: "24 Sep" },
      { dayNumber: 25, isCurrentMonth: true, dateKey: "25 Sep" },
      { dayNumber: 26, isCurrentMonth: true, dateKey: "26 Sep" },
      { dayNumber: 27, isCurrentMonth: true, dateKey: "27 Sep" }
    ]
  },
  {
    weekNum: 40,
    days: [
      { dayNumber: 28, isCurrentMonth: true, dateKey: "28 Sep" },
      { dayNumber: 29, isCurrentMonth: true, dateKey: "29 Sep" },
      { dayNumber: 30, isCurrentMonth: true, dateKey: "30 Sep" },
      { dayNumber: 1, isCurrentMonth: false, dateKey: "1 Oct" },
      { dayNumber: 2, isCurrentMonth: false, dateKey: "2 Oct" },
      { dayNumber: 3, isCurrentMonth: false, dateKey: "3 Oct" },
      { dayNumber: 4, isCurrentMonth: false, dateKey: "4 Oct" }
    ]
  }
];

export function BriefdCalendarView({ formats, onSelectFormat }: BriefdCalendarViewProps) {
  // Map formats by deadline
  const formatsByDate: Record<string, FormatData[]> = {};
  formats.forEach((f) => {
    if (!formatsByDate[f.deadline]) {
      formatsByDate[f.deadline] = [];
    }
    formatsByDate[f.deadline].push(f);
  });

  return (
    <div className="w-full bg-white flex flex-col gap-6">

      {/* 1. Apple Calendar Header (clean navigation controls & legend) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">

        {/* Month & Year Title */}
        <div className="flex items-center gap-4">
          <h2 className="text-title font-bold text-black tracking-tight leading-none">
            September 2026
          </h2>

          <div className="flex items-center gap-1.5 text-black/40 pl-2">
            <button className="p-1.5 hover:text-black transition-colors cursor-pointer" title="Previous month">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-label font-bold text-black px-2.5 py-1 bg-black/5 rounded-xs">
              Today
            </span>
            <button className="p-1.5 hover:text-black transition-colors cursor-pointer" title="Next month">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Color Legend */}
        <div className="flex flex-wrap items-center gap-5 text-label font-normal text-black/60">
          {CATEGORY_ORDER.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${CATEGORIES[cat].dot}`} />
              <span>{CATEGORIES[cat].shortLabel}</span>
            </div>
          ))}
        </div>

      </div>

      {/* 2. Apple Calendar Full-Width Stage Grid with Tall Square Proportions (~150px Cells) */}
      <div className="w-full border-t border-l border-black/[0.08] bg-white">

        {/* Weekday Labels Row */}
        <div className="grid grid-cols-[34px_repeat(7,1fr)] border-b border-black/[0.08] bg-white text-label font-normal text-black/60">
          <div className="py-2.5 text-center" />
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2.5 px-3 text-right border-r border-black/[0.08]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Week Rows (Generous min-h so columns are near-square 1:1) */}
        {WEEKS_DATA.map((week) => (
          <div
            key={week.weekNum}
            className="grid grid-cols-[34px_repeat(7,1fr)] border-b border-black/[0.08] min-h-[135px] sm:min-h-[145px] lg:min-h-[155px]"
          >

            {/* Week Number (Apple style discrete left column) */}
            <div className="text-label text-black/60 font-normal pt-3 text-center select-none border-r border-black/[0.04]">
              {week.weekNum}
            </div>

            {/* 7 Days in Week (Full Width & Tall for Near-Square 1:1 Proportion) */}
            {week.days.map((day, dIdx) => {
              const dayFormats = formatsByDate[day.dateKey] || [];
              const hasFormats = dayFormats.length > 0;
              const isWeekend = dIdx >= 5;

              return (
                <div
                  key={`${week.weekNum}-${day.dayNumber}-${dIdx}`}
                  className={`p-2 sm:p-2.5 border-r border-black/[0.08] flex flex-col justify-between transition-colors overflow-hidden ${
                    !day.isCurrentMonth
                      ? "bg-black/[0.015]"
                      : isWeekend
                      ? "bg-black/[0.008]"
                      : "bg-white"
                  }`}
                >
                  {/* Top: Day Number (circular marker for the first deadline) */}
                  <div className="flex items-center justify-end mb-1">
                    {day.isFirstDeadline ? (
                      <span className="w-5 h-5 rounded-full bg-taupe text-yellow flex items-center justify-center text-label font-bold">
                        {day.dayNumber}
                      </span>
                    ) : (
                      <span
                        className={`text-label font-normal leading-none ${
                          day.isCurrentMonth && !isWeekend ? "text-black" : "text-black/60"
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    )}
                  </div>

                  {/* Events / Format Deliverables (Apple Calendar clean vertical colored bar) */}
                  <div className="flex flex-col gap-1 flex-1 justify-start overflow-hidden pt-1">
                    {dayFormats.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onSelectFormat(f.id)}
                        className="w-full text-left px-1.5 py-1 rounded-[3px] hover:bg-black/[0.05] transition-colors flex items-center gap-1.5 group cursor-pointer"
                        title={`${f.formatName} · ${f.publisher} (${f.dimensions})`}
                      >
                        {/* Apple-style Vertical 3px Colored Bar */}
                        <span
                          className={`w-[3px] h-3.5 rounded-full ${CATEGORIES[f.sectionCategory].calendarBar} shrink-0`}
                        />

                        {/* Format Name */}
                        <span className="text-label font-normal text-black truncate leading-tight group-hover:underline">
                          {f.formatName}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Empty Spacer */}
                  {!hasFormats && <div className="flex-1" />}
                </div>
              );
            })}

          </div>
        ))}

      </div>

      {/* 3. Subtle Footer Note */}
      <div className="flex items-center justify-between text-label text-black/60 pt-1">
        <span>Click a format in the calendar to open its technical specification</span>
        <span className="font-normal text-black">22 deliveries in September</span>
      </div>

    </div>
  );
}
