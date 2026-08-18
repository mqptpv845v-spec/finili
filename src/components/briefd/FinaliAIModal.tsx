"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ArrowRight } from "lucide-react";

interface FinaliAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinaliAIModal({ isOpen, onClose }: FinaliAIModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-[#520037] text-[#FFADEB] p-8 sm:p-12 shadow-2xl border border-[#FFADEB]/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#FFADEB]/70 hover:text-[#FFADEB] hover:rotate-90 transition-all cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        {!isSubmitted ? (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-[clamp(1.75rem,2.8vw,2.5rem)] font-bold leading-tight tracking-tight text-[#FFADEB]">
                Automated final art delivery
              </h2>
              <p className="text-[1.05rem] text-[#FFADEB]/85 leading-relaxed mt-3">
                From approved format cards to production-ready print, DOOH, and social files in seconds. Automatic format adaptation, ICC profiling, and PDF/X validation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
              <label htmlFor="early-email" className="text-xs font-semibold text-[#FFADEB]/80">
                Get early access & updates
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="early-email"
                  type="email"
                  required
                  placeholder="your.email@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-[#FFADEB]/30 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FFADEB] text-sm"
                />
                <button
                  type="submit"
                  className="btn-morph bg-[#FFADEB] text-[#520037] font-bold px-6 py-3 text-sm hover:bg-white cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Request access</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[0.75rem] text-[#FFADEB]/60 mt-1">
                Currently onboarding select agency partners in Stockholm.
              </span>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFADEB]/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#FFADEB]" />
            </div>
            <h3 className="text-2xl font-bold text-[#FFADEB]">You&apos;re on the list!</h3>
            <p className="text-sm text-[#FFADEB]/80 max-w-sm">
              We&apos;ve saved your request for <strong className="text-white">{email}</strong>. We will reach out as soon as early access opens.
            </p>
            <button
              onClick={onClose}
              className="btn-morph mt-4 px-6 py-2 bg-[#FFADEB] text-[#520037] font-bold text-xs hover:bg-white cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
