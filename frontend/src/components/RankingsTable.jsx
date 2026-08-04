import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const RankingsTable = ({ jobId }) => {
  const [status, setStatus] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] = useState(false);

  const fetchRankings = async () => {
    setLoadingRankings(true);
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${jobId}/rankings`);
      setRankings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRankings(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${jobId}/score-status`);
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
        <>
          {/* Mobile — stacked cards, hidden on md+ */}
          <div className="space-y-3 md:hidden">
            {rankings.map((r, i) => (
              <div
                key={r._id}
                className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
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
                <p className="text-sm leading-relaxed text-zinc-600">
                  {r.reasoning}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop — table, hidden below md */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-widest text-zinc-500">
                  <th className="py-2 pr-4">Rank</th>
                  <th className="py-2 pr-4">Candidate</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r, i) => (
                  <tr key={r._id} className="border-b border-zinc-100">
                    <td className="py-2.5 pr-4 font-mono text-zinc-400">
                      {i + 1}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-zinc-900">
                      {r.candidate_name}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded-full bg-red-50 px-2.5 py-1 font-mono text-xs text-red-700">
                        {r.score}
                      </span>
                    </td>
                    <td className="py-2.5 text-zinc-600">{r.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RankingsTable;
