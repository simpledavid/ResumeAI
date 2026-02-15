"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    const storedHTML = sessionStorage.getItem("generatedHTML");
    const storedName = sessionStorage.getItem("resumeName");

    if (!storedHTML) {
      router.push("/upload");
      return;
    }

    setHtml(storedHTML);
    setResumeName(storedName || "Resume");
  }, [router]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();
  }, [html, viewMode]);

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeName.toLowerCase().replace(/\s+/g, "-")}-resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyHTML = async () => {
    await navigator.clipboard.writeText(html);
  };

  const widthMap = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  if (!html) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      {!isFullscreen && (
        <div className="border-b border-zinc-800 bg-zinc-950">
          <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  R
                </div>
              </Link>
              <div className="h-5 w-px bg-zinc-800" />
              <span className="text-sm text-zinc-400">{resumeName}&apos;s Website</span>
            </div>

            {/* Viewport controls */}
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
              {(["desktop", "tablet", "mobile"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {mode === "desktop" && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {mode === "tablet" && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  {mode === "mobile" && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(true)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Fullscreen
              </button>
              <button
                onClick={handleCopyHTML}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Copy HTML
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <Link
                href="/upload"
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                New Resume
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen exit button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Exit Fullscreen
        </button>
      )}

      {/* Preview */}
      <div className={`flex-1 flex items-start justify-center bg-zinc-900 ${isFullscreen ? "" : "p-4"}`}>
        <div
          className={`bg-white transition-all duration-300 ${isFullscreen ? "w-full h-full" : "rounded-lg shadow-2xl overflow-hidden"}`}
          style={{
            width: isFullscreen ? "100%" : widthMap[viewMode],
            height: isFullscreen ? "100vh" : "calc(100vh - 90px)",
          }}
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Generated website preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
