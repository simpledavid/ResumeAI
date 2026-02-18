"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Github, Lock, UserRound, Sparkles, Printer, Share2 } from "lucide-react";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export type AuthMode = "login" | "register";

type AuthResponse = {
  error?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
};

type FormState = {
  identifier: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className="h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.501 12.233c0-.78-.063-1.35-.2-1.942H12.24v3.841h5.906c-.119.954-.762 2.39-2.191 3.356l-.02.129 3.072 2.328.213.021c1.955-1.768 3.281-4.368 3.281-7.733Z"
      fill="#4285F4"
    />
    <path
      d="M12.24 22.5c2.891 0 5.32-.936 7.093-2.534l-3.379-2.478c-.904.617-2.121 1.048-3.714 1.048-2.831 0-5.23-1.805-6.086-4.304l-.125.01-3.194 2.418-.043.117C4.554 20.186 8.11 22.5 12.24 22.5Z"
      fill="#34A853"
    />
    <path
      d="M6.154 14.232a6.54 6.54 0 0 1-.358-2.149c0-.749.131-1.479.345-2.149l-.006-.143-3.236-2.457-.106.049A10.22 10.22 0 0 0 1.667 12.083c0 1.642.405 3.199 1.126 4.7l3.361-2.551Z"
      fill="#FBBC05"
    />
    <path
      d="M12.24 5.63c2.008 0 3.364.842 4.136 1.548l3.02-2.879C17.551 2.657 15.132 1.667 12.24 1.667c-4.13 0-7.686 2.314-9.448 5.717l3.348 2.551c.869-2.499 3.268-4.304 6.1-4.304Z"
      fill="#EB4335"
    />
  </svg>
);

const usernamePattern = /^[a-z0-9_-]{3,24}$/;
const HERO_TEXT = "AI时代的简历";

