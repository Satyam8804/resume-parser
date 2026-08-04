import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const JobForm = ({ onJobCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/jobs/`, {
        title,
        description,
      });
      const jobId = res.data.id;
      await axios.post(`${API_URL}/jobs/${jobId}/score-all`); // trigger scoring immediately
      onJobCreated(jobId);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError("Failed to create job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4  border-zinc-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-zinc-900">Post a Job</h2>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
          Job Title
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Senior Frontend Engineer"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/10"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
          Job Description
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={8}
          placeholder="Paste the full job description here..."
          className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/10"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-red-700 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:bg-zinc-300"
      >
        {submitting ? "Creating..." : "Create Job & Score Resumes"}
      </button>
    </form>
  );
};

export default JobForm;
