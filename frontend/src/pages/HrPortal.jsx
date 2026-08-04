import { useState } from "react";
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
      {/* Left pane */}
      <div className="flex w-[360px] shrink-0 flex-col border-r border-zinc-200 bg-white">
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

      {/* Right pane */}
      <div className="flex-1 overflow-y-auto">
        <JobDetail jobId={selectedJobId} />
      </div>
    </div>
  );
};

export default HrPortal;