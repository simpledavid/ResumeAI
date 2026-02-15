"use client";

import { useRef } from "react";
import Link from "next/link";
import { TEMPLATES, TemplateId } from "@/types/resume";
import { sampleResume } from "@/lib/sample-data";
import ScrollingPreview from "@/components/templates/ScrollingPreview";

function TemplateCard({ templateId, index }: { templateId: TemplateId; index: number }) {
  const template = TEMPLATES.find((t) => t.id === templateId)!;

  return (
    <div className="flex-shrink-0 w-[380px] group">
      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 transition-all duration-300 group-hover:border-zinc-600 group-hover:shadow-2xl group-hover:shadow-zinc-800/50">
        <ScrollingPreview
          templateId={templateId}
          resumeData={sampleResume}
          height={480}
          speed={20 + index * 5}
        />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-6 pt-16">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-br ${template.gradient}`}
            />
            <h3 className="text-lg font-semibold text-zinc-100">{template.name}</h3>
          </div>
          <p className="text-sm text-zinc-400">{template.description}</p>
        </div>
      </div>
    </div>
  );
}

function ScrollingRow({
  templateIds,
  direction,
}: {
  templateIds: TemplateId[];
  direction: "left" | "right";
}) {
  const doubled = [...templateIds, ...templateIds];

  return (
    <div className="overflow-hidden">
      <div
        className={`flex gap-6 ${
          direction === "left" ? "animate-scroll-left" : "animate-scroll-right"
        }`}
        style={{ width: "max-content" }}
      >
        {doubled.map((id, i) => (
          <TemplateCard key={`${id}-${i}`} templateId={id} index={i % templateIds.length} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const templatesRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() =>
                templatesRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Templates
            </button>
            <Link
              href="/upload"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            PDF to Website in Seconds
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Turn Your Resume
            <br />
            Into a Website
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your PDF resume and we&apos;ll parse it automatically, then choose from
            beautiful templates to generate your personal website instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-600/25 text-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload Resume
            </Link>
            <button
              onClick={() =>
                templatesRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-xl font-medium transition-all text-lg"
            >
              View Templates
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload PDF",
                desc: "Upload your existing PDF resume. We'll automatically extract all your information.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Choose Template",
                desc: "Pick from 5 professionally designed templates. Each one is fully responsive.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Download & Deploy",
                desc: "Download your generated HTML website. Deploy anywhere you like.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className="text-5xl font-bold text-zinc-800 absolute top-4 right-6">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase with auto-scrolling */}
      <section ref={templatesRef} className="py-20">
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <h2 className="text-3xl font-bold text-center mb-4">
            Beautiful Templates
          </h2>
          <p className="text-zinc-400 text-center max-w-xl mx-auto">
            Each template is crafted with attention to detail. Hover to pause the preview scrolling.
          </p>
        </div>

        <div className="space-y-8">
          <ScrollingRow
            templateIds={["minimal", "modern", "creative", "professional", "developer"]}
            direction="left"
          />
          <ScrollingRow
            templateIds={["developer", "professional", "creative", "modern", "minimal"]}
            direction="right"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Your Site?</h2>
          <p className="text-zinc-400 text-lg mb-10">
            Upload your resume and have your personal website ready in seconds.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium text-lg transition-all hover:shadow-lg hover:shadow-indigo-600/25"
          >
            Get Started Now
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-zinc-500">
          <span>ResumeAI</span>
          <span>Transform your resume into a website</span>
        </div>
      </footer>
    </div>
  );
}
