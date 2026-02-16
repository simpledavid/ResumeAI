"use client";
/* eslint-disable @next/next/no-img-element */

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

type WidgetType =
  | "title"
  | "text"
  | "image"
  | "location"
  | "website"
  | "wechat"
  | "xhs"
  | "github";

type WidgetShape = "rounded" | "square" | "pill";
type WidgetSizeMode = "square" | "wide";

type Widget = {
  id: string;
  type: WidgetType;
  shape?: WidgetShape;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  content?: string;
  url?: string;
  actionText?: string;
  imageUrl?: string;
  githubUsername?: string;
  githubName?: string;
  githubAvatarUrl?: string;
  githubRepos?: number;
  githubFollowers?: number;
  githubContributionsUrl?: string;
};

type DraggingState = {
  id: string;
  offsetX: number;
  offsetY: number;
};

type LocationEditorState = {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  query: string;
};

type ToolItem = {
  type: WidgetType;
  label: string;
  iconText?: string;
  iconUrl?: string;
};

const TOOLS: ToolItem[] = [
  { type: "title", label: "标题", iconText: "T" },
  { type: "text", label: "文本", iconText: "段" },
  { type: "image", label: "图片", iconText: "🖼" },
  { type: "location", label: "位置", iconText: "📍" },
  { type: "website", label: "网页", iconText: "🌐" },
  { type: "wechat", label: "微信", iconUrl: "https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico" },
  { type: "xhs", label: "小红书", iconUrl: "https://www.xiaohongshu.com/favicon.ico" },
  { type: "github", label: "GitHub", iconUrl: "https://github.com/favicon.ico" },
];

const INITIAL_WIDGETS: Widget[] = [
  {
    id: "init-location",
    type: "location",
    shape: "rounded",
    x: 20,
    y: 20,
    w: 170,
    h: 170,
    title: "北京市",
    imageUrl:
      "https://biofy-public-bucket.oss-cn-hangzhou.aliyuncs.com/assets/official/biofy_cn_official_image_map_01.png",
  },
  {
    id: "init-wechat",
    type: "wechat",
    shape: "pill",
    x: 210,
    y: 20,
    w: 420,
    h: 74,
    title: "微信",
    actionText: "查看",
  },
  {
    id: "init-text",
    type: "text",
    shape: "rounded",
    x: 210,
    y: 110,
    w: 260,
    h: 140,
    title: "文本",
    content: "点击右上角编辑，拖动到你想要的位置。",
  },
];

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getWidgetRadius(shape?: WidgetShape) {
  if (shape === "square") {
    return 0;
  }
  if (shape === "pill") {
    return 9999;
  }
  return 22;
}

function getWidgetSizeMode(widget: Widget): WidgetSizeMode {
  return Math.abs(widget.w - widget.h) <= 16 ? "square" : "wide";
}

function getWidgetSizePreset(type: WidgetType, mode: WidgetSizeMode) {
  if (mode === "square") {
    switch (type) {
      case "location":
      case "image":
        return { w: 170, h: 170 };
      case "wechat":
        return { w: 170, h: 170 };
      case "xhs":
        return { w: 200, h: 200 };
      case "github":
        return { w: 260, h: 260 };
      default:
        return { w: 220, h: 220 };
    }
  }

  switch (type) {
    case "title":
      return { w: 320, h: 96 };
    case "text":
      return { w: 300, h: 140 };
    case "image":
      return { w: 280, h: 170 };
    case "location":
      return { w: 300, h: 170 };
    case "website":
      return { w: 340, h: 96 };
    case "wechat":
      return { w: 420, h: 74 };
    case "xhs":
      return { w: 220, h: 130 };
    case "github":
      return { w: 340, h: 250 };
  }
}

function buildGithubContributionsUrl(username: string) {
  return `https://ghchart.rshah.org/22c55e/${encodeURIComponent(username)}`;
}

