"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FormatData } from "@/lib/briefd/types";
import { buildCalendarMonth, formatsByDeadline, initialCalendarMonth, moveMonth } from "@/lib/briefd/calendar";
import { formatDimensions } from "@/lib/briefd/format";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/briefd/categories";

interface BriefdCalendarViewProps {
  formats: FormatData[];
  onSelectFormat: (formatId: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
}

export function BriefdCalendarView({ formats, onSelectFormat }: BriefdCalendarViewProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => initialCalendarMonth(formats));
  const weeks = useMemo(() => buildCalendarMonth(visibleMonth), [visibleMonth]);
  const grouped = useMemo(() => formatsByDeadline(formats), [formats]);
  const datedCount = formats.filter((format) => format.deadline).length;
  const unscheduledCount = formats.length - datedCount;

  return (
    <div className="w-full bg-white flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-title font-bold tracking-tight">{monthLabel(visibleMonth)}</h2>
          <div className="flex items-center gap-1" aria-label="Calendar navigation">
            <button type="button" onClick={() => setVisibleMonth((month) => moveMonth(month, -1))} className="p-2 hover:bg-black/5 focus-visible:outline" aria-label="Previous month">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setVisibleMonth(new Date().toISOString().slice(0, 7))} className="px-2.5 py-1 text-label font-bold bg-black/5 focus-visible:outline">
              Today
            </button>
            <button type="button" onClick={() => setVisibleMonth((month) => moveMonth(month, 1))} className="p-2 hover:bg-black/5 focus-visible:outline" aria-label="Next month">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-label text-black/60" aria-label="Format categories">
          {CATEGORY_ORDER.map((category) => (
            <span key={category} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${CATEGORIES[category].dot}`} />
              {CATEGORIES[category].shortLabel}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto" tabIndex={0} aria-label={`${monthLabel(visibleMonth)} delivery calendar`}>
        <div className="min-w-[820px] border-t border-l border-black/[0.08]">
          <div className="grid grid-cols-[34px_repeat(7,1fr)] border-b border-black/[0.08] text-label text-black/60">
            <div />
            {WEEKDAYS.map((day) => <div key={day} className="py-2.5 px-3 text-right border-r border-black/[0.08]">{day}</div>)}
          </div>
          {weeks.map((week) => (
            <div key={`${visibleMonth}-${week.weekNumber}`} className="grid grid-cols-[34px_repeat(7,1fr)] border-b border-black/[0.08] min-h-[130px]">
              <div className="text-label text-black/60 pt-3 text-center border-r border-black/[0.08]">{week.weekNumber}</div>
              {week.days.map((day, index) => {
                const dayFormats = grouped.get(day.isoDate) ?? [];
                return (
                  <div key={day.isoDate} className={`p-2 border-r border-black/[0.08] ${day.isCurrentMonth ? (index >= 5 ? "bg-black/[0.008]" : "bg-white") : "bg-black/[0.025]"}`}>
                    <time dateTime={day.isoDate} className={`block text-right text-label ${day.isCurrentMonth ? "text-black" : "text-black/40"}`}>{day.dayNumber}</time>
                    <div className="flex flex-col gap-1 mt-2">
                      {dayFormats.map((format) => (
                        <button key={format.id} type="button" onClick={() => onSelectFormat(format.id)} className="w-full text-left px-1.5 py-1 hover:bg-black/5 flex items-center gap-1.5 focus-visible:outline" title={`${format.formatName} · ${format.publisher} (${formatDimensions(format.dimensions)})`}>
                          <span className={`w-[3px] h-3.5 rounded-full ${CATEGORIES[format.sectionCategory].calendarBar} shrink-0`} />
                          <span className="text-label truncate hover:underline">{format.formatName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-label text-black/60">
        <span>Select a delivery to open its technical specification.</span>
        <span>{datedCount} scheduled{unscheduledCount > 0 ? ` · ${unscheduledCount} without a deadline` : ""}</span>
      </div>
    </div>
  );
}
