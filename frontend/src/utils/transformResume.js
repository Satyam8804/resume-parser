export const toBackendPayload = (resume) => {
  return {
    name: resume.personal.fullName,
    email: resume.personal.email,
    phone: resume.personal.phone || null,
    linkedin: resume.personal.linkedin || null,
    github: resume.personal.github || null,
    portfolio: resume.personal.portfolio || null,
    summary: resume.summary,
    total_experience: resume.experience.length
      ? Number(
          resume.experience
            .reduce((sum, e) => sum + (Number(e.years_of_experience) || 0), 0)
            .toFixed(1)
        )
      : null,
    experiences: resume.experience.map((exp) => ({
      companyName: exp.companyName,
      role: exp.role,
      description: exp.description,
      start_date: null,
      end_date: null,
      years_of_experience: exp.years_of_experience
        ? Number(exp.years_of_experience)
        : null,
    })),
    education: resume.education.map((edu) => {
      let year = null;
      if (edu.year) {
        const yearStr = String(edu.year);
        const match = yearStr.match(/\d{4}/);
        year = match ? parseInt(match[0], 10) : parseInt(yearStr, 10);
        if (isNaN(year)) year = null;
      }
      return {
        degree: edu.degree,
        college: edu.college,
        fieldOfStudy: edu.fieldOfStudy,
        year,
        cgpa: edu.cgpa ? parseFloat(edu.cgpa) : null,
      };
    }),
    projects: resume.projects.map((p) => ({
      title: p.title,
      technologies: Array.isArray(p.technologies)
        ? p.technologies
        : (p.technologies || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      description: p.description,
    })),
    certifications: resume.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      date: c.date || null,
    })),
    skills: resume.skills.map((s) => ({ name: s })),
  };
};
