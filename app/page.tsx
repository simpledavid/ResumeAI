/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import Link from "next/link";

function cardStyle(
  rotate: number,
  left: string,
  top: string,
  delay: number,
): CSSProperties {
  return {
    left,
    top,
    animationDelay: `${delay}s`,
    ["--r" as string]: `${rotate}deg`,
  };
}

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

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(66,109,208,0.28),transparent_36%),radial-gradient(circle_at_85%_82%,rgba(255,138,92,0.22),transparent_34%),linear-gradient(145deg,#101524_0%,#172033_48%,#251f37_100%)] text-slate-100">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 md:justify-start md:pl-[14vw]">
        <div className="pointer-events-none absolute inset-0">
          <article
            className="float-card absolute h-[240px] w-[260px] rounded-[22px] border border-[#ffe5cd] bg-[#fff6ec] p-4 text-slate-700 shadow-[0_8px_26px_rgba(0,0,0,0.24)]"
            style={cardStyle(-8, "14vw", "10vh", 0)}
          >
            <div className="flex items-center gap-2.5">
              <img src="https://www.weibo.com/favicon.ico" alt="weibo" className="h-7 w-7 rounded-md" />
              <div>
                <p className="text-[15px] leading-none font-bold">微博</p>
                <p className="mt-0.5 text-xs text-slate-500">@你的昵称</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-6 text-slate-600">把动态、链接和最近更新集中展示，别人一眼就能找到你。</p>
            <div className="mt-5 inline-flex rounded-lg bg-[#ff7a45] px-3 py-1 text-xs font-bold text-white">查看</div>
          </article>

          <article
            className="float-card absolute hidden h-[160px] w-[280px] overflow-hidden rounded-[22px] border border-[#ffe5cd] bg-[#fff6ec] shadow-[0_8px_26px_rgba(0,0,0,0.24)] md:block"
            style={cardStyle(-16, "8vw", "58vh", 0.5)}
          >
            <img
              src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80"
              alt="forest"
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-xs text-slate-700">摄影作品</span>
          </article>

          <article
            className="float-card absolute hidden h-[160px] w-[160px] rounded-[22px] border border-[#ffe5cd] bg-[#fff6ec] p-3.5 text-slate-700 shadow-[0_8px_26px_rgba(0,0,0,0.24)] md:block"
            style={cardStyle(6, "73vw", "18vh", 0.3)}
          >
            <div className="flex items-center gap-2">
              <img src="https://www.xiaohongshu.com/favicon.ico" alt="xhs" className="h-7 w-7 rounded-md" />
              <div>
                <p className="text-[13px] leading-none font-bold">小红书</p>
                <p className="mt-0.5 text-[11px] text-slate-500">生活记录</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">更新你的日常和灵感，形成个人风格。</p>
          </article>

          <article
            className="float-card absolute h-[250px] w-[280px] rounded-[22px] border border-[#ffe5cd] bg-[#fff6ec] p-4 text-slate-700 shadow-[0_8px_26px_rgba(0,0,0,0.24)]"
            style={cardStyle(11, "70vw", "56vh", 0.7)}
          >
            <div className="flex items-center gap-2.5">
              <img src="https://github.com/favicon.ico" alt="github" className="h-7 w-7 rounded-md" />
              <div>
                <p className="text-[15px] leading-none font-bold">GitHub</p>
                <p className="mt-0.5 text-xs text-slate-500">@username</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-xs text-slate-600">
              <span>仓库 60</span>
              <span>粉丝 966</span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {Array.from({ length: 21 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-[2px] ${i % 4 === 0 || i % 6 === 2 ? "bg-teal-400" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </article>

          <article
            className="float-card absolute hidden h-[260px] w-[150px] overflow-hidden rounded-[22px] border border-[#ffe5cd] bg-[#fff6ec] shadow-[0_8px_26px_rgba(0,0,0,0.24)] md:block"
            style={cardStyle(4, "84vw", "8vh", 1.2)}
          >
            <img
              src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80"
              alt="street"
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-xs text-slate-700">城市街拍</span>
          </article>

          <article
            className="float-card absolute hidden h-[150px] w-[280px] overflow-hidden rounded-[22px] border border-[#ffe5cd] bg-[#fff6ec] shadow-[0_8px_26px_rgba(0,0,0,0.24)] md:block"
            style={cardStyle(-6, "34vw", "82vh", 0.2)}
          >
            <img
              src="https://biofy-public-bucket.oss-cn-hangzhou.aliyuncs.com/assets/official/biofy_cn_official_image_map_01.png"
              alt="map"
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-xs text-slate-700">杭州 · 西湖</span>
          </article>
        </div>

        <div className="glass-card relative z-10 flex w-full max-w-[680px] flex-col items-start rounded-[36px] border border-[#ffe9d9] bg-[#fff8ef]/88 px-6 py-8 text-slate-900 shadow-[0_28px_70px_rgba(0,0,0,0.32)] md:min-h-[560px] md:rounded-[56px] md:px-12 md:py-12">
          <div className="mb-7 flex items-center gap-3">
            <BrandMark />
            <span className="rounded-full border border-[#ffd9bb] bg-[#fff2e2] px-3 py-1 text-xs font-semibold text-slate-700">
              Personal Hub
            </span>
          </div>

          <h1 className="text-left text-[40px] leading-[1.18] font-extrabold tracking-[-0.02em] md:text-[58px]">
            AI时代的简历
          </h1>

          <p className="mt-6 max-w-[560px] text-left text-[17px] leading-[1.65] text-slate-600 md:text-[20px]">
            自定义布局、展示内容和风格，让别人更快认识你。无论是个人品牌、创作者主页，还是简历导航页，都可以一页完成。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-[58px] w-[286px] items-center justify-center rounded-[14px] bg-[#329a60] px-8 text-[18px] font-bold text-[#d5f3e4] shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition hover:bg-[#35a768] active:scale-[0.98]"
            >
              创建我的RusemeAI
            </Link>
            <Link
              href="/login"
              className="inline-flex h-[56px] items-center justify-center rounded-2xl border border-[#f2b089] bg-[#fff2e4] px-8 text-[18px] font-semibold text-slate-700 transition hover:bg-[#ffe8d2]"
            >
              已有账号登录
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
