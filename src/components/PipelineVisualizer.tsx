"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";

export type PipelineStep = "idle" | "parsing" | "brain" | "indesign" | "complete" | "error";

const steps = [
    { id: "parsing", label: "Parsing Media Plan" },
    { id: "brain", label: "Querying The Brain" },
    { id: "indesign", label: "InDesign Cloud API" },
    { id: "complete", label: "Final PDF Ready" },
];

export function PipelineVisualizer({ currentStep }: { currentStep: PipelineStep, errorMessage?: string }) {
    if (currentStep === "idle") return null;

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 md:col-span-2 w-full max-w-4xl mx-auto mt-8 glass-panel p-8 rounded-2xl pb-16"
        >
            <h3 className="text-xl font-bold mb-8 text-center">Pipeline Execution</h3>
            <div className="flex items-center justify-between relative px-4 md:px-12">
                {/* Background Line */}
                <div className="absolute top-1/2 left-12 right-12 h-[2px] bg-slate-200 -translate-y-1/2 rounded-full z-0" />

                {/* Active Line */}
                <motion.div
                    className={cn(
                        "absolute top-1/2 left-12 h-[2px] -translate-y-1/2 rounded-full z-0",
                        currentStep === "error" ? "bg-red-400" : "bg-blue-400"
                    )}
                    initial={{ width: "0%" }}
                    animate={{
                        width: currentStep === "error"
                            ? "100%"
                            : `calc(${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}% - 6rem)`
                    }}
                    transition={{ duration: 0.5 }}
                />

                {steps.map((step, index) => {
                    const isPassed = currentIndex > index || currentStep === "complete";
                    const isActive = currentStep === step.id;
                    const isErrorHover = currentStep === "error"; // Treat steps as errored visually if pipeline failed

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                    backgroundColor: isErrorHover ? "#fee2e2" : (isPassed || isActive ? "#fff" : "#f5f5f5"),
                                }}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                                    isErrorHover ? "border-red-400 text-red-500 bg-white" :
                                        isPassed ? "border-green-400 bg-white text-green-500 shadow-sm" :
                                            isActive ? "border-blue-400 bg-white text-blue-500 shadow-md ring-4 ring-blue-50" :
                                                "border-slate-200 bg-white text-slate-300"
                                )}
                            >
                                {isPassed ? <CheckCircle2 className="w-6 h-6" /> : isActive ? <Loader2 className="w-6 h-6 animate-spin" /> : <CircleDashed className="w-6 h-6" />}
                            </motion.div>
                            <span className={cn(
                                "text-xs font-medium w-28 text-center absolute top-16 -ml-[0.5rem]",
                                isPassed || isActive ? "text-slate-700" : "text-slate-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
