"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

function BrandMark() {
  return (
    <div className="flex items-end gap-1.5">
      <span className="h-6 w-4 rounded-full bg-[#ff7a45]" />
      <span className="h-8 w-4 rounded-full bg-[#ffc067]" />
      <span className="h-10 w-4 rounded-full bg-[#14b8a6]" />
      <span className="h-7 w-4 rounded-full bg-[#60a5fa]" />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "注册失败，请稍后重试");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(66,109,208,0.2),transparent_38%),radial-gradient(circle_at_88%_100%,rgba(255,138,92,0.2),transparent_34%),linear-gradient(145deg,#0f141f_0%,#121928_45%,#171e2f_100%)] px-6 py-10 text-slate-100 md:px-12">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-[1fr_420px] md:items-center">
        <section className="hidden md:block">
          <div className="flex items-center gap-4">
            <BrandMark />
            <h1 className="text-7xl leading-none font-bold tracking-tight text-slate-100">Resumio</h1>
          </div>
          <p className="mt-14 text-5xl leading-[1.28] font-bold text-[#d8c49b]">
            拼接、聚合
            <br />
            你的
            <br />
            多元化世界
          </p>
        </section>

        <section className="w-full rounded-3xl border border-white/10 bg-black/25 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-sm md:p-8">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="flex h-14 items-center rounded-2xl border border-white/5 bg-white/[0.04] px-4">
              <span className="mr-1 text-[18px] text-[#d7c6a4]">resumio.cn/</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="请输入用户名"
                className="h-full w-full bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="flex h-14 items-center rounded-2xl border border-white/5 bg-white/[0.04] px-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="请输入邮箱"
                className="h-full w-full bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="flex h-14 items-center rounded-2xl border border-white/5 bg-white/[0.04] px-4">
              <input
                placeholder="请输入邮箱验证码"
                className="h-full w-full bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                className="ml-3 rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-bold whitespace-nowrap text-[#d7c6a4] hover:bg-white/[0.1]"
              >
                发送验证码
              </button>
            </div>

            <p className="px-1 text-sm text-[#d7c6a4]">收不到验证码? 联系我</p>

            <div className="flex h-14 items-center rounded-2xl border border-white/5 bg-white/[0.04] px-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="请输入密码"
                className="h-full w-full bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="flex h-14 items-center rounded-2xl border border-white/5 bg-white/[0.04] px-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="请再输入一次密码"
                className="h-full w-full bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-14 w-full rounded-2xl bg-[#329a60] text-[34px] font-bold text-[#d5f3e4] shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition hover:bg-[#35a768] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <div className="mt-4 text-right text-[24px] font-bold text-[#26f88a]">
            <Link href="/login" className="hover:underline">
              已有账号? 点击登录 &gt;&gt;
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
