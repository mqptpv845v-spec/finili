"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CropFrame } from "@/components/CropFrame";
import { 
  Database, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  ArrowRight,
  FileCheck2,
  Printer,
  FileSpreadsheet,
  Network,
  Cpu
} from "lucide-react";

type AnimationScene = 1 | 2 | 3 | 4;

interface TaggedElement {
  id: "X" | "Y" | "W" | "Z";
  label: string;
  desc: string;
  tagColor: string;
  textColor: string;
}

const TAGS: TaggedElement[] = [
  { id: "X", label: "Rubrik X", desc: "Display-rubrik (Instrument Sans)", tagColor: "#FFADEB", textColor: "#520037" },
  { id: "Y", label: "Bild Y", desc: "Halftone Sky bakgrundsbild", tagColor: "#84CCEF", textColor: "#173537" },
  { id: "W", label: "Brödtext W", desc: "Sektions-ingress & kampanjkopia", tagColor: "#95886D", textColor: "#FFFE7D" },
  { id: "Z", label: "Logotyp Z", desc: "Finali varumärkes-vektor", tagColor: "#FFFE7D", textColor: "#191A1C" }
];

// Helper component for Halftone Sky Background
function HalftoneSky({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#84CCEF] via-[#B5E5FB] to-[#F5F5F5] ${className}`}>
      {/* Halftone Dot Matrix Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="halftone-pattern-sky" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="2.8" fill="#173537" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#halftone-pattern-sky)" />
      </svg>
      {/* Soft atmospheric cloud vector curves */}
      <svg className="absolute bottom-0 w-full h-3/4 opacity-35" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path d="M0,180 C120,120 220,240 400,160 L400,300 L0,300 Z" fill="#173537" />
        <path d="M0,210 C150,150 280,260 400,200 L400,300 L0,300 Z" fill="#84CCEF" />
      </svg>
    </div>
  );
}

