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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  Link as LinkIcon,
  LogOut,
  Mail,
  MapPin,
  Phone,
  UserRound,
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
    description: "榛樿鏍峰紡",
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
    description: "鐣欑櫧鏇村ぇ",
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
    description: "绱у噾鎺掔増",
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
    website: string;
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
  website: string;
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
    website: "",
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
  website: "",
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

  return {
    ...resume,
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
  const left = [value.school, value.major].filter(Boolean).join(" 鈥斺€?");
  return [left, value.period].filter(Boolean).join("  ");
};

const parseLines = (value: string) =>
  value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

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
        item.tech.length > 0 ? `鎶€鏈爤 ${item.tech.join(" ")}` : "";
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

export default function ResumeEditorPage({ publicUsername }: ResumeEditorPageProps) {
  const router = useRouter();
  const profileUsername = publicUsername?.trim().toLowerCase() ?? "";
  const isPublicRoute = profileUsername.length > 0;
  const [basics, setBasics] = useState<BasicsInput>(emptyBasics);
  const [text, setText] = useState<TextSections>(emptyTextSections);
  const [educationLine, setEducationLine] =
    useState<EducationLine>(emptyEducationLine);
  const [structuredResume, setStructuredResume] = useState<Resume>(emptyResume);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [booting, setBooting] = useState(true);
  const [username, setUsername] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [error, setError] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
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

  const addProject = () => {
    if (isReadonly) return;
    setStructuredResume((prev) => ({
      ...prev,
      projects: [...prev.projects, createEmptyProjectItem()],
    }));
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
      website: normalizedResume.basics.website ?? "",
      summary: normalizedResume.basics.summary ?? "",
    });
    setText(resumeToText(normalizedResume));
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
  };

  const buildResumePayload = (): Resume => {
    const hasEducation =
      educationLine.school || educationLine.major || educationLine.period;
    return {
      ...structuredResume,
      basics: {
        ...structuredResume.basics,
        ...basics,
        links: structuredResume.basics.links ?? [],
      },
      skills: parseLines(text.skills),
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
      setError(err instanceof Error ? err.message : "Save failed.");
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
        throw new Error(data?.error || "璇锋眰澶辫触");
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
    if (!resumeRef.current || downloading) return;
    const hasValue = (value?: string) =>
      typeof value === "string" && value.trim().length > 0;
    const hasArrayValues = (values?: string[]) =>
      Array.isArray(values) && values.some(hasValue);
    const hasBasicsContent = Object.values(basics).some(hasValue);
    const hasEducationLineContent = [
      educationLine.school,
      educationLine.major,
      educationLine.period,
    ].some(hasValue);
    const hasTextContent = [
      text.skills,
      text.experience,
      text.projects,
    ].some(hasValue);
    const hasExperienceContent = structuredResume.experience.some(
      (item) =>
        [
          item.company,
          item.role,
          item.summary,
          item.startDate,
          item.endDate,
          item.location,
        ].some(hasValue) || hasArrayValues(item.highlights),
    );
    const hasProjectContent = structuredResume.projects.some(
      (item) =>
        [item.name, item.description, item.link].some(hasValue) ||
        hasArrayValues(item.highlights) ||
        hasArrayValues(item.tech),
    );
    const hasEducationContent = Array.isArray(structuredResume.education)
      ? structuredResume.education.some(
          (item) =>
            [
              item.school,
              item.degree,
              item.field,
              item.startDate,
              item.endDate,
              item.location,
            ].some(hasValue) || hasArrayValues(item.highlights),
        )
      : false;
    const hasUserContent =
      hasBasicsContent ||
      hasEducationLineContent ||
      hasTextContent ||
      hasExperienceContent ||
      hasProjectContent ||
      hasEducationContent ||
      Boolean(avatarUrl);

    if (!hasUserContent) {
      setError("请先填写内容。");
      return;
    }
    setDownloading(true);
    setError("");
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const hexToRgb = (value: string) => {
        const normalized = value.replace("#", "").trim();
        if (normalized.length === 3) {
          const r = Number.parseInt(normalized[0] + normalized[0], 16);
          const g = Number.parseInt(normalized[1] + normalized[1], 16);
          const b = Number.parseInt(normalized[2] + normalized[2], 16);
          return { r, g, b };
        }
        if (normalized.length !== 6) return null;
        const num = Number.parseInt(normalized, 16);
        if (Number.isNaN(num)) return null;
        return {
          r: (num >> 16) & 0xff,
          g: (num >> 8) & 0xff,
          b: num & 0xff,
        };
      };

      const backgroundRgb = hexToRgb(template.resumeBg) ?? {
        r: 255,
        g: 255,
        b: 255,
      };

      const createSnapshot = () => {
        const original = resumeRef.current!;
        const clone = original.cloneNode(true) as HTMLElement;
        clone.style.position = "fixed";
        clone.style.left = "0";
        clone.style.top = "0";
        clone.style.margin = "0";
        clone.style.backgroundColor = template.resumeBg;
        clone.style.borderColor = template.border;
        clone.style.setProperty("--accent", template.accent);
        clone.style.setProperty("--line", template.line);
        clone.style.width = `${original.offsetWidth}px`;
        clone.style.minHeight = `${original.offsetHeight}px`;
        clone.querySelectorAll("[contenteditable]").forEach((node) => {
          node.removeAttribute("contenteditable");
          node.removeAttribute("data-placeholder");
          node.removeAttribute("data-empty");
        });
        clone.querySelectorAll("[data-export=\"exclude\"]").forEach((node) => {
          node.remove();
        });
        document.body.appendChild(clone);
        return clone;
      };

      const renderCanvas = async (
        target: HTMLElement,
        useForeignObject: boolean,
      ) => {
        target.setAttribute("data-capture-root", "true");
        try {
          return await html2canvas(target, {
            scale: 2,
            backgroundColor: template.resumeBg,
            useCORS: true,
            foreignObjectRendering: useForeignObject,
            onclone: (doc) => {
              const root = doc.querySelector(
                "[data-capture-root=\"true\"]",
              ) as HTMLElement | null;
              if (!root) return;
              root.style.setProperty("--accent", template.accent);
              root.style.setProperty("--line", template.line);
            root.querySelectorAll("[contenteditable]").forEach((node) => {
              node.removeAttribute("contenteditable");
              node.removeAttribute("data-placeholder");
              node.removeAttribute("data-empty");
            });
            root.querySelectorAll("[data-export=\"exclude\"]").forEach((node) => {
              node.remove();
            });
            if (!doc.defaultView) return;
            const walker = doc.createTreeWalker(
              root,
              doc.defaultView.NodeFilter.SHOW_ELEMENT,
            );
              let node: HTMLElement | null = root;
              while (node) {
                const styles = doc.defaultView.getComputedStyle(node);
                node.style.color = styles.color;
                node.style.backgroundColor = styles.backgroundColor;
                node.style.borderTopColor = styles.borderTopColor;
                node.style.borderRightColor = styles.borderRightColor;
                node.style.borderBottomColor = styles.borderBottomColor;
                node.style.borderLeftColor = styles.borderLeftColor;
                node.style.boxShadow = styles.boxShadow;
                node.style.fontFamily = styles.fontFamily;
                node.style.fontSize = styles.fontSize;
                node.style.fontWeight = styles.fontWeight;
                node.style.lineHeight = styles.lineHeight;
                node.style.letterSpacing = styles.letterSpacing;
                node = walker.nextNode() as HTMLElement | null;
              }
            },
          });
        } finally {
          target.removeAttribute("data-capture-root");
        }
      };

      let canvas: HTMLCanvasElement;
      const isCanvasBlank = (value: HTMLCanvasElement) => {
        if (!value.width || !value.height) return true;
        const sampleSize = 192;
        const threshold = 6;
        const sampleCanvas = document.createElement("canvas");
        sampleCanvas.width = sampleSize;
        sampleCanvas.height = sampleSize;
        const sampleContext = sampleCanvas.getContext("2d");
        if (!sampleContext) return false;
        try {
          sampleContext.drawImage(value, 0, 0, sampleSize, sampleSize);
          const data = sampleContext.getImageData(
            0,
            0,
            sampleSize,
            sampleSize,
          ).data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            const diff =
              Math.abs(r - backgroundRgb.r) +
              Math.abs(g - backgroundRgb.g) +
              Math.abs(b - backgroundRgb.b);
            if (
              a !== 0 &&
              diff > threshold
            ) {
              return false;
            }
          }
        } catch (error) {
          return false;
        }
        return true;
      };

      const snapshot = createSnapshot();
      let usedForeignObject = false;
      try {
        try {
          canvas = await renderCanvas(snapshot, false);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (/oklab|oklch|color function/i.test(message)) {
            canvas = await renderCanvas(snapshot, true);
            usedForeignObject = true;
          } else {
            throw err;
          }
        }

        if (!usedForeignObject && isCanvasBlank(canvas)) {
          const alternative = await renderCanvas(snapshot, true);
          if (!isCanvasBlank(alternative)) {
            canvas = alternative;
          }
        }

        if (isCanvasBlank(canvas)) {
          let directCanvas = await renderCanvas(resumeRef.current!, false);
          if (isCanvasBlank(directCanvas)) {
            directCanvas = await renderCanvas(resumeRef.current!, true);
          }
          if (!isCanvasBlank(directCanvas)) {
            canvas = directCanvas;
          }
        }
      } finally {
        snapshot.remove();
      }

      if (isCanvasBlank(canvas)) {
        throw new Error(
          "当前浏览器导出失败，请使用 Chrome/Edge 或系统打印导出。",
        );
      }
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const epsilon = 0.5;
      const pageCount = Math.max(
        1,
        Math.ceil((imgHeight - epsilon) / pdfHeight),
      );
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      for (let page = 1; page < pageCount; page += 1) {
        const position = -pdfHeight * page;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      }

      const filename = basics.name ? `${basics.name}-绠€鍘?pdf` : "绠€鍘?pdf";
      pdf.save(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF 生成失败，请重试。");
    } finally {
      setDownloading(false);
    }
  };

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f3f5] text-slate-600">
        姝ｅ湪鍔犺浇...
      </div>
    );
  }

  return (
    <ResumeReadonlyContext.Provider value={isReadonly}>
      <div
        className={`min-h-screen text-slate-900 ${bodyFont.variable} ${headingFont.variable}`}
        style={{ backgroundColor: template.pageBg }}
      >
        <div className="mx-auto flex max-w-[900px] flex-col gap-4 px-4 py-6">
                {canEdit ? (
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-600">
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
                  宸蹭繚瀛?{new Date(savedAt).toLocaleTimeString("zh-CN")}
                </span>
              ) : null}
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "AI running..." : "AI polish"}
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? "Generating..." : "Download PDF"}
              </button>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}
          {((canEdit && assistantMessage) || error) && (
            <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
              {canEdit && assistantMessage && <p>{assistantMessage}</p>}
              {error && <p className="text-rose-600">{error}</p>}
            </div>
          )}

        <div
          ref={resumeRef}
          id="resume-root"
          className={`w-full border text-slate-900 ${template.resumePaddingClass}`}
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
                    placeholder="浣犵殑濮撳悕"
                    className="!text-2xl font-semibold text-slate-900 [font-family:var(--font-heading)]"
                    singleLine
                  />
                </div>
                <div className={contactClass}>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} aria-hidden />
                    <EditableBlock
                    value={basics.phone}
                    onChange={(value) => updateBasics("phone", value)}
                    placeholder="鐢佃瘽"
                    className="text-xs"
                    singleLine
                  />
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} aria-hidden />
                    <EditableBlock
                    value={basics.email}
                    onChange={(value) => updateBasics("email", value)}
                    placeholder="閭"
                    className="text-xs"
                    singleLine
                  />
                  </div>
                  <div className="flex items-center gap-1">
                    <LinkIcon
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--accent)" }}
                      aria-hidden
                    />
                    <EditableBlock
                      value={basics.website}
                      onChange={(value) => updateBasics("website", value)}
                      placeholder="涓汉閾炬帴"
                      className="text-xs"
                      singleLine
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} aria-hidden />
                    <EditableBlock
                    value={basics.location}
                    onChange={(value) => updateBasics("location", value)}
                    placeholder="鍩庡競"
                    className="text-xs"
                    singleLine
                  />
                  </div>
                </div>
              </div>
              <div className={`flex flex-col gap-2 ${avatarWrapperClass}`}>
                <label
                  htmlFor={canEdit ? "avatar-upload" : undefined}
                  className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#f59e0b] bg-[#fff7ed] text-xs text-[#9a3412] ${
                    canEdit ? "cursor-pointer" : "cursor-default"
                  }`}
                  aria-label="涓婁紶澶村儚"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="澶村儚"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    "涓婁紶澶村儚"
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
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <GraduationCap className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden />
                <h2
                  className={template.sectionTitleClass}
                  style={{ color: "var(--accent)" }}
                >
                  鏁欒偛缁忓巻
                </h2>
                <div
                  className={`flex-1 ${template.sectionLineClass}`}
                  style={{ backgroundColor: "var(--line)" }}
                />
              </div>
              <div className="mt-3 flex items-baseline gap-4 text-sm text-slate-700">
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <EditableBlock
                    value={educationLine.school}
                    onChange={(value) => updateEducationLine("school", value)}
                    placeholder="瀛︽牎鍚嶇О"
                    className="text-sm"
                    singleLine
                  />
                  <span className="text-slate-400">—</span>
                  <EditableBlock
                    value={educationLine.major}
                    onChange={(value) => updateEducationLine("major", value)}
                    placeholder="涓撲笟"
                    className="text-sm"
                    singleLine
                  />
                </div>
                <EditableBlock
                  value={educationLine.period}
                  onChange={(value) => updateEducationLine("period", value)}
                  placeholder="鏃堕棿"
                  className="min-w-[90px] text-sm text-right text-slate-600"
                  singleLine
                />
              </div>
            </div>
          </div>

          <Section
            title="专业技能"
            icon={Wrench}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            <EditableBlock
              value={text.skills}
              onChange={(value) => updateText("skills", value)}
              placeholder="直接写技能清单即可"
              className="min-h-[160px]"
            />
          </Section>

          <Section
            title="宸ヤ綔缁忓巻"
            icon={Briefcase}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            {structuredResume.experience.length > 0 ? (
              <>
                <div className="space-y-4 min-h-[220px]">
                  {structuredResume.experience.map((item, index) => (
                      <div key={`experience-${index}`} className="space-y-2">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="flex min-w-0 items-baseline gap-2">
                            <EditableBlock
                              value={item.role}
                              onChange={(value) =>
                                updateExperienceField(index, "role", value)
                              }
                              placeholder="缁忓巻鍚嶇О"
                              className="font-semibold text-slate-900"
                              singleLine
                            />
                            <span className="text-slate-400">-</span>
                            <EditableBlock
                              value={item.company}
                              onChange={(value) =>
                                updateExperienceField(index, "company", value)
                              }
                              placeholder="鍏徃"
                              className="font-semibold text-slate-900"
                              singleLine
                            />
                          </div>
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
                              placeholder="缁撴潫"
                              className="min-w-[52px] text-right text-xs text-slate-600"
                              singleLine
                            />
                          </div>
                        </div>
                        <EditableBlock
                          value={item.summary ?? ""}
                          onChange={(value) =>
                            updateExperienceField(index, "summary", value)
                          }
                          placeholder="缁忓巻姒傝堪"
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
                    澧炲姞
                  </button>
                ) : null}
              </>
            ) : (
              <EditableBlock
                value={text.experience}
                onChange={(value) => updateText("experience", value)}
                placeholder="鐩存帴鎻忚堪姣忔缁忓巻锛屽彲鎹㈣"
                className="min-h-[220px]"
              />
            )}
          </Section>

          <Section
            title="椤圭洰缁忓巻"
            icon={FolderKanban}
            className={template.sectionSpacing}
            titleClassName={template.sectionTitleClass}
            lineClassName={template.sectionLineClass}
          >
            {structuredResume.projects.length > 0 ? (
              <>
                <div className="space-y-4 min-h-[220px]">
                  {structuredResume.projects.map((item, index) => (
                    <div key={`project-${index}`} className="space-y-2">
                      <div className="flex items-baseline justify-between gap-4">
                        <EditableBlock
                          value={item.name}
                          onChange={(value) =>
                            updateProjectField(index, "name", value)
                          }
                          placeholder="椤圭洰鍚嶇О"
                          className="font-semibold text-slate-900"
                          singleLine
                        />
                        <EditableBlock
                          value={item.link}
                          onChange={(value) =>
                            updateProjectField(index, "link", value)
                          }
                          placeholder="閾炬帴"
                          className="min-w-[120px] text-right text-xs text-slate-600"
                          singleLine
                        />
                      </div>
                      <EditableBlock
                        value={item.description}
                        onChange={(value) =>
                          updateProjectField(index, "description", value)
                        }
                        placeholder="椤圭洰姒傝堪"
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
                    澧炲姞
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
        `}</style>
      </div>
    </ResumeReadonlyContext.Provider>
  );
}

