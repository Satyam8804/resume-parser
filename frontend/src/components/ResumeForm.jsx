import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Sparkles,
  Award,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const SECTIONS = [
  { id: "personal", tag: "01", label: "Personal" },
  { id: "summary", tag: "02", label: "Summary" },
  { id: "education", tag: "03", label: "Education" },
  { id: "experience", tag: "04", label: "Experience" },
  { id: "projects", tag: "05", label: "Projects" },
  { id: "skills", tag: "06", label: "Skills" },
  { id: "certifications", tag: "07", label: "Certifications" },
];

const emptyEducation = {
  degree: "",
  college: "",
  fieldOfStudy: "",
  cgpa: "",
  year: "",
};
const emptyExperience = {
  companyName: "",
  role: "",
  years_of_experience: "",
  description: "",
};
const emptyProject = {
  title: "",
  technologies: "",
  github: "",
  liveUrl: "",
  description: "",
};
const emptyCertification = { name: "", issuer: "", date: "" };

const Field = ({
  label,
  icon: Icon,
  as = "input",
  className = "",
  ...props
}) => {
  const Tag = as;
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
        {label}
      </span>
      <Tag
        {...props}
        className={`w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[16px] sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-700/10 ${className}`}
      />
    </label>
  );
};

const EntryCard = ({ index, onRemove, children }) => (
  <div className="relative rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 sm:p-5">
    <div className="mb-3 flex items-center justify-between">
      <span className="font-mono text-[11px] tabular-nums text-zinc-400">
        #{String(index + 1).padStart(2, "0")}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove entry"
        className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs text-zinc-400 transition hover:bg-red-50 hover:text-red-700 active:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden xs:inline sm:inline">Remove</span>
      </button>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
  </div>
);

const AddButton = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-500 transition hover:border-red-700 hover:text-red-700 active:border-red-700 active:text-red-700"
  >
    <Plus className="h-4 w-4 shrink-0" />
    {label}
  </button>
);

const SectionCard = ({
  id,
  tag,
  icon: Icon,
  title,
  hint,
  innerRef,
  children,
}) => (
  <section
    id={id}
    ref={innerRef}
    className="relative scroll-mt-24 sm:scroll-mt-28 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm"
  >
    <div className="absolute bottom-4 left-0 top-4 sm:bottom-6 sm:top-6 w-[3px] rounded-full bg-red-700" />
    <div className="pl-3 sm:pl-5">
      <div className="mb-1 font-mono text-[11px] tracking-[0.2em] text-red-700">
        #{tag}
      </div>
      <div className="mb-5 sm:mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-zinc-900">
          <Icon className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.75} />
          {title}
        </h2>
        {hint && <span className="text-xs text-zinc-400">{hint}</span>}
      </div>
      {children}
    </div>
  </section>
);

