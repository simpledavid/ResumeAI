"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type TemplateId = "modern" | "classic" | "minimal";

type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  highlights: string;
};

type Education = {
  id: string;
  school: string;
  major: string;
  period: string;
  details: string;
};

type Project = {
  id: string;
  name: string;
  role: string;
  link: string;
  description: string;
};

type ResumeData = {
  fullName: string;
  headline: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  skills: string[];
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
};

type TemplateMeta = {
  id: TemplateId;
  name: string;
  subtitle: string;
  description: string;
};

const STORAGE_KEY = "resumeai.resume.editor.v1";

const TEMPLATE_LIST: TemplateMeta[] = [
  {
    id: "modern",
    name: "现代商务",
    subtitle: "双栏结构",
    description: "适合互联网和技术岗位，突出结果与技能。",
  },
  {
    id: "classic",
    name: "经典专业",
    subtitle: "传统结构",
    description: "适合校招与常规社招，信息清晰稳健。",
  },
  {
    id: "minimal",
    name: "极简作品",
    subtitle: "简洁叙事",
    description: "适合设计和创意岗位，强调项目表达。",
  },
];

const PRESETS: Record<TemplateId, ResumeData> = {
  modern: {
    fullName: "李明",
    headline: "高级前端工程师 | React / Next.js / AI",
    summary:
      "5 年 Web 开发经验，主导过企业级中后台与 AI 应用落地。擅长通过性能优化和体验设计提升转化指标。",
    email: "liming@example.com",
    phone: "138-8888-8888",
    location: "上海",
    website: "github.com/octocat",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "A/B 测试"],
    experiences: [
      {
        id: "m-e-1",
        role: "高级前端工程师",
        company: "某 AI SaaS 公司",
        period: "2022.03 - 至今",
        highlights: "负责简历产品前端架构，首屏性能提升 43%，注册转化提升 22%。",
      },
    ],
    educations: [
      {
        id: "m-ed-1",
        school: "华东理工大学",
        major: "软件工程 本科",
        period: "2016 - 2020",
        details: "主修软件工程、数据库与算法。",
      },
    ],
    projects: [
      {
        id: "m-p-1",
        name: "ResumeAI 简历平台",
        role: "前端负责人",
        link: "resumeai-dja.pages.dev",
        description: "实现模板化编辑与 Cloudflare Pages 自动部署。",
      },
    ],
  },
  classic: {
    fullName: "陈雨",
    headline: "产品经理 | B 端产品与增长",
    summary: "擅长从业务目标拆解产品路径，推进跨团队协同和复杂项目落地。",
    email: "chenyu@example.com",
    phone: "139-0000-0000",
    location: "北京",
    website: "linkedin.com",
    skills: ["需求分析", "PRD", "用户研究", "数据分析", "项目管理"],
    experiences: [
      {
        id: "c-e-1",
        role: "高级产品经理",
        company: "某企业服务公司",
        period: "2021.05 - 至今",
        highlights: "主导客户管理模块重构，续费率提升 15%。",
      },
    ],
    educations: [
      {
        id: "c-ed-1",
        school: "南京大学",
        major: "信息管理与信息系统 本科",
        period: "2015 - 2019",
        details: "连续两年奖学金，担任项目负责人。",
      },
    ],
    projects: [
      {
        id: "c-p-1",
        name: "客户成功平台升级",
        role: "项目负责人",
        link: "",
        description: "重构任务流与运营看板，提升协同效率。",
      },
    ],
  },
  minimal: {
    fullName: "王悦",
    headline: "视觉设计师 | 品牌与数字体验",
    summary: "专注品牌视觉系统与数字产品设计，平衡审美表达和业务目标。",
    email: "wangyue@example.com",
    phone: "137-7777-7777",
    location: "深圳",
    website: "dribbble.com",
    skills: ["Figma", "品牌设计", "UI 设计", "动效设计", "设计系统"],
    experiences: [
      {
        id: "n-e-1",
        role: "视觉设计师",
        company: "某消费品牌",
        period: "2021.09 - 至今",
        highlights: "建立官网设计规范，官网停留时长提升 26%。",
      },
    ],
    educations: [
      {
        id: "n-ed-1",
        school: "广州美术学院",
        major: "视觉传达设计 本科",
        period: "2017 - 2021",
        details: "毕业设计获学院优秀作品。",
      },
    ],
    projects: [
      {
        id: "n-p-1",
        name: "品牌官网改版",
        role: "主设计",
        link: "",
        description: "完成信息架构重组和视觉升级。",
      },
    ],
  },
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-slate-100 outline-none";
const areaClass =
  "w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none";

