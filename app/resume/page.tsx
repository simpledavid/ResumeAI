"use client";

import {
  createContext,
  useEffect,
  useContext,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Briefcase,
  CalendarDays,
  FolderKanban,
  GraduationCap,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  UserRound,
  VenusAndMars,
  Wrench,
} from "lucide-react";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { useRouter } from "next/navigation";

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-heading",
});

type TemplateId = "classic" | "warm" | "minimal";

type TemplateConfig = {
  id: TemplateId;
  label: string;
  description: string;
  accent: string;
  line: string;
  pageBg: string;
  resumeBg: string;
  border: string;
  headerLayout: "split" | "stacked";
  contactLayout: "row" | "grid";
  sectionSpacing: string;
  sectionTitleClass: string;
  sectionLineClass: string;
  resumePaddingClass: string;
  avatarFrameClass: string;
  avatarImageClass: string;
};

const templates: TemplateConfig[] = [
  {
    id: "classic",
    label: "经典蓝",
    description: "默认样式",
    accent: "#1f4f8c",
    line: "#cbd5e1",
    pageBg: "#f1f3f5",
    resumeBg: "#ffffff",
    border: "#cbd5e1",
    headerLayout: "split",
    contactLayout: "row",
    sectionSpacing: "mt-6",
    sectionTitleClass: "text-sm font-semibold tracking-[0.08em]",
    sectionLineClass: "h-px",
    resumePaddingClass: "px-10 py-10",
    avatarFrameClass: "h-32 w-24 rounded-sm",
    avatarImageClass: "rounded-sm",
  },
  {
    id: "warm",
    label: "暖调橙",
    description: "留白更大",
    accent: "#b45309",
    line: "#f59e0b",
    pageBg: "#faf6ef",
    resumeBg: "#fffdf8",
    border: "#f0e2c5",
    headerLayout: "stacked",
    contactLayout: "row",
    sectionSpacing: "mt-8",
    sectionTitleClass: "text-xs font-semibold tracking-[0.18em]",
    sectionLineClass: "h-[2px]",
    resumePaddingClass: "px-12 py-12",
    avatarFrameClass: "h-28 w-28 rounded-full",
    avatarImageClass: "rounded-full",
  },
  {
    id: "minimal",
    label: "极简黑",
    description: "紧凑排版",
    accent: "#111827",
    line: "#e5e7eb",
    pageBg: "#f8fafc",
    resumeBg: "#ffffff",
    border: "#e5e7eb",
    headerLayout: "split",
    contactLayout: "grid",
    sectionSpacing: "mt-5",
    sectionTitleClass: "text-xs font-semibold tracking-[0.12em]",
    sectionLineClass: "h-px",
    resumePaddingClass: "px-8 py-8",
    avatarFrameClass: "h-32 w-24 rounded-none",
    avatarImageClass: "rounded-none",
  },
];

type Resume = {
  basics: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    age: string;
    gender: string;
    jobTarget: string;
    summary: string;
    links: { label: string; url: string }[];
  };
  skills: string[];
  experience: {
    company: string;
    role: string;
    summary: string;
    startDate: string;
    endDate: string;
    location: string;
    highlights: string[];
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    location: string;
    highlights: string[];
  }[];
  projects: {
    name: string;
    description: string;
    tech: string[];
    link: string;
    highlights: string[];
  }[];
  aiTools?: string;
  aiProducts?: string;
  aiToolLinks?: string[];
  aiProductLinks?: string[];
};

type ChatApiResponse = {
  error?: string;
  resume?: Resume;
  assistant_message?: string;
};

type MeResponse = {
  error?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
};

type ResumeApiResponse = {
  error?: string;
  user?: {
    id: string;
    username: string;
    email?: string;
  };
  resume?: Resume | null;
  avatarUrl?: string;
  templateId?: TemplateId;
  updatedAt?: number;
};

type ResumeEditorPageProps = {
  publicUsername?: string;
};

type BasicsInput = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  age: string;
  gender: string;
  jobTarget: string;
  summary: string;
};

type TextSections = {
  skills: string;
  experience: string;
  projects: string;
};

type EducationLine = {
  school: string;
  major: string;
  period: string;
};

type AiLinks = {
  tools: string[];
  products: string[];
};

type UrlMeta = {
  href: string;
  label: string;
  iconPrimary: string;
  iconFallback: string;
};

const createEmptyExperienceItem = (): Resume["experience"][number] => ({
  company: "",
  role: "",
  summary: "",
  startDate: "",
  endDate: "",
  location: "",
  highlights: [""],
});

const createEmptyProjectItem = (): Resume["projects"][number] => ({
  name: "",
  description: "",
  tech: [],
  link: "",
  highlights: [""],
});

const emptyResume: Resume = {
  basics: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    age: "",
    gender: "",
    jobTarget: "",
    summary: "",
    links: [],
  },
  skills: [],
  experience: [createEmptyExperienceItem()],
  education: [],
  projects: [createEmptyProjectItem()],
};

