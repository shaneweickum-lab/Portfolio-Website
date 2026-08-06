export interface JobResponse {
  id: string;
  filename: string;
  format: string;
  status: "queued" | "parsing" | "synthesizing" | "encoding" | "done" | "error";
  progress: number;
  error: string | null;
  download_url: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function uploadDocument(file: File): Promise<JobResponse> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${API_URL}/jobs`, { method: "POST", body });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail ?? `Upload failed (${response.status})`);
  }
  return response.json();
}

export async function getJobStatus(jobId: string): Promise<JobResponse> {
  const response = await fetch(`${API_URL}/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error(`Could not fetch job status (${response.status})`);
  }
  return response.json();
}

export function downloadUrlFor(job: JobResponse): string | null {
  return job.download_url ? `${API_URL}${job.download_url}` : null;
}

export const SUPPORTED_FORMATS: { extension: string; label: string; tier: "free" | "paid" }[] = [
  { extension: "txt", label: ".txt", tier: "free" },
  { extension: "md", label: ".md", tier: "free" },
  { extension: "docx", label: ".docx", tier: "paid" },
];
