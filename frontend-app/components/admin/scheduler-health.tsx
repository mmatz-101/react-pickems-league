import { Activity, AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SchedulerJob = { job_name: string; status: "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED"; started_at: string; completed_at?: string; error_message?: string; records_received: number; records_created: number; records_updated: number; records_failed: number };

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function statusStyle(status: SchedulerJob["status"]) {
  if (status === "SUCCESS") return { className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2, label: "Healthy" };
  if (status === "FAILED") return { className: "bg-red-100 text-red-800", icon: XCircle, label: "Failed" };
  if (status === "RUNNING") return { className: "bg-blue-100 text-blue-800", icon: Activity, label: "Running" };
  return { className: "bg-amber-100 text-amber-800", icon: AlertTriangle, label: "Skipped" };
}

export default function SchedulerHealth({ error, jobs }: { error?: string; jobs: SchedulerJob[] }) {
  return <Card className="settings-card animate-fade-up"><CardHeader className="border-b bg-muted/30"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Activity className="size-4" /></span><div><CardTitle className="text-lg">Scheduler health</CardTitle><CardDescription className="mt-1">Latest background sync status for game data and pick results.</CardDescription></div></div></CardHeader><CardContent className="p-5 sm:p-6">{error ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div> : !jobs.length ? <div className="rounded-lg border border-dashed py-10 text-center"><Clock3 className="mx-auto mb-3 size-5 text-muted-foreground" /><p className="font-medium">No scheduler runs recorded yet</p><p className="mt-1 text-sm text-muted-foreground">The status cards will appear after the scheduler runs.</p></div> : <div className="grid gap-4 md:grid-cols-2">{jobs.map((job) => { const style = statusStyle(job.status); const Icon = style.icon; return <div className="rounded-xl border p-4" key={job.job_name}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{job.job_name === "get-covers-data" ? "Game & odds sync" : job.job_name === "update-picks-results" ? "Pick results sync" : job.job_name}</p><p className="mt-1 text-sm text-muted-foreground">Last started {formatDate(job.started_at)}</p></div><span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${style.className}`}><Icon className="size-3.5" />{style.label}</span></div><dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm"><div><dt className="text-muted-foreground">Received</dt><dd className="mt-0.5 font-semibold tabular-nums">{job.records_received}</dd></div><div><dt className="text-muted-foreground">Created / updated</dt><dd className="mt-0.5 font-semibold tabular-nums">{job.records_created} / {job.records_updated}</dd></div></dl>{job.records_failed > 0 && <p className="mt-3 text-sm font-medium text-destructive">{job.records_failed} record{job.records_failed === 1 ? "" : "s"} failed</p>}{job.error_message && <p className="mt-3 rounded-md bg-destructive/5 p-3 text-sm text-destructive">{job.error_message}</p>}</div>; })}</div>}</CardContent></Card>;
}
