"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { ResumeData, TemplateId } from "@/types/resume";
import { generateMinimalHTML } from "@/lib/generators/minimal";
import { generateModernHTML } from "@/lib/generators/modern";
import { generateCreativeHTML } from "@/lib/generators/creative";
import { generateProfessionalHTML } from "@/lib/generators/professional";
import { generateDeveloperHTML } from "@/lib/generators/developer";

const generators: Record<TemplateId, (data: ResumeData) => string> = {
  minimal: generateMinimalHTML,
  modern: generateModernHTML,
  creative: generateCreativeHTML,
  professional: generateProfessionalHTML,
  developer: generateDeveloperHTML,
};

interface ScrollingPreviewProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  height?: number;
  speed?: number;
  paused?: boolean;
}

export default function ScrollingPreview({
  templateId,
  resumeData,
  height = 500,
  speed = 30,
  paused = false,
}: ScrollingPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const animRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  const html = useMemo(
    () => generators[templateId](resumeData),
    [templateId, resumeData]
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let lastTime = 0;

    const scroll = (time: number) => {
      if (!iframe.contentDocument?.documentElement) {
        animRef.current = requestAnimationFrame(scroll);
        return;
      }

      if (lastTime === 0) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (!isHovered && !paused) {
        const doc = iframe.contentDocument;
        const maxScroll = doc.documentElement.scrollHeight - doc.documentElement.clientHeight;

        if (maxScroll > 0) {
          const pixelsPerFrame = (speed / 1000) * delta;
          const current = doc.documentElement.scrollTop;
          let next = current + pixelsPerFrame;

          if (next >= maxScroll) {
            next = 0;
          }

          doc.documentElement.scrollTop = next;
        }
      }

      animRef.current = requestAnimationFrame(scroll);
    };

    animRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isHovered, paused, speed]);

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <iframe
        ref={iframeRef}
        className="w-full border-0 pointer-events-none"
        style={{ height: height * 2 }}
        title={`${templateId} template preview`}
        sandbox="allow-same-origin"
      />
      {isHovered && (
        <div className="absolute inset-0 bg-black/0 flex items-end justify-center pb-4 pointer-events-none">
          <span className="text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            Scroll paused
          </span>
        </div>
      )}
    </div>
  );
}
