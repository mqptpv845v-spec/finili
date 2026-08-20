"use client";

import { Database, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="light" label={`Sharing status for ${clientName}`}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 pr-8">
          <div className="flex items-center gap-2 text-label font-bold text-black/60">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>View-only sharing</span>
          </div>

          <h3 className="text-title font-bold text-black tracking-tight leading-tight">
            Sharing is not enabled yet
          </h3>

          <p className="text-value text-black/60 leading-relaxed mt-0.5">
            This workspace contains {formatCount} {formatCount === 1 ? "format" : "formats"} for {clientName}, but no share link has been created. Briefd will only expose this control after durable storage, access revocation, and a two-session view-only flow have been verified.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/[0.06] text-label">
          <div className="flex items-start gap-2 text-black/70">
            <Database className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <strong className="block text-black font-semibold">Durability required</strong>
              <span>A link must load the saved campaign after a reload before sharing can be offered.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-black/70">
            <ShieldCheck className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <strong className="block text-black font-semibold">Revocation required</strong>
              <span>Recipients must remain view-only and the owner must be able to disable access.</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
