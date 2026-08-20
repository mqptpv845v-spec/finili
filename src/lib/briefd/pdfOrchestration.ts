import type { OrchestratedJob } from "@/lib/jobOrchestrator";

export function markUnsupportedPdfJobs(jobs: OrchestratedJob[]): OrchestratedJob[] {
  return jobs.map((job) => {
    if (job.status === "error" || job.generatedFileName.toLowerCase().endsWith(".pdf")) return job;
    return {
      ...job,
      status: "error",
      error: `${job.publisher} — ${job.formatName} is not a PDF deliverable and cannot use the local InDesign PDF route.`,
    };
  });
}