function cloneResume(data: ResumeData): ResumeData {
  return JSON.parse(JSON.stringify(data)) as ResumeData;
}

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ensureUrl(url: string) {
  const v = url.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function toSkills(text: string) {
  return Array.from(
    new Set(
      text
        .split(/[,\n，、]/)
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  );
}

function Preview({ template, resume }: { template: TemplateId; resume: ResumeData }) {
  const website = ensureUrl(resume.website);
  if (template === "modern") {
    return (
      <article className="mx-auto w-full max-w-[900px] overflow-hidden rounded-2xl bg-white text-slate-800 shadow-[0_20px_60px_rgba(8,14,28,0.16)]">
        <div className="grid md:grid-cols-[250px_1fr]">
          <aside className="bg-gradient-to-b from-[#1d355b] to-[#11203a] p-6 text-slate-100">
            <h1 className="text-3xl font-extrabold">{resume.fullName || "你的姓名"}</h1>
            <p className="mt-2 text-sm text-slate-200">{resume.headline || "职位标题"}</p>
            <p className="mt-6 text-sm">{resume.email}</p>
            <p className="text-sm">{resume.phone}</p>
            <p className="text-sm">{resume.location}</p>
            {website ? (
              <a href={website} target="_blank" rel="noreferrer" className="text-sm underline">
                {resume.website}
              </a>
            ) : null}
            <h3 className="mt-8 text-xs font-bold tracking-[0.2em] uppercase">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </aside>
          <main className="space-y-6 p-6">
            <section>
              <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Summary</h3>
              <p className="mt-2 text-sm leading-7">{resume.summary}</p>
            </section>
            <section>
              <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Experience</h3>
              <div className="mt-3 space-y-4">
                {resume.experiences.map((item) => (
                  <div key={item.id}>
                    <p className="font-semibold">{item.role} · {item.company}</p>
                    <p className="text-xs text-slate-500">{item.period}</p>
                    <p className="mt-1 text-sm leading-7">{item.highlights}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </article>
    );
  }

  if (template === "classic") {
    return (
      <article className="mx-auto w-full max-w-[900px] rounded-2xl bg-white p-8 text-slate-800 shadow-[0_20px_60px_rgba(8,14,28,0.16)]">
        <header className="border-b border-slate-200 pb-4 text-center">
          <h1 className="text-4xl font-bold">{resume.fullName || "你的姓名"}</h1>
          <p className="mt-2 text-sm">{resume.headline || "职位标题"}</p>
          <p className="mt-2 text-xs text-slate-500">{[resume.email, resume.phone, resume.location].filter(Boolean).join(" | ")}</p>
        </header>
        <section className="mt-6">
          <h3 className="border-b border-slate-200 pb-1 text-xs font-bold tracking-[0.2em] uppercase">个人简介</h3>
          <p className="mt-2 text-sm leading-7">{resume.summary}</p>
        </section>
        <section className="mt-6">
          <h3 className="border-b border-slate-200 pb-1 text-xs font-bold tracking-[0.2em] uppercase">工作经历</h3>
          <div className="mt-3 space-y-3">
            {resume.experiences.map((item) => (
              <div key={item.id}>
                <p className="font-semibold">{item.company} · {item.role}</p>
                <p className="text-xs text-slate-500">{item.period}</p>
                <p className="mt-1 text-sm">{item.highlights}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-[900px] rounded-2xl bg-white p-8 text-slate-900 shadow-[0_20px_60px_rgba(8,14,28,0.16)]">
      <header className="border-l-4 border-slate-900 pl-4">
        <h1 className="text-4xl font-bold">{resume.fullName || "你的姓名"}</h1>
        <p className="mt-2">{resume.headline || "职位标题"}</p>
      </header>
      <p className="mt-6 text-sm leading-7">{resume.summary}</p>
      <h3 className="mt-6 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Projects</h3>
      <div className="mt-2 space-y-3">
        {resume.projects.map((item) => (
          <div key={item.id}>
            <p className="font-semibold">{item.name} · {item.role}</p>
            <p className="text-sm text-slate-700">{item.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-2 text-sm font-semibold text-[#d7c6a4]">{title}</p>
      {children}
    </div>
  );
}

export default function DashboardEditor() {
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [resume, setResume] = useState<ResumeData>(() => cloneResume(PRESETS.modern));
  const [skillsInput, setSkillsInput] = useState(PRESETS.modern.skills.join("，"));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { template?: TemplateId; resume?: ResumeData };
        if (parsed.template && PRESETS[parsed.template]) setTemplate(parsed.template);
        if (parsed.resume) {
          setResume(parsed.resume);
          setSkillsInput((parsed.resume.skills || []).join("，"));
        }
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ template, resume }));
  }, [ready, template, resume]);

  function applyTemplate(id: TemplateId) {
    const data = cloneResume(PRESETS[id]);
    setTemplate(id);
    setResume(data);
    setSkillsInput(data.skills.join("，"));
  }

  return (
    <section className="min-h-[980px] rounded-[28px] border border-white/5 bg-black/10 p-4 md:p-5">
      <SectionBlock title="简历模板">
        <div className="mb-3 flex flex-wrap gap-2">
          {TEMPLATE_LIST.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyTemplate(item.id)}
              className={`rounded-xl border px-3 py-2 text-left ${
                template === item.id ? "border-[#4dbf7f] bg-[#1f3a2f]/70" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <p className="text-sm font-semibold text-slate-100">{item.name}</p>
              <p className="text-xs text-slate-400">{item.subtitle}</p>
            </button>
          ))}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-[#329a60] px-3 py-2 text-sm font-semibold text-[#d5f3e4]"
          >
            打印 / PDF
          </button>
        </div>
        <p className="text-xs text-slate-400">{TEMPLATE_LIST.find((x) => x.id === template)?.description}</p>
      </SectionBlock>

      <div className="mt-4 grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="space-y-4 xl:max-h-[840px] xl:overflow-y-auto xl:pr-2">
          <SectionBlock title="基础信息">
            <input
              value={resume.fullName}
              onChange={(e) => setResume((p) => ({ ...p, fullName: e.target.value }))}
              className={inputClass}
              placeholder="姓名"
            />
            <input
              value={resume.headline}
              onChange={(e) => setResume((p) => ({ ...p, headline: e.target.value }))}
              className={`${inputClass} mt-2`}
              placeholder="职位标题"
            />
            <textarea
              value={resume.summary}
              onChange={(e) => setResume((p) => ({ ...p, summary: e.target.value }))}
              className={`${areaClass} mt-2 h-20`}
              placeholder="个人简介"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input value={resume.email} onChange={(e) => setResume((p) => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="邮箱" />
              <input value={resume.phone} onChange={(e) => setResume((p) => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="电话" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input value={resume.location} onChange={(e) => setResume((p) => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="城市" />
              <input value={resume.website} onChange={(e) => setResume((p) => ({ ...p, website: e.target.value }))} className={inputClass} placeholder="网站/链接" />
            </div>
          </SectionBlock>

          <SectionBlock title="技能（逗号分隔）">
            <textarea
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onBlur={() => setResume((p) => ({ ...p, skills: toSkills(skillsInput) }))}
              className={`${areaClass} h-16`}
            />
          </SectionBlock>

          <SectionBlock title="工作经历">
            {resume.experiences.map((item) => (
              <div key={item.id} className="mb-3 rounded-xl border border-white/10 bg-black/10 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <input value={item.role} onChange={(e) => setResume((p) => ({ ...p, experiences: p.experiences.map((x) => x.id === item.id ? { ...x, role: e.target.value } : x) }))} className={inputClass} placeholder="职位" />
                  <input value={item.company} onChange={(e) => setResume((p) => ({ ...p, experiences: p.experiences.map((x) => x.id === item.id ? { ...x, company: e.target.value } : x) }))} className={inputClass} placeholder="公司" />
                </div>
                <input value={item.period} onChange={(e) => setResume((p) => ({ ...p, experiences: p.experiences.map((x) => x.id === item.id ? { ...x, period: e.target.value } : x) }))} className={`${inputClass} mt-2`} placeholder="时间" />
                <textarea value={item.highlights} onChange={(e) => setResume((p) => ({ ...p, experiences: p.experiences.map((x) => x.id === item.id ? { ...x, highlights: e.target.value } : x) }))} className={`${areaClass} mt-2 h-16`} placeholder="成果" />
              </div>
            ))}
            <button type="button" onClick={() => setResume((p) => ({ ...p, experiences: [...p.experiences, { id: newId(), role: "新职位", company: "新公司", period: "时间段", highlights: "请填写成果" }] }))} className="rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300">添加经历</button>
          </SectionBlock>

          <SectionBlock title="教育背景">
            {resume.educations.map((item) => (
              <div key={item.id} className="mb-3 rounded-xl border border-white/10 bg-black/10 p-3">
                <input value={item.school} onChange={(e) => setResume((p) => ({ ...p, educations: p.educations.map((x) => x.id === item.id ? { ...x, school: e.target.value } : x) }))} className={inputClass} placeholder="学校" />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input value={item.major} onChange={(e) => setResume((p) => ({ ...p, educations: p.educations.map((x) => x.id === item.id ? { ...x, major: e.target.value } : x) }))} className={inputClass} placeholder="专业" />
                  <input value={item.period} onChange={(e) => setResume((p) => ({ ...p, educations: p.educations.map((x) => x.id === item.id ? { ...x, period: e.target.value } : x) }))} className={inputClass} placeholder="时间" />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setResume((p) => ({ ...p, educations: [...p.educations, { id: newId(), school: "学校", major: "专业", period: "时间", details: "" }] }))} className="rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300">添加教育</button>
          </SectionBlock>

          <SectionBlock title="项目经历">
            {resume.projects.map((item) => (
              <div key={item.id} className="mb-3 rounded-xl border border-white/10 bg-black/10 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <input value={item.name} onChange={(e) => setResume((p) => ({ ...p, projects: p.projects.map((x) => x.id === item.id ? { ...x, name: e.target.value } : x) }))} className={inputClass} placeholder="项目名称" />
                  <input value={item.role} onChange={(e) => setResume((p) => ({ ...p, projects: p.projects.map((x) => x.id === item.id ? { ...x, role: e.target.value } : x) }))} className={inputClass} placeholder="角色" />
                </div>
                <input value={item.link} onChange={(e) => setResume((p) => ({ ...p, projects: p.projects.map((x) => x.id === item.id ? { ...x, link: e.target.value } : x) }))} className={`${inputClass} mt-2`} placeholder="链接" />
                <textarea value={item.description} onChange={(e) => setResume((p) => ({ ...p, projects: p.projects.map((x) => x.id === item.id ? { ...x, description: e.target.value } : x) }))} className={`${areaClass} mt-2 h-16`} placeholder="描述" />
              </div>
            ))}
            <button type="button" onClick={() => setResume((p) => ({ ...p, projects: [...p.projects, { id: newId(), name: "项目", role: "角色", link: "", description: "项目描述" }] }))} className="rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300">添加项目</button>
          </SectionBlock>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 md:p-4">
          <p className="mb-2 text-sm font-semibold text-slate-100">简历预览（{TEMPLATE_LIST.find((x) => x.id === template)?.name}）</p>
          <div className="max-h-[840px] overflow-auto rounded-xl bg-[#dbe4f1] p-3">
            <Preview template={template} resume={resume} />
          </div>
        </div>
      </div>
    </section>
  );
}
