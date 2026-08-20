"use client";

import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";

interface Props { isOpen: boolean; onClose: () => void }

export function FinaliAIModal({ isOpen, onClose }: Props) {
  return <Modal isOpen={isOpen} onClose={onClose} variant="plum" label="Planned Finali automation">
    <div className="flex flex-col gap-6">
      <div><p className="text-label font-bold text-magenta/70">Coming soon</p><h2 className="text-title font-bold leading-tight tracking-tight text-magenta mt-1">Automated final-art delivery</h2><p className="text-value text-magenta/85 leading-relaxed mt-3">The intended Finali workflow will adapt approved masters and validate production outputs against Briefd requirements. That automation is not part of the current Briefd utility.</p></div>
      <div className="bg-white/10 p-4 text-label text-magenta/80"><strong className="block text-magenta mb-1">What works today</strong>Workbook parsing, a cited provisional specification Brain, row correction, and campaign views.</div>
      <Button variant="contrast" size="sm" onClick={onClose} className="self-start">Close</Button>
    </div>
  </Modal>;
}
