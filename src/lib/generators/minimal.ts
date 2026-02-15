import { ResumeData } from "@/types/resume";
import { e, hasContent } from "./shared";

export function generateMinimalHTML(data: ResumeData): string {
  const c = hasContent(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e(data.name)} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #1a1a2e; background: #fafafa; line-height: 1.7; }
    .container { max-width: 800px; margin: 0 auto; padding: 60px 40px; }
    header { text-align: center; margin-bottom: 50px; }
    h1 { font-size: 2.5rem; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
    .title { font-size: 1.1rem; color: #666; font-style: italic; margin-bottom: 20px; }
    .contact { font-size: 0.85rem; color: #888; }
    .contact span { margin: 0 8px; }
    .contact a { color: #888; text-decoration: none; }
    .contact a:hover { color: #1a1a2e; }
    .divider { width: 60px; height: 1px; background: #1a1a2e; margin: 30px auto; }
    section { margin-bottom: 40px; }
    h2 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
    .summary { font-size: 1rem; color: #444; text-align: center; max-width: 600px; margin: 0 auto 40px; }
    .exp-item, .edu-item, .proj-item { margin-bottom: 25px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 4px; }
    .company { font-weight: 600; font-size: 1rem; }
    .date { color: #888; font-size: 0.85rem; }
    .position { color: #555; font-size: 0.95rem; font-style: italic; margin-bottom: 8px; }
    ul { padding-left: 20px; }
    li { font-size: 0.9rem; color: #555; margin-bottom: 4px; }
    .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { font-size: 0.85rem; color: #555; padding: 4px 12px; border: 1px solid #ddd; border-radius: 2px; }
    .edu-school { font-weight: 600; }
    .edu-degree { color: #555; font-style: italic; }
    .proj-name { font-weight: 600; }
    .proj-name a { color: #1a1a2e; text-decoration: none; }
    .proj-name a:hover { text-decoration: underline; }
    .proj-tech { font-size: 0.8rem; color: #888; margin-top: 4px; }
    .cert-item, .lang-item { font-size: 0.9rem; color: #555; margin-bottom: 4px; }
    @media (max-width: 600px) {
      .container { padding: 30px 20px; }
      h1 { font-size: 1.8rem; }
      .exp-header { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${e(data.name)}</h1>
      ${data.title ? `<div class="title">${e(data.title)}</div>` : ""}
      <div class="contact">
        ${data.email ? `<a href="mailto:${e(data.email)}">${e(data.email)}</a>` : ""}
        ${data.phone ? `<span>|</span>${e(data.phone)}` : ""}
        ${data.location ? `<span>|</span>${e(data.location)}` : ""}
      </div>
      <div class="contact" style="margin-top:6px">
        ${data.website ? `<a href="${e(data.website)}" target="_blank">${e(data.website)}</a>` : ""}
        ${data.linkedin ? `<span>|</span><a href="https://${e(data.linkedin)}" target="_blank">${e(data.linkedin)}</a>` : ""}
        ${data.github ? `<span>|</span><a href="https://${e(data.github)}" target="_blank">${e(data.github)}</a>` : ""}
      </div>
    </header>

    <div class="divider"></div>

    ${c.hasSummary ? `<p class="summary">${e(data.summary)}</p>` : ""}

    ${c.hasExperience ? `
    <section>
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
    </section>` : ""}

    ${c.hasEducation ? `
    <section>
      <h2>Education</h2>
      ${data.education.map((edu) => `
        <div class="edu-item">
          <div class="exp-header">
            <span class="edu-school">${e(edu.school)}</span>
            <span class="date">${e(edu.startDate)} - ${e(edu.endDate)}</span>
          </div>
          <div class="edu-degree">${e(edu.degree)}${edu.field ? ` in ${e(edu.field)}` : ""}${edu.gpa ? ` | GPA: ${e(edu.gpa)}` : ""}</div>
        </div>
      `).join("")}
    </section>` : ""}

    ${c.hasSkills ? `
    <section>
      <h2>Skills</h2>
      <div class="skills-list">
        ${data.skills.map((s) => `<span class="skill">${e(s)}</span>`).join("")}
      </div>
    </section>` : ""}

    ${c.hasProjects ? `
    <section>
      <h2>Projects</h2>
      ${data.projects.map((p) => `
        <div class="proj-item">
          <div class="proj-name">${p.link ? `<a href="${e(p.link)}" target="_blank">${e(p.name)}</a>` : e(p.name)}</div>
          <div style="font-size:0.9rem;color:#555">${e(p.description)}</div>
          ${p.technologies.length > 0 ? `<div class="proj-tech">${p.technologies.map((t) => e(t)).join(" · ")}</div>` : ""}
        </div>
      `).join("")}
    </section>` : ""}

    ${c.hasCertifications ? `
    <section>
      <h2>Certifications</h2>
      ${data.certifications.map((cert) => `<div class="cert-item">${e(cert)}</div>`).join("")}
    </section>` : ""}

    ${c.hasLanguages ? `
    <section>
      <h2>Languages</h2>
      ${data.languages.map((lang) => `<span class="lang-item">${e(lang)}</span>`).join(" · ")}
    </section>` : ""}
  </div>
</body>
</html>`;
}
