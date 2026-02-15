import { ResumeData } from "@/types/resume";

export function parseResumeText(text: string): ResumeData {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const resume: ResumeData = {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
  };

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) resume.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  if (phoneMatch) resume.phone = phoneMatch[0].trim();

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) resume.linkedin = linkedinMatch[0];

  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) resume.github = githubMatch[0];

  // Extract website
  const websiteMatch = text.match(/https?:\/\/(?!.*(?:linkedin|github))[\w.-]+\.[\w.-]+/i);
  if (websiteMatch) resume.website = websiteMatch[0];

  // Name is typically the first meaningful line
  if (lines.length > 0) {
    resume.name = lines[0].length <= 60 ? lines[0] : lines[0].substring(0, 60);
  }

  // Find sections
  const sectionPatterns: Record<string, RegExp> = {
    summary: /^(summary|profile|about|objective|overview)/i,
    experience: /^(experience|work|employment|professional\s+experience|work\s+history)/i,
    education: /^(education|academic|school|university)/i,
    skills: /^(skills|technical\s+skills|technologies|competencies|expertise)/i,
    projects: /^(projects|portfolio|personal\s+projects)/i,
    certifications: /^(certifications?|certificates?|licenses?)/i,
    languages: /^(languages?|language\s+skills)/i,
  };

  type Section = keyof typeof sectionPatterns;
  const sections: { type: Section; startIdx: number }[] = [];

  lines.forEach((line, idx) => {
    for (const [type, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line.replace(/[:\-|]/g, "").trim())) {
        sections.push({ type: type as Section, startIdx: idx });
        break;
      }
    }
  });

  // Sort sections by their appearance
  sections.sort((a, b) => a.startIdx - b.startIdx);

  // Detect title (usually the line after the name, before first section)
  const firstSectionIdx = sections.length > 0 ? sections[0].startIdx : lines.length;
  for (let i = 1; i < Math.min(firstSectionIdx, 5); i++) {
    const line = lines[i];
    if (
      line &&
      !line.includes("@") &&
      !line.match(/\d{3}/) &&
      !line.match(/linkedin|github|http/i) &&
      line.length > 3 &&
      line.length < 80
    ) {
      resume.title = line;
      break;
    }
  }

  // Parse each section
  for (let s = 0; s < sections.length; s++) {
    const section = sections[s];
    const nextIdx = s + 1 < sections.length ? sections[s + 1].startIdx : lines.length;
    const sectionLines = lines.slice(section.startIdx + 1, nextIdx);

    switch (section.type) {
      case "summary":
        resume.summary = sectionLines.join(" ");
        break;

      case "skills":
        resume.skills = sectionLines
          .join(", ")
          .split(/[,;|/]/)
          .map((s) => s.replace(/^[\s\-•·]+/, "").trim())
          .filter((s) => s.length > 0 && s.length < 40);
        break;

      case "languages":
        resume.languages = sectionLines
          .join(", ")
          .split(/[,;|]/)
          .map((s) => s.replace(/^[\s\-•·]+/, "").trim())
          .filter((s) => s.length > 0);
        break;

      case "certifications":
        resume.certifications = sectionLines
          .map((s) => s.replace(/^[\s\-•·]+/, "").trim())
          .filter((s) => s.length > 0);
        break;

      case "experience":
        resume.experience = parseExperience(sectionLines);
        break;

      case "education":
        resume.education = parseEducation(sectionLines);
        break;

      case "projects":
        resume.projects = parseProjects(sectionLines);
        break;
    }
  }

  return resume;
}

function parseExperience(lines: string[]) {
  const experiences: ResumeData["experience"] = [];
  let current: ResumeData["experience"][0] | null = null;

  for (const line of lines) {
    const dateMatch = line.match(
      /(\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*[-–—to]+\s*(Present|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i
    );

    if (dateMatch && !line.startsWith("•") && !line.startsWith("-")) {
      if (current) experiences.push(current);
      current = {
        company: line.replace(dateMatch[0], "").replace(/[|,\-–—]/g, " ").trim(),
        position: "",
        startDate: dateMatch[1],
        endDate: dateMatch[2],
        description: [],
      };
    } else if (current) {
      const cleanLine = line.replace(/^[\s\-•·]+/, "").trim();
      if (cleanLine.length > 0) {
        if (!current.position && cleanLine.length < 80 && !cleanLine.includes("•")) {
          current.position = cleanLine;
        } else {
          current.description.push(cleanLine);
        }
      }
    }
  }
  if (current) experiences.push(current);
  return experiences;
}

function parseEducation(lines: string[]) {
  const education: ResumeData["education"] = [];
  let current: ResumeData["education"][0] | null = null;

  for (const line of lines) {
    const dateMatch = line.match(/(\d{4})\s*[-–—to]+\s*(\d{4}|Present)/i);

    if (dateMatch) {
      if (current) education.push(current);
      const remainder = line.replace(dateMatch[0], "").replace(/[|,\-–—]/g, " ").trim();
      current = {
        school: remainder,
        degree: "",
        field: "",
        startDate: dateMatch[1],
        endDate: dateMatch[2],
      };
    } else if (current) {
      const cleanLine = line.replace(/^[\s\-•·]+/, "").trim();
      if (cleanLine.length > 0) {
        if (!current.degree) {
          const degreeMatch = cleanLine.match(
            /(Bachelor|Master|PhD|Doctor|Associate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA)/i
          );
          if (degreeMatch) {
            current.degree = cleanLine;
          } else if (!current.field) {
            current.field = cleanLine;
          }
        }
        const gpaMatch = cleanLine.match(/GPA[:\s]*([0-9.]+)/i);
        if (gpaMatch) current.gpa = gpaMatch[1];
      }
    }
  }
  if (current) education.push(current);
  return education;
}

function parseProjects(lines: string[]) {
  const projects: ResumeData["projects"] = [];
  let current: ResumeData["projects"][0] | null = null;

  for (const line of lines) {
    const cleanLine = line.replace(/^[\s\-•·]+/, "").trim();
    if (!cleanLine) continue;

    const linkMatch = cleanLine.match(/https?:\/\/[\w.-]+[/\w.-]*/);

    if (
      cleanLine.length < 60 &&
      !cleanLine.startsWith("•") &&
      !cleanLine.startsWith("-") &&
      (projects.length === 0 || (current && current.description))
    ) {
      if (current) projects.push(current);
      current = {
        name: cleanLine,
        description: "",
        technologies: [],
        link: linkMatch ? linkMatch[0] : undefined,
      };
    } else if (current) {
      if (linkMatch) {
        current.link = linkMatch[0];
      }
      const techMatch = cleanLine.match(/(?:tech|stack|built\s+with|using)[:\s]*(.*)/i);
      if (techMatch) {
        current.technologies = techMatch[1]
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter(Boolean);
      } else {
        current.description += (current.description ? " " : "") + cleanLine;
      }
    }
  }
  if (current) projects.push(current);
  return projects;
}
