"use client";

import React, { useState } from "react";
import { X, Copy, Check, Link as LinkIcon, ShieldCheck, Users, Globe } from "lucide-react";

interface ShareLiveBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  formatCount: number;
}

export function ShareLiveBriefModal({
  isOpen,
  onClose,
  clientName,
  formatCount
}: ShareLiveBriefModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/briefd?campaign=bevero-bf2026` 
    : "https://briefd.finali.se/briefd?campaign=bevero-bf2026";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white border border-black/[0.08] shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-black/40 hover:text-black transition-colors cursor-pointer"
          title="Stäng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Header */}
        <div className="flex flex-col gap-1.5 pr-8">
          <div className="flex items-center gap-2 text-[11px] font-bold text-black/60">
            <Globe className="w-3.5 h-3.5" />
            <span>Zero-login live share</span>
          </div>
          
          <h3 className="text-[26px] font-bold text-black tracking-tight leading-tight">
            Share live brief for {clientName}
          </h3>
          
          <p className="text-[13px] text-black/60 leading-relaxed mt-0.5">
            No accounts, passwords, or registrations required. Anyone with this link gets instant access to verified specs, delivery deadlines, and production artboards.
          </p>
        </div>

        {/* 2. Direct Link Copy Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-black/70">
            Direct access URL ({formatCount} validated formats)
          </label>

          <div className="flex items-center gap-2 p-1.5 bg-black/[0.03] border border-black/[0.1] rounded-xs">
            <LinkIcon className="w-4 h-4 text-black/40 ml-2 shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-[12px] font-medium text-black outline-none select-all truncate px-1"
            />
            <button
              onClick={handleCopy}
              className={`btn-morph px-4 py-2 text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                copied 
                  ? "bg-emerald-600 text-white" 
                  : "bg-black text-white hover:opacity-85"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. PLG Reassurance Badges */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/[0.06] text-[11px]">
          <div className="flex items-start gap-2 text-black/70">
            <Users className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <strong className="block text-black font-semibold">Shared single source</strong>
              <span>Agency, client &amp; freelancers see the exact same verified data in real time.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-black/70">
            <ShieldCheck className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <strong className="block text-black font-semibold">Silent data-cleaning active</strong>
              <span>Hidden line breaks, whitespace &amp; formatting anomalies were auto-sanitized.</span>
            </div>
          </div>
        </div>

        {/* 4. Done Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="btn-morph px-5 py-2 text-[11px] font-bold text-black border border-black/[0.15] hover:border-black cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
}