const emptyBasics: BasicsInput = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  age: "",
  gender: "",
  jobTarget: "",
  summary: "",
};

const emptyTextSections: TextSections = {
  skills: "",
  experience: "",
  projects: "",
};

const emptyEducationLine: EducationLine = {
  school: "",
  major: "",
  period: "",
};

const emptyAiLinks: AiLinks = {
  tools: [],
  products: [],
};

const parseLineList = (value?: string) =>
  typeof value === "string"
    ? value
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

const normalizeStringList = (values?: string[]) =>
  Array.isArray(values)
    ? values.map((value) => value.trim()).filter(Boolean)
    : [];

const normalizeAiLinkArray = (values?: string[]) =>
  Array.isArray(values)
    ? values.map((value) => value.trim()).filter(Boolean)
    : [];

const normalizeUrlValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const inferSiteName = (hostname: string) => {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  if (host.includes("chatgpt.com")) return "ChatGPT";
  if (host.includes("claude.ai")) return "Claude";
  if (host.includes("notebooklm.google.com")) return "NotebookLM";
  if (host.includes("gemini.google.com")) return "Gemini";
  if (host.includes("openai.com")) return "OpenAI";
  if (host.includes("deepseek.com")) return "DeepSeek";
  if (host.includes("github.com")) return "GitHub";
  if (host.includes("resumio.cn")) return "Resumio";

  const first = host.split(".")[0] ?? host;
  if (!first) return host;
  return `${first.charAt(0).toUpperCase()}${first.slice(1)}`;
};

const parseUrlMeta = (value: string): UrlMeta | null => {
  const normalized = normalizeUrlValue(value);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    const origin = `${parsed.protocol}//${parsed.hostname}`;
    return {
      href: parsed.toString(),
      label: inferSiteName(parsed.hostname),
      iconPrimary: `${origin}/favicon.ico`,
      iconFallback: `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(
        origin,
      )}`,
    };
  } catch {
    return null;
  }
};

const inferMetaFromKeyword = (value: string): UrlMeta | null => {
  const keyword = value.trim().toLowerCase();
  if (!keyword) return null;

  const catalog: Array<{ match: RegExp; href: string; label: string }> = [
    { match: /chatgpt|openai/, href: "https://chatgpt.com", label: "ChatGPT" },
    { match: /claude|anthropic/, href: "https://claude.ai", label: "Claude" },
    {
      match: /notebooklm|notebook lm/,
      href: "https://notebooklm.google.com",
      label: "NotebookLM",
    },
    { match: /gemini/, href: "https://gemini.google.com", label: "Gemini" },
    {
      match: /deepseek|深度求索/,
      href: "https://www.deepseek.com",
      label: "DeepSeek",
    },
    { match: /github/, href: "https://github.com", label: "GitHub" },
    { match: /resumio/, href: "https://resumio.cn", label: "Resumio" },
  ];

  const matched = catalog.find((item) => item.match.test(keyword));
  if (!matched) return null;

  try {
    const parsed = new URL(matched.href);
    const origin = `${parsed.protocol}//${parsed.hostname}`;
    return {
      href: matched.href,
      label: matched.label,
      iconPrimary: `${origin}/favicon.ico`,
      iconFallback: `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(
        origin,
      )}`,
    };
  } catch {
    return null;
  }
};

const resolveUrlMeta = (value: string): UrlMeta | null =>
  parseUrlMeta(value) ?? inferMetaFromKeyword(value);

const normalizeResume = (resume: Resume): Resume => {
  const experienceSource = Array.isArray(resume.experience)
    ? resume.experience
    : [];
  const projectSource = Array.isArray(resume.projects) ? resume.projects : [];

  const experience =
    experienceSource.length > 0
      ? experienceSource.map((item) => ({
          ...createEmptyExperienceItem(),
          ...item,
          highlights:
            Array.isArray(item.highlights) && item.highlights.length > 0
              ? item.highlights
              : [""],
        }))
      : [createEmptyExperienceItem()];

  const projects =
    projectSource.length > 0
      ? projectSource.map((item) => ({
          ...createEmptyProjectItem(),
          ...item,
          tech: Array.isArray(item.tech) ? item.tech : [],
          highlights:
            Array.isArray(item.highlights) && item.highlights.length > 0
              ? item.highlights
              : [""],
        }))
      : [createEmptyProjectItem()];

  const aiToolLinks = normalizeAiLinkArray(resume.aiToolLinks);
  const aiProductLinks = normalizeAiLinkArray(resume.aiProductLinks);
  const aiToolsText = typeof resume.aiTools === "string" ? resume.aiTools : "";
  const aiProductsText =
    typeof resume.aiProducts === "string" ? resume.aiProducts : "";
  const mergedAiTools =
    aiToolLinks.length > 0 ? aiToolLinks : parseLineList(aiToolsText);
  const mergedAiProducts =
    aiProductLinks.length > 0 ? aiProductLinks : parseLineList(aiProductsText);

  return {
    ...resume,
    skills: normalizeStringList(resume.skills),
    aiTools: mergedAiTools.join("\n"),
    aiProducts: mergedAiProducts.join("\n"),
    aiToolLinks: mergedAiTools,
    aiProductLinks: mergedAiProducts,
    experience,
    projects,
  };
};

