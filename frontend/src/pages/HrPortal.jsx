import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import JobForm from "../components/JobForm";
import JobList from "../components/JobList";
import JobDetail from "../components/JobDetail";

const HrPortal = () => {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleJobCreated = (jobId) => {
    setSelectedJobId(jobId);
    setRefreshTrigger((prev) => prev + 1);
    setShowForm(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50">
      {/* Left pane — job list. Hidden on mobile when a job is selected. */}
      <div
        className={`flex w-full shrink-0 flex-col border-r border-zinc-200 bg-white md:w-[360px] ${
          selectedJobId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-zinc-200 p-4">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="w-full rounded-xl bg-red-700 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            {showForm ? "Cancel" : "+ Post New Job"}
          </button>
        </div>

        {showForm && (
          <div className="border-b border-zinc-200 p-4">
            <JobForm onJobCreated={handleJobCreated} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <JobList
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            onJobDeleted={() => setSelectedJobId(null)}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Right pane — job detail. Hidden on mobile until a job is selected. */}
      <div
        className={`w-full flex-1 overflow-y-auto ${
          selectedJobId ? "block" : "hidden md:block"
        }`}
      >
        {selectedJobId && (
          <button
            onClick={() => setSelectedJobId(null)}
            className="flex items-center gap-1.5 border-b border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to jobs
          </button>
        )}
        <JobDetail jobId={selectedJobId} />
      </div>
    </div>
  );
};

export default HrPortal;