const ResumeForm = ({ resume, setResume }) => {
  const [active, setActive] = useState("personal");
  const refs = useRef({});

  const handleChange = (section, field, value, index = null) => {
    setResume((prev) => {
      if (field === null) {
        return { ...prev, [section]: value };
      }

      if (index !== null) {
        const updated = [...prev[section]];
        updated[index] = { ...updated[index], [field]: value };
        return { ...prev, [section]: updated };
      }

      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
  };

  const addEntry = (section, template) => {
    setResume((prev) => ({
      ...prev,
      [section]: [...prev[section], { ...template }],
    }));
  };

  const removeEntry = (section, index) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(resume);
  };

  const scrollTo = (id) => {
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const skillsValue = Array.isArray(resume?.skills) ? resume.skills : [];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-zinc-50">
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Resume Builder
            </h1>
            <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
              DOCUMENT INDEX
            </span>
          </div>
          <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`flex cursor-pointer shrink-0 items-center font-semibold gap-1.5 rounded-full border px-2.5 py-1.5 sm:px-3 font-mono text-[10px] sm:text-[11px] tracking-wide transition ${
                  active === s.id
                    ? "border-red-700 bg-red-700 text-white"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                }`}
              >
                <span className="opacity-70">{s.tag}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-5xl space-y-4 sm:space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <SectionCard
          id="personal"
          tag="01"
          icon={User}
          title="Personal Information"
          innerRef={(el) => (refs.current.personal = el)}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Full Name"
              icon={User}
              placeholder="Satyam Kumar"
              value={resume.personal.fullName}
              onChange={(e) =>
                handleChange("personal", "fullName", e.target.value)
              }
            />
            <Field
              label="Email"
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={resume.personal.email}
              onChange={(e) =>
                handleChange("personal", "email", e.target.value)
              }
            />
            <Field
              label="Phone"
              icon={Phone}
              placeholder="+91 00000 00000"
              value={resume.personal.phone}
              onChange={(e) =>
                handleChange("personal", "phone", e.target.value)
              }
            />
            <Field
              label="Address"
              icon={MapPin}
              placeholder="City, Country"
              value={resume.personal.address}
              onChange={(e) =>
                handleChange("personal", "address", e.target.value)
              }
            />
            <Field
              label="LinkedIn"
              icon={FaLinkedin}
              placeholder="linkedin.com/in/username"
              value={resume.personal.linkedin}
              onChange={(e) =>
                handleChange("personal", "linkedin", e.target.value)
              }
            />
            <Field
              label="GitHub"
              icon={FaGithub}
              placeholder="github.com/username"
              value={resume.personal.github}
              onChange={(e) =>
                handleChange("personal", "github", e.target.value)
              }
            />
            <Field
              label="Portfolio"
              icon={Globe}
              placeholder="yourdomain.com"
              className="sm:col-span-2"
              value={resume.personal.portfolio}
              onChange={(e) =>
                handleChange("personal", "portfolio", e.target.value)
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          id="summary"
          tag="02"
          icon={Sparkles}
          title="Professional Summary"
          innerRef={(el) => (refs.current.summary = el)}
        >
          <Field
            as="textarea"
            label="Summary"
            rows={4}
            placeholder="A short pitch of who you are and what you build."
            value={resume.summary}
            onChange={(e) => handleChange("summary", null, e.target.value)}
          />
        </SectionCard>

        <SectionCard
          id="education"
          tag="03"
          icon={GraduationCap}
          title="Education"
          hint={`${resume.education.length} ${
            resume.education.length === 1 ? "entry" : "entries"
          }`}
          innerRef={(el) => (refs.current.education = el)}
        >
          <div className="space-y-3">
            {resume.education.map((edu, index) => (
              <EntryCard
                key={index}
                index={index}
                onRemove={() => removeEntry("education", index)}
              >
                <Field
                  label="Degree"
                  placeholder="B.Tech"
                  value={edu.degree}
                  onChange={(e) =>
                    handleChange("education", "degree", e.target.value, index)
                  }
                />
                <Field
                  label="Institution"
                  placeholder="University name"
                  value={edu.college}
                  onChange={(e) =>
                    handleChange("education", "college", e.target.value, index)
                  }
                />
                <Field
                  label="Field of Study"
                  placeholder="Computer Science"
                  value={edu.fieldOfStudy}
                  onChange={(e) =>
                    handleChange(
                      "education",
                      "fieldOfStudy",
                      e.target.value,
                      index
                    )
                  }
                />
                <Field
                  label="CGPA"
                  placeholder="8.5"
                  value={edu.cgpa}
                  onChange={(e) =>
                    handleChange("education", "cgpa", e.target.value, index)
                  }
                />
                <Field
                  label="End Date"
                  className="sm:col-span-2"
                  placeholder="May 2024"
                  value={edu.year}
                  onChange={(e) =>
                    handleChange("education", "year", e.target.value, index)
                  }
                />
              </EntryCard>
            ))}
            <AddButton
              onClick={() => addEntry("education", emptyEducation)}
              label="Add education"
            />
          </div>
        </SectionCard>

        <SectionCard
          id="experience"
          tag="04"
          icon={Briefcase}
          title="Experience"
          hint={`${resume.experience.length} ${
            resume.experience.length === 1 ? "entry" : "entries"
          }`}
          innerRef={(el) => (refs.current.experience = el)}
        >
          <div className="space-y-3">
            {resume.experience.map((exp, index) => (
              <EntryCard
                key={index}
                index={index}
                onRemove={() => removeEntry("experience", index)}
              >
                <Field
                  label="Company"
                  placeholder="Company name"
                  value={exp.companyName}
                  onChange={(e) =>
                    handleChange(
                      "experience",
                      "companyName",
                      e.target.value,
                      index
                    )
                  }
                />
                <Field
                  label="Designation"
                  placeholder="Role / title"
                  value={exp.role}
                  onChange={(e) =>
                    handleChange("experience", "role", e.target.value, index)
                  }
                />
                <Field
                  label="Years of Experience"
                  type="number"
                  min="0"
                  placeholder="2"
                  value={exp.years_of_experience}
                  onChange={(e) =>
                    handleChange(
                      "experience",
                      "years_of_experience",
                      e.target.value,
                      index
                    )
                  }
                />
                <Field
                  as="textarea"
                  label="Description"
                  rows={3}
                  className="sm:col-span-2"
                  placeholder="What did you build or own here?"
                  value={exp.description}
                  onChange={(e) =>
                    handleChange(
                      "experience",
                      "description",
                      e.target.value,
                      index
                    )
                  }
                />
              </EntryCard>
            ))}
            <AddButton
              onClick={() => addEntry("experience", emptyExperience)}
              label="Add experience"
            />
          </div>
        </SectionCard>

        <SectionCard
          id="projects"
          tag="05"
          icon={FolderGit2}
          title="Projects"
          hint={`${resume.projects.length} ${
            resume.projects.length === 1 ? "entry" : "entries"
          }`}
          innerRef={(el) => (refs.current.projects = el)}
        >
          <div className="space-y-3">
            {resume.projects.map((project, index) => (
              <EntryCard
                key={index}
                index={index}
                onRemove={() => removeEntry("projects", index)}
              >
                <Field
                  label="Project Title"
                  placeholder="Project name"
                  value={project.title}
                  onChange={(e) =>
                    handleChange("projects", "title", e.target.value, index)
                  }
                />
                <Field
                  label="Technologies"
                  placeholder="React, Node.js, MongoDB"
                  value={project.technologies}
                  onChange={(e) =>
                    handleChange(
                      "projects",
                      "technologies",
                      e.target.value,
                      index
                    )
                  }
                />
                <Field
                  label="GitHub"
                  icon={FaGithub}
                  placeholder="github.com/user/repo"
                  value={project.github}
                  onChange={(e) =>
                    handleChange("projects", "github", e.target.value, index)
                  }
                />
                <Field
                  label="Live URL"
                  icon={Globe}
                  placeholder="project.live"
                  value={project.liveUrl}
                  onChange={(e) =>
                    handleChange("projects", "liveUrl", e.target.value, index)
                  }
                />
                <Field
                  as="textarea"
                  label="Description"
                  rows={3}
                  className="sm:col-span-2"
                  placeholder="What does it do, and what did you build?"
                  value={project.description}
                  onChange={(e) =>
                    handleChange(
                      "projects",
                      "description",
                      e.target.value,
                      index
                    )
                  }
                />
              </EntryCard>
            ))}
            <AddButton
              onClick={() => addEntry("projects", emptyProject)}
              label="Add project"
            />
          </div>
        </SectionCard>

        <SectionCard
          id="skills"
          tag="06"
          icon={Sparkles}
          title="Skills"
          hint="Comma-separated"
          innerRef={(el) => (refs.current.skills = el)}
        >
          <Field
            label="Skills"
            placeholder="JavaScript, React, Node.js"
            value={skillsValue.join(", ")}
            onChange={(e) =>
              handleChange(
                "skills",
                null,
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
          {skillsValue.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skillsValue.map((skill, i) => (
                <span
                  key={i}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          id="certifications"
          tag="07"
          icon={Award}
          title="Certifications"
          hint={`${resume.certifications.length} ${
            resume.certifications.length === 1 ? "entry" : "entries"
          }`}
          innerRef={(el) => (refs.current.certifications = el)}
        >
          <div className="space-y-3">
            {resume.certifications.map((cert, index) => (
              <EntryCard
                key={index}
                index={index}
                onRemove={() => removeEntry("certifications", index)}
              >
                <Field
                  label="Certification"
                  placeholder="Certification name"
                  value={cert.name}
                  onChange={(e) =>
                    handleChange(
                      "certifications",
                      "name",
                      e.target.value,
                      index
                    )
                  }
                />
                <Field
                  label="Issuer"
                  placeholder="Issuing organization"
                  value={cert.issuer}
                  onChange={(e) =>
                    handleChange(
                      "certifications",
                      "issuer",
                      e.target.value,
                      index
                    )
                  }
                />
                <Field
                  label="Date"
                  type="date"
                  value={cert.date}
                  onChange={(e) =>
                    handleChange(
                      "certifications",
                      "date",
                      e.target.value,
                      index
                    )
                  }
                />
              </EntryCard>
            ))}
            <AddButton
              onClick={() => addEntry("certifications", emptyCertification)}
              label="Add certification"
            />
          </div>
        </SectionCard>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 py-3.5 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/20 active:bg-red-800"
        >
          <Send className="h-4 w-4 shrink-0" />
          Save Resume
        </button>
      </form>
    </div>
  );
};

export default ResumeForm;
