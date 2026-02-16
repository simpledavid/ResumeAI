import Link from "next/link";

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

const TEMPLATES = [
  {
    name: "现代商务",
    tag: "双栏结构",
    desc: "突出技能与成果，适合互联网、技术、产品岗位。",
    accent: "from-[#274c80] to-[#183253]",
  },
  {
    name: "经典专业",
    tag: "传统结构",
    desc: "信息清晰稳健，适合校招、职能岗与常规社招。",
    accent: "from-[#3f3a35] to-[#2e2a25]",
  },
  {
    name: "极简作品",
    tag: "简洁叙事",
    desc: "强调项目和表达，适合设计、内容和创意方向。",
    accent: "from-[#1f2937] to-[#111827]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_14%_0%,rgba(66,109,208,0.22),transparent_38%),radial-gradient(circle_at_86%_100%,rgba(255,138,92,0.2),transparent_34%),linear-gradient(145deg,#0f141f_0%,#121928_45%,#171e2f_100%)] text-slate-100">
      <section className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 backdrop-blur-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandMark />
              <p className="text-2xl font-bold tracking-tight md:text-3xl">ResumeAI</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-xl border border-white/20 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.08]"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#329a60] px-4 py-2 text-sm font-semibold text-[#d5f3e4] hover:bg-[#3aa76a]"
              >
                免费创建简历
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="inline-flex rounded-full border border-[#ffd9bb]/40 bg-[#fff2e2]/10 px-3 py-1 text-xs font-semibold text-[#ffd3b3]">
                AI 简历编辑器
              </p>
              <h1 className="mt-4 text-4xl leading-tight font-extrabold tracking-[-0.02em] md:text-6xl">
                一站式制作
                <br />
                模板化求职简历
              </h1>
              <p className="mt-5 max-w-[620px] text-base leading-7 text-slate-300 md:text-lg">
                登录后即可使用简历模板中心，快速套用模板、编辑个人信息、实时预览，并直接打印导出 PDF。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-2xl bg-[#329a60] px-6 py-3 text-base font-bold text-[#d5f3e4] shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
                >
                  立即开始
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-2xl border border-white/20 bg-white/[0.03] px-6 py-3 text-base font-semibold text-slate-200"
                >
                  查看编辑器
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <p className="mb-3 text-sm font-semibold text-[#d7c6a4]">模板预览</p>
              <div className="space-y-3">
                {TEMPLATES.map((item) => (
                  <article
                    key={item.name}
                    className={`rounded-xl border border-white/10 bg-gradient-to-r ${item.accent} p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">{item.name}</p>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{item.tag}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-200">{item.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
