"use client";

import { useState, useEffect } from "react";

interface PreflightLoaderProps {
  onComplete: () => void;
}

// CMYK-inspired columns using the tone-on-tone brand pairs:
// dark column base with a light "liquid" wave fill.
const CMYK_COLUMNS = [
  { key: "C", bgClass: "bg-petrol", fillClass: "bg-cyan", phaseOffset: 0 },
  { key: "M", bgClass: "bg-plum", fillClass: "bg-magenta", phaseOffset: Math.PI / 2 },
  { key: "Y", bgClass: "bg-taupe", fillClass: "bg-yellow", phaseOffset: Math.PI },
  { key: "K", bgClass: "bg-graphite", fillClass: "bg-white", phaseOffset: (3 * Math.PI) / 2 }
];

export function PreflightLoader({ onComplete }: PreflightLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [waveTime, setWaveTime] = useState(0);

  useEffect(() => {
    // Slower, smoother wave animation tick
    const waveInterval = setInterval(() => {
      setWaveTime((prev) => prev + 0.05);
    }, 25);

    // Slower progress counter (0 -> 100% over ~4.8 seconds)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 48);

    return () => {
      clearInterval(waveInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="w-full max-w-lg mx-auto bg-transparent p-6 sm:p-10 flex flex-col items-center justify-center text-center gap-8">

      {/* 1. Heading with % */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-title font-bold text-black tracking-tight leading-tight">
          Parsing media plan: Bevero Black Friday 2026
        </h2>
        <span className="text-value font-bold text-black/70">
          {progress}%
        </span>
      </div>

      {/* 2. Four columns: dark base with a light wave inside (no borders) */}
      <div className="flex items-end justify-center gap-3 sm:gap-4 my-2">
        {CMYK_COLUMNS.map((col) => {
          // Dynamic wave height
          const waveHeight = progress >= 98
            ? 100
            : 30 + Math.sin(waveTime + col.phaseOffset) * 22 + (progress * 0.45);

          const clampedHeight = Math.min(100, Math.max(15, waveHeight));

          return (
            <div
              key={col.key}
              className={`w-12 sm:w-14 h-36 sm:h-44 overflow-hidden relative flex flex-col justify-end ${col.bgClass}`}
            >
              {/* Light liquid forming the wave */}
              <div
                className={`w-full transition-all duration-100 ease-out ${col.fillClass}`}
                style={{ height: `${clampedHeight}%` }}
              />
            </div>
          );
        })}
      </div>

    </div>
  );
}
