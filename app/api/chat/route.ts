import OpenAI from "openai";
import { z } from "zod";

const DAILY_LIMIT = 30;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

const createDeepSeekClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  });
};

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-client-ip");

  return realIp?.trim() || "unknown";
};

const ResumeSchema = z.object({
  basics: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    age: z.string().optional(),
    gender: z.string().optional(),
    jobTarget: z.string().optional(),
    summary: z.string(),
    links: z.array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    ),
  }),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      summary: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      location: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      location: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      tech: z.array(z.string()),
      link: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  aiTools: z.string().optional(),
  aiProducts: z.string().optional(),
  aiToolLinks: z.array(z.string()).optional(),
  aiProductLinks: z.array(z.string()).optional(),
});

const ChatResponseSchema = z.object({
  assistant_message: z.string(),
  resume: ResumeSchema,
});

type Resume = z.infer<typeof ResumeSchema>;
type ChatResponse = z.infer<typeof ChatResponseSchema>;

const ResumePatchSchema = z.object({
  basics: z
    .object({
      name: z.string().optional(),
      title: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      age: z.string().optional(),
      gender: z.string().optional(),
      jobTarget: z.string().optional(),
      summary: z.string().optional(),
      links: z
        .array(
          z.object({
            label: z.string().optional(),
            url: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
  skills: z.array(z.string()).optional(),
  experience: z
    .array(
      z.object({
        company: z.string().optional(),
        role: z.string().optional(),
        summary: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        highlights: z.array(z.string()).optional(),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().optional(),
        degree: z.string().optional(),
        field: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        highlights: z.array(z.string()).optional(),
      })
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        tech: z.array(z.string()).optional(),
        link: z.string().optional(),
        highlights: z.array(z.string()).optional(),
      })
    )
    .optional(),
  aiTools: z.string().optional(),
  aiProducts: z.string().optional(),
  aiToolLinks: z.array(z.string()).optional(),
  aiProductLinks: z.array(z.string()).optional(),
});

type ResumePatch = z.infer<typeof ResumePatchSchema>;

const emptyResume = () => ({
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
  experience: [],
  education: [],
  projects: [],
  aiTools: "",
  aiProducts: "",
  aiToolLinks: [],
  aiProductLinks: [],
});

const extractFirstJsonObject = (text: string) => {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
};

const normalizeString = (value: string | undefined) => value?.trim() ?? "";

const mergeString = (base: string, patch?: string) => {
  const normalized = normalizeString(patch);
  return normalized ? normalized : base;
};

const normalizeStringArray = (values?: string[]) => {
  if (!Array.isArray(values)) return null;
  const normalized = values
    .map((value) => normalizeString(value))
    .filter(Boolean);
  return normalized.length > 0 ? normalized : null;
};

const normalizeLinks = (values?: { label?: string; url?: string }[]) => {
  if (!Array.isArray(values)) return null;
  const normalized = values
    .map((link) => ({
      label: normalizeString(link?.label),
      url: normalizeString(link?.url),
    }))
    .filter((link) => link.label || link.url);
  return normalized.length > 0 ? normalized : null;
};

const normalizeExperience = (values?: ResumePatch["experience"]) => {
  if (!Array.isArray(values)) return null;
  const normalized = values
    .map((item) => ({
      company: normalizeString(item.company),
      role: normalizeString(item.role),
      summary: normalizeString(item.summary),
      startDate: normalizeString(item.startDate),
      endDate: normalizeString(item.endDate),
      location: normalizeString(item.location),
      highlights: normalizeStringArray(item.highlights) ?? [],
    }))
    .filter(
      (item) =>
        item.company ||
        item.role ||
        item.summary ||
        item.startDate ||
        item.endDate ||
        item.location ||
        item.highlights.length > 0
    );
  return normalized.length > 0 ? normalized : null;
};

const normalizeEducation = (values?: ResumePatch["education"]) => {
  if (!Array.isArray(values)) return null;
  const normalized = values
    .map((item) => ({
      school: normalizeString(item.school),
      degree: normalizeString(item.degree),
      field: normalizeString(item.field),
      startDate: normalizeString(item.startDate),
      endDate: normalizeString(item.endDate),
      location: normalizeString(item.location),
      highlights: normalizeStringArray(item.highlights) ?? [],
    }))
    .filter(
      (item) =>
        item.school ||
        item.degree ||
        item.field ||
        item.startDate ||
        item.endDate ||
        item.location ||
        item.highlights.length > 0
    );
  return normalized.length > 0 ? normalized : null;
};

const normalizeProjects = (values?: ResumePatch["projects"]) => {
  if (!Array.isArray(values)) return null;
  const normalized = values
    .map((item) => ({
      name: normalizeString(item.name),
      description: normalizeString(item.description),
      tech: normalizeStringArray(item.tech) ?? [],
      link: normalizeString(item.link),
      highlights: normalizeStringArray(item.highlights) ?? [],
    }))
    .filter(
      (item) =>
        item.name ||
        item.description ||
        item.link ||
        item.tech.length > 0 ||
        item.highlights.length > 0
    );
  return normalized.length > 0 ? normalized : null;
};

const mergeResume = (base: Resume, patch: ResumePatch): Resume => {
  const basicsPatch = patch.basics;
  const merged: Resume = {
    basics: {
      name: mergeString(base.basics.name, basicsPatch?.name),
      title: mergeString(base.basics.title, basicsPatch?.title),
      email: mergeString(base.basics.email, basicsPatch?.email),
      phone: mergeString(base.basics.phone, basicsPatch?.phone),
      location: mergeString(base.basics.location, basicsPatch?.location),
      age: mergeString(base.basics.age ?? "", basicsPatch?.age),
      gender: mergeString(base.basics.gender ?? "", basicsPatch?.gender),
      jobTarget: mergeString(base.basics.jobTarget ?? "", basicsPatch?.jobTarget),
      summary: mergeString(base.basics.summary, basicsPatch?.summary),
      links: normalizeLinks(basicsPatch?.links) ?? base.basics.links,
    },
    skills: normalizeStringArray(patch.skills) ?? base.skills,
    experience: normalizeExperience(patch.experience) ?? base.experience,
    education: normalizeEducation(patch.education) ?? base.education,
    projects: normalizeProjects(patch.projects) ?? base.projects,
    aiTools: mergeString(base.aiTools ?? "", patch.aiTools),
    aiProducts: mergeString(base.aiProducts ?? "", patch.aiProducts),
    aiToolLinks:
      normalizeStringArray(patch.aiToolLinks) ?? (base.aiToolLinks ?? []),
    aiProductLinks:
      normalizeStringArray(patch.aiProductLinks) ?? (base.aiProductLinks ?? []),
  };
  return merged;
};

const buildFallbackResponse = (resume: Resume, assistantMessage?: string): ChatResponse => ({
  assistant_message:
    assistantMessage ?? "模型输出格式异常，请重试或补充信息。",
  resume,
});

const normalizeChatResponse = (raw: unknown, baseResume: Resume): ChatResponse | null => {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const assistantMessage =
    typeof record.assistant_message === "string"
      ? record.assistant_message
      : typeof record.message === "string"
        ? record.message
        : "模型输出格式异常，请重试或补充信息。";

  const resumeCandidate = record.resume ?? record;
  const patchResult = ResumePatchSchema.safeParse(resumeCandidate);
  return {
    assistant_message: assistantMessage,
    resume: patchResult.success ? mergeResume(baseResume, patchResult.data) : baseResume,
  };
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const now = Date.now();
    const existing = ipBuckets.get(ip);
    if (!existing || now > existing.resetAt) {
      ipBuckets.set(ip, { count: 1, resetAt: now + ONE_DAY_MS });
    } else if (existing.count >= DAILY_LIMIT) {
      return Response.json(
        { error: "您所在 IP 今日限额啦，次日更新～" },
        { status: 429 }
      );
    } else {
      ipBuckets.set(ip, {
        count: existing.count + 1,
        resetAt: existing.resetAt,
      });
    }

    const body = (await request.json().catch(() => ({}))) as {
      resume?: unknown;
      raw?: unknown;
    };
    const parsedResume = ResumeSchema.safeParse(body.resume);
    const resume = parsedResume.success ? parsedResume.data : emptyResume();
    const rawInput = body.raw;

    const systemPrompt = [
      "你是一名中文简历解析与润色助手。",
      "任务：从用户提供的原始文本中提取简历信息，并进行措辞美化与结构优化，但不得新增事实。",
      "规则：",
      "1) 严格输出符合给定 schema 的 JSON。",
      "1.1) 只输出 JSON 本体，不要包含任何解释、Markdown、代码块或多余文本。",
      "1.2) 必须包含 assistant_message 和 resume 两个顶级字段，字段名保持不变。",
      "2) 不得臆造公司、时间、学历、数字成果等事实；只改写表达。",
      "2.1) 技能可进行合理能力表述（如“熟悉/掌握/能够”），但不得新增未出现的技能或具体项目细节。",
      "3) 原文可能没有分隔符，请根据语义进行解析。",
      "3.1) skills 输出为一个自然段（数组中只放 1 个字符串）。可将每个技能扩写为能力描述并合并成一段话；不得新增技能。",
      "4) 工作经历/项目经历的 highlights 优先按“问题-方法-价值”组织；如信息不足则保留原表述。",
      "4.1) 工作经历必须包含 summary（经历概述），项目经历使用 description 作为概述。",
      "5) 对于未知字段，保持为空字符串或空数组。",
      "6) assistant_message 只输出给用户的中文短回复（例如：已完成美化）。",
    ].join("\n");

    const userPrompt = rawInput
      ? [
          "请根据 RAW_INPUT_JSON 解析并美化简历。",
          "只改写措辞和组织方式，不新增事实。",
          `RAW_INPUT_JSON:\n${JSON.stringify(rawInput)}`,
        ].join("\n")
      : [
          "请基于以下简历 JSON 进行美化与结构优化。",
          "只改写措辞和组织方式，不新增事实。",
          `CURRENT_RESUME_JSON:\n${JSON.stringify(resume)}`,
        ].join("\n");

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    // DeepSeek official aliases deepseek-chat/deepseek-reasoner point to latest models.
    const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    const deepseek = createDeepSeekClient();

    if (!deepseek) {
      return Response.json(
        { error: "Missing DEEPSEEK_API_KEY. Set it in .dev.vars or Cloudflare Secrets." },
        { status: 500 }
      );
    }

    const completion = await deepseek.chat.completions.create({
      model,
      messages: chatMessages,
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { error: "No response content received from model." },
        { status: 500 }
      );
    }

    const jsonText = extractFirstJsonObject(content) ?? content;
    let raw: unknown;

    try {
      raw = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse model output as JSON.", {
        error: parseError,
        content,
      });
      return Response.json(buildFallbackResponse(resume));
    }

    const validated = ChatResponseSchema.safeParse(raw);
    if (!validated.success) {
      console.error("Model output failed schema validation.", {
        issues: validated.error.issues,
        raw,
      });

      const normalized = normalizeChatResponse(raw, resume);
      return Response.json(normalized ?? buildFallbackResponse(resume));
    }

    return Response.json(validated.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
