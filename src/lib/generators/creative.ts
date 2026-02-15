import { ResumeData } from "@/types/resume";
import { e, hasContent } from "./shared";

export function generateCreativeHTML(data: ResumeData): string {
  const c = hasContent(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e(data.name)} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.6; }
    .hero { position: relative; min-height: 50vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #fbbf24 100%); color: white; overflow: hidden; }
    .hero::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.07'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
    .hero-content { position: relative; text-align: center; padding: 60px 20px; }
    .hero h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
    .hero .title { font-size: 1.4rem; font-weight: 300; opacity: 0.95; margin-bottom: 20px; }
    .hero .contact { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; font-size: 0.9rem; }
    .hero .contact a { color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; backdrop-filter: blur(4px); }
    .hero .contact a:hover { background: rgba(255,255,255,0.3); }
    .wave { height: 80px; background: white; margin-top: -40px; position: relative; z-index: 1; }
    .wave::before { content: ''; display: block; height: 80px; background: linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #fbbf24 100%); clip-path: ellipse(55% 70% at 50% 0%); }
    main { max-width: 900px; margin: 0 auto; padding: 0 20px 60px; }
    section { margin-bottom: 50px; }
    h2 { font-size: 1.8rem; font-weight: 700; margin-bottom: 24px; background: linear-gradient(135deg, #f43f5e, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .summary { font-size: 1.15rem; color: #555; max-width: 700px; line-height: 1.8; }
    .timeline { position: relative; padding-left: 30px; }
    .timeline::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(to bottom, #f43f5e, #fbbf24); border-radius: 2px; }
    .timeline-item { position: relative; margin-bottom: 30px; }
    .timeline-item::before { content: ''; position: absolute; left: -34px; top: 6px; width: 12px; height: 12px; background: #f43f5e; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #f43f5e; }
    .company { font-weight: 700; font-size: 1.1rem; }
    .meta { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
    .date { color: #f43f5e; font-weight: 600; font-size: 0.85rem; }
    .position { color: #777; font-style: italic; margin: 2px 0 8px; }
    ul { padding-left: 18px; }
    li { color: #555; margin-bottom: 4px; font-size: 0.9rem; }
    .skills-cloud { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-bubble { padding: 8px 20px; border-radius: 25px; font-size: 0.9rem; font-weight: 500; color: white; background: linear-gradient(135deg, #f43f5e, #fb923c); box-shadow: 0 2px 8px rgba(244,63,94,0.3); transition: transform 0.2s; }
    .skill-bubble:hover { transform: scale(1.05); }
    .skill-bubble:nth-child(3n+1) { background: linear-gradient(135deg, #f43f5e, #e11d48); }
    .skill-bubble:nth-child(3n+2) { background: linear-gradient(135deg, #fb923c, #ea580c); }
    .skill-bubble:nth-child(3n) { background: linear-gradient(135deg, #fbbf24, #d97706); }
    .edu-card { background: linear-gradient(135deg, #fff7ed, #fef2f2); padding: 20px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid #f43f5e; }
    .edu-school { font-weight: 700; font-size: 1.05rem; }
    .edu-degree { color: #666; }
    .proj-card { padding: 20px; border-radius: 12px; margin-bottom: 16px; background: #fafafa; border: 1px solid #eee; transition: box-shadow 0.2s; }
    .proj-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .proj-name { font-weight: 700; font-size: 1rem; }
    .proj-name a { color: #f43f5e; text-decoration: none; }
    .proj-name a:hover { text-decoration: underline; }
    .proj-desc { color: #555; font-size: 0.9rem; margin: 4px 0; }
    .proj-tech { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .proj-tech span { font-size: 0.75rem; background: #fce7f3; color: #be185d; padding: 2px 10px; border-radius: 10px; }
    .cert-item { padding: 8px 0; font-size: 0.9rem; color: #555; border-bottom: 1px dashed #eee; }
    @media (max-width: 600px) {
      .hero h1 { font-size: 2.2rem; }
      main { padding: 0 16px 40px; }
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="hero-content">
      <h1>${e(data.name)}</h1>
      ${data.title ? `<div class="title">${e(data.title)}</div>` : ""}
      <div class="contact">
        ${data.email ? `<a href="mailto:${e(data.email)}">${e(data.email)}</a>` : ""}
        ${data.phone ? `<a href="tel:${e(data.phone)}">${e(data.phone)}</a>` : ""}
        ${data.location ? `<a href="#">${e(data.location)}</a>` : ""}
        ${data.linkedin ? `<a href="https://${e(data.linkedin)}" target="_blank">LinkedIn</a>` : ""}
        ${data.github ? `<a href="https://${e(data.github)}" target="_blank">GitHub</a>` : ""}
      </div>
    </div>
  </div>
  <div class="wave"></div>

  <main>
    ${c.hasSummary ? `
    <section>
      <h2>Hello!</h2>
      <p class="summary">${e(data.summary)}</p>
    </section>` : ""}

    ${c.hasExperience ? `
    <section>
      <h2>Where I've Worked</h2>
      <div class="timeline">
        ${data.experience.map((exp) => `
          <div class="timeline-item">
            <div class="meta">
              <span class="company">${e(exp.company)}</span>
              <span class="date">${e(exp.startDate)} - ${e(exp.endDate)}</span>
            </div>
            <div class="position">${e(exp.position)}</div>
            ${exp.description.length > 0 ? `<ul>${exp.description.map((d) => `<li>${e(d)}</li>`).join("")}</ul>` : ""}
          </div>
        `).join("")}
      </div>
    </section>` : ""}

    ${c.hasSkills ? `
    <section>
      <h2>What I Know</h2>
      <div class="skills-cloud">
        ${data.skills.map((s) => `<span class="skill-bubble">${e(s)}</span>`).join("")}
      </div>
    </section>` : ""}

    ${c.hasEducation ? `
    <section>
      <h2>Education</h2>
      ${data.education.map((edu) => `
        <div class="edu-card">
          <div class="edu-school">${e(edu.school)}</div>
          <div class="edu-degree">${e(edu.degree)}${edu.field ? ` in ${e(edu.field)}` : ""}</div>
          <div style="font-size:0.85rem;color:#f43f5e">${e(edu.startDate)} - ${e(edu.endDate)}${edu.gpa ? ` | GPA: ${e(edu.gpa)}` : ""}</div>
        </div>
      `).join("")}
    </section>` : ""}

    ${c.hasProjects ? `
    <section>
      <h2>Things I've Built</h2>
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
      <p style="color:#555">${data.languages.map((l) => e(l)).join(" · ")}</p>
    </section>` : ""}
  </main>
</body>
</html>`;
}
