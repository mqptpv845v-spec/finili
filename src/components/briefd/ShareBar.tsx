"use client";

import React, { useState } from "react";
import { Link2, Check, Download, ExternalLink } from "lucide-react";

interface ShareBarProps {
  campaignSlug?: string;
  onOpenFinaliModal: () => void;
}

export function ShareBar({ 
  campaignSlug = "autumn-launch-2026", 
  onOpenFinaliModal 
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `briefd.app/p/${campaignSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#191A1C] text-white px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      {/* Left: Live Share URL indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-white/70">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[0.75rem] uppercase tracking-wider text-white/50">Live link</span>
        </div>
        <div className="flex items-center bg-white/10 px-3 py-1.5 border border-white/15 font-mono text-[0.8rem] text-white">
          <Link2 className="w-3.5 h-3.5 text-white/60 mr-2 shrink-0" />
          <span className="select-all">{shareUrl}</span>
        </div>
        <button
          onClick={handleCopyLink}
          className="px-3 py-1.5 bg-white text-[#191A1C] font-semibold text-[0.75rem] hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied</span>
            </>
          ) : (
            <span>Copy link</span>
          )}
        </button>
      </div>

      {/* Right: Actions (Export PDF + Bridge to Automated Production) */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.print()}
          className="text-white/80 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white/40 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
        
        <button
          onClick={onOpenFinaliModal}
          className="bg-[#FFADEB] text-[#520037] px-3.5 py-1.5 font-bold hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Automate final art</span>
        </button>
      </div>
    </div>
  );
}