const formatRange = (start: string, end: string) => {
  if (start && end) return `${start}-${end}`;
  if (start || end) return start || end;
  return "";
};

const formatLines = (values: string[]) => values.filter(Boolean).join("\n");

const formatEducationLine = (value: EducationLine) => {
  const left = [value.school, value.major].filter(Boolean).join(" - ");
  return [left, value.period].filter(Boolean).join("  ");
};

const formatExperience = (values: Resume["experience"]) =>
  values
    .map((item) => {
      const header = [
        item.company,
        item.role,
        formatRange(item.startDate, item.endDate),
        item.location,
      ]
        .filter(Boolean)
        .join(" ");
      const lines = [header, item.summary, ...item.highlights.filter(Boolean)].filter(
        Boolean,
      );
      return lines.join("\n");
    })
    .filter(Boolean)
    .join("\n\n");

const formatProjects = (values: Resume["projects"]) =>
  values
    .map((item) => {
      const header = [item.name, item.link].filter(Boolean).join(" ");
      const techLine =
        item.tech.length > 0 ? `技术栈 ${item.tech.join(" ")}` : "";
      const lines = [
        header,
        item.description,
        techLine,
        ...item.highlights.filter(Boolean),
      ].filter(Boolean);
      return lines.join("\n");
    })
    .filter(Boolean)
    .join("\n\n");

const resumeToText = (resume: Resume): TextSections => ({
  skills: formatLines(resume.skills),
  experience: formatExperience(resume.experience),
  projects: formatProjects(resume.projects),
});

function Section({
  title,
  icon: Icon,
  children,
  className,
  titleClassName,
  lineClassName,
}: {
  title: string;
  icon: typeof Wrench;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  lineClassName?: string;
}) {
  return (
    <section className={className ?? ""}>
      <div className="flex items-baseline gap-2">
        <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden />
        <h2
          className={titleClassName ?? "text-sm font-semibold tracking-[0.08em]"}
          style={{ color: "var(--accent)" }}
        >
          {title}
        </h2>
        <div
          className={`flex-1 ${lineClassName ?? "h-px"}`}
          style={{ backgroundColor: "var(--line)" }}
        />
      </div>
      <div className="mt-3 text-sm text-slate-700">{children}</div>
    </section>
  );
}

const ResumeReadonlyContext = createContext(false);

function EditableBlock({
  value,
  onChange,
  placeholder,
  className,
  singleLine = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  singleLine?: boolean;
}) {
  const readOnly = useContext(ResumeReadonlyContext);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={readOnly ? undefined : placeholder}
      data-empty={
        readOnly ? undefined : value.trim().length === 0 ? "true" : "false"
      }
      onInput={
        readOnly
          ? undefined
          : (event) => onChange(event.currentTarget.innerText.replace(/\s+$/, ""))
      }
      onKeyDown={(event) => {
        if (readOnly) {
          event.preventDefault();
          return;
        }
        if (singleLine && event.key === "Enter") {
          event.preventDefault();
        }
      }}
      className={`editable whitespace-pre-wrap rounded-none px-0 py-0 text-sm leading-relaxed text-slate-900 focus:outline-none ${className ?? ""}`}
    />
  );
}

