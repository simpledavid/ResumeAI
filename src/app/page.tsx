"use client";

import { useState } from "react";
import Link from "next/link";
import { TEMPLATES, TemplateId } from "@/types/resume";
import { sampleResume } from "@/lib/sample-data";
import ScrollingPreview from "@/components/templates/ScrollingPreview";

export default function Home() {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <span className="text-sm font-semibold tracking-tight">ResumeAI</span>
          </div>
          <Link
            href="/upload"
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-md transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-5 py-5 flex gap-5">
        {/* Left Sidebar */}
        <div className="w-[260px] flex-shrink-0 space-y-4">
          {/* Initialize with AI */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Initialize with AI</h3>
                <p className="text-[11px] text-zinc-500">Auto-parse your resume</p>
              </div>
            </div>
            <Link
              href="/upload"
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload CV
            </Link>
          </div>

          {/* Quick Info */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">How It Works</h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "Upload your PDF resume" },
                { step: "2", text: "Review parsed information" },
                { step: "3", text: "Choose a template below" },
                { step: "4", text: "Download your website" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-medium text-zinc-400 flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <span className="text-xs text-zinc-400 leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-lg font-bold text-zinc-100">5</div>
                <div className="text-[11px] text-zinc-500">Templates</div>
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-100">100%</div>
                <div className="text-[11px] text-zinc-500">Responsive</div>
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-100">Free</div>
                <div className="text-[11px] text-zinc-500">No Cost</div>
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-100">HTML</div>
                <div className="text-[11px] text-zinc-500">Standalone</div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Templates</h2>
              <p className="text-xs text-zinc-500">Choose a design for your resume website</p>
            </div>
            <span className="text-xs text-zinc-600">{TEMPLATES.length} available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-600 transition-all"
              >
                {/* Preview Thumbnail */}
                <div className="relative h-[200px] overflow-hidden border-b border-zinc-800">
                  <ScrollingPreview
                    templateId={template.id}
                    resumeData={sampleResume}
                    height={200}
                    speed={15}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Card Content */}
                <div className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${template.gradient}`} />
                    <h3 className="text-sm font-semibold text-zinc-100">{template.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{template.description}</p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewTemplate(previewTemplate === template.id ? null : template.id)}
                      className="flex-1 text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                    >
                      Preview
                    </button>
                    <Link
                      href="/upload"
                      className="flex-1 text-xs px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-center transition-colors font-medium"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="w-full max-w-4xl bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-zinc-400 ml-2">
                  {TEMPLATES.find((t) => t.id === previewTemplate)?.name} Template
                </span>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ScrollingPreview
              templateId={previewTemplate}
              resumeData={sampleResume}
              height={550}
              speed={25}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-4 px-5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[11px] text-zinc-600">
          <span>ResumeAI</span>
          <span>Transform your resume into a website</span>
        </div>
      </footer>
    </div>
  );
}
