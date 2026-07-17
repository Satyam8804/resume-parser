import { useRef, useState } from "react";
import axios from "axios";
import { UploadCloud, FileText, X, Loader2, AlertCircle } from "lucide-react";

const ACCEPTED_TYPES = ["application/pdf"];
const ACCEPTED_EXTENSIONS = [".pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Returns an error message string if the file is invalid, or null if it's fine.
const validateFile = (file) => {
  if (!file) return "No file selected.";

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const typeOk = ACCEPTED_TYPES.includes(file.type);
  const extensionOk = ACCEPTED_EXTENSIONS.includes(extension);

  // Some OS/browser combos report an empty or generic mime type for PDFs
  // (e.g. drag-drop from certain file managers), so fall back to the
  // extension check rather than rejecting purely on `file.type`.
  if (!typeOk && !extensionOk) {
    return "Only PDF files are supported.";
  }

  if (file.size === 0) {
    return "This file is empty.";
  }

  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large (${(file.size / (1024 * 1024)).toFixed(
      1
    )} MB). Max size is 10 MB.`;
  }

  return null;
};

const normalizeResume = (data) => {
  const skillToString = (s) => {
    if (typeof s === "string") return s;
    if (s && typeof s === "object") {
      return s.name || s.skill || s.title || Object.values(s)[0] || "";
    }
    return "";
  };

  return {
    personal: {
      fullName: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      linkedin: data.linkedin || "",
      github: data.github || "",
      portfolio: data.portfolio || "",
    },
    summary: data.summary || "",
    education: data.education || [],
    experience: data.experiences || data.experience || [],
    projects: data.projects || [],
    skills: (data.skills || []).map(skillToString).filter(Boolean),
    certifications: data.certifications || [],
  };
};

const FileUploader = ({ setResume }) => {
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selected = e.target.files[0];
      const validationError = validateFile(selected);
      setError(validationError);
      setFile(validationError ? null : selected);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      const validationError = validateFile(dropped);
      setError(validationError);
      setFile(validationError ? null : dropped);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await axios.post(
        `${API_URL}/upload`,
        formData,
        {
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          },
        }
      );

      alert("Upload Successful");
      setResume(normalizeResume(response.data.data));
      console.log(response);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <section className="relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="absolute bottom-6 left-0 top-6 hidden w-[3px] rounded-full bg-red-700 sm:block" />

        <div className="sm:pl-5">
          <div className="mb-1 font-mono text-[11px] tracking-[0.2em] text-red-700">
            #00
          </div>

          <div className="mb-5 sm:mb-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Upload resume
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              PDF only — we'll fill the form in automatically.
            </p>
          </div>

          <div
            onClick={() => fileRef.current.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition sm:px-6 sm:py-14 ${
              dragging
                ? "border-red-700 bg-red-50/50"
                : "border-zinc-300 bg-zinc-50/60 hover:border-zinc-400"
            }`}
          >
            {!file ? (
              <>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm sm:h-12 sm:w-12">
                  <UploadCloud
                    className="h-5 w-5 text-red-700"
                    strokeWidth={1.75}
                  />
                </div>

                <p className="text-sm font-medium text-zinc-900">
                  Drag &amp; drop your file here
                </p>
                <p className="mt-1 text-xs text-zinc-400">or</p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current.click();
                  }}
                  className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/20"
                >
                  Browse files
                </button>

                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  PDF · up to 10MB
                </p>
              </>
            ) : (
              <div className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <FileText
                    className="h-5 w-5 text-red-700"
                    strokeWidth={1.75}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {file.name}
                  </p>
                  <p className="font-mono text-[11px] text-zinc-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                <button
                  onClick={removeFile}
                  aria-label="Remove file"
                  className="shrink-0 rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={handleFileChange}
          />

          {error && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={1.75}
              />
              <span>{error}</span>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between font-mono text-[11px] text-zinc-500">
                <span>UPLOADING</span>
                <span className="text-zinc-900">{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-red-700 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={uploading || !file || !!error}
            className="mt-5 cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 py-3 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/20 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Upload resume"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default FileUploader;
