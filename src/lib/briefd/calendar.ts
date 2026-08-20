import type { FormatData } from "./types";

export interface CalendarDay {
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export interface CalendarWeek {
  weekNumber: number;
  days: CalendarDay[];
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isoWeekNumber(date: Date): number {
  const target = new Date(date);
  target.setUTCHours(0, 0, 0, 0);
  target.setUTCDate(target.getUTCDate() + 3 - ((target.getUTCDay() + 6) % 7));
  const weekOne = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((target.getTime() - weekOne.getTime()) / 86400000 - 3 + ((weekOne.getUTCDay() + 6) % 7)) / 7);
}

export function monthKey(value: string | null): string | null {
  return value?.match(/^\d{4}-\d{2}/)?.[0] ?? null;
}

export function initialCalendarMonth(formats: FormatData[], today = new Date()): string {
  const dated = formats.map((format) => format.deadline).filter((value): value is string => Boolean(value)).sort();
  return monthKey(dated[0] ?? null) ?? isoDate(today).slice(0, 7);
}

export function moveMonth(value: string, delta: number): string {
  const [year, month] = value.split("-").map(Number);
  return isoDate(new Date(Date.UTC(year, month - 1 + delta, 1))).slice(0, 7);
}

export function buildCalendarMonth(value: string): CalendarWeek[] {
  const [year, month] = value.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setUTCDate(first.getUTCDate() - mondayOffset);
  const sundayOffset = 6 - ((last.getUTCDay() + 6) % 7);
  const gridEnd = new Date(last);
  gridEnd.setUTCDate(last.getUTCDate() + sundayOffset);
  const weeks: CalendarWeek[] = [];
  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(cursor);
      date.setUTCDate(cursor.getUTCDate() + index);
      return {
        isoDate: isoDate(date),
        dayNumber: date.getUTCDate(),
        isCurrentMonth: date.getUTCMonth() === month - 1,
      };
    });
    weeks.push({ weekNumber: isoWeekNumber(cursor), days });
  }
  return weeks;
}

export function formatsByDeadline(formats: FormatData[]): Map<string, FormatData[]> {
  const grouped = new Map<string, FormatData[]>();
  for (const format of formats) {
    if (!format.deadline) continue;
    grouped.set(format.deadline, [...(grouped.get(format.deadline) ?? []), format]);
  }
  return grouped;
}
