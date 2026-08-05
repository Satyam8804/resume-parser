import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const SkillTags = ({ skills, variant }) => {
  if (!skills || skills.length === 0) return null;

  const styles =
    variant === "match"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-700";

  return (
    <div className="flex flex-wrap gap-1">
      {skills.map((skill, i) => (
        <span
          key={i}
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${styles}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

const ExperienceBadge = ({ met }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] ${
      met ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
    }`}
  >
    {met ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
    {met ? "Experience met" : "Experience gap"}
  </span>
);

const RankingsTable = ({ jobId }) => {
  const [status, setStatus] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] = useState(false);

  const fetchRankings = async () => {
    setLoadingRankings(true);
    try {
      const res = await axios.get(`${API_URL}/jobs/${jobId}/rankings`);
      setRankings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRankings(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/jobs/${jobId}/score-status`);
      setStatus(res.data);
      return res.data.status;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    if (!jobId) return;
    setRankings([]);
    setStatus(null);

    let interval;

    const init = async () => {
      const currentStatus = await fetchStatus();
      if (currentStatus === "completed") {
        fetchRankings();
      } else if (currentStatus === "in_progress") {
        interval = setInterval(async () => {
          const s = await fetchStatus();
          if (s === "completed") {
            clearInterval(interval);
            fetchRankings();
          }
        }, 3000);
      }
    };

    init();
    return () => interval && clearInterval(interval);
  }, [jobId]);

  if (!jobId) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">Rankings</h2>

      {status && status.status !== "completed" && (
        <div className="mb-4">
          <div className="mb-1.5 flex justify-between font-mono text-[11px] text-zinc-500">
            <span>SCORING</span>
            <span>
              {status.scored_count}/{status.total_resumes}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-red-700 transition-all duration-300"
              style={{
                width: status.total_resumes
                  ? `${(status.scored_count / status.total_resumes) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      )}

      {loadingRankings && (
        <p className="text-sm text-zinc-500">Loading rankings...</p>
      )}

      {!loadingRankings &&
        rankings.length === 0 &&
        status?.status === "completed" && (
          <p className="text-sm text-zinc-500">No resumes scored yet.</p>
        )}

      {rankings.length > 0 && (
        <div className="space-y-3">
          {rankings.map((r, i) => (
            <div
              key={r._id}
              className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-400">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-zinc-900">
                    {r.candidate_name}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 font-mono text-xs font-semibold text-red-700">
                  {r.score}
                </span>
              </div>

              {r.verdict && (
                <p className="mb-3 text-sm leading-relaxed text-zinc-600">
                  {r.verdict}
                </p>
              )}

              <div className="mb-2">
                <ExperienceBadge met={r.experience_requirement_met} />
              </div>

              {r.matching_skills?.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                    Matching
                  </p>
                  <SkillTags skills={r.matching_skills} variant="match" />
                </div>
              )}

              {r.missing_skills?.length > 0 && (
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                    Missing
                  </p>
                  <SkillTags skills={r.missing_skills} variant="missing" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RankingsTable;