function SiteIcon({
  meta,
}: {
  meta: UrlMeta;
}) {
  const [src, setSrc] = useState(meta.iconPrimary);

  useEffect(() => {
    setSrc(meta.iconPrimary);
  }, [meta.iconPrimary]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${meta.label} icon`}
      className="h-4 w-4 shrink-0 rounded-sm"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        setSrc((prev) => (prev === meta.iconFallback ? prev : meta.iconFallback));
      }}
    />
  );
}

export default function ResumeEditorPage({ publicUsername }: ResumeEditorPageProps) {
  const router = useRouter();
  const profileUsername = publicUsername?.trim().toLowerCase() ?? "";
  const isPublicRoute = profileUsername.length > 0;
  const [basics, setBasics] = useState<BasicsInput>(emptyBasics);
  const [text, setText] = useState<TextSections>(emptyTextSections);
  const [skillItems, setSkillItems] = useState<string[]>([]);
  const [educationLine, setEducationLine] =
    useState<EducationLine>(emptyEducationLine);
  const [aiLinks, setAiLinks] = useState<AiLinks>(emptyAiLinks);
  const [structuredResume, setStructuredResume] = useState<Resume>(emptyResume);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [booting, setBooting] = useState(true);
  const [username, setUsername] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [error, setError] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("minimal");
  const [canEdit, setCanEdit] = useState(!isPublicRoute);
  const resumeRef = useRef<HTMLDivElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const template =
    templates.find((item) => item.id === templateId) ?? templates[0];
  const headerClass =
    template.headerLayout === "stacked"
      ? "flex flex-col items-start gap-4"
      : "flex flex-wrap items-start justify-between gap-6";
  const contactClass =
    template.contactLayout === "grid"
      ? "mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600"
      : "mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600";
  const avatarWrapperClass =
    template.headerLayout === "stacked" ? "items-start" : "items-end";
  const resumeStyle: CSSProperties & Record<string, string> = {
    maxWidth: "210mm",
    minHeight: "297mm",
    backgroundColor: template.resumeBg,
    borderColor: template.border,
    "--accent": template.accent,
    "--line": template.line,
  };
  const isReadonly = isPublicRoute && !canEdit;

  const updateBasics = (field: keyof BasicsInput, value: string) => {
    if (isReadonly) return;
    setBasics((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateText = (field: keyof TextSections, value: string) => {
    if (isReadonly) return;
    setText((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateEducationLine = (field: keyof EducationLine, value: string) => {
    if (isReadonly) return;
    setEducationLine((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSkillItem = (index: number, value: string) => {
    if (isReadonly) return;
    setSkillItems((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const addSkillItem = () => {
    if (isReadonly) return;
    setSkillItems((prev) => [...prev, ""]);
  };

  const removeSkillItem = (index: number) => {
    if (isReadonly) return;
    setSkillItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateAiLink = (field: keyof AiLinks, index: number, value: string) => {
    if (isReadonly) return;
    setAiLinks((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
  };

  const addAiLink = (field: keyof AiLinks) => {
    if (isReadonly) return;
    setAiLinks((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeAiLink = (field: keyof AiLinks, index: number) => {
    if (isReadonly) return;
    setAiLinks((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const normalizeAiLinkItem = (field: keyof AiLinks, index: number) => {
    if (isReadonly) return;
    setAiLinks((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) =>
        itemIndex === index ? normalizeUrlValue(item) : item,
      ),
    }));
  };

  const updateExperienceField = (
    index: number,
    field:
      | "company"
      | "role"
      | "summary"
      | "startDate"
      | "endDate"
      | "location",
    value: string,
  ) => {
    if (isReadonly) return;
    setStructuredResume((prev) => {
      const next = prev.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, experience: next };
    });
  };

  const updateProjectField = (
    index: number,
    field: "name" | "description" | "link",
    value: string,
  ) => {
    if (isReadonly) return;
    setStructuredResume((prev) => {
      const next = prev.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, projects: next };
    });
  };

  const addExperience = () => {
    if (isReadonly) return;
    setStructuredResume((prev) => ({
      ...prev,
      experience: [...prev.experience, createEmptyExperienceItem()],
    }));
  };

  const removeExperience = (index: number) => {
    if (isReadonly) return;
    setStructuredResume((prev) => {
      const next = prev.experience.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...prev,
        experience: next.length > 0 ? next : [createEmptyExperienceItem()],
      };
    });
  };

  const addProject = () => {
    if (isReadonly) return;
    setStructuredResume((prev) => ({
      ...prev,
      projects: [...prev.projects, createEmptyProjectItem()],
    }));
  };

  const removeProject = (index: number) => {
    if (isReadonly) return;
    setStructuredResume((prev) => {
      const next = prev.projects.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...prev,
        projects: next.length > 0 ? next : [createEmptyProjectItem()],
      };
    });
  };

  const applyResume = (resume: Resume) => {
    const normalizedResume = normalizeResume(resume);
    setStructuredResume(normalizedResume);
    setBasics({
      name: normalizedResume.basics.name ?? "",
      title: normalizedResume.basics.title ?? "",
      email: normalizedResume.basics.email ?? "",
      phone: normalizedResume.basics.phone ?? "",
      location: normalizedResume.basics.location ?? "",
      age: normalizedResume.basics.age ?? "",
      gender: normalizedResume.basics.gender ?? "",
      jobTarget: normalizedResume.basics.jobTarget ?? "",
      summary: normalizedResume.basics.summary ?? "",
    });
    setText(resumeToText(normalizedResume));
    setSkillItems(normalizeStringList(normalizedResume.skills));
    const primaryEducation = normalizedResume.education?.[0];
    if (primaryEducation) {
      setEducationLine({
        school: primaryEducation.school ?? "",
        major: primaryEducation.field || primaryEducation.degree || "",
        period: formatRange(
          primaryEducation.startDate,
          primaryEducation.endDate,
        ),
      });
    } else {
      setEducationLine(emptyEducationLine);
    }
    setAiLinks({
      tools: normalizeAiLinkArray(normalizedResume.aiToolLinks),
      products: normalizeAiLinkArray(normalizedResume.aiProductLinks),
    });
  };

  const buildResumePayload = (): Resume => {
    const hasEducation =
      educationLine.school || educationLine.major || educationLine.period;
    const normalizedAiTools = aiLinks.tools
      .map((item) => normalizeUrlValue(item))
      .filter(Boolean);
    const normalizedAiProducts = aiLinks.products
      .map((item) => normalizeUrlValue(item))
      .filter(Boolean);
    return {
      ...structuredResume,
      aiTools: normalizedAiTools.join("\n"),
      aiProducts: normalizedAiProducts.join("\n"),
      aiToolLinks: normalizedAiTools,
      aiProductLinks: normalizedAiProducts,
      basics: {
        ...structuredResume.basics,
        ...basics,
        links: structuredResume.basics.links ?? [],
      },
      skills: normalizeStringList(skillItems),
      education: hasEducation
        ? [
            {
              school: educationLine.school,
              degree: "",
              field: educationLine.major,
              startDate: educationLine.period,
              endDate: "",
              location: "",
              highlights: [],
            },
          ]
        : [],
    };
  };

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      setBooting(true);
      setError("");
      setCanEdit(!isPublicRoute);

      const applyResumeData = (resumeData: ResumeApiResponse) => {
        if (resumeData.resume) {
          applyResume(resumeData.resume);
        }
        if (typeof resumeData.avatarUrl === "string") {
          setAvatarUrl(resumeData.avatarUrl);
        }
        if (
          typeof resumeData.templateId === "string" &&
          templates.some((item) => item.id === resumeData.templateId)
        ) {
          setTemplateId(resumeData.templateId);
        }
        if (typeof resumeData.updatedAt === "number") {
          setSavedAt(new Date(resumeData.updatedAt * 1000).toISOString());
        }
      };

      try {
        if (isPublicRoute) {
          setUsername(profileUsername);

          const publicResponse = await fetch(
            `/api/public/${encodeURIComponent(profileUsername)}`,
            { cache: "no-store" },
          );
          const publicData = (await publicResponse
            .json()
            .catch(() => ({}))) as ResumeApiResponse;
          if (!publicResponse.ok) {
            if (publicResponse.status === 404) {
              router.replace("/");
              return;
            }
            throw new Error(publicData.error ?? "Failed to load public resume.");
          }

          if (cancelled) return;
          setUsername(publicData.user?.username ?? profileUsername);
          applyResumeData(publicData);

          const meResponse = await fetch("/api/auth/me?silent=1", {
            cache: "no-store",
          });
          const meData = (await meResponse.json().catch(() => ({}))) as MeResponse;
          const isOwner =
            typeof meData.user?.username === "string" &&
            meData.user.username.toLowerCase() === profileUsername;

          if (cancelled) return;
          setCanEdit(isOwner);

          if (isOwner) {
            const resumeResponse = await fetch("/api/resume", {
              cache: "no-store",
            });
            const resumeData = (await resumeResponse
              .json()
              .catch(() => ({}))) as ResumeApiResponse;
            if (!resumeResponse.ok) {
              throw new Error(resumeData.error ?? "Failed to load resume data.");
            }
            if (cancelled) return;
            applyResumeData(resumeData);
          }
          return;
        }

        const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const meData = (await meResponse.json().catch(() => ({}))) as MeResponse;
        if (!meResponse.ok || !meData.user) {
          if (!cancelled) {
            router.replace("/");
          }
          return;
        }

        if (cancelled) return;
        setCanEdit(true);
        setUsername(meData.user.username);

        const resumeResponse = await fetch("/api/resume", { cache: "no-store" });
        const resumeData = (await resumeResponse
          .json()
          .catch(() => ({}))) as ResumeApiResponse;
        if (!resumeResponse.ok) {
          if (!cancelled && resumeResponse.status === 401) {
            router.replace("/");
            return;
          }
          throw new Error(resumeData.error ?? "Failed to load resume data.");
        }

        if (cancelled) return;
        applyResumeData(resumeData);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to initialize.");
      } finally {
        if (!cancelled) {
          setBooting(false);
        }
      }
    };

    void initialize();
    return () => {
      cancelled = true;
    };
  }, [isPublicRoute, profileUsername, router]);

  const handleSave = async () => {
    if (isReadonly || saving) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: buildResumePayload(),
          avatarUrl,
          templateId,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        updatedAt?: number;
      };

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/");
          return;
        }
        throw new Error(data.error ?? "Failed to save resume.");
      }

      if (typeof data.updatedAt === "number") {
        setSavedAt(new Date(data.updatedAt * 1000).toISOString());
      } else {
        setSavedAt(new Date().toISOString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请重试。");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isReadonly) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isReadonly) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };

      if (!response.ok || typeof data.url !== "string") {
        throw new Error(data.error ?? "Failed to upload avatar image.");
      }

      setAvatarUrl(data.url);
    } catch {
      // Fallback to local preview if cloud upload is unavailable.
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setError("Avatar upload failed. Using local preview instead.");
    } finally {
      setUploadingAvatar(false);
    }

    event.currentTarget.value = "";
  };

  const handleGenerate = async () => {
    if (isReadonly || loading) return;
    setError("");
    setAssistantMessage("");
    setLoading(true);
    const resumePayload = buildResumePayload();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumePayload }),
      });

      const data = (await response.json().catch(() => ({}))) as ChatApiResponse;
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("您所在 IP 今日额度已用完，明日重置。");
        }
        throw new Error(data?.error || "请求失败");
      }

      if (data?.resume) {
        applyResume(data.resume);
      }

      if (data?.assistant_message) {
        setAssistantMessage(data.assistant_message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "服务不可用");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const originalTitle = document.title;
    const name = basics.name.trim();
    const jobTarget = basics.jobTarget.trim();
    const printTitle = [name, jobTarget].filter(Boolean).join("-");
    if (printTitle) {
      document.title = printTitle;
    }
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // ignore font readiness errors
      }
    }
    window.print();
    window.setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f3f5] text-slate-600">
        正在加载...
      </div>
    );
  }

  return (
    <ResumeReadonlyContext.Provider value={isReadonly}>
      <div
        id="resume-page"
        className={`min-h-screen print:min-h-0 text-slate-900 ${bodyFont.variable} ${headingFont.variable}`}
        style={{ backgroundColor: template.pageBg }}
      >
        <div className="mx-auto flex max-w-[900px] flex-col gap-4 px-4 py-6 print:max-w-none print:px-0 print:py-0 print:gap-0">
          {canEdit ? (
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-600 print:hidden">
              {username ? (
                <a
                  href={`/${username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:border-slate-400"
                >
                  /{username}
                </a>
              ) : null}
              {savedAt ? (
                <span className="text-xs text-slate-500">
                  已保存 {new Date(savedAt).toLocaleTimeString("zh-CN")}
                </span>
              ) : null}
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "保存中..." : "保存"}
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "AI润色中..." : "AI润色"}
              </button>
              <button
                onClick={handleDownload}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400"
              >
                打印
              </button>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400"
                aria-label="退出登录"
                title="退出登录"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : isReadonly ? (
            <div className="flex justify-end print:hidden" data-export="exclude">
              <a
                href="/register"
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400"
              >
                创建我的resumio
              </a>
            </div>
          ) : null}
          {((canEdit && assistantMessage) || error) && (
            <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 print:hidden">
              {canEdit && assistantMessage && <p>{assistantMessage}</p>}
              {error && <p className="text-rose-600">{error}</p>}
            </div>
          )}

        <div
          ref={resumeRef}
          id="resume-root"
          className={`w-full border print:border-0 print:max-w-none text-slate-900 ${template.resumePaddingClass}`}
          style={resumeStyle}
        >
          <div className="pb-0">
            <div className={headerClass}>
              <div className="flex min-w-[260px] flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" style={{ color: "var(--accent)" }} aria-hidden />
                  <EditableBlock
                    value={basics.name}
                    onChange={(value) => updateBasics("name", value)}
                    placeholder="你的姓名"
                    className="!text-2xl font-semibold text-slate-900 [font-family:var(--font-heading)]"
                    singleLine
                  />
                </div>
                <EditableBlock
                  value={basics.summary}
                  onChange={(value) => updateBasics("summary", value)}
                  placeholder="一段自我介绍"
                  className="text-sm text-slate-700"
                />
                <div className={contactClass}>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} aria-hidden />
                    <EditableBlock
                    value={basics.phone}
                    onChange={(value) => updateBasics("phone", value)}
                    placeholder="电话"
                    className="text-xs"
                    singleLine
                  />
                  </div>
                  <div className="flex items-center gap-1">
                    <VenusAndMars
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--accent)" }}
                      aria-hidden
                    />
                    <EditableBlock
                    value={basics.gender}
                    onChange={(value) => updateBasics("gender", value)}
                    placeholder="性别"
                    className="text-xs"
                    singleLine
                  />
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--accent)" }}
                      aria-hidden
                    />
                    <EditableBlock
                    value={basics.age}
                    onChange={(value) => updateBasics("age", value)}
                    placeholder="年龄"
                    className="text-xs"
                    singleLine
                  />
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} aria-hidden />
                    <EditableBlock
                    value={basics.email}
                    onChange={(value) => updateBasics("email", value)}
                    placeholder="邮箱"
                    className="text-xs"
                    singleLine
                  />
                  </div>
                  <div className="flex items-center gap-1">
                    <Target
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--accent)" }}
                      aria-hidden
                    />
                    <EditableBlock
                      value={basics.jobTarget}
                      onChange={(value) => updateBasics("jobTarget", value)}
                      placeholder="求职意向"
                      className="text-xs"
                      singleLine
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} aria-hidden />
                    <EditableBlock
                    value={basics.location}
                    onChange={(value) => updateBasics("location", value)}
                    placeholder="城市"
                    className="text-xs"
                    singleLine
                  />
                  </div>
                </div>
              </div>
              <div className={`flex flex-col gap-2 ${avatarWrapperClass}`}>
                <label
                  htmlFor={canEdit ? "avatar-upload" : undefined}
                  className={`flex items-center justify-center overflow-hidden bg-transparent text-xs text-slate-500 ${template.avatarFrameClass} ${
                    canEdit ? "cursor-pointer" : "cursor-default"
                  }`}
                  aria-label="上传头像"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="头像"
                      className={`h-full w-full object-cover ${template.avatarImageClass}`}
                    />
                  ) : (
                    "上传头像"
                  )}
                </label>
                {canEdit ? (
                  <input
                    ref={avatarInputRef}
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    disabled={uploadingAvatar}
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                ) : null}
              </div>
            </div>
          </div>

          <Section
            title="工作经历"
            icon={Briefcase}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            {structuredResume.experience.length > 0 ? (
              <>
                <div className="space-y-4 min-h-[220px] print:min-h-0">
                  {structuredResume.experience.map((item, index) => (
                      <div key={`experience-${index}`} className="space-y-2">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="flex min-w-0 items-baseline gap-2">
                            <EditableBlock
                              value={item.role}
                              onChange={(value) =>
                                updateExperienceField(index, "role", value)
                              }
                              placeholder="职位"
                              className="font-semibold text-slate-900"
                              singleLine
                            />
                            <span className="text-slate-400">-</span>
                            <EditableBlock
                              value={item.company}
                              onChange={(value) =>
                                updateExperienceField(index, "company", value)
                              }
                              placeholder="公司"
                              className="font-semibold text-slate-900"
                              singleLine
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-baseline gap-1 text-xs text-slate-600">
                              <EditableBlock
                                value={item.startDate}
                                onChange={(value) =>
                                  updateExperienceField(index, "startDate", value)
                                }
                                placeholder="开始"
                                className="min-w-[52px] text-right text-xs text-slate-600"
                                singleLine
                              />
                              <span className="text-slate-400">-</span>
                              <EditableBlock
                                value={item.endDate}
                                onChange={(value) =>
                                  updateExperienceField(index, "endDate", value)
                                }
                                placeholder="结束"
                                className="min-w-[52px] text-right text-xs text-slate-600"
                                singleLine
                              />
                            </div>
                            {canEdit ? (
                              <button
                                type="button"
                                onClick={() => removeExperience(index)}
                                data-export="exclude"
                                className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-500 transition hover:border-slate-400"
                              >
                                删除
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <EditableBlock
                          value={item.summary ?? ""}
                          onChange={(value) =>
                            updateExperienceField(index, "summary", value)
                          }
                          placeholder="经历概述"
                          className="text-sm text-slate-700"
                        />
                      </div>
                  ))}
                </div>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={addExperience}
                    data-export="exclude"
                    className="mt-3 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-400"
                  >
                    增加
                  </button>
                ) : null}
              </>
            ) : (
              <EditableBlock
                value={text.experience}
                onChange={(value) => updateText("experience", value)}
                placeholder="直接描述每段经历，可换行"
                className="min-h-[220px]"
              />
            )}
          </Section>

          <Section
            title="项目经历"
            icon={FolderKanban}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            {structuredResume.projects.length > 0 ? (
              <>
                <div className="space-y-4 min-h-[220px] print:min-h-0">
                  {structuredResume.projects.map((item, index) => (
                    <div key={`project-${index}`} className="space-y-2">
                      <div className="flex items-baseline justify-between gap-4">
                        <EditableBlock
                          value={item.name}
                          onChange={(value) =>
                            updateProjectField(index, "name", value)
                          }
                          placeholder="项目名称"
                          className="font-semibold text-slate-900"
                          singleLine
                        />
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => removeProject(index)}
                            data-export="exclude"
                            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-500 transition hover:border-slate-400"
                          >
                            删除
                          </button>
                        ) : null}
                      </div>
                      <EditableBlock
                        value={item.description}
                        onChange={(value) =>
                          updateProjectField(index, "description", value)
                        }
                        placeholder="项目概述"
                        className="text-sm text-slate-700"
                      />
                    </div>
                  ))}
                </div>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={addProject}
                    data-export="exclude"
                    className="mt-3 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-400"
                  >
                    增加
                  </button>
                ) : null}
              </>
            ) : (
              <EditableBlock
                value={text.projects}
                onChange={(value) => updateText("projects", value)}
                placeholder="直接描述项目背景、做法、价值"
                className="min-h-[220px]"
              />
            )}
          </Section>

          <Section
            title="专业技能"
            icon={Wrench}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            <div className="space-y-2">
              {(canEdit ? skillItems : skillItems.filter((item) => item.trim().length > 0)).map(
                (item, index) => (
                  <div key={`skill-${index}`} className="flex items-center gap-2">
                    {canEdit ? (
                      <>
                        <input
                          value={item}
                          onChange={(event) => updateSkillItem(index, event.target.value)}
                          placeholder="例如：C++ / Python"
                          className="min-w-0 flex-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 print:hidden"
                        />
                        <span className="hidden print:inline-block rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700">
                          {item}
                        </span>
                      </>
                    ) : (
                      <span className="rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700">
                        {item}
                      </span>
                    )}
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => removeSkillItem(index)}
                        data-export="exclude"
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500 transition hover:border-slate-400"
                      >
                        删除
                      </button>
                    ) : null}
                  </div>
                ),
              )}
              {canEdit ? (
                <button
                  type="button"
                  onClick={addSkillItem}
                  data-export="exclude"
                  className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-400"
                >
                  增加
                </button>
              ) : null}
            </div>
          </Section>

          <Section
            title="AI工具"
            icon={Sparkles}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            <div
              className="grid grid-cols-4 print:grid-cols-4 gap-2"
              style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
            >
              {aiLinks.tools.map((item, index) => {
                const meta = resolveUrlMeta(item);
                const showInput = canEdit && (!meta || item.trim().length === 0);
                return (
                  <div
                    key={`ai-tool-${index}`}
                    className="relative flex min-h-10 items-center rounded border border-slate-200 bg-white px-2 py-1.5"
                  >
                    {showInput ? (
                      <input
                        value={item}
                        onChange={(event) =>
                          updateAiLink("tools", index, event.target.value)
                        }
                        onBlur={() => normalizeAiLinkItem("tools", index)}
                        placeholder="https://chatgpt.com/"
                        className="min-w-0 flex-1 bg-transparent pr-7 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    ) : meta ? (
                      <a
                        href={meta.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-2 text-sm text-slate-700"
                      >
                        <SiteIcon meta={meta} />
                        <span className="truncate">{meta.label}</span>
                      </a>
                    ) : (
                      <span className="truncate text-sm text-slate-700">{item}</span>
                    )}
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => removeAiLink("tools", index)}
                        data-export="exclude"
                        className="absolute right-1 top-1 rounded px-1 text-xs text-slate-500 transition hover:bg-slate-100"
                        aria-label="删除"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => addAiLink("tools")}
                  data-export="exclude"
                  className="flex min-h-10 items-center justify-center rounded border border-dashed border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-400"
                >
                  增加
                </button>
              ) : null}
            </div>
          </Section>

          <Section
            title="我的产品"
            icon={Sparkles}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            <div
              className="grid grid-cols-4 print:grid-cols-4 gap-2"
              style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
            >
              {aiLinks.products.map((item, index) => {
                const meta = resolveUrlMeta(item);
                const showInput = canEdit && (!meta || item.trim().length === 0);
                return (
                  <div
                    key={`ai-product-${index}`}
                    className="relative flex min-h-10 items-center rounded border border-slate-200 bg-white px-2 py-1.5"
                  >
                    {showInput ? (
                      <input
                        value={item}
                        onChange={(event) =>
                          updateAiLink("products", index, event.target.value)
                        }
                        onBlur={() => normalizeAiLinkItem("products", index)}
                        placeholder="https://example.com/"
                        className="min-w-0 flex-1 bg-transparent pr-7 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    ) : meta ? (
                      <a
                        href={meta.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-2 text-sm text-slate-700"
                      >
                        <SiteIcon meta={meta} />
                        <span className="truncate">{meta.label}</span>
                      </a>
                    ) : (
                      <span className="truncate text-sm text-slate-700">{item}</span>
                    )}
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => removeAiLink("products", index)}
                        data-export="exclude"
                        className="absolute right-1 top-1 rounded px-1 text-xs text-slate-500 transition hover:bg-slate-100"
                        aria-label="删除"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => addAiLink("products")}
                  data-export="exclude"
                  className="flex min-h-10 items-center justify-center rounded border border-dashed border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-400"
                >
                  增加
                </button>
              ) : null}
            </div>
          </Section>

          <Section
            title="教育经历"
            icon={GraduationCap}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            <div className="flex items-baseline gap-4 text-sm text-slate-700">
              <div className="flex min-w-0 flex-1 items-baseline gap-2">
                <EditableBlock
                  value={educationLine.school}
                  onChange={(value) => updateEducationLine("school", value)}
                  placeholder="学校名称"
                  className="text-sm"
                  singleLine
                />
                <span className="text-slate-400">—</span>
                <EditableBlock
                  value={educationLine.major}
                  onChange={(value) => updateEducationLine("major", value)}
                  placeholder="专业"
                  className="text-sm"
                  singleLine
                />
              </div>
              <EditableBlock
                value={educationLine.period}
                onChange={(value) => updateEducationLine("period", value)}
                placeholder="时间"
                className="min-w-[90px] text-sm text-right text-slate-600"
                singleLine
              />
            </div>
          </Section>

          
        </div>
      </div>

        <style jsx>{`
          :global(.editable) {
            min-height: 1.2em;
          }
          :global(.editable[data-empty="true"]::before) {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            :global(body) {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* 覆盖外层页面灰色背景（inline style 优先级高，需要 !important） */
            :global(#resume-page) {
              background: white !important;
            }
            :global(#resume-root) {
              max-width: 190mm !important;
              min-height: 0 !important;
            }
            /* 隐藏所有编辑控件（删除/增加按钮等） */
            :global([data-export="exclude"]) {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </ResumeReadonlyContext.Provider>
  );
}
