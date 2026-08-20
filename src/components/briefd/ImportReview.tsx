"use client";

import { useState } from "react";
import type { MediaPlanColumnMapping, MediaPlanField, ParsedMediaPlan } from "@/lib/jobOrchestrator";
import { mediaSpecs } from "@/lib/briefd/brain";
import type { FormatData, SectionCategory } from "@/lib/briefd/types";
import type { UnmatchedRow } from "@/lib/briefd/mapJobs";
import { resolveManually, resolveWithSpec } from "@/lib/briefd/corrections";
import { CATEGORY_ORDER, CATEGORY_TAGS } from "@/lib/briefd/categories";
import { Button } from "@/components/atoms/Button";

const FIELDS: { key: MediaPlanField; label: string; required?: boolean }[] = [
  { key: "campaign", label: "Campaign" }, { key: "publisher", label: "Publisher", required: true },
  { key: "format", label: "Format", required: true }, { key: "deadline", label: "Deadline" }, { key: "notes", label: "Notes" },
];

interface Props {
  plan: ParsedMediaPlan;
  matched: FormatData[];
  unmatched: UnmatchedRow[];
  onReparse: (settings: { sheetName: string; headerRow: number; mapping: MediaPlanColumnMapping }) => Promise<void>;
  onResolve: (format: FormatData) => void;
  onContinue: () => void;
  busy?: boolean;
  error?: string | null;
}

