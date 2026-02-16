"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardSidebarProps = {
  username: string;
  initialAvatarUrl?: string | null;
};

function toDisplayAvatarUrl(rawUrl: string | null) {
  if (!rawUrl) {
    return null;
  }
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return `/api/user/avatar/proxy?src=${encodeURIComponent(rawUrl)}`;
  }
  return rawUrl;
}

export default function DashboardSidebar({
  username,
  initialAvatarUrl = null,
}: DashboardSidebarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [bio, setBio] = useState("");

  async function onPickAvatar(file: File) {
    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { error?: string; avatarUrl?: string };
      if (!res.ok || !data.avatarUrl) {
        setError(data.error ?? "上传失败，请稍后重试");
        return;
      }

      setAvatarUrl(data.avatarUrl);
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setUploading(false);
    }
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function onPrintResume() {
    window.print();
  }

  return (
    <aside className="border-b border-white/10 pb-5 md:flex md:min-h-[860px] md:flex-col md:border-r md:border-b-0 md:pb-0 md:pr-6">
      <div className="mb-6 flex items-start justify-between md:mb-7 md:pt-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03] text-sm text-[#d7c6a4] md:h-[112px] md:w-[112px] md:text-sm"
        >
          {avatarUrl ? (
            <img
              src={toDisplayAvatarUrl(avatarUrl) ?? ""}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            "上传头像"
          )}
          {uploading ? (
            <span className="absolute inset-0 grid place-items-center bg-black/55 text-sm text-white">
              上传中...
            </span>
          ) : null}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void onPickAvatar(file);
            }
            e.currentTarget.value = "";
          }}
        />

        <div className="pt-3 md:pt-4">
          <button
            type="button"
            onClick={onPrintResume}
            className="inline-flex h-10 items-center rounded-full bg-[#329a60] px-5 text-base font-bold text-[#d5f3e4] shadow-[0_8px_20px_rgba(0,0,0,0.28)] md:h-[38px] md:px-5 md:text-[16px]"
          >
            导出 PDF
          </button>
          <p className="mt-2 text-lg text-zinc-300 md:text-[16px]">简历预览</p>
        </div>
      </div>

      {error ? <p className="mb-2 text-sm text-rose-300">{error}</p> : null}

      <p className="text-[26px] leading-none font-bold text-slate-100 md:text-[44px]">{username}</p>

      <div className="mt-4">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="h-14 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[15px] text-[#d8c49b] outline-none md:h-16 md:text-[16px]"
          placeholder="一句话职业标签..."
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 text-base font-medium text-[#d7c6a4] md:mt-auto md:mb-1 md:grid-cols-2 md:gap-2 md:text-[13px]">
        <p className="truncate">• 模板中心</p>
        <p className="truncate">◖ 简历设置</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-base font-medium text-[#d7c6a4] md:mb-2 md:grid-cols-2 md:gap-2 md:text-[13px]">
        <button
          type="button"
          onClick={onLogout}
          className="truncate text-left font-semibold text-[#d7c6a4] hover:underline"
        >
          退出登录
        </button>
        <p className="truncate border-l border-white/15 pl-3">求职建议</p>
      </div>
    </aside>
  );
}
