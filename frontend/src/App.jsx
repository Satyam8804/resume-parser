import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import FileUploader from "./components/FileUploader";
import ResumeForm from "./components/ResumeForm";
import HrPortal from "./pages/HrPortal";

const emptyResume = {
  personal: {
    fullName: "", email: "", phone: "", address: "",
    linkedin: "", github: "", portfolio: "",
  },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
};

const CandidatePage = () => {
  const [resume, setResume] = useState(emptyResume);

  return (
    <div>
      <FileUploader setResume={setResume} />
      <ResumeForm resume={resume} setResume={setResume} />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CandidatePage />} />
        <Route path="/hr" element={<HrPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;