function ResolutionForm({ row, onResolve }: { row: UnmatchedRow; onResolve: (format: FormatData) => void }) {
  const [mode, setMode] = useState<"spec" | "manual">("spec");
  const [specId, setSpecId] = useState(mediaSpecs[0]?.id ?? "");
  const [publisher, setPublisher] = useState(row.publisher);
  const [name, setName] = useState(row.format);
  const [width, setWidth] = useState(""); const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<"px" | "mm">("px");
  const [deadline, setDeadline] = useState(row.deadline ?? "");
  const [category, setCategory] = useState<SectionCategory>("Digital Display & High-Impact");
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    try {
      onResolve(mode === "spec" ? resolveWithSpec(row, specId) : resolveManually(row, {
        publisher, formatName: name, width: Number(width), height: Number(height), unit,
        deadline: deadline || null, sectionCategory: category, categoryTag: CATEGORY_TAGS[category],
      }));
      setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not resolve this row."); }
  };
  return <div className="mt-4 grid gap-3">
    <label className="text-label font-bold">Resolution type<select value={mode} onChange={(e) => setMode(e.target.value as "spec" | "manual")} className="mt-1 block w-full border border-black/15 p-2 bg-white"><option value="spec">Assign a verified Brain spec</option><option value="manual">Enter campaign-specific values</option></select></label>
    {mode === "spec" ? <label className="text-label font-bold">Verified specification<select value={specId} onChange={(e) => setSpecId(e.target.value)} className="mt-1 block w-full border border-black/15 p-2 bg-white">{mediaSpecs.map((spec) => <option key={spec.id} value={spec.id}>{spec.publisher} — {spec.name}</option>)}</select></label> : <div className="grid sm:grid-cols-2 gap-3">
      <label className="text-label font-bold">Publisher<input value={publisher} onChange={(e) => setPublisher(e.target.value)} className="mt-1 block w-full border border-black/15 p-2" /></label>
      <label className="text-label font-bold">Format<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-black/15 p-2" /></label>
      <label className="text-label font-bold">Width<input type="number" min="0.01" step="any" value={width} onChange={(e) => setWidth(e.target.value)} className="mt-1 block w-full border border-black/15 p-2" /></label>
      <label className="text-label font-bold">Height<input type="number" min="0.01" step="any" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 block w-full border border-black/15 p-2" /></label>
      <label className="text-label font-bold">Unit<select value={unit} onChange={(e) => setUnit(e.target.value as "px" | "mm")} className="mt-1 block w-full border border-black/15 p-2 bg-white"><option value="px">px</option><option value="mm">mm</option></select></label>
      <label className="text-label font-bold">Deadline<input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 block w-full border border-black/15 p-2" /></label>
      <label className="text-label font-bold sm:col-span-2">Category<select value={category} onChange={(e) => setCategory(e.target.value as SectionCategory)} className="mt-1 block w-full border border-black/15 p-2 bg-white">{CATEGORY_ORDER.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>}
    {error && <p className="text-label font-bold text-plum" role="alert">{error}</p>}
    <Button size="sm" onClick={submit} className="justify-self-start">Resolve row</Button>
  </div>;
}

export function ImportReview({ plan, matched, unmatched, onReparse, onResolve, onContinue, busy, error }: Props) {
  const [sheetName, setSheetName] = useState(plan.sheetName);
  const [headerRow, setHeaderRow] = useState(String(plan.headerRow));
  const [mapping, setMapping] = useState<MediaPlanColumnMapping>(plan.mapping);
  const setColumn = (field: MediaPlanField, value: string) => setMapping((current) => ({ ...current, [field]: value ? Number(value) : undefined }));
  return <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
    <div><p className="text-label font-bold text-petrol">Import review</p><h1 className="text-section font-bold tracking-tight">Confirm what Briefd found</h1><p className="text-value text-black/60 mt-2">Review the workbook interpretation and resolve every unmatched row before opening the campaign.</p></div>
    <section className="bg-light p-6 sm:p-8 grid gap-5"><h2 className="text-title font-bold">Workbook structure</h2><div className="grid sm:grid-cols-2 gap-4"><label className="text-label font-bold">Sheet<select value={sheetName} onChange={(e) => setSheetName(e.target.value)} className="mt-1 block w-full border border-black/15 p-2 bg-white">{plan.availableSheets.map((sheet) => <option key={sheet}>{sheet}</option>)}</select></label><label className="text-label font-bold">Header row<input type="number" min="1" value={headerRow} onChange={(e) => setHeaderRow(e.target.value)} className="mt-1 block w-full border border-black/15 p-2 bg-white" /></label></div><div className="grid sm:grid-cols-3 gap-4">{FIELDS.map((field) => <label key={field.key} className="text-label font-bold">{field.label}{field.required ? " *" : ""}<select value={mapping[field.key] ?? ""} onChange={(e) => setColumn(field.key, e.target.value)} className="mt-1 block w-full border border-black/15 p-2 bg-white"><option value="">Not mapped</option>{plan.columns.map((column) => <option key={column.index} value={column.index}>{column.label} (column {column.index})</option>)}</select></label>)}</div>{error && <p className="text-label font-bold text-plum" role="alert">{error}</p>}<Button variant="soft" size="sm" disabled={busy || !mapping.publisher || !mapping.format} onClick={() => onReparse({ sheetName, headerRow: Number(headerRow), mapping })} className="justify-self-start">{busy ? "Applying…" : "Apply mapping"}</Button></section>
    <section className="grid gap-4"><div className="flex items-baseline justify-between gap-4"><h2 className="text-title font-bold">Row worklist</h2><span className="text-label text-black/60">{matched.length} resolved · {unmatched.length} unresolved</span></div>{unmatched.map((row) => <article key={row.id} className="border border-black/10 p-5"><p className="text-label text-black/60">{row.source.sheetName}, row {row.source.rowNumber}</p><h3 className="text-value font-bold mt-1">{row.publisher || "Missing publisher"} — {row.format || "Missing format"}</h3><p className="text-label text-plum mt-1">{row.error}</p><ResolutionForm row={row} onResolve={onResolve} /></article>)}{unmatched.length === 0 && <div className="bg-cyan/20 p-5 text-value font-semibold">Every imported row has a specification.</div>}</section>
    <div className="flex items-center justify-between gap-4"><p className="text-label text-black/60">Verified assignments cite the Brain source. Manual values remain visibly user-provided.</p><Button disabled={unmatched.length > 0 || matched.length === 0} onClick={onContinue}>Open campaign</Button></div>
  </div>;
}
