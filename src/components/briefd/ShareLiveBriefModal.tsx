"use client";

import { Copy, Check, Link as LinkIcon, ShieldCheck, Users, Globe } from "lucide-react";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

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
  const { copied, copy } = useCopyToClipboard(2500);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/briefd?campaign=bevero-bf2026`
    : "https://briefd.finali.se/briefd?campaign=bevero-bf2026";

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="light" label={`Share live brief for ${clientName}`}>
      <div className="flex flex-col gap-6">

        {/* 1. Header */}
        <div className="flex flex-col gap-1.5 pr-8">
          <div className="flex items-center gap-2 text-label font-bold text-black/60">
            <Globe className="w-3.5 h-3.5" />
            <span>Zero-login live share</span>
          </div>

          <h3 className="text-title font-bold text-black tracking-tight leading-tight">
            Share live brief for {clientName}
          </h3>

          <p className="text-value text-black/60 leading-relaxed mt-0.5">
            No accounts, passwords, or registrations required. Anyone with this link gets instant access to verified specs, delivery deadlines, and production artboards.
          </p>
        </div>

        {/* 2. Direct Link Copy Input */}
        <div className="flex flex-col gap-2">
          <label className="text-label font-bold text-black/70">
            Direct access URL ({formatCount} validated formats)
          </label>

          <div className="flex items-center gap-2 p-1.5 bg-black/[0.03] border border-black/[0.1] rounded-xs">
            <LinkIcon className="w-4 h-4 text-black/40 ml-2 shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-label font-medium text-black outline-none select-all truncate px-1"
            />
            <Button variant="solid" size="sm" onClick={() => copy(shareUrl)} className="shrink-0">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan" />
                  <span>Link copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 3. Reassurance Notes */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/[0.06] text-label">
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
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>

      </div>
    </Modal>
  );
}
