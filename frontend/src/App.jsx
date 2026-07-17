import { useState } from "react";
import FileUploader from "./components/FileUploader";
import ResumeForm from "./components/ResumeForm";

const emptyResume = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
};

const App = () => {
  const [resume, setResume] = useState(emptyResume);

  return (
    <div className="w-full h-screen flex flex-col gap-6 mt-18 items-center">
      <FileUploader setResume={setResume} />
      <ResumeForm resume={resume} setResume={setResume} />
    </div>
  );
};

export default App;