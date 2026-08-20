"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link as LinkIcon, ShieldCheck, Trash2 } from "lucide-react";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";

interface ActiveShare {
  id: string;
  createdAt: string;
  expiresAt: string | null;
}

interface ShareLiveBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  shares: ActiveShare[];
  onCreate: () => Promise<{ id: string; token: string }>;
  onRevoke: (shareId: string) => Promise<void>;
}

function shareDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Creation date unavailable";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function ShareLiveBriefModal({
  isOpen,
  onClose,
  campaignName,
  shares,
  onCreate,
  onRevoke,
}: ShareLiveBriefModalProps) {
  const [knownLinks, setKnownLinks] = useState<Record<string, string>>({});
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
  }, []);

  const createShare = async () => {
    setBusyAction("create");
    setError(null);
    try {
      const created = await onCreate();
      const url = new URL("/briefd", window.location.origin);
      url.searchParams.set("share", created.token);
      setKnownLinks((current) => ({ ...current, [created.id]: url.toString() }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The share link could not be created.");
    } finally {
      setBusyAction(null);
    }
  };

  const copyShare = async (shareId: string, url: string) => {
    setError(null);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShareId(shareId);
      if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => setCopiedShareId((current) => current === shareId ? null : current), 2000);
    } catch {
      setError("Clipboard access was unavailable. Select and copy the link manually.");
    }
  };

  const revokeShare = async (shareId: string) => {
    setBusyAction(shareId);
    setError(null);
    try {
      await onRevoke(shareId);
      setKnownLinks((current) => {
        const next = { ...current };
        delete next[shareId];
        return next;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The share link could not be revoked.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="light" label={`Share ${campaignName}`}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 pr-8">
          <div className="flex items-center gap-2 text-label font-bold text-black/60">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>View-only sharing</span>
          </div>
          <h2 className="text-title font-bold text-black tracking-tight leading-tight">Share this campaign</h2>
          <p className="text-value text-black/60 leading-relaxed">
            Each link opens the saved campaign without upload, correction, reset, or sharing controls. Revoke a link to disable it immediately.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-4">
          <div className="flex items-start gap-2 text-label text-black/70">
            <ShieldCheck className="w-4 h-4 text-black shrink-0" />
            <span>{shares.length} active {shares.length === 1 ? "link" : "links"}</span>
          </div>
          <Button size="sm" disabled={busyAction !== null} onClick={() => void createShare()}>
            <LinkIcon className="w-3.5 h-3.5" />
            {busyAction === "create" ? "Creating…" : "Create link"}
          </Button>
        </div>

        {shares.length > 0 ? (
          <ul className="grid gap-3 max-h-[40vh] overflow-y-auto" aria-label="Active share links" tabIndex={0}>
            {shares.map((share) => {
              const url = knownLinks[share.id];
              const isBusy = busyAction === share.id;
              return (
                <li key={share.id} className="border border-black/10 p-4 grid gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-label font-bold text-black">Created {shareDate(share.createdAt)}</p>
                      <p className="text-label text-black/60">{share.expiresAt ? `Expires ${shareDate(share.expiresAt)}` : "No expiry"}</p>
                    </div>
                    <Button variant="outline" size="sm" disabled={busyAction !== null} onClick={() => void revokeShare(share.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                      {isBusy ? "Revoking…" : "Revoke"}
                    </Button>
                  </div>
                  {url ? (
                    <div className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <input
                        type="text"
                        readOnly
                        value={url}
                        onFocus={(event) => event.currentTarget.select()}
                        aria-label="New view-only share link"
                        className="min-w-0 w-full border border-black/15 bg-light px-3 py-2 text-label text-black"
                      />
                      <Button variant="soft" size="sm" onClick={() => void copyShare(share.id, url)}>
                        {copiedShareId === share.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedShareId === share.id ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-label text-black/60">
                      For security, Briefd only reveals a link when it is created. Revoke this link and create a new one if you no longer have it.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-label text-black/60">No one can access this campaign through a share link yet.</p>
        )}

        {error && <p className="text-label font-bold text-plum" role="alert">{error}</p>}
        <p className="sr-only" role="status" aria-live="polite">
          {copiedShareId ? "Share link copied." : busyAction === "create" ? "Creating share link." : ""}
        </p>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
