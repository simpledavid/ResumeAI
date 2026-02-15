"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResumeData, TEMPLATES, TemplateId } from "@/types/resume";
import ScrollingPreview from "@/components/templates/ScrollingPreview";

type Step = "upload" | "review" | "template";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to parse resume.");
        return;
      }

      setResumeData(result.data);
      setStep("review");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleGenerate = async () => {
    if (!resumeData) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, templateId: selectedTemplate }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to generate site.");
        return;
      }

      // Store the generated HTML in sessionStorage for the preview page
      sessionStorage.setItem("generatedHTML", result.html);
      sessionStorage.setItem("templateId", selectedTemplate);
      sessionStorage.setItem("resumeName", resumeData.name);
      router.push("/preview");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateField = (field: keyof ResumeData, value: string | string[]) => {
    if (!resumeData) return;
    setResumeData({ ...resumeData, [field]: value });
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
          </Link>

          {/* Steps indicator */}
          <div className="flex items-center gap-3">
            {(["upload", "review", "template"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 text-sm ${
                    step === s
                      ? "text-indigo-400"
                      : (["upload", "review", "template"] as Step[]).indexOf(step) > i
                      ? "text-zinc-300"
                      : "text-zinc-600"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${
                      step === s
                        ? "border-indigo-500 bg-indigo-600/20 text-indigo-400"
                        : (["upload", "review", "template"] as Step[]).indexOf(step) > i
                        ? "border-zinc-600 bg-zinc-800 text-zinc-300"
                        : "border-zinc-700 text-zinc-600"
                    }`}
                  >
                    {(["upload", "review", "template"] as Step[]).indexOf(step) > i ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="hidden sm:inline capitalize">{s}</span>
                </div>
                {i < 2 && (
                  <div className={`w-8 h-px ${(["upload", "review", "template"] as Step[]).indexOf(step) > i ? "bg-zinc-600" : "bg-zinc-800"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6">
        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-3">Upload Your Resume</h1>
              <p className="text-zinc-400">
                Upload a PDF resume and we&apos;ll extract your information automatically.
              </p>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center transition-all ${
                isDragging
                  ? "border-indigo-500 bg-indigo-600/5"
                  : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-zinc-300">Parsing your resume...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-zinc-200 font-medium mb-1">
                      Drop your PDF resume here or click to browse
                    </p>
                    <p className="text-sm text-zinc-500">PDF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review parsed data */}
        {step === "review" && resumeData && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-3">Review Your Information</h1>
              <p className="text-zinc-400">
                Edit any fields that weren&apos;t parsed correctly.
              </p>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(
                    [
                      ["name", "Full Name"],
                      ["title", "Job Title"],
                      ["email", "Email"],
                      ["phone", "Phone"],
                      ["location", "Location"],
                      ["website", "Website"],
                      ["linkedin", "LinkedIn"],
                      ["github", "GitHub"],
                    ] as [keyof ResumeData, string][]
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
                      <input
                        type="text"
                        value={(resumeData[field] as string) || ""}
                        onChange={(e) => updateField(field, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                  Summary
                </h3>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Professional summary..."
                />
              </div>

              {/* Skills */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                  Skills
                </h3>
                <input
                  type="text"
                  value={resumeData.skills.join(", ")}
                  onChange={(e) =>
                    updateField(
                      "skills",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Separate skills with commas..."
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {resumeData.skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                  Experience ({resumeData.experience.length} positions)
                </h3>
                {resumeData.experience.map((exp, i) => (
                  <div
                    key={i}
                    className="mb-4 pb-4 border-b border-zinc-800 last:border-0 last:mb-0 last:pb-0"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium text-sm text-zinc-200">{exp.company}</span>
                      <span className="text-xs text-zinc-500">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400 italic">{exp.position}</div>
                    {exp.description.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {exp.description.map((d, j) => (
                          <li key={j} className="text-xs text-zinc-500 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-zinc-600">
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                  Education ({resumeData.education.length})
                </h3>
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="font-medium text-sm text-zinc-200">{edu.school}</div>
                    <div className="text-sm text-zinc-400">
                      {edu.degree}
                      {edu.field ? ` in ${edu.field}` : ""}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {edu.startDate} - {edu.endDate}
                      {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => {
                    setStep("upload");
                    setResumeData(null);
                  }}
                  className="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
                >
                  Re-upload
                </button>
                <button
                  onClick={() => setStep("template")}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-sm font-medium"
                >
                  Choose Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Template selection */}
        {step === "template" && resumeData && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-3">Choose Your Template</h1>
              <p className="text-zinc-400">
                Select a template that matches your style. Preview updates in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
              {/* Template list */}
              <div className="space-y-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedTemplate === template.id
                        ? "border-indigo-500 bg-indigo-600/10"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-br ${template.gradient}`}
                      />
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-zinc-500">{template.description}</div>
                      </div>
                    </div>
                  </button>
                ))}

                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => setStep("review")}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Website
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live preview */}
              <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  </div>
                  <div className="flex-1 text-center text-xs text-zinc-500">
                    {resumeData.name.toLowerCase().replace(/\s+/g, "")}.dev
                  </div>
                </div>
                <ScrollingPreview
                  templateId={selectedTemplate}
                  resumeData={resumeData}
                  height={600}
                  speed={25}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