const FEATURES = [
  { icon: Sparkles, label: "AI 一键润色" },
  { icon: Printer,  label: "A4 完美打印" },
  { icon: Share2,   label: "链接公开分享" },
];

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  // mounted 用于防止主题读取前的闪烁
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    identifier: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const isLogin = mode === "login";
  const isLightTheme = theme === "light";
  const typedHeroText = HERO_TEXT.slice(0, typingIndex);

  // 读取保存的主题，读完后才显示页面，避免深色→浅色闪烁
  useEffect(() => {
    const saved = window.localStorage.getItem("auth-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (typingIndex < HERO_TEXT.length) {
      timer = setTimeout(() => setTypingIndex((value) => value + 1), 120);
    } else {
      timer = setTimeout(() => setTypingIndex(0), 1500);
    }
    return () => clearTimeout(timer);
  }, [typingIndex]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setError("第三方登录失败，请重试。");
      return;
    }
    setError("");
  }, []);

  const changeTheme = (nextTheme: "dark" | "light") => {
    setTheme(nextTheme);
    window.localStorage.setItem("auth-theme", nextTheme);
  };

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setMessage("");

    if (!isLogin) {
      const username = form.username.trim().toLowerCase();
      if (!username) {
        setError("请输入用户名。");
        return;
      }
      if (!usernamePattern.test(username)) {
        setError("用户名需为 3-24 位，仅支持小写字母、数字、_、-。");
        return;
      }
      if (form.password.length < 8) {
        setError("密码至少 8 位。");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("两次密码输入不一致。");
        return;
      }
    } else if (!form.identifier.trim() || !form.password.trim()) {
      setError("请输入账号和密码。");
      return;
    }

    setSubmitting(true);
    try {
      const username = form.username.trim().toLowerCase();
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? {
                identifier: form.identifier.trim(),
                password: form.password,
              }
            : {
                username,
                email: `${username}@users.resumio.local`,
                password: form.password,
                code: "",
              },
        ),
      });

      const data = (await response.json().catch(() => ({}))) as AuthResponse;
      if (!response.ok) {
        setError(data.error ?? "请求失败，请稍后重试。");
        return;
      }

      setMessage(isLogin ? "登录成功，正在进入..." : "注册成功，正在进入...");
      const targetUsername = data.user?.username ?? username;
      router.push(`/${targetUsername}`);
      router.refresh();
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  const pageClassName = isLightTheme
    ? "relative min-h-screen overflow-hidden bg-[#ffffff] px-4 py-8 text-[#111827]"
    : "relative min-h-screen overflow-hidden bg-[#000000] px-4 py-8 text-[#f5f5f5]";
  const gridClassName = isLightTheme
    ? "pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(17,24,39,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.07)_1px,transparent_1px)] [background-size:14px_14px]"
    : "pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:14px_14px]";
  const cardClassName = isLightTheme
    ? "relative rounded-[26px] border border-[#e5e7eb] bg-[#ffffff]/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-7"
    : "relative rounded-[26px] border border-[#1d1d1d] bg-[#090909]/95 p-6 shadow-[0_36px_90px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-7";
  const authSwitchClassName = isLightTheme
    ? "inline-flex rounded-full border border-[#d4d4d8] bg-[#f8fafc] p-1"
    : "inline-flex rounded-full border border-[#2a2a2a] bg-[#0d0d0d] p-1";
  const authSwitchInactiveClassName = isLightTheme
    ? "text-[#6b7280] hover:text-[#111827]"
    : "text-[#959595] hover:text-[#ececec]";
  const themeSwitchClassName = isLightTheme
    ? "inline-flex rounded-full border border-[#d4d4d8] bg-[#ffffff] p-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
    : "inline-flex rounded-full border border-[#2a2a2a] bg-[#0d0d0d] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)]";
  const themeSwitchInactiveClassName = isLightTheme
    ? "text-[#6b7280] hover:text-[#111827]"
    : "text-[#8f8f8f] hover:text-[#ececec]";
  const inputClassName = isLightTheme
    ? "h-11 w-full rounded-xl border border-[#d4d4d8] bg-[#ffffff] px-3 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] transition focus:border-[#ff8700] focus:shadow-[0_0_0_2px_rgba(255,135,0,0.18)]"
    : "h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-3 text-sm text-[#f5f5f5] outline-none placeholder:text-[#6d6d6d] transition focus:border-[#ff8700] focus:shadow-[0_0_0_2px_rgba(255,135,0,0.22)]";
  const eyeButtonClassName = isLightTheme
    ? "grid h-11 w-11 place-items-center rounded-xl border border-[#d4d4d8] bg-[#ffffff] text-[#6b7280] transition hover:border-[#ff8700] hover:text-[#c26a00]"
    : "grid h-11 w-11 place-items-center rounded-xl border border-[#2a2a2a] bg-[#101010] text-[#8a8a8a] transition hover:border-[#ff8700] hover:text-[#ffc168]";
  const usernameWrapClassName = isLightTheme
    ? "grid h-11 grid-cols-[auto_1fr] items-center gap-2 rounded-xl border border-[#d4d4d8] bg-[#ffffff] px-3"
    : "grid h-11 grid-cols-[auto_1fr] items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#101010] px-3";
  const usernameInputClassName = isLightTheme
    ? "w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9ca3af]"
    : "w-full bg-transparent text-sm text-[#f5f5f5] outline-none placeholder:text-[#6d6d6d]";
  const dividerClassName = isLightTheme
    ? "h-px flex-1 bg-[#e5e7eb]"
    : "h-px flex-1 bg-[#252525]";
  const oauthButtonClassName = isLightTheme
    ? "flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d4d4d8] bg-[#ffffff] text-sm text-[#374151] transition hover:border-[#ff9d23] hover:text-[#c26a00]"
    : "flex h-11 items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#101010] text-sm text-[#dbdbdb] transition hover:border-[#ff9d23] hover:text-[#ffd18a]";
  const heroClassName = isLightTheme
    ? "text-[34px] font-semibold leading-tight tracking-tight text-[#111827] sm:text-[52px]"
    : "text-[34px] font-semibold leading-tight tracking-tight text-[#f5f5f5] sm:text-[52px]";
  const subtitleClassName = isLightTheme
    ? "mt-3 text-sm text-[#6b7280] sm:text-base"
    : "mt-3 text-sm text-[#737373] sm:text-base";
  const featureTagClassName = isLightTheme
    ? "flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-xs text-[#4b5563]"
    : "flex items-center gap-1.5 rounded-full border border-[#252525] bg-[#0f0f0f] px-3 py-1 text-xs text-[#a3a3a3]";

  return (
    <main className={`${pageClassName} ${mounted ? "" : "invisible"}`}>
      <div className={gridClassName} />

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <div className={themeSwitchClassName}>
          <button
            type="button"
            onClick={() => changeTheme("dark")}
            className={`rounded-full px-3 py-1 text-xs transition ${
              isLightTheme
                ? themeSwitchInactiveClassName
                : "bg-[#ff9d23] text-[#15110a]"
            }`}
          >
            深色
          </button>
          <button
            type="button"
            onClick={() => changeTheme("light")}
            className={`rounded-full px-3 py-1 text-xs transition ${
              isLightTheme
                ? "bg-[#ff9d23] text-[#15110a]"
                : themeSwitchInactiveClassName
            }`}
          >
            浅色
          </button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        {/* Hero */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className={heroClassName}>
            {typedHeroText}
            <span className="ml-1 inline-block w-[0.6ch] animate-pulse">|</span>
          </h1>
          <p className={subtitleClassName}>三分钟生成，AI 润色，A4 打印，一键分享</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {FEATURES.map(({ icon: Icon, label }) => (
              <span key={label} className={featureTagClassName}>
                <Icon className="h-3 w-3 text-[#ff9d23]" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[560px]">
          <section className={cardClassName}>
            <header className="mb-6 flex items-center justify-between gap-3">
              <p
                className={`${pixelFont.className} bg-gradient-to-r from-[#ff7a1c] via-[#ff9d23] to-[#ffd166] bg-clip-text text-[11px] text-transparent`}
              >
                RESUMIO
              </p>
              <div className={authSwitchClassName}>
                <Link
                  href="/login"
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    isLogin
                      ? "bg-[#ff9d23] text-[#15110a]"
                      : authSwitchInactiveClassName
                  }`}
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    isLogin
                      ? authSwitchInactiveClassName
                      : "bg-[#ff9d23] text-[#15110a]"
                  }`}
                >
                  注册
                </Link>
              </div>
            </header>

            <form className="space-y-3" onSubmit={submit}>
              {isLogin ? (
                <>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f8f8f]" />
                    <input
                      className={`${inputClassName} pl-9`}
                      value={form.identifier}
                      onChange={(event) => update("identifier", event.target.value)}
                      autoComplete="username"
                      placeholder="用户名或邮箱"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f8f8f]" />
                      <input
                        className={`${inputClassName} pl-9`}
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(event) => update("password", event.target.value)}
                        autoComplete="current-password"
                        placeholder="密码"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={eyeButtonClassName}
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={usernameWrapClassName}>
                    <span className="text-xs text-[#ffb74f]">resumio.cn/</span>
                    <input
                      className={usernameInputClassName}
                      value={form.username}
                      onChange={(event) => update("username", event.target.value)}
                      autoComplete="username"
                      placeholder="用户名"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f8f8f]" />
                      <input
                        className={`${inputClassName} pl-9`}
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(event) => update("password", event.target.value)}
                        autoComplete="new-password"
                        placeholder="设置密码（至少 8 位）"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={eyeButtonClassName}
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f8f8f]" />
                      <input
                        className={`${inputClassName} pl-9`}
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(event) =>
                          update("confirmPassword", event.target.value)
                        }
                        autoComplete="new-password"
                        placeholder="确认密码"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className={eyeButtonClassName}
                      aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {error ? <p className="text-sm text-[#ff6464]">{error}</p> : null}
              {message ? <p className="text-sm text-[#68d496]">{message}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-xl border border-[#ff9d23] bg-[linear-gradient(180deg,#ffb145,#ff8b12)] text-sm font-semibold text-[#181005] transition hover:bg-[linear-gradient(180deg,#ffba56,#ff981f)] disabled:opacity-60"
              >
                {submitting ? "处理中..." : isLogin ? "登录" : "注册"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-[#6f6f6f]">
              <span className={dividerClassName} />
              <span>或使用第三方登录</span>
              <span className={dividerClassName} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a href="/api/auth/oauth/github/start" className={oauthButtonClassName}>
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a href="/api/auth/oauth/google/start" className={oauthButtonClassName}>
                <GoogleIcon />
                Google
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
