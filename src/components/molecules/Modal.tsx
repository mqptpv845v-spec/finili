"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Shared modal shell: backdrop, panel, close button, Escape/backdrop-close,
// dialog semantics and initial focus. Flat and sharp per the design rules —
// no shadows. Variants follow the tone-on-tone pairs: "light" is a white
// panel, "plum" is the plum/magenta pair.
type ModalVariant = "light" | "plum";

const PANEL_CLASSES: Record<ModalVariant, string> = {
  light: "max-w-lg bg-white border border-black/10 p-6 sm:p-8",
  plum: "max-w-xl bg-plum text-magenta border border-magenta/20 p-8 sm:p-12",
};

const CLOSE_CLASSES: Record<ModalVariant, string> = {
  light: "text-black/40 hover:text-black",
  plum: "text-magenta/70 hover:text-magenta",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  /** Accessible name for the dialog */
  label: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, variant = "light", label, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full outline-none ${PANEL_CLASSES[variant]}`}
      >
        <button
          onClick={onClose}
          title="Close"
          className={`absolute top-5 right-5 p-1.5 transition-colors cursor-pointer ${CLOSE_CLASSES[variant]}`}
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