function buildHeatmapSeed(input: string) {
  let seed = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    seed ^= input.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function buildGithubHeatmap(username: string) {
  const cells = 19 * 7;
  let seed = buildHeatmapSeed(username || "github");
  const values: number[] = [];

  for (let i = 0; i < cells; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const r = seed / 4294967296;
    let level = 0;
    if (r > 0.78) level = 1;
    if (r > 0.88) level = 2;
    if (r > 0.95) level = 3;
    if (r > 0.985) level = 4;
    values.push(level);
  }

  return values;
}

function githubHeatClass(level: number) {
  if (level === 1) return "bg-[#143022]";
  if (level === 2) return "bg-[#1f5a33]";
  if (level === 3) return "bg-[#2f8f4d]";
  if (level === 4) return "bg-[#5acb78]";
  return "bg-[#121a1f] border border-white/[0.04]";
}

function createWidget(type: WidgetType, offset: number): Widget {
  const baseX = 20 + (offset % 4) * 22;
  const baseY = 20 + (offset % 6) * 22;

  switch (type) {
    case "title":
      return {
        id: newId(),
        type,
        shape: "rounded",
        x: baseX,
        y: baseY,
        w: 320,
        h: 96,
        title: "新标题",
      };
    case "text":
      return {
        id: newId(),
        type,
        shape: "rounded",
        x: baseX,
        y: baseY + 90,
        w: 300,
        h: 140,
        title: "文本",
        content: "这是你的介绍文本",
      };
    case "image":
      return {
        id: newId(),
        type,
        shape: "rounded",
        x: baseX,
        y: baseY + 120,
        w: 170,
        h: 170,
        title: "图片",
        imageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
      };
    case "location":
      return {
        id: newId(),
        type,
        shape: "rounded",
        x: baseX,
        y: baseY + 120,
        w: 170,
        h: 170,
        title: "位置",
        imageUrl:
          "https://biofy-public-bucket.oss-cn-hangzhou.aliyuncs.com/assets/official/biofy_cn_official_image_map_01.png",
      };
    case "website":
      return {
        id: newId(),
        type,
        shape: "rounded",
        x: baseX,
        y: baseY + 120,
        w: 340,
        h: 96,
        title: "我的网站",
        content: "https://example.com",
        url: "https://example.com",
      };
    case "wechat":
      return {
        id: newId(),
        type,
        shape: "pill",
        x: baseX,
        y: baseY + 200,
        w: 420,
        h: 74,
        title: "微信",
        actionText: "查看",
      };
    case "xhs":
      return {
        id: newId(),
        type,
        shape: "rounded",
        x: baseX,
        y: baseY + 130,
        w: 200,
        h: 130,
        title: "小红书",
        content: "@你的账号",
        actionText: "查看",
        url: "https://www.xiaohongshu.com",
      };
    case "github":
      return {
        id: newId(),
        type,
        shape: "rounded",
        x: baseX,
        y: baseY + 130,
        w: 340,
        h: 250,
        title: "GitHub",
        content: "To be an artist-engineer.",
        url: "https://github.com/octocat",
        actionText: "查看",
        githubUsername: "octocat",
        githubName: "The Octocat",
        githubAvatarUrl: "https://github.com/octocat.png",
        githubRepos: 8,
        githubFollowers: 10000,
        githubContributionsUrl: buildGithubContributionsUrl("octocat"),
      };
  }
}

function ToolIcon({ item }: { item: ToolItem }) {
  if (item.iconUrl) {
    return <img src={item.iconUrl} alt={item.label} className="h-6 w-6 rounded-md" draggable={false} />;
  }
  return <span className="text-lg font-bold text-[#d7c6a4]">{item.iconText}</span>;
}

function WidgetBody({ widget }: { widget: Widget }) {
  if (widget.type === "location") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-white/15 bg-white/[0.03]">
        <img src={widget.imageUrl} alt="location" className="h-full w-full object-cover" draggable={false} />
        <span className="absolute bottom-2 left-2 rounded-lg bg-black/45 px-2 py-1 text-xs text-zinc-100">{widget.title}</span>
      </div>
    );
  }

  if (widget.type === "image") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-white/15 bg-black/20">
        {widget.imageUrl ? (
          <img src={widget.imageUrl} alt={widget.title} className="h-full w-full object-cover" draggable={false} />
        ) : null}
      </div>
    );
  }

  if (widget.type === "wechat") {
    const squareMode = getWidgetSizeMode(widget) === "square";
    return (
      <div className="h-full w-full rounded-[20px] border border-emerald-500/40 bg-[linear-gradient(90deg,rgba(0,128,64,0.55),rgba(27,171,89,0.35))] px-4 py-3">
        <div className={`h-full ${squareMode ? "flex flex-col justify-between" : "flex items-center justify-between"}`}>
          <div className={`flex ${squareMode ? "flex-col items-start gap-3" : "items-center gap-3"}`}>
            <img
              src="https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico"
              alt="wechat"
              className="h-8 w-8 rounded-md"
              draggable={false}
            />
            <div>
              <p className={`font-bold text-[#d5f3e4] ${squareMode ? "text-[30px] leading-none" : "text-2xl"}`}>{widget.title}</p>
              {widget.content ? <p className="text-xs text-emerald-100/80">{widget.content}</p> : null}
            </div>
          </div>
          <button className={`rounded-xl bg-[#329a60] text-lg font-bold text-[#d5f3e4] ${squareMode ? "h-11 w-20 self-start" : "h-10 px-5"}`}>{widget.actionText || "查看"}</button>
        </div>
      </div>
    );
  }

  if (widget.type === "website") {
    return (
      <div className="h-full w-full rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
        <div className="text-xl font-bold text-[#d7c6a4]">{widget.title}</div>
        <div className="mt-2 text-sm text-slate-300">{widget.content}</div>
      </div>
    );
  }

  if (widget.type === "xhs") {
    return (
      <div className="h-full w-full rounded-[20px] border border-rose-400/30 bg-[linear-gradient(120deg,rgba(58,18,24,0.5),rgba(132,31,57,0.35))] px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="https://www.xiaohongshu.com/favicon.ico" alt="xhs" className="h-6 w-6 rounded-md" draggable={false} />
          <span className="text-xl font-bold text-[#ffd9df]">{widget.title}</span>
        </div>
        <div className="mt-2 text-sm text-rose-100/90">{widget.content}</div>
      </div>
    );
  }

  if (widget.type === "github") {
    const username = (widget.githubUsername || widget.content || "octocat").replace(/^@/, "");
    const displayName = widget.githubName || username;
    const repos = widget.githubRepos ?? 0;
    const followers = widget.githubFollowers ?? 0;
    const actionText = widget.actionText || "查看";
    const quote = widget.content || "To be an artist-engineer.";
    const heatmap = buildGithubHeatmap(username);
    const contributions = Math.max(48, heatmap.reduce((sum, level) => sum + level * 3, 0));
    const monthLabels = ["Oct", "Nov", "Dec", "Jan", "Feb"];

    return (
      <div className="h-full w-full rounded-[24px] border border-[#39444f] bg-[radial-gradient(120%_100%_at_0%_0%,rgba(52,63,77,0.28),rgba(15,19,23,0.95)_58%),linear-gradient(180deg,#12171d,#0f1317)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-black/70 ring-1 ring-white/10">
                <img src="https://github.com/favicon.ico" alt="github" className="h-5 w-5 rounded-sm" draggable={false} />
              </div>
              <p className="text-[33px] font-semibold leading-none tracking-tight text-zinc-100">{widget.title || "GitHub"}</p>
            </div>
            <p className="mt-2 text-[27px] leading-none text-zinc-400">{displayName}</p>
          </div>
          <div className="max-w-[45%] text-right">
            <p className="text-[36px] leading-none text-zinc-300/60">“</p>
            <p className="text-[13px] italic text-zinc-300/90">{quote}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="space-y-1 text-[17px] text-zinc-300">
            <p>仓库: <span className="font-semibold text-zinc-100">{repos}</span></p>
            <p>粉丝: <span className="font-semibold text-zinc-100">{followers}</span></p>
          </div>
          <button className="h-11 rounded-xl bg-black px-8 text-[22px] font-bold text-zinc-100 shadow-[0_8px_20px_rgba(0,0,0,0.45)]">{actionText}</button>
        </div>

        <p className="mt-4 text-[13px] text-zinc-400">{contributions} contributions in the last year</p>

        <div className="mt-2 flex gap-2">
          <div className="w-7 pt-5 text-[11px] text-zinc-400">
            <p className="h-[12px]" />
            <p className="mt-[10px]">Mon</p>
            <p className="mt-[12px]">Wed</p>
            <p className="mt-[12px]">Fri</p>
          </div>

          <div className="flex-1">
            <div className="mb-[6px] grid grid-cols-5 text-[12px] text-zinc-400">
              {monthLabels.map((month) => (
                <p key={month}>{month}</p>
              ))}
            </div>
            <div className="grid grid-cols-[repeat(19,minmax(0,1fr))] grid-rows-7 gap-[3px]">
              {heatmap.map((level, index) => (
                <span key={`${username}-${index}`} className={`h-[10px] rounded-[2px] ${githubHeatClass(level)}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (widget.type === "title") {
    return (
      <div className="grid h-full w-full place-items-center rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-center text-4xl font-extrabold text-slate-100">
        {widget.title}
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-[20px] border border-white/10 bg-white/[0.03] p-4 text-left">
      <div className="text-xl font-bold text-[#d7c6a4]">{widget.title}</div>
      <div className="mt-2 text-base leading-7 text-slate-300">{widget.content}</div>
    </div>
  );
}

export default function DashboardEditor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>(INITIAL_WIDGETS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [hoveredTool, setHoveredTool] = useState<string>("标题");
  const [locationEditor, setLocationEditor] = useState<LocationEditorState | null>(null);
  const [locationSearch, setLocationSearch] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [widgetEditor, setWidgetEditor] = useState<Widget | null>(null);
  const [githubSync, setGithubSync] = useState<{
    loading: boolean;
    message: string;
    status: "idle" | "success" | "error";
  }>({
    loading: false,
    message: "",
    status: "idle",
  });
  const locationEditorId = locationEditor?.id ?? "";
  const locationEditorQuery = locationEditor?.query ?? "";

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const onMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();

      setWidgets((prev) =>
        prev.map((w) => {
          if (w.id !== dragging.id) {
            return w;
          }
          const nextX = clamp(e.clientX - rect.left - dragging.offsetX, 0, rect.width - w.w);
          const nextY = clamp(e.clientY - rect.top - dragging.offsetY, 0, rect.height - w.h);
          return { ...w, x: nextX, y: nextY };
        }),
      );
    };

    const onUp = () => setDragging(null);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  useEffect(() => {
    if (!locationEditorId) {
      return;
    }

    const query = locationEditorQuery.trim();
    if (query.length < 2) {
      setLocationSearch({ status: "idle", message: "" });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLocationSearch({ status: "loading", message: "正在搜索地点..." });
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          error?: string;
          shortName?: string;
          displayName?: string;
          mapImageUrl?: string;
          mapLink?: string;
        };
        const mapImageUrl = data.mapImageUrl;
        if (!res.ok || !mapImageUrl) {
          throw new Error(data.error ?? "地点搜索失败");
        }

        setLocationEditor((prev) => {
          if (!prev || prev.id !== locationEditorId) {
            return prev;
          }
          return {
            ...prev,
            title: (data.shortName ?? query).trim(),
            imageUrl: mapImageUrl,
            url: data.mapLink ?? prev.url,
          };
        });
        setLocationSearch({
          status: "success",
          message: data.displayName ? `已定位：${data.displayName}` : "地点已更新",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : "地点搜索失败";
        setLocationSearch({ status: "error", message });
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [locationEditorId, locationEditorQuery]);

  function addWidget(type: WidgetType) {
    const next = createWidget(type, widgets.length + 1);
    setWidgets((prev) => [...prev, next]);
    setSelectedId(next.id);
  }

  function deleteSelected() {
    if (!selectedId) {
      return;
    }
    setWidgets((prev) => prev.filter((w) => w.id !== selectedId));
    setSelectedId(null);
  }

  function updateSelectedShape(shape: WidgetShape) {
    if (!selectedId) {
      return;
    }
    setWidgets((prev) => prev.map((w) => (w.id === selectedId ? { ...w, shape } : w)));
  }

  function updateSelectedSize(mode: WidgetSizeMode) {
    if (!selectedId) {
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) {
          return w;
        }
        const preset = getWidgetSizePreset(w.type, mode);
        const nextW = rect ? Math.min(preset.w, Math.max(120, rect.width)) : preset.w;
        const nextH = rect ? Math.min(preset.h, Math.max(80, rect.height)) : preset.h;
        if (!rect) {
          return { ...w, w: nextW, h: nextH };
        }
        const nextX = clamp(w.x, 0, Math.max(0, rect.width - nextW));
        const nextY = clamp(w.y, 0, Math.max(0, rect.height - nextH));
        return { ...w, w: nextW, h: nextH, x: nextX, y: nextY };
      }),
    );
  }

  function openWidgetEditor(widget: Widget) {
    setWidgetEditor({ ...widget });
    setGithubSync({
      loading: false,
      message: "",
      status: "idle",
    });
  }

  function updateWidgetEditor(patch: Partial<Widget>) {
    setWidgetEditor((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function saveWidgetEditor() {
    if (!widgetEditor) {
      return;
    }
    setWidgets((prev) => prev.map((w) => (w.id === widgetEditor.id ? { ...w, ...widgetEditor } : w)));
    setWidgetEditor(null);
    setGithubSync({
      loading: false,
      message: "",
      status: "idle",
    });
  }

  async function syncGithubProfile() {
    if (!widgetEditor || widgetEditor.type !== "github") {
      return;
    }

    const username = (widgetEditor.githubUsername || widgetEditor.content || "").trim().replace(/^@/, "");
    if (!username) {
      setGithubSync({
        loading: false,
        message: "请先填写 GitHub 用户名",
        status: "error",
      });
      return;
    }

    setGithubSync({
      loading: true,
      message: "正在同步 GitHub 信息...",
      status: "idle",
    });

    try {
      const res = await fetch(`/api/github/user?username=${encodeURIComponent(username)}`);
      const data = (await res.json()) as {
        error?: string;
        username?: string;
        name?: string;
        avatarUrl?: string;
        publicRepos?: number;
        followers?: number;
        profileUrl?: string;
        bio?: string;
        contributionsUrl?: string;
      };

      if (!res.ok || !data.username) {
        throw new Error(data.error || "GitHub 信息同步失败");
      }
      const profileUsername = data.username;

      setWidgetEditor((prev) => {
        if (!prev || prev.type !== "github") {
          return prev;
        }
        return {
          ...prev,
          title: "GitHub",
          githubUsername: data.username,
          githubName: data.name || data.username,
          githubAvatarUrl: data.avatarUrl || prev.githubAvatarUrl,
          githubRepos: data.publicRepos ?? prev.githubRepos,
          githubFollowers: data.followers ?? prev.githubFollowers,
          githubContributionsUrl: data.contributionsUrl || buildGithubContributionsUrl(profileUsername),
          url: data.profileUrl || prev.url,
          content: prev.content?.trim() ? prev.content : data.bio || "To be an artist-engineer.",
          actionText: prev.actionText || "查看",
        };
      });

      setGithubSync({
        loading: false,
        message: "GitHub 信息已同步",
        status: "success",
      });
    } catch (error) {
      setGithubSync({
        loading: false,
        message: error instanceof Error ? error.message : "GitHub 信息同步失败",
        status: "error",
      });
    }
  }

  function startDrag(e: ReactPointerEvent<HTMLButtonElement>, widget: Widget) {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    setDragging({
      id: widget.id,
      offsetX: e.clientX - rect.left - widget.x,
      offsetY: e.clientY - rect.top - widget.y,
    });
  }

  function openLocationEditor(widget: Widget) {
    if (widget.type !== "location") {
      return;
    }
    setLocationEditor({
      id: widget.id,
      title: widget.title,
      url: widget.url ?? "",
      imageUrl: widget.imageUrl ?? "",
      query: "",
    });
    setLocationSearch({ status: "idle", message: "" });
  }

  function saveLocationEditor() {
    if (!locationEditor) {
      return;
    }
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === locationEditor.id
          ? {
              ...w,
              title: locationEditor.title,
              url: locationEditor.url,
              imageUrl: locationEditor.imageUrl,
            }
          : w,
      ),
    );
    setLocationEditor(null);
    setLocationSearch({ status: "idle", message: "" });
  }

  return (
    <section className="relative min-h-[980px] overflow-hidden rounded-[28px] border border-white/5 bg-black/10 p-4 md:p-5">
      <div
        ref={containerRef}
        className="relative h-[860px] w-full overflow-hidden rounded-[24px] border border-white/5 bg-black/10"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedId(null);
          }
        }}
      >
        {widgets.map((widget) => {
          const selectedNow = widget.id === selectedId;
          const radius = getWidgetRadius(widget.shape);
          const sizeMode = getWidgetSizeMode(widget);
          return (
            <div
              key={widget.id}
              className={`absolute transition ${selectedNow ? "z-30" : "z-20"}`}
              style={{ left: widget.x, top: widget.y, width: widget.w, height: widget.h }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedId(widget.id);
              }}
            >
              <div
                className={`h-full w-full overflow-hidden ${selectedNow ? "ring-2 ring-blue-500" : ""}`}
                style={{ borderRadius: radius }}
              >
                <WidgetBody widget={widget} />
              </div>

              {selectedNow ? (
                <>
                  <button
                    className="absolute -top-4 -left-4 grid h-11 w-11 place-items-center rounded-full bg-black/85 text-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (widget.type === "location") {
                        openLocationEditor(widget);
                      } else {
                        openWidgetEditor(widget);
                      }
                    }}
                    title="编辑"
                    type="button"
                  >
                    ✎
                  </button>
                  <button
                    className="absolute -top-4 -right-4 grid h-11 w-11 place-items-center rounded-full bg-red-600 text-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSelected();
                    }}
                    title="删除"
                    type="button"
                  >
                    🗑
                  </button>
                  <button
                    className="absolute -bottom-4 left-1/2 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full bg-black/90 text-lg"
                    onPointerDown={(e) => startDrag(e, widget)}
                    title="拖动"
                    type="button"
                    style={{ touchAction: "none" }}
                  >
                    ✥
                  </button>
                  <div className="absolute -bottom-16 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-white/10 bg-black/80 px-2 py-1.5 backdrop-blur-sm">
                    <span className="text-[10px] text-zinc-400">尺寸</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelectedSize("square");
                      }}
                      className={`grid h-7 min-w-8 place-items-center rounded-lg px-2 text-xs ${sizeMode !== "square" ? "text-zinc-300 hover:bg-white/10" : "bg-[#329a60] text-white"}`}
                      title="方形"
                    >
                      方
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelectedSize("wide");
                      }}
                      className={`grid h-7 min-w-8 place-items-center rounded-lg px-2 text-xs ${sizeMode !== "wide" ? "text-zinc-300 hover:bg-white/10" : "bg-[#329a60] text-white"}`}
                      title="长形"
                    >
                      长
                    </button>
                    <span className="mx-0.5 h-4 w-px bg-white/10" />
                    <span className="text-[10px] text-zinc-400">圆角</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelectedShape("rounded");
                      }}
                      className={`grid h-7 w-7 place-items-center rounded-lg ${widget.shape !== "rounded" ? "text-zinc-300 hover:bg-white/10" : "bg-[#329a60] text-white"}`}
                      title="圆角"
                    >
                      <span className="h-3 w-3 rounded-[4px] border border-current" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelectedShape("square");
                      }}
                      className={`grid h-7 w-7 place-items-center rounded-lg ${widget.shape !== "square" ? "text-zinc-300 hover:bg-white/10" : "bg-[#329a60] text-white"}`}
                      title="直角"
                    >
                      <span className="h-3 w-3 rounded-none border border-current" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelectedShape("pill");
                      }}
                      className={`grid h-7 w-7 place-items-center rounded-lg ${widget.shape !== "pill" ? "text-zinc-300 hover:bg-white/10" : "bg-[#329a60] text-white"}`}
                      title="胶囊"
                    >
                      <span className="h-3 w-4 rounded-full border border-current" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-5 left-1/2 w-[min(92%,600px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-sm">
        <div className="mb-2 inline-block rounded-md border border-[#d8c49b]/30 bg-[#1f2432] px-3 py-1 text-sm font-bold text-[#d8c49b]">
          {hoveredTool}
        </div>

        <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
          {TOOLS.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => addWidget(item.type)}
              onMouseEnter={() => setHoveredTool(item.label)}
              className="grid h-12 place-items-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1]"
              title={item.label}
            >
              <ToolIcon item={item} />
            </button>
          ))}
        </div>
      </div>

      {widgetEditor ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[620px] rounded-[26px] border border-white/10 bg-[#12161f] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                className="h-12 rounded-2xl bg-white/[0.06] px-7 text-2xl font-bold text-zinc-300"
                onClick={() => setWidgetEditor(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="h-12 rounded-2xl bg-[#329a60] px-9 text-2xl font-bold text-[#d5f3e4]"
                onClick={saveWidgetEditor}
              >
                保存
              </button>
            </div>

            {widgetEditor.type !== "wechat" ? (
              <>
                <p className="mb-4 text-2xl text-[#d7c6a4]">编辑控件</p>
                <label className="mb-1 block text-xl text-zinc-300">标题</label>
                <input
                  value={widgetEditor.title}
                  onChange={(e) => updateWidgetEditor({ title: e.target.value })}
                  className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
                />
              </>
            ) : (
              <div className="mb-6 mt-2">
                <img
                  src="https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico"
                  alt="wechat"
                  className="mb-6 h-12 w-12 rounded-lg"
                  draggable={false}
                />
                <label className="mb-1 block text-2xl text-zinc-300">微信号</label>
                <input
                  value={widgetEditor.content ?? ""}
                  onChange={(e) => updateWidgetEditor({ content: e.target.value, title: "微信" })}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none placeholder:text-zinc-500"
                  placeholder="请输入你的微信号"
                />
              </div>
            )}

            {widgetEditor.type === "text" || widgetEditor.type === "website" || widgetEditor.type === "xhs" ? (
              <>
                <label className="mb-1 block text-xl text-zinc-300">文本</label>
                <textarea
                  value={widgetEditor.content ?? ""}
                  onChange={(e) => updateWidgetEditor({ content: e.target.value })}
                  className="mb-4 h-28 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-lg outline-none"
                />
              </>
            ) : null}

            {widgetEditor.type === "image" ? (
              <>
                <label className="mb-1 block text-xl text-zinc-300">图片 URL</label>
                <input
                  value={widgetEditor.imageUrl ?? ""}
                  onChange={(e) => updateWidgetEditor({ imageUrl: e.target.value })}
                  className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
                />
              </>
            ) : null}

            {widgetEditor.type === "website" || widgetEditor.type === "xhs" ? (
              <>
                <label className="mb-1 block text-xl text-zinc-300">链接 URL</label>
                <input
                  value={widgetEditor.url ?? ""}
                  onChange={(e) => updateWidgetEditor({ url: e.target.value })}
                  className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
                />
              </>
            ) : null}

            {widgetEditor.type === "xhs" ? (
              <>
                <label className="mb-1 block text-xl text-zinc-300">按钮文案</label>
                <input
                  value={widgetEditor.actionText ?? ""}
                  onChange={(e) => updateWidgetEditor({ actionText: e.target.value })}
                  className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
                />
              </>
            ) : null}

            {widgetEditor.type === "github" ? (
              <>
                <label className="mb-1 block text-xl text-zinc-300">GitHub 用户名</label>
                <div className="mb-3 flex gap-3">
                  <input
                    value={widgetEditor.githubUsername ?? ""}
                    onChange={(e) => updateWidgetEditor({ githubUsername: e.target.value.trim().replace(/^@/, "") })}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
                    placeholder="octocat"
                  />
                  <button
                    type="button"
                    className="h-12 rounded-xl bg-[#329a60] px-6 text-lg font-bold text-[#d5f3e4] disabled:opacity-60"
                    onClick={syncGithubProfile}
                    disabled={githubSync.loading}
                  >
                    {githubSync.loading ? "同步中" : "同步"}
                  </button>
                </div>

                <p
                  className={`mb-4 text-sm ${
                    githubSync.status === "error"
                      ? "text-rose-400"
                      : githubSync.status === "success"
                        ? "text-emerald-300"
                        : "text-zinc-400"
                  }`}
                >
                  {githubSync.message || "输入用户名后点击同步，可自动带出头像、仓库、粉丝和链接"}
                </p>

                <label className="mb-1 block text-xl text-zinc-300">签名文案（可选）</label>
                <input
                  value={widgetEditor.content ?? ""}
                  onChange={(e) => updateWidgetEditor({ content: e.target.value })}
                  className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
                  placeholder="To be an artist-engineer."
                />

                <label className="mb-1 block text-xl text-zinc-300">按钮文案</label>
                <input
                  value={widgetEditor.actionText ?? ""}
                  onChange={(e) => updateWidgetEditor({ actionText: e.target.value })}
                  className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
                />

                <label className="mb-1 block text-xl text-zinc-300">链接 URL</label>
                <input
                  value={widgetEditor.url ?? ""}
                  onChange={(e) => updateWidgetEditor({ url: e.target.value })}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
                />
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {locationEditor ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[620px] rounded-[26px] border border-white/10 bg-[#12161f] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                className="h-12 rounded-2xl bg-white/[0.06] px-7 text-2xl font-bold text-zinc-300"
                onClick={() => {
                  setLocationEditor(null);
                  setLocationSearch({ status: "idle", message: "" });
                }}
              >
                取消
              </button>
              <button
                type="button"
                className="h-12 rounded-2xl bg-[#329a60] px-9 text-2xl font-bold text-[#d5f3e4]"
                onClick={saveLocationEditor}
              >
                保存
              </button>
            </div>

            <p className="mb-4 text-2xl text-[#d7c6a4]">位置</p>

            <input
              value={locationEditor.query}
              onChange={(e) =>
                setLocationEditor((prev) => (prev ? { ...prev, query: e.target.value } : prev))
              }
              className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none placeholder:text-zinc-500"
              placeholder="搜索地点..."
            />

            <div className="mx-auto mb-3 h-[300px] max-w-[420px] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]">
              {locationEditor.imageUrl ? (
                <img
                  src={locationEditor.imageUrl}
                  alt="location preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-zinc-400">暂无地图图片</div>
              )}
            </div>

            <p
              className={`mb-5 text-center text-sm ${
                locationSearch.status === "error"
                  ? "text-rose-400"
                  : locationSearch.status === "success"
                    ? "text-emerald-300"
                    : "text-zinc-400"
              }`}
            >
              {locationSearch.message || "输入地点后会自动更新地图预览"}
            </p>

            <label className="mb-1 block text-xl text-zinc-300">描述（可选）</label>
            <input
              value={locationEditor.title}
              onChange={(e) =>
                setLocationEditor((prev) => (prev ? { ...prev, title: e.target.value } : prev))
              }
              className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
              placeholder="北京市"
            />

            <label className="mb-1 block text-xl text-zinc-300">链接（可选）</label>
            <input
              value={locationEditor.url}
              onChange={(e) =>
                setLocationEditor((prev) => (prev ? { ...prev, url: e.target.value } : prev))
              }
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg outline-none"
              placeholder="https://map.qq.com"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
