import { ResumeData } from "@/types/resume";
import { e, hasContent } from "./shared";

export function generateDeveloperHTML(data: ResumeData): string {
  const c = hasContent(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e(data.name)} - Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Inter:wght@400;500;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; color: #d4d4d4; background: #0d1117; line-height: 1.6; }
    .container { max-width: 960px; margin: 0 auto; padding: 40px 20px; }
    .header { margin-bottom: 40px; }
    .terminal-bar { background: #161b22; border-radius: 8px 8px 0 0; padding: 10px 16px; display: flex; align-items: center; gap: 8px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot.red { background: #ff5f57; }
    .dot.yellow { background: #febc2e; }
    .dot.green { background: #28c840; }
    .terminal-title { color: #8b949e; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; margin-left: auto; }
    .terminal-body { background: #0d1117; border: 1px solid #30363d; border-top: none; border-radius: 0 0 8px 8px; padding: 24px; font-family: 'JetBrains Mono', monospace; }
    .prompt { color: #22c55e; }
    .flag { color: #f97316; }
    .value { color: #58a6ff; }
    .comment { color: #8b949e; }
    h1 { font-family: 'JetBrains Mono', monospace; font-size: 2rem; color: #22c55e; margin-bottom: 4px; }
    .title-line { font-size: 1rem; color: #8b949e; margin-bottom: 12px; }
    .contact-line { font-size: 0.85rem; color: #8b949e; }
    .contact-line a { color: #58a6ff; text-decoration: none; }
    .contact-line a:hover { text-decoration: underline; }
    section { margin-bottom: 32px; }
    h2 { font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: #22c55e; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #21262d; }
    h2::before { content: '## '; color: #484f58; }
    .summary { color: #8b949e; font-size: 0.95rem; padding: 16px; background: #161b22; border-radius: 8px; border-left: 3px solid #22c55e; }
    .card { background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
    .card:hover { border-color: #30363d; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; }
    .company { font-weight: 700; color: #e6edf3; font-size: 1rem; }
    .date { font-family: 'JetBrains Mono', monospace; color: #22c55e; font-size: 0.8rem; background: rgba(34,197,94,0.1); padding: 2px 8px; border-radius: 4px; }
    .position { color: #8b949e; font-size: 0.9rem; margin: 4px 0 10px; }
    ul { padding-left: 18px; }
    li { color: #8b949e; font-size: 0.85rem; margin-bottom: 4px; }
    li::marker { color: #22c55e; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-chip { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; padding: 4px 12px; border-radius: 4px; border: 1px solid #21262d; background: #161b22; color: #22c55e; }
    .skill-chip:nth-child(3n+2) { color: #58a6ff; }
    .skill-chip:nth-child(3n) { color: #f97316; }
    .edu-school { font-weight: 700; color: #e6edf3; }
    .edu-degree { color: #8b949e; font-size: 0.9rem; }
    .proj-card { background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .proj-name { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #e6edf3; }
    .proj-name a { color: #58a6ff; text-decoration: none; }
    .proj-name a:hover { text-decoration: underline; }
    .proj-desc { color: #8b949e; font-size: 0.85rem; margin: 4px 0; }
    .proj-tech { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .proj-tech span { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #f97316; background: rgba(249,115,22,0.1); padding: 2px 8px; border-radius: 4px; }
    .cert-item { color: #8b949e; font-size: 0.85rem; margin-bottom: 6px; padding-left: 16px; position: relative; }
    .cert-item::before { content: '>'; position: absolute; left: 0; color: #22c55e; font-family: 'JetBrains Mono', monospace; }
    .lang-list { color: #8b949e; font-size: 0.9rem; }
    @media (max-width: 600px) {
      .container { padding: 20px 12px; }
      h1 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="terminal-bar">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
        <span class="terminal-title">resume.sh</span>
      </div>
      <div class="terminal-body">
        <div><span class="prompt">$</span> cat <span class="flag">--name</span></div>
        <h1>${e(data.name)}</h1>
        ${data.title ? `<div class="title-line"><span class="comment">// ${e(data.title)}</span></div>` : ""}
        <div style="margin-top: 12px">
          <div><span class="prompt">$</span> cat <span class="flag">--contact</span></div>
          <div class="contact-line">
            ${data.email ? `<span class="flag">email</span>=<a href="mailto:${e(data.email)}">"${e(data.email)}"</a>` : ""}
            ${data.phone ? ` <span class="flag">phone</span>="<span class="value">${e(data.phone)}</span>"` : ""}
          </div>
          <div class="contact-line">
            ${data.location ? `<span class="flag">location</span>="<span class="value">${e(data.location)}</span>"` : ""}
            ${data.linkedin ? ` <span class="flag">linkedin</span>=<a href="https://${e(data.linkedin)}" target="_blank">"${e(data.linkedin)}"</a>` : ""}
            ${data.github ? ` <span class="flag">github</span>=<a href="https://${e(data.github)}" target="_blank">"${e(data.github)}"</a>` : ""}
          </div>
        </div>
      </div>
    </div>

    ${c.hasSummary ? `
    <section>
      <h2>About</h2>
      <div class="summary">${e(data.summary)}</div>
    </section>` : ""}

    ${c.hasExperience ? `
    <section>
      <h2>Experience</h2>
      ${data.experience.map((exp) => `
        <div class="card">
          <div class="exp-header">
            <span class="company">${e(exp.company)}</span>
            <span class="date">${e(exp.startDate)} - ${e(exp.endDate)}</span>
          </div>
          <div class="position">${e(exp.position)}</div>
          ${exp.description.length > 0 ? `<ul>${exp.description.map((d) => `<li>${e(d)}</li>`).join("")}</ul>` : ""}
        </div>
      `).join("")}
    </section>` : ""}

    ${c.hasSkills ? `
    <section>
      <h2>Tech Stack</h2>
      <div class="skills-grid">
        ${data.skills.map((s) => `<span class="skill-chip">${e(s)}</span>`).join("")}
      </div>
    </section>` : ""}

    ${c.hasEducation ? `
    <section>
      <h2>Education</h2>
      ${data.education.map((edu) => `
        <div class="card">
          <div class="exp-header">
            <span class="edu-school">${e(edu.school)}</span>
            <span class="date">${e(edu.startDate)} - ${e(edu.endDate)}</span>
          </div>
          <div class="edu-degree">${e(edu.degree)}${edu.field ? ` in ${e(edu.field)}` : ""}${edu.gpa ? ` | GPA: ${e(edu.gpa)}` : ""}</div>
        </div>
      `).join("")}
    </section>` : ""}

    ${c.hasProjects ? `
    <section>
      <h2>Projects</h2>
      ${data.projects.map((p) => `
        <div class="proj-card">
          <div class="proj-name">${p.link ? `<a href="${e(p.link)}" target="_blank">${e(p.name)}</a>` : e(p.name)}</div>
          <div class="proj-desc">${e(p.description)}</div>
          ${p.technologies.length > 0 ? `<div class="proj-tech">${p.technologies.map((t) => `<span>${e(t)}</span>`).join("")}</div>` : ""}
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
      <div class="lang-list">${data.languages.map((l) => e(l)).join(" · ")}</div>
    </section>` : ""}
  </div>
</body>
</html>`;
}
