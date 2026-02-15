import { ResumeData } from "@/types/resume";
import { e, hasContent } from "./shared";

export function generateProfessionalHTML(data: ResumeData): string {
  const c = hasContent(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e(data.name)} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; background: #f0fdfa; line-height: 1.6; }
    .page { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; }
    .sidebar { background: linear-gradient(180deg, #0f766e, #134e4a); color: white; padding: 40px 24px; }
    .sidebar h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
    .sidebar .title { font-size: 0.95rem; opacity: 0.8; margin-bottom: 24px; }
    .sidebar h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; opacity: 0.6; margin-bottom: 12px; margin-top: 24px; }
    .sidebar .contact-item { font-size: 0.85rem; margin-bottom: 8px; opacity: 0.9; }
    .sidebar .contact-item a { color: white; text-decoration: none; }
    .sidebar .contact-item a:hover { text-decoration: underline; }
    .sidebar .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .sidebar .skill-tag { background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; }
    .sidebar .lang-item { font-size: 0.85rem; opacity: 0.9; margin-bottom: 4px; }
    .sidebar .cert-item { font-size: 0.8rem; opacity: 0.85; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .main-content { padding: 40px; }
    .main-content h2 { font-size: 1.2rem; color: #0f766e; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px; border-bottom: 2px solid #0f766e; margin-bottom: 20px; }
    section { margin-bottom: 36px; }
    .summary { font-size: 1rem; color: #444; line-height: 1.8; }
    .exp-item { margin-bottom: 24px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; }
    .company { font-weight: 700; font-size: 1.05rem; color: #0f766e; }
    .date { color: #888; font-size: 0.85rem; }
    .position { font-weight: 500; color: #333; margin: 2px 0 8px; }
    ul { padding-left: 18px; }
    li { color: #555; font-size: 0.9rem; margin-bottom: 4px; }
    .edu-item { margin-bottom: 16px; }
    .edu-school { font-weight: 700; color: #0f766e; }
    .edu-degree { color: #555; }
    .edu-date { font-size: 0.85rem; color: #888; }
    .proj-item { background: #f0fdfa; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 3px solid #0f766e; }
    .proj-name { font-weight: 700; }
    .proj-name a { color: #0f766e; text-decoration: none; }
    .proj-name a:hover { text-decoration: underline; }
    .proj-desc { color: #555; font-size: 0.9rem; margin: 4px 0; }
    .proj-tech { font-size: 0.8rem; color: #0f766e; }
    @media (max-width: 768px) {
      .page { grid-template-columns: 1fr; }
      .sidebar { padding: 30px 20px; }
      .main-content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <h1>${e(data.name)}</h1>
      ${data.title ? `<div class="title">${e(data.title)}</div>` : ""}

      <h3>Contact</h3>
      ${data.email ? `<div class="contact-item"><a href="mailto:${e(data.email)}">${e(data.email)}</a></div>` : ""}
      ${data.phone ? `<div class="contact-item">${e(data.phone)}</div>` : ""}
      ${data.location ? `<div class="contact-item">${e(data.location)}</div>` : ""}
      ${data.website ? `<div class="contact-item"><a href="${e(data.website)}" target="_blank">Website</a></div>` : ""}
      ${data.linkedin ? `<div class="contact-item"><a href="https://${e(data.linkedin)}" target="_blank">LinkedIn</a></div>` : ""}
      ${data.github ? `<div class="contact-item"><a href="https://${e(data.github)}" target="_blank">GitHub</a></div>` : ""}

      ${c.hasSkills ? `
      <h3>Skills</h3>
      <div class="skills-list">
        ${data.skills.map((s) => `<span class="skill-tag">${e(s)}</span>`).join("")}
      </div>` : ""}

      ${c.hasLanguages ? `
      <h3>Languages</h3>
      ${data.languages.map((l) => `<div class="lang-item">${e(l)}</div>`).join("")}` : ""}

      ${c.hasCertifications ? `
      <h3>Certifications</h3>
      ${data.certifications.map((cert) => `<div class="cert-item">${e(cert)}</div>`).join("")}` : ""}
    </aside>

    <div class="main-content">
      ${c.hasSummary ? `
      <section>
        <h2>Professional Summary</h2>
        <p class="summary">${e(data.summary)}</p>
      </section>` : ""}

      ${c.hasExperience ? `
      <section>
        <h2>Professional Experience</h2>
        ${data.experience.map((exp) => `
          <div class="exp-item">
            <div class="exp-header">
              <span class="company">${e(exp.company)}</span>
              <span class="date">${e(exp.startDate)} - ${e(exp.endDate)}</span>
            </div>
            <div class="position">${e(exp.position)}</div>
            ${exp.description.length > 0 ? `<ul>${exp.description.map((d) => `<li>${e(d)}</li>`).join("")}</ul>` : ""}
          </div>
        `).join("")}
      </section>` : ""}

      ${c.hasEducation ? `
      <section>
        <h2>Education</h2>
        ${data.education.map((edu) => `
          <div class="edu-item">
            <div class="edu-school">${e(edu.school)}</div>
            <div class="edu-degree">${e(edu.degree)}${edu.field ? ` in ${e(edu.field)}` : ""}</div>
            <div class="edu-date">${e(edu.startDate)} - ${e(edu.endDate)}${edu.gpa ? ` | GPA: ${e(edu.gpa)}` : ""}</div>
          </div>
        `).join("")}
      </section>` : ""}

      ${c.hasProjects ? `
      <section>
        <h2>Projects</h2>
        ${data.projects.map((p) => `
          <div class="proj-item">
            <div class="proj-name">${p.link ? `<a href="${e(p.link)}" target="_blank">${e(p.name)}</a>` : e(p.name)}</div>
            <div class="proj-desc">${e(p.description)}</div>
            ${p.technologies.length > 0 ? `<div class="proj-tech">${p.technologies.map((t) => e(t)).join(" · ")}</div>` : ""}
          </div>
        `).join("")}
      </section>` : ""}
    </div>
  </div>
</body>
</html>`;
}
