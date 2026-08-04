import { useEffect, useState } from "react";
import axios from "axios";
import { Briefcase, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import RankingsTable from "./RankingsTable";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const DESCRIPTION_LIMIT = 300; // characters shown before truncating

const JobDetail = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    setJob(null);
    setLoading(true);
    setExpanded(false); // reset expand state when switching jobs
    axios
      .get(`${API_URL}/jobs/${jobId}`)
      .then((res) => setJob(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  const copyJobId = () => {
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!jobId) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Briefcase className="mb-3 h-10 w-10 text-zinc-200" strokeWidth={1.5} />
        <p className="text-sm text-zinc-400">
          Select a job to view details and rankings
        </p>
      </div>
    );
  }

  if (loading || !job) {
    return <p className="p-6 text-sm text-zinc-400">Loading job...</p>;
  }

  const description = job.description || "";
  const isLong = description.length > DESCRIPTION_LIMIT;
  const displayText =
    isLong && !expanded
      ? description.slice(0, DESCRIPTION_LIMIT).trimEnd() + "…"
      : description;

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-1 font-mono text-[11px] tracking-[0.2em] text-red-700">
          JOB DETAILS
        </div>
        <h1 className="text-xl font-bold text-zinc-900">{job.title}</h1>

        <button
          onClick={copyJobId}
          className="mt-2 flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-500 transition hover:bg-zinc-100"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          ID: {job._id}
        </button>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
          {displayText}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-700 transition hover:text-red-800"
          >
            {expanded ? (
              <>
                See less <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                See more <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}

        {job.created_at && (
          <p className="mt-4 font-mono text-[11px] text-zinc-400">
            Posted {new Date(job.created_at).toLocaleString()}
          </p>
        )}
      </div>

      <RankingsTable jobId={jobId} />
    </div>
  );
};

export default JobDetail;