export function ServiceAnimation() {
  const [currentScene, setCurrentScene] = useState<AnimationScene>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Auto-play timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev === 4 ? 1 : ((prev + 1) as AnimationScene)));
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="w-full bg-[#F5F5F5] text-[#191A1C] p-6 md:p-10 flex flex-col gap-8 select-none border border-[#191A1C]/15">
      
      {/* Header & Controls Bar (Light & Fresh aesthetic) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#191A1C]/10 bg-white p-6 border border-[#191A1C]/10">
        <div>
          <div className="flex items-center gap-2 text-[#173537] text-xs font-medium tracking-normal mb-1">
            <Printer className="w-4 h-4 text-[#173537]" />
            <span className="bg-[#84CCEF]/20 text-[#173537] px-2 py-0.5 font-semibold">
              Printed OOH &amp; Multi-format Automation
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#191A1C]">
            Från taggat InDesign-original till validerat OOH-tryck
          </h3>
        </div>

        {/* Scene Tabs & Play/Pause */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#F5F5F5] p-1 border border-[#191A1C]/15">
            {([1, 2, 3, 4] as AnimationScene[]).map((scene) => {
              const labels = [
                "1. Tagga original", 
                "2. Databas-brygga", 
                "3. Utplacering på format", 
                "4. Tryckklar PDF/X"
              ];
              const isActive = currentScene === scene;
              return (
                <button
                  key={scene}
                  onClick={() => {
                    setCurrentScene(scene);
                    setIsPlaying(false);
                  }}
                  className={`px-3 py-2 text-xs font-medium tracking-normal transition-all duration-300 ${
                    isActive
                      ? "bg-[#173537] text-[#84CCEF]"
                      : "text-[#191A1C]/70 hover:text-[#191A1C] hover:bg-[#191A1C]/5"
                  }`}
                >
                  {labels[scene - 1]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-[#191A1C] text-[#F5F5F5] text-xs font-medium tracking-normal hover:rounded-[20px] transition-all duration-300 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pausa</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Spela</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setCurrentScene(1);
              setIsPlaying(true);
            }}
            className="p-2 border border-[#191A1C] text-[#191A1C] text-xs hover:bg-[#191A1C]/5 transition-all cursor-pointer"
            title="Starta om"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* STAGE CONTAINER (Light, Fresh, Crisp White Canvas) */}
      <div className="bg-white p-6 md:p-8 border border-[#191A1C]/10 min-h-[560px] flex flex-col justify-between">
        
        {/* SCEN 1: Orginalverk till vänster + Taggad poster till höger */}
        {currentScene === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch"
          >
            {/* VÄNSTER: RIKTIG POSTER (Orginalverk i Finali Brand Identity) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#173537]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#173537]" />
                  <span>InDesign Master Orginalverk (.indd)</span>
                </div>
                <span className="font-mono text-[10px] bg-[#95886D]/20 text-[#173537] px-2 py-0.5">
                  1185 × 1750 mm Eurosize
                </span>
              </div>

              <CropFrame markColor="#191A1C" gap={8} className="w-full h-full">
                <div className="w-full aspect-[1185/1750] bg-white p-6 md:p-8 flex flex-col justify-between border border-[#191A1C]/20 relative overflow-hidden group">
                  
                  {/* Background Halftone Sky */}
                  <div className="absolute inset-0 pointer-events-none">
                    <HalftoneSky />
                  </div>

                  {/* Top Content Layer */}
                  <div className="relative z-10 flex flex-col gap-4">
                    {/* Rubrik i Instrument Sans (Inga versaler) */}
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#191A1C] leading-[1.05]">
                      Automate your print &amp;<br />
                      multi-format production.
                    </h2>
                    
                    {/* Subheading / Ingress (hero-inspiration) */}
                    <p className="text-sm md:text-base font-normal text-[#191A1C]/85 max-w-md leading-relaxed">
                      Connect InDesign templates with your media plans. Generate dozens of print-ready, fully validated PDF/X files in seconds.
                    </p>
                  </div>

                  {/* Footer Layer on Poster */}
                  <div className="relative z-10 flex items-end justify-between pt-8 border-t border-[#191A1C]/20">
                    <div className="text-[10px] font-mono text-[#191A1C]/70">
                      Print Spec: Bonnier / Clear Channel OOH<br />
                      ISOnewspaper26v4 • 240% Max Ink
                    </div>

                    {/* Finali Logotyp i Nedre Högra Hörnet */}
                    <div className="bg-[#FFFE7D] p-2 border border-[#191A1C]">
                      <Image
                        src="/logotype.svg"
                        alt="Finali"
                        width={70}
                        height={26}
                        className="h-6 w-auto"
                      />
                    </div>
                  </div>

                </div>
              </CropFrame>
            </div>

            {/* HÖGER: TAGGAD POSTER (Identifierade InDesign-ramar [X], [Y], [W], [Z]) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#520037]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#520037]" />
                  <span>Automatisk Schema-taggning (InDesign-ramar)</span>
                </div>
                <span className="font-mono text-[10px] bg-[#FFADEB] text-[#520037] px-2 py-0.5 font-bold">
                  SCHEMA MATCHED
                </span>
              </div>

              <CropFrame markColor="#520037" gap={8} className="w-full h-full">
                <div className="w-full aspect-[1185/1750] bg-[#F5F5F5] p-6 md:p-8 flex flex-col justify-between border-2 border-[#520037]/40 relative overflow-hidden">
                  
                  {/* Background Sky with Overlay Wireframe */}
                  <div className="absolute inset-0 pointer-events-none opacity-40">
                    <HalftoneSky />
                  </div>

                  {/* Top Content Layer with Schema Tags */}
                  <div className="relative z-10 flex flex-col gap-4">
                    
                    {/* Tagged Rubrik [X] */}
                    <motion.div
                      onMouseEnter={() => setActiveTag("X")}
                      onMouseLeave={() => setActiveTag(null)}
                      animate={{
                        borderColor: activeTag === "X" ? "#173537" : "#FFADEB",
                        backgroundColor: activeTag === "X" ? "#FFFE7D" : "#FFADEB",
                      }}
                      className="p-3 border-2 border-[#FFADEB] bg-[#FFADEB]/90 text-[#520037] transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span>Rubrik i Instrument Sans</span>
                        <span className="font-mono bg-[#520037] text-[#FFADEB] px-1.5 py-0.5 text-[10px]">[X]</span>
                      </div>
                      <h4 className="text-xl font-semibold text-[#520037] leading-tight">
                        Automate your print production.
                      </h4>
                    </motion.div>

                    {/* Tagged Image Frame [Y] */}
                    <motion.div
                      onMouseEnter={() => setActiveTag("Y")}
                      onMouseLeave={() => setActiveTag(null)}
                      animate={{
                        borderColor: activeTag === "Y" ? "#173537" : "#84CCEF",
                        backgroundColor: activeTag === "Y" ? "#FFFE7D" : "#84CCEF",
                      }}
                      className="p-3 border-2 border-[#84CCEF] bg-[#84CCEF]/80 text-[#173537] flex flex-col justify-between h-28 relative transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold z-10">
                        <span>Halftone Sky Bakgrundsbild</span>
                        <span className="font-mono bg-[#173537] text-[#84CCEF] px-1.5 py-0.5 text-[10px]">[Y]</span>
                      </div>
                      <div className="text-[10px] font-mono opacity-80 z-10">
                        Smart CMYK vector crop &amp; resolution check (300 DPI)
                      </div>
                    </motion.div>

                    {/* Tagged Brödtext [W] */}
                    <motion.div
                      onMouseEnter={() => setActiveTag("W")}
                      onMouseLeave={() => setActiveTag(null)}
                      animate={{
                        borderColor: activeTag === "W" ? "#173537" : "#95886D",
                        backgroundColor: activeTag === "W" ? "#FFFE7D" : "#95886D",
                      }}
                      className="p-3 border-2 border-[#95886D] bg-[#95886D]/90 text-[#FFFE7D] transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span>Ingress &amp; Kampanjkopia</span>
                        <span className="font-mono bg-[#FFFE7D] text-[#191A1C] px-1.5 py-0.5 text-[10px]">[W]</span>
                      </div>
                      <p className="text-xs font-normal leading-relaxed opacity-95">
                        Connect InDesign templates with your media plans...
                      </p>
                    </motion.div>

                  </div>

                  {/* Tagged Logotyp [Z] Footer */}
                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#191A1C]/20">
                    <span className="text-[10px] font-mono text-[#191A1C]/60">
                      Ramar kopplade till mediaplan (Excel)
                    </span>

                    <motion.div
                      onMouseEnter={() => setActiveTag("Z")}
                      onMouseLeave={() => setActiveTag(null)}
                      animate={{
                        borderColor: activeTag === "Z" ? "#173537" : "#FFFE7D",
                        backgroundColor: activeTag === "Z" ? "#FFADEB" : "#FFFE7D",
                      }}
                      className="p-2 border-2 border-[#FFFE7D] bg-[#FFFE7D] flex items-center gap-2 cursor-pointer"
                    >
                      <Image
                        src="/logotype.svg"
                        alt="Finali"
                        width={60}
                        height={22}
                        className="h-5 w-auto"
                      />
                      <span className="font-mono bg-[#191A1C] text-[#FFFE7D] px-1.5 py-0.5 text-[10px] font-bold">[Z]</span>
                    </motion.div>
                  </div>

                </div>
              </CropFrame>
            </div>
          </motion.div>
        )}

        {/* SCEN 2: VISUELL BRYGGA MELLAN TAGGAD POSTER & DATABAS */}
        {currentScene === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4"
          >
            {/* VÄNSTER: TAGGADE ELEMENT [X, Y, W, Z] */}
            <div className="lg:col-span-4 bg-[#FAF9F6] p-5 border border-[#191A1C]/15 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#191A1C]/10 text-xs font-bold text-[#520037]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Taggat Originalverk</span>
                </div>
                <span className="font-mono text-[10px] bg-[#FFADEB] text-[#520037] px-1.5 py-0.5">.INDD</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="p-2.5 bg-[#FFADEB] text-[#520037] text-xs font-bold flex justify-between items-center border border-[#520037]/20">
                  <span>Rubrik [X] (Instrument Sans)</span>
                  <span className="font-mono text-[10px] bg-[#520037] text-[#FFADEB] px-1.5 py-0.5">[X]</span>
                </div>
                <div className="p-2.5 bg-[#84CCEF] text-[#173537] text-xs font-bold flex justify-between items-center border border-[#173537]/20">
                  <span>Bakgrundsbild [Y] (Halftone Sky)</span>
                  <span className="font-mono text-[10px] bg-[#173537] text-[#84CCEF] px-1.5 py-0.5">[Y]</span>
                </div>
                <div className="p-2.5 bg-[#95886D] text-[#FFFE7D] text-xs font-bold flex justify-between items-center border border-[#95886D]/20">
                  <span>Brödtext [W] (Ingress)</span>
                  <span className="font-mono text-[10px] bg-[#FFFE7D] text-[#191A1C] px-1.5 py-0.5">[W]</span>
                </div>
                <div className="p-2.5 bg-[#FFFE7D] text-[#191A1C] text-xs font-bold flex justify-between items-center border border-[#191A1C]/20">
                  <span>Logotyp [Z] (Finali Vector)</span>
                  <span className="font-mono text-[10px] bg-[#191A1C] text-[#FFFE7D] px-1.5 py-0.5">[Z]</span>
                </div>
              </div>
            </div>

            {/* MITTEN: ANIMERAD DATABAS-BRYGGA (BRIDGE) */}
            <div className="lg:col-span-4 bg-[#173537] text-[#84CCEF] p-6 border-2 border-[#84CCEF] flex flex-col gap-4 relative overflow-hidden">
              
              {/* Pulsing data streams overlay */}
              <div className="flex items-center justify-between pb-3 border-b border-[#84CCEF]/20 relative z-10">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#84CCEF] animate-pulse" />
                  <h4 className="text-sm font-bold text-white">Finali Spec-databashub</h4>
                </div>
                <span className="text-[10px] font-mono bg-[#84CCEF] text-[#173537] px-2 py-0.5 font-bold">
                  BRYGGA AKTIV
                </span>
              </div>

              <p className="text-xs text-[#84CCEF]/90 leading-relaxed relative z-10">
                Hämtar exakta tryckmått, utfall och färgbegränsningar för varje publicist i realtid för att säkerställa 100% pre-flight compliance.
              </p>

              {/* Real-time Query Rows */}
              <div className="flex flex-col gap-2 text-xs font-mono relative z-10">
                <div className="p-2.5 bg-[#84CCEF]/10 border border-[#84CCEF]/30 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold text-[11px]">Eurosize / Abribus</div>
                    <div className="text-[10px] text-[#84CCEF]/80">Clear Channel • JCDecaux</div>
                  </div>
                  <span className="text-[10px] text-green-300 font-bold">1185 × 1750 mm</span>
                </div>

                <div className="p-2.5 bg-[#84CCEF]/10 border border-[#84CCEF]/30 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold text-[11px]">Billboard Stortavla</div>
                    <div className="text-[10px] text-[#84CCEF]/80">Bonnier • SDR Print</div>
                  </div>
                  <span className="text-[10px] text-green-300 font-bold">7000 × 3000 mm</span>
                </div>

                <div className="p-2.5 bg-[#84CCEF]/10 border border-[#84CCEF]/30 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold text-[11px]">Färg &amp; Bläck-limit</div>
                    <div className="text-[10px] text-[#84CCEF]/80">ISOnewspaper26v4</div>
                  </div>
                  <span className="text-[10px] text-[#FFFE7D] font-bold">Max 240% CMYK</span>
                </div>
              </div>

            </div>

            {/* HÖGER: MÅLFORMATS-DATA */}
            <div className="lg:col-span-4 bg-[#FAF9F6] p-5 border border-[#191A1C]/15 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#191A1C]/10 text-xs font-bold text-[#173537]">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  <span>Säkrade Målformat</span>
                </div>
                <span className="font-mono text-[10px] bg-[#84CCEF] text-[#173537] px-1.5 py-0.5 font-bold">VALIDATED</span>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 bg-white border border-[#191A1C]/15 flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#173537]">
                    <span>Eurosize Stående</span>
                    <span className="text-green-700">✓ Matchad</span>
                  </div>
                  <p className="text-[11px] text-gray-600">Ramar [X, Y, W, Z] placeras om i stående 1185×1750 mm raster.</p>
                </div>

                <div className="p-3 bg-white border border-[#191A1C]/15 flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#520037]">
                    <span>Billboard Liggande</span>
                    <span className="text-green-700">✓ Matchad</span>
                  </div>
                  <p className="text-[11px] text-gray-600">Ramar [X, Y, W, Z] placeras om i liggande 7000×3000 mm spalter.</p>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* SCEN 3: BRYGGA I ACTION – UTLACERING PÅ EUROSIZE & BILLBOARD */}
        {currentScene === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
          >
            {/* OOH FORMAT 1: Eurosize Stående (1185 × 1750 mm) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#173537]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Eurosize / Abribus Stående</span>
                </div>
                <span className="font-mono text-[10px] bg-[#84CCEF] text-[#173537] px-2 py-0.5 font-bold">
                  SPEC: 1185 × 1750 mm OK
                </span>
              </div>

              <CropFrame markColor="#173537" gap={6} className="w-full h-full">
                <div className="w-full aspect-[1185/1750] bg-white p-5 flex flex-col justify-between border border-[#173537]/30 relative overflow-hidden">
                  
                  {/* Sky background */}
                  <div className="absolute inset-0 pointer-events-none">
                    <HalftoneSky />
                  </div>

                  {/* Reflowed & Placed Elements */}
                  <div className="relative z-10 flex flex-col gap-3">
                    {/* Element X (Rubrik) */}
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 120, damping: 16 }}
                      className="p-3 bg-[#FFADEB] text-[#520037] border-2 border-[#FFADEB] text-xs font-bold shadow-sm"
                    >
                      <div className="flex justify-between text-[10px] mb-1">
                        <span>Utplacerad Rubrik [X]</span>
                        <span className="font-mono text-[9px] bg-[#520037] text-[#FFADEB] px-1 py-0.2">[X]</span>
                      </div>
                      <h4 className="text-base font-semibold leading-tight">Automate your print production.</h4>
                    </motion.div>

                    {/* Element Y (Bakgrundsbild) */}
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 120, damping: 16 }}
                      className="p-3 bg-[#84CCEF]/90 text-[#173537] border-2 border-[#84CCEF] h-32 flex flex-col justify-between text-xs font-bold"
                    >
                      <div className="flex justify-between text-[10px]">
                        <span>Utplacerad Bakgrundsbild [Y]</span>
                        <span className="font-mono text-[9px] bg-[#173537] text-[#84CCEF] px-1 py-0.2">[Y]</span>
                      </div>
                      <span className="text-[9px] font-mono opacity-80">Placerad &amp; beskuren för 1185×1750 mm</span>
                    </motion.div>

                    {/* Element W (Brödtext) */}
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 120, damping: 16 }}
                      className="p-2.5 bg-[#95886D] text-[#FFFE7D] border-2 border-[#95886D] text-xs font-medium"
                    >
                      <div className="flex justify-between text-[10px] mb-0.5 font-bold">
                        <span>Utplacerad Brödtext [W]</span>
                        <span className="font-mono text-[9px] bg-[#FFFE7D] text-[#191A1C] px-1 py-0.2">[W]</span>
                      </div>
                      <p className="text-[11px] leading-tight">Connect InDesign templates with your media plans...</p>
                    </motion.div>
                  </div>

                  {/* Element Z (Logotyp) */}
                  <div className="relative z-10 flex justify-between items-center pt-3 border-t border-[#191A1C]/20">
                    <span className="text-[9px] font-mono text-[#173537] font-bold bg-[#84CCEF]/30 px-2 py-0.5">
                      ✓ Spec: Clear Channel OK
                    </span>

                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 120, damping: 16 }}
                      className="bg-[#FFFE7D] p-1.5 border-2 border-[#191A1C] flex items-center gap-2"
                    >
                      <Image src="/logotype.svg" alt="Finali" width={55} height={20} className="h-4 w-auto" />
                      <span className="text-[9px] font-mono font-bold bg-[#191A1C] text-[#FFFE7D] px-1">[Z]</span>
                    </motion.div>
                  </div>

                </div>
              </CropFrame>
            </div>

            {/* OOH FORMAT 2: Billboard Liggande (7000 × 3000 mm) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#520037]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Billboard Liggande</span>
                </div>
                <span className="font-mono text-[10px] bg-[#FFADEB] text-[#520037] px-2 py-0.5 font-bold">
                  SPEC: 7000 × 3000 mm OK
                </span>
              </div>

              <CropFrame markColor="#520037" gap={6} className="w-full h-full">
                <div className="w-full aspect-[7000/3000] bg-white p-5 flex flex-col justify-between border border-[#520037]/30 relative overflow-hidden">
                  
                  {/* Sky background */}
                  <div className="absolute inset-0 pointer-events-none">
                    <HalftoneSky />
                  </div>

                  {/* Horizontal reflow layout */}
                  <div className="relative z-10 grid grid-cols-12 gap-3 h-full items-stretch">
                    
                    {/* Left Column: Bild Y */}
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 120, damping: 16 }}
                      className="col-span-5 p-2.5 bg-[#84CCEF]/90 text-[#173537] border-2 border-[#84CCEF] flex flex-col justify-between text-xs font-bold"
                    >
                      <div className="flex justify-between text-[9px]">
                        <span>Bild [Y]</span>
                        <span className="font-mono bg-[#173537] text-[#84CCEF] px-1">[Y]</span>
                      </div>
                      <span className="text-[9px] font-mono opacity-80">Panorama beskärning</span>
                    </motion.div>

                    {/* Right Column: Rubrik X + Text W + Logo Z */}
                    <div className="col-span-7 flex flex-col justify-between gap-2">
                      {/* Rubrik X */}
                      <motion.div 
                        layout
                        transition={{ type: "spring", stiffness: 120, damping: 16 }}
                        className="p-2 bg-[#FFADEB] text-[#520037] border-2 border-[#FFADEB] text-xs font-bold"
                      >
                        <div className="flex justify-between text-[9px] mb-0.5">
                          <span>Rubrik [X]</span>
                          <span className="font-mono bg-[#520037] text-[#FFADEB] px-1">[X]</span>
                        </div>
                        <h4 className="text-sm font-semibold leading-tight">Automate your print production.</h4>
                      </motion.div>

                      {/* Text W */}
                      <motion.div 
                        layout
                        transition={{ type: "spring", stiffness: 120, damping: 16 }}
                        className="p-2 bg-[#95886D] text-[#FFFE7D] border-2 border-[#95886D] text-xs font-medium"
                      >
                        <p className="text-[10px] leading-tight">Connect InDesign templates with media plans...</p>
                      </motion.div>

                      {/* Logo Z & Spec Confirmation */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-[#520037] font-bold bg-[#FFADEB]/40 px-1.5 py-0.5">
                          ✓ Spec: Bonnier OK
                        </span>

                        <motion.div 
                          layout
                          transition={{ type: "spring", stiffness: 120, damping: 16 }}
                          className="bg-[#FFFE7D] p-1.5 border-2 border-[#191A1C] flex items-center gap-1.5"
                        >
                          <Image src="/logotype.svg" alt="Finali" width={50} height={18} className="h-4 w-auto" />
                          <span className="text-[9px] font-mono font-bold bg-[#191A1C] text-[#FFFE7D] px-1">[Z]</span>
                        </motion.div>
                      </div>
                    </div>

                  </div>

                </div>
              </CropFrame>
            </div>
          </motion.div>
        )}

        {/* SCEN 4: VALIDERAD PDF/X-4 EXPORT FÖR TRYCK */}
        {currentScene === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-6 text-center"
          >
            <div className="p-5 bg-[#84CCEF]/20 border-2 border-[#173537] rounded-none">
              <FileCheck2 className="w-12 h-12 text-[#173537] mx-auto mb-2" />
              <h4 className="text-2xl font-bold text-[#173537]">100% Pre-flight Godkänd för Tryck</h4>
              <p className="text-sm text-[#173537]/80 max-w-md mt-1 leading-relaxed">
                Alla genererade OOH-filer validerade mot ISOnewspaper26v4, CMYK 240% max bläck och 3mm/5mm utfall utan tryckfel.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              <div className="p-4 bg-white border border-[#191A1C]/20 flex items-center justify-between">
                <div className="text-left">
                  <div className="font-bold text-xs">Eurosize_1185x1750_PRINT.pdf</div>
                  <div className="text-[10px] font-mono text-gray-500">PDF/X-4 • 300 DPI CMYK • 3mm Bleed</div>
                </div>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OK
                </span>
              </div>

              <div className="p-4 bg-white border border-[#191A1C]/20 flex items-center justify-between">
                <div className="text-left">
                  <div className="font-bold text-xs">Billboard_7000x3000_PRINT.pdf</div>
                  <div className="text-[10px] font-mono text-gray-500">PDF/X-4 • 300 DPI CMYK • 5mm Bleed</div>
                </div>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OK
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Legend / Element Tag Guide */}
        <div className="mt-6 pt-4 border-t border-[#191A1C]/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[#191A1C]/70">InDesign Element-ID:</span>
            {TAGS.map((tag) => (
              <button
                key={tag.id}
                onMouseEnter={() => setActiveTag(tag.id)}
                onMouseLeave={() => setActiveTag(null)}
                className={`px-3 py-1 text-[11px] font-medium transition-all border ${
                  activeTag === tag.id
                    ? "bg-[#173537] text-[#84CCEF] border-[#173537]"
                    : "bg-white text-[#191A1C] border-[#191A1C]/20 hover:border-[#191A1C]/60"
                }`}
              >
                <span className="font-mono font-bold mr-1.5">[{tag.id}]</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#191A1C]/60">
            Klicka på scen-knapparna i toppen för manuell stegvisning
          </div>
        </div>

      </div>

    </div>
  );
}
