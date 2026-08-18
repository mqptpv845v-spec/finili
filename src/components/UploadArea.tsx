"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileType, FileSpreadsheet, XCircle, CheckCircle2, AlertTriangle, Maximize, Palette, Plus, Download, FileImage, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PipelineVisualizer, type PipelineStep } from "./PipelineVisualizer";
import { OrchestratedJob } from "@/lib/jobOrchestrator";

type BrainSpec = {
    color?: { icc_profile?: string };
    dimensions?: { width_mm?: number, height_mm?: number, width_px?: number, height_px?: number };
};

export function UploadArea() {
    const [masterFile, setMasterFile] = useState<File | null>(null);
    const [mediaPlan, setMediaPlan] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [isDraggingMaster, setIsDraggingMaster] = useState(false);
    const [isDraggingPlan, setIsDraggingPlan] = useState(false);
    const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
    const [finalJobs, setFinalJobs] = useState<OrchestratedJob[] | null>(null);
    const [parsedJobs, setParsedJobs] = useState<OrchestratedJob[] | null>(null);
    const [isParsingExcel, setIsParsingExcel] = useState(false);

    const parseExcel = async (file: File) => {
        setIsParsingExcel(true);
        try {
            const formData = new FormData();
            formData.append("mediaPlan", file);
            const res = await fetch("/api/parse", { method: "POST", body: formData });
            const data = await res.json();
            if (data.jobs) {
                setParsedJobs(data.jobs);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsParsingExcel(false);
        }
    };

    // Handlers for Master File (.indd / .pdf)
    const handleMasterDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingMaster(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setMasterFile(e.dataTransfer.files[0]);
        }
    }, []);

    // Handlers for Media Plan (.xlsx)
    const handlePlanDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPlan(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setMediaPlan(file);
            parseExcel(file);
        }
    }, []);

    const clearMaster = () => setMasterFile(null);
    const clearPlan = () => {
        setMediaPlan(null);
        setParsedJobs(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
            {/* Master File Dropzone */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                    "glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors duration-300 relative overflow-hidden h-72 border-2",
                    isDraggingMaster ? "border-blue-500 bg-blue-500/10" : "border-black/10 hover:border-black/20",
                    masterFile && "border-green-500/50 bg-green-500/5 cursor-default"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingMaster(true); }}
                onDragLeave={() => setIsDraggingMaster(false)}
                onDrop={handleMasterDrop}
            >
                <AnimatePresence mode="wait">
                    {!masterFile ? (
                        <motion.div
                            key="empty-master"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center pointer-events-none"
                        >
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                                <FileType className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Master File</h3>
                            <p className="text-sm text-gray-400">Drag and drop your .indd or .pdf here</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="filled-master"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                            <h3 className="text-lg font-medium text-black break-all">{masterFile.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{(masterFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button
                                onClick={clearMaster}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Media Plan Dropzone */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                    "glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors duration-300 relative overflow-hidden h-72 border-2",
                    isDraggingPlan ? "border-purple-500 bg-purple-500/10" : "border-black/10 hover:border-black/20",
                    mediaPlan && "border-green-500/50 bg-green-500/5 cursor-default"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPlan(true); }}
                onDragLeave={() => setIsDraggingPlan(false)}
                onDrop={handlePlanDrop}
            >
                <AnimatePresence mode="wait">
                    {!mediaPlan ? (
                        <motion.div
                            key="empty-plan"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center pointer-events-none"
                        >
                            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                                <FileSpreadsheet className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Media Plan</h3>
                            <p className="text-sm text-gray-400">Drag and drop your .xlsx overview here</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="filled-plan"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            {isParsingExcel ? <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-3" /> : <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />}
                            <h3 className="text-lg font-medium text-black break-all">{mediaPlan.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{(mediaPlan.size / 1024).toFixed(2)} KB</p>
                            <button
                                onClick={clearPlan}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Generate Button Area */}
            <div className="md:col-span-2 flex flex-col items-center mt-6">
                <motion.button
                    onClick={async () => {
                        if (pipelineStep !== "idle" || !masterFile || !mediaPlan) return;

                        setErrorMessage(null);
                        setPipelineStep("parsing");

                        const formData = new FormData();
                        formData.append("mediaPlan", mediaPlan);
                        formData.append("masterFile", masterFile);

                        try {
                            // Simulate UI progression before the fetch completes
                            setTimeout(() => setPipelineStep(prev => prev === "error" ? "error" : "brain"), 500);
                            setTimeout(() => setPipelineStep(prev => prev === "error" ? "error" : "indesign"), 1500);

                            const res = await fetch("/api/orchestrate", {
                                method: "POST",
                                body: formData,
                            });

                            const data = await res.json();

                            if (!res.ok || data.error) {
                                throw new Error(data.error || "Unknown API Error");
                            }

                            // We allow mixed status (some success, some error) to pass through to the gallery.
                            // If all jobs failed, the backend returns 400 with a top-level error message instead.
                            setFinalJobs(data.jobs);
                            setPipelineStep("complete");
                        } catch (err: unknown) {
                            setPipelineStep("error");
                            const errMessage = err instanceof Error ? err.message : String(err);
                            setErrorMessage(errMessage || "Failed to orchestrate pipeline");
                        }
                    }}
                    disabled={!masterFile || !mediaPlan || pipelineStep !== "idle"}
                    whileHover={{ scale: (masterFile && mediaPlan && pipelineStep === "idle") ? 1.05 : 1 }}
                    whileTap={{ scale: (masterFile && mediaPlan && pipelineStep === "idle") ? 0.95 : 1 }}
                    className={cn(
                        "px-8 py-4 rounded-full font-bold text-lg shadow-xl shrink-0 transition-all duration-300 flex items-center gap-2",
                        masterFile && mediaPlan && pipelineStep === "idle"
                            ? "bg-black text-white hover:bg-gray-800 cursor-pointer shadow-black/20"
                            : "bg-black/5 text-black/40 cursor-not-allowed"
                    )}
                >
                    <UploadCloud className="w-5 h-5" />
                    {pipelineStep === "idle" ? "Initialize Pipeline" : "Processing..."}
                </motion.button>
            </div>

            <div className="md:col-span-2 w-full mt-4">
                <PipelineVisualizer currentStep={pipelineStep} errorMessage={errorMessage || undefined} />
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-200 text-center max-w-2xl mx-auto"
                    >
                        <span className="font-bold text-red-400 block mb-1">Pipeline Terminated</span>
                        {errorMessage}
                    </motion.div>
                )}
            </div>

            {/* Spec Validation Area */}
            {parsedJobs && pipelineStep === "idle" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 mt-2 glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Spec Validation
                    </h3>
                    <div className="flex flex-col gap-3">
                        {parsedJobs.map((job, idx) => (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className={cn("p-4 rounded-xl border flex items-center justify-between shadow-sm", job.status === "error" ? "bg-red-50 border-red-200" : "bg-white border-slate-200")}>
                                <div className="flex items-center gap-4 w-full overflow-hidden">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", job.status === "error" ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500")}>
                                        {job.status === "error" ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                        <p className="font-semibold text-slate-800 truncate">{job.publisher} - {job.formatName}</p>
                                        {job.status === "error" ? (
                                            <p className="text-xs text-red-500 mt-1 truncate">{job.error}</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Palette className="w-3 h-3" /> {(job.specs as BrainSpec)?.color?.icc_profile || "sRGB"}</span>
                                                <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {(job.specs as BrainSpec)?.dimensions?.width_mm ? `${(job.specs as BrainSpec).dimensions!.width_mm}x${(job.specs as BrainSpec).dimensions!.height_mm} mm` : `${(job.specs as BrainSpec)?.dimensions?.width_px}x${(job.specs as BrainSpec)?.dimensions?.height_px} px`}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {job.status === "error" && (
                                    <button className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs rounded-lg flex items-center gap-1 transition-colors shrink-0 ml-4 font-medium shadow-sm">
                                        <Plus className="w-3 h-3" /> Add Missing Spec
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Download Gallery */}
            {pipelineStep === "complete" && finalJobs && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 mt-2 glass-panel p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Download className="w-6 h-6 text-blue-400" />
                        Download Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {finalJobs.filter(job => job.status === "complete").map((job, idx) => (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col items-center text-center relative group overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <FileImage className="w-12 h-12 text-blue-400 mb-4" />
                                <h4 className="font-semibold text-sm mb-1 text-slate-800 line-clamp-2 w-full" title={job.generatedFileName}>{job.generatedFileName}</h4>
                                <p className="text-xs text-slate-500 mb-6">{job.publisher} - {job.formatName}</p>
                                <a href={job.outputUrl} download={job.generatedFileName} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm">
                                    <Download className="w-4 h-4" /> Download PDF
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
