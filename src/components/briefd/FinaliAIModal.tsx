"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";

interface FinaliAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinaliAIModal({ isOpen, onClose }: FinaliAIModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="plum" label="Automated final art delivery — early access">
      {!isSubmitted ? (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-title font-bold leading-tight tracking-tight text-magenta">
              Automated final art delivery
            </h2>
            <p className="text-value text-magenta/85 leading-relaxed mt-3">
              From approved format cards to production-ready print, DOOH, and social files in seconds. Automatic format adaptation, ICC profiling, and PDF/X validation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
            <label htmlFor="early-email" className="text-label font-semibold text-magenta/80">
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
                className="flex-1 bg-white/10 border border-magenta/30 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-magenta text-value"
              />
              <Button variant="contrast" type="submit">
                <span>Request access</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-label text-magenta/60 mt-1">
              Currently onboarding select agency partners in Stockholm.
            </span>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-6 gap-4">
          <div className="w-12 h-12 rounded-full bg-magenta/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-magenta" />
          </div>
          <h3 className="text-title font-bold text-magenta">You&apos;re on the list!</h3>
          <p className="text-value text-magenta/80 max-w-sm">
            We&apos;ve saved your request for <strong className="text-white">{email}</strong>. We will reach out as soon as early access opens.
          </p>
          <Button variant="contrast" size="sm" onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
}
