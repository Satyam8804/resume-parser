import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Briefcase } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const statusStyles = {
  completed: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-amber-50 text-amber-700",
  not_started: "bg-zinc-100 text-zinc-500",
};

const JobList = ({ selectedJobId, onSelectJob, onJobDeleted, refreshTrigger }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [refreshTrigger]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/jobs/`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, jobId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this job posting and all its scores?")) return;

    setDeletingId(jobId);
    try {
      await axios.delete(`${API_URL}/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      if (selectedJobId === jobId) onJobDeleted();
    } catch (err) {
      console.error(err);
      alert("Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Job Postings
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="px-5 py-4 text-sm text-zinc-400">Loading jobs...</p>
        )}

        {!loading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <Briefcase className="mb-2 h-8 w-8 text-zinc-300" strokeWidth={1.5} />
            <p className="text-sm text-zinc-400">No jobs posted yet</p>
          </div>
        )}

        {jobs.map((job) => (
          <div
            key={job._id}
            onClick={() => onSelectJob(job._id)}
            className={`group relative cursor-pointer border-b border-zinc-100 px-5 py-4 transition ${
              selectedJobId === job._id ? "bg-red-50" : "hover:bg-zinc-50"
            }`}
          >
            {selectedJobId === job._id && (
              <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-red-700" />
            )}
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-medium text-zinc-900">{job.title}</p>
              <button
                onClick={(e) => handleDelete(e, job._id)}
                disabled={deletingId === job._id}
                aria-label="Delete job"
                className="shrink-0 rounded-md p-1 text-zinc-300 opacity-0 transition hover:bg-red-100 hover:text-red-700 group-hover:opacity-100 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-zinc-400">{job.description}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                statusStyles[job.status] || statusStyles.not_started
              }`}
            >
              {job.status === "completed"
                ? `${job.scored_count}/${job.total_resumes} scored`
                : job.status === "in_progress"
                ? `Scoring ${job.scored_count}/${job.total_resumes}`
                : "Not scored"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;