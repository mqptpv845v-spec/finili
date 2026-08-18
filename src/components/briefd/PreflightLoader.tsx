"use client";

import React, { useState, useEffect } from "react";

interface PreflightLoaderProps {
  onComplete: () => void;
}

const CMYK_COLUMNS = [
  {
    key: "C",
    bgDark: "#173537",    // Mörk petroleum
    fillLight: "#84CCEF", // Ljusblå / Cyan
    phaseOffset: 0
  },
  {
    key: "M",
    bgDark: "#520037",    // Djup plommon
    fillLight: "#FFADEB", // Rosa / Magenta
    phaseOffset: Math.PI / 2
  },
  {
    key: "Y",
    bgDark: "#7C705A",    // Mörk taupe
    fillLight: "#FFFFA8", // Ljusgul
    phaseOffset: Math.PI
  },
  {
    key: "K",
    bgDark: "#191A1C",    // Djup grafit
    fillLight: "#FFFFFF", // Vit
    phaseOffset: (3 * Math.PI) / 2
  }
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
      
      {/* 1. Rubrik med % */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-[30px] font-bold text-black tracking-tight leading-tight">
          Parsing media plan: Bevero Black Friday 2026
        </h2>
        <span className="text-[18px] font-bold text-black/70">
          {progress}%
        </span>
      </div>

      {/* 2. 4 Pelare: Mörk botten med ljus våg inuti (Inga borders) */}
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
              className="w-12 sm:w-14 h-36 sm:h-44 overflow-hidden relative flex flex-col justify-end"
              style={{ backgroundColor: col.bgDark }}
            >
              {/* Ljus vätska som gör vågen */}
              <div
                className="w-full transition-all duration-100 ease-out"
                style={{
                  height: `${clampedHeight}%`,
                  backgroundColor: col.fillLight
                }}
              />
            </div>
          );
        })}
      </div>

    </div>
  );
}
