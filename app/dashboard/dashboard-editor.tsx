"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

const STORAGE_KEY = "resumeai.resume.editor.v2";

const TEMPLATES: TemplateMeta[] = [
  {
    id: "modern",
    name: "现代商务",
    subtitle: "双栏结果导向",
    description: "适合互联网和技术岗位，突出技能与成果。",
  },
  {
    id: "classic",
    name: "经典专业",
    subtitle: "传统招聘风格",
    description: "适合校招和通用社招，结构清晰稳健。",
  },
  {
    id: "minimal",
    name: "极简作品",
    subtitle: "简洁叙事表达",
    description: "适合设计、内容、创意岗位的项目展示。",
  },
];

const PRESETS: Record<TemplateId, ResumeData> = {
  modern: {
    fullName: "李明",
    headline: "高级前端工程师 | React / Next.js / AI",
    summary:
      "5 年 Web 开发经验，主导过中后台与 AI 应用落地。擅长通过性能优化和用户体验改进提升关键业务指标。",
    email: "liming@example.com",
    phone: "138-8888-8888",
    location: "上海",
    website: "github.com/octocat",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "A/B Test"],
    experiences: [
      {
        id: "m-exp-1",
        role: "高级前端工程师",
        company: "某 AI SaaS 公司",
        period: "2022.03 - 至今",
        highlights: "负责简历产品前端架构，首屏性能提升 43%，注册转化率提升 22%。",
      },
    ],
    educations: [
      {
        id: "m-edu-1",
        school: "华东理工大学",
        major: "软件工程 本科",
        period: "2016 - 2020",
        details: "主修软件工程、数据库系统与算法。",
      },
    ],
    projects: [
      {
        id: "m-pro-1",
        name: "ResumeAI",
        role: "前端负责人",
        link: "resumeai-dja.pages.dev",
        description: "实现模板化编辑、认证体系和 Cloudflare 自动部署。",
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
        id: "c-exp-1",
        role: "高级产品经理",
        company: "某企业服务公司",
        period: "2021.05 - 至今",
        highlights: "主导客户管理模块重构，客户续费率提升 15%。",
      },
    ],
    educations: [
      {
        id: "c-edu-1",
        school: "南京大学",
        major: "信息管理与信息系统 本科",
        period: "2015 - 2019",
        details: "连续两年获奖学金，担任校级项目负责人。",
      },
    ],
    projects: [
      {
        id: "c-pro-1",
        name: "客户成功平台升级",
        role: "项目负责人",
        link: "",
        description: "重构任务流与运营看板，提升跨部门协同效率。",
      },
    ],
  },
  minimal: {
    fullName: "王悦",
    headline: "视觉设计师 | 品牌与数字体验",
    summary: "专注品牌视觉系统与数字产品设计，平衡审美表达和商业目标。",
    email: "wangyue@example.com",
    phone: "137-7777-7777",
    location: "深圳",
    website: "dribbble.com",
    skills: ["Figma", "品牌设计", "UI 设计", "设计系统", "动效设计"],
    experiences: [
      {
        id: "n-exp-1",
        role: "视觉设计师",
        company: "某消费品牌",
        period: "2021.09 - 至今",
        highlights: "建立官网视觉规范，官网停留时长提升 26%。",
      },
    ],
    educations: [
      {
        id: "n-edu-1",
        school: "广州美术学院",
        major: "视觉传达设计 本科",
        period: "2017 - 2021",
        details: "毕业设计获学院优秀作品。",
      },
    ],
    projects: [
      {
        id: "n-pro-1",
        name: "品牌官网改版",
        role: "主设计",
        link: "",
        description: "完成信息架构重组和视觉升级，形成可复用设计资产。",
      },
    ],
  },
};

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeSkills(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(/[,\n，、]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeUrl(url: string) {
  const value = url.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function Label({ children }: { children: string }) {
  return <p className="mb-1 text-xs font-medium text-slate-300">{children}</p>;
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm text-[#d7c6a4]">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function Preview({ template, resume }: { template: TemplateId; resume: ResumeData }) {
  if (template === "modern") {
    return (
      <article className="mx-auto w-full max-w-[860px] overflow-hidden rounded-2xl bg-white text-slate-800 shadow-[0_24px_70px_rgba(10,20,35,0.18)]">
        <div className="grid md:grid-cols-[240px_1fr]">
          <aside className="bg-gradient-to-b from-[#22406f] to-[#142846] p-6 text-slate-100">
            <h1 className="text-3xl font-extrabold">{resume.fullName || "你的姓名"}</h1>
            <p className="mt-2 text-sm text-slate-200">{resume.headline || "职位标题"}</p>
            <p className="mt-5 text-sm">{resume.email}</p>
            <p className="text-sm">{resume.phone}</p>
            <p className="text-sm">{resume.location}</p>
            {resume.website ? (
              <a href={normalizeUrl(resume.website)} target="_blank" rel="noreferrer" className="text-sm underline">
                {resume.website}
              </a>
            ) : null}
            <p className="mt-6 text-xs font-semibold tracking-[0.18em] uppercase">Skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </aside>
          <div className="space-y-6 p-6">
            <section>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Summary</p>
              <p className="mt-2 text-sm leading-7">{resume.summary}</p>
            </section>
            <section>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Experience</p>
              <div className="mt-3 space-y-4">
                {resume.experiences.map((item) => (
                  <div key={item.id}>
                    <p className="font-semibold">
                      {item.role || "职位"} · {item.company || "公司"}
                    </p>
                    <p className="text-xs text-slate-500">{item.period}</p>
                    <p className="mt-1 text-sm leading-7">{item.highlights}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    );
  }

  if (template === "classic") {
    return (
      <article className="mx-auto w-full max-w-[860px] rounded-2xl bg-white p-8 text-slate-800 shadow-[0_24px_70px_rgba(10,20,35,0.18)]">
        <header className="border-b border-slate-200 pb-4 text-center">
          <h1 className="text-4xl font-bold">{resume.fullName || "你的姓名"}</h1>
          <p className="mt-2 text-sm">{resume.headline || "职位标题"}</p>
          <p className="mt-2 text-xs text-slate-500">
            {[resume.email, resume.phone, resume.location].filter(Boolean).join(" | ")}
          </p>
        </header>
        <section className="mt-6">
          <p className="border-b border-slate-200 pb-1 text-xs font-semibold tracking-[0.16em] uppercase">个人简介</p>
          <p className="mt-2 text-sm leading-7">{resume.summary}</p>
        </section>
        <section className="mt-6">
          <p className="border-b border-slate-200 pb-1 text-xs font-semibold tracking-[0.16em] uppercase">工作经历</p>
          <div className="mt-3 space-y-3">
            {resume.experiences.map((item) => (
              <div key={item.id}>
                <p className="font-semibold">
                  {item.company || "公司"} · {item.role || "职位"}
                </p>
                <p className="text-xs text-slate-500">{item.period}</p>
                <p className="mt-1 text-sm leading-7">{item.highlights}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-[860px] rounded-2xl bg-white p-8 text-slate-900 shadow-[0_24px_70px_rgba(10,20,35,0.18)]">
      <header className="border-l-4 border-slate-900 pl-4">
        <h1 className="text-4xl font-bold">{resume.fullName || "你的姓名"}</h1>
        <p className="mt-2">{resume.headline || "职位标题"}</p>
      </header>
      <p className="mt-6 text-sm leading-7">{resume.summary}</p>
      <p className="mt-6 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Projects</p>
      <div className="mt-2 space-y-3">
        {resume.projects.map((item) => (
          <div key={item.id}>
            <p className="font-semibold">
              {item.name || "项目"} · {item.role || "角色"}
            </p>
            <p className="text-sm text-slate-700">{item.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function DashboardEditor() {
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [resume, setResume] = useState<ResumeData>(() => deepCopy(PRESETS.modern));
  const [skillsText, setSkillsText] = useState(PRESETS.modern.skills.join("，"));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { template?: TemplateId; resume?: ResumeData };
        if (parsed.template && PRESETS[parsed.template]) {
          setTemplate(parsed.template);
        }
        if (parsed.resume) {
          setResume(parsed.resume);
          setSkillsText((parsed.resume.skills || []).join("，"));
        }
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ template, resume }));
  }, [ready, resume, template]);

  function applyTemplate(id: TemplateId) {
    const data = deepCopy(PRESETS[id]);
    setTemplate(id);
    setResume(data);
    setSkillsText(data.skills.join("，"));
  }

  const templateDescription = useMemo(
    () => TEMPLATES.find((item) => item.id === template)?.description ?? "",
    [template],
  );

  return (
    <section className="min-h-[940px] rounded-[26px] border border-white/10 bg-black/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] md:p-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_500px]">
        <div className="space-y-4">
          <Section title="基础信息">
            <Label>姓名</Label>
            <Input
              value={resume.fullName}
              onChange={(e) => setResume((prev) => ({ ...prev, fullName: e.target.value }))}
              className="border-white/10 bg-white/[0.03] text-slate-100"
            />
            <Label>职位标题</Label>
            <Input
              value={resume.headline}
              onChange={(e) => setResume((prev) => ({ ...prev, headline: e.target.value }))}
              className="border-white/10 bg-white/[0.03] text-slate-100"
            />
            <Label>个人简介</Label>
            <textarea
              value={resume.summary}
              onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))}
              className="h-24 w-full resize-none rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none"
            />
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                value={resume.email}
                onChange={(e) => setResume((prev) => ({ ...prev, email: e.target.value }))}
                className="border-white/10 bg-white/[0.03] text-slate-100"
                placeholder="邮箱"
              />
              <Input
                value={resume.phone}
                onChange={(e) => setResume((prev) => ({ ...prev, phone: e.target.value }))}
                className="border-white/10 bg-white/[0.03] text-slate-100"
                placeholder="电话"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                value={resume.location}
                onChange={(e) => setResume((prev) => ({ ...prev, location: e.target.value }))}
                className="border-white/10 bg-white/[0.03] text-slate-100"
                placeholder="城市"
              />
              <Input
                value={resume.website}
                onChange={(e) => setResume((prev) => ({ ...prev, website: e.target.value }))}
                className="border-white/10 bg-white/[0.03] text-slate-100"
                placeholder="网站/链接"
              />
            </div>
          </Section>

          <Section title="技能（逗号分隔）">
            <textarea
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              onBlur={() => setResume((prev) => ({ ...prev, skills: normalizeSkills(skillsText) }))}
              className="h-16 w-full resize-none rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none"
            />
          </Section>

          <Section
            title="工作经历"
            action={
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 bg-transparent text-slate-200 hover:bg-white/10"
                onClick={() =>
                  setResume((prev) => ({
                    ...prev,
                    experiences: [
                      ...prev.experiences,
                      { id: makeId(), role: "新职位", company: "新公司", period: "时间段", highlights: "请填写成果" },
                    ],
                  }))
                }
              >
                添加
              </Button>
            }
          >
            {resume.experiences.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    value={item.role}
                    onChange={(e) =>
                      setResume((prev) => ({
                        ...prev,
                        experiences: prev.experiences.map((x) =>
                          x.id === item.id ? { ...x, role: e.target.value } : x,
                        ),
                      }))
                    }
                    className="border-white/10 bg-white/[0.03] text-slate-100"
                    placeholder="职位"
                  />
                  <Input
                    value={item.company}
                    onChange={(e) =>
                      setResume((prev) => ({
                        ...prev,
                        experiences: prev.experiences.map((x) =>
                          x.id === item.id ? { ...x, company: e.target.value } : x,
                        ),
                      }))
                    }
                    className="border-white/10 bg-white/[0.03] text-slate-100"
                    placeholder="公司"
                  />
                </div>
                <Input
                  value={item.period}
                  onChange={(e) =>
                    setResume((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((x) =>
                        x.id === item.id ? { ...x, period: e.target.value } : x,
                      ),
                    }))
                  }
                  className="mt-2 border-white/10 bg-white/[0.03] text-slate-100"
                  placeholder="时间段"
                />
                <textarea
                  value={item.highlights}
                  onChange={(e) =>
                    setResume((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((x) =>
                        x.id === item.id ? { ...x, highlights: e.target.value } : x,
                      ),
                    }))
                  }
                  className="mt-2 h-16 w-full resize-none rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
            ))}
          </Section>
        </div>

        <div className="space-y-4">
          <Card className="border-white/10 bg-white/[0.03] shadow-[0_14px_32px_rgba(0,0,0,0.26)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">模板选择</CardTitle>
              <CardDescription className="text-slate-400">{templateDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {TEMPLATES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyTemplate(item.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    template === item.id
                      ? "border-[#4dbf7f] bg-[#1f3a2f]/70"
                      : "border-white/15 bg-white/[0.02] hover:bg-white/[0.08]"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </button>
              ))}

              <Button
                className="mt-2 w-full bg-[#329a60] text-[#d5f3e4] hover:bg-[#3da96e]"
                onClick={() => window.print()}
              >
                导出 PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03] shadow-[0_14px_32px_rgba(0,0,0,0.26)]">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">模板预览</CardTitle>
              <CardDescription className="text-slate-400">右侧固定展示，方便对照编辑</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[760px] overflow-auto rounded-xl bg-[#dbe4f1] p-3">
                <Preview template={template} resume={resume} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
