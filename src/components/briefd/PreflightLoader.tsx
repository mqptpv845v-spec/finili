"use client";

import { useEffect, useRef } from "react";

interface PreflightLoaderProps {
  onComplete: () => void;
  complete?: boolean;
  label?: string;
}

const CMYK_COLUMNS = [
  { key: "C", bgClass: "bg-petrol", fillClass: "bg-cyan", heightClass: "h-1/3" },
  { key: "M", bgClass: "bg-plum", fillClass: "bg-magenta", heightClass: "h-1/2" },
  { key: "Y", bgClass: "bg-taupe", fillClass: "bg-yellow", heightClass: "h-2/3" },
  { key: "K", bgClass: "bg-graphite", fillClass: "bg-white", heightClass: "h-1/2" }
];

export function PreflightLoader({
  onComplete,
  complete = false,
  label = "Reading workbook"
}: PreflightLoaderProps) {
  const completionReported = useRef(false);

  useEffect(() => {
    if (!complete) {
      completionReported.current = false;
      return;
    }

    if (!completionReported.current) {
      completionReported.current = true;
      onComplete();
    }
  }, [complete, onComplete]);

  return (
    <div
      className="w-full max-w-lg mx-auto bg-transparent p-6 sm:p-10 flex flex-col items-center justify-center text-center gap-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-title font-bold text-black tracking-tight leading-tight">
          {complete ? "Workbook ready" : label}
        </h2>
        <p className="text-value text-black/60">
          {complete ? "The imported rows are ready for review." : "Large workbooks can take a moment. No changes are made while the file is being read."}
        </p>
      </div>

      <div className="flex items-end justify-center gap-3 sm:gap-4 my-2" aria-hidden="true">
        {CMYK_COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`w-12 sm:w-14 h-36 sm:h-44 overflow-hidden relative flex flex-col justify-end ${col.bgClass}`}
          >
            <div
              className={`w-full ${col.heightClass} ${col.fillClass}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
