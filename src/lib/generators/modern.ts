import { ResumeData } from "@/types/resume";
import { e, hasContent } from "./shared";

export function generateModernHTML(data: ResumeData): string {
  const c = hasContent(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e(data.name)} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; background: #f8fafc; line-height: 1.6; }
    .hero { background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); color: white; padding: 60px 40px; text-align: center; }
    .hero h1 { font-size: 3rem; font-weight: 700; margin-bottom: 8px; }
    .hero .title { font-size: 1.3rem; opacity: 0.9; margin-bottom: 20px; }
    .hero .contact { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 0.9rem; opacity: 0.85; }
    .hero .contact a { color: white; text-decoration: none; }
    .hero .contact a:hover { text-decoration: underline; }
    .container { max-width: 900px; margin: -30px auto 40px; padding: 0 20px; }
    .card { background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h2 { font-size: 1.3rem; color: #6366f1; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    h2::before { content: ''; width: 4px; height: 24px; background: linear-gradient(to bottom, #6366f1, #a855f7); border-radius: 2px; }
    .summary { font-size: 1.05rem; color: #475569; }
    .exp-item { margin-bottom: 24px; padding-left: 20px; border-left: 2px solid #e2e8f0; }
    .exp-item:hover { border-left-color: #6366f1; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; }
    .company { font-weight: 700; font-size: 1.1rem; color: #1e293b; }
    .date { color: #6366f1; font-size: 0.85rem; font-weight: 600; background: #eef2ff; padding: 2px 10px; border-radius: 12px; }
    .position { color: #64748b; font-size: 0.95rem; margin: 4px 0 8px; }
    ul { padding-left: 18px; }
    li { font-size: 0.9rem; color: #475569; margin-bottom: 4px; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { background: linear-gradient(135deg, #eef2ff, #e0e7ff); color: #4338ca; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
    .edu-item { margin-bottom: 16px; }
    .edu-school { font-weight: 700; font-size: 1.05rem; }
    .edu-degree { color: #64748b; }
    .proj-item { margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px; }
    .proj-name { font-weight: 700; font-size: 1rem; }
    .proj-name a { color: #6366f1; text-decoration: none; }
    .proj-name a:hover { text-decoration: underline; }
    .proj-desc { font-size: 0.9rem; color: #475569; margin: 4px 0; }
    .proj-tech { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .proj-tech span { font-size: 0.75rem; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 8px; }
    .cert-item { font-size: 0.9rem; color: #475569; margin-bottom: 6px; padding-left: 16px; position: relative; }
    .cert-item::before { content: '✓'; position: absolute; left: 0; color: #6366f1; font-weight: bold; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 600px) {
      .hero { padding: 40px 20px; }
      .hero h1 { font-size: 2rem; }
      .card { padding: 20px; }
      .two-col { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${e(data.name)}</h1>
    ${data.title ? `<div class="title">${e(data.title)}</div>` : ""}
    <div class="contact">
      ${data.email ? `<a href="mailto:${e(data.email)}">${e(data.email)}</a>` : ""}
      ${data.phone ? `<span>${e(data.phone)}</span>` : ""}
      ${data.location ? `<span>${e(data.location)}</span>` : ""}
      ${data.linkedin ? `<a href="https://${e(data.linkedin)}" target="_blank">LinkedIn</a>` : ""}
      ${data.github ? `<a href="https://${e(data.github)}" target="_blank">GitHub</a>` : ""}
    </div>
  </div>

  <div class="container">
    ${c.hasSummary ? `
    <div class="card">
      <h2>About Me</h2>
      <p class="summary">${e(data.summary)}</p>
    </div>` : ""}

    ${c.hasExperience ? `
    <div class="card">
      <h2>Experience</h2>
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
    </div>` : ""}

    <div class="two-col">
      ${c.hasEducation ? `
      <div class="card">
        <h2>Education</h2>
        ${data.education.map((edu) => `
          <div class="edu-item">
            <div class="edu-school">${e(edu.school)}</div>
            <div class="edu-degree">${e(edu.degree)}${edu.field ? ` in ${e(edu.field)}` : ""}</div>
            <div style="font-size:0.85rem;color:#6366f1">${e(edu.startDate)} - ${e(edu.endDate)}${edu.gpa ? ` | GPA: ${e(edu.gpa)}` : ""}</div>
          </div>
        `).join("")}
      </div>` : ""}

      ${c.hasCertifications || c.hasLanguages ? `
      <div class="card">
        ${c.hasCertifications ? `
          <h2>Certifications</h2>
          ${data.certifications.map((cert) => `<div class="cert-item">${e(cert)}</div>`).join("")}
        ` : ""}
        ${c.hasLanguages ? `
          <h2 style="margin-top:${c.hasCertifications ? "20px" : "0"}">Languages</h2>
          <p style="color:#475569;font-size:0.9rem">${data.languages.map((l) => e(l)).join(" · ")}</p>
        ` : ""}
      </div>` : ""}
    </div>

    ${c.hasSkills ? `
    <div class="card">
      <h2>Skills</h2>
      <div class="skills-grid">
        ${data.skills.map((s) => `<span class="skill-tag">${e(s)}</span>`).join("")}
      </div>
    </div>` : ""}

    ${c.hasProjects ? `
    <div class="card">
      <h2>Projects</h2>
      ${data.projects.map((p) => `
        <div class="proj-item">
          <div class="proj-name">${p.link ? `<a href="${e(p.link)}" target="_blank">${e(p.name)}</a>` : e(p.name)}</div>
          <div class="proj-desc">${e(p.description)}</div>
          ${p.technologies.length > 0 ? `<div class="proj-tech">${p.technologies.map((t) => `<span>${e(t)}</span>`).join("")}</div>` : ""}
        </div>
      `).join("")}
    </div>` : ""}
  </div>
</body>
</html>`;
}
