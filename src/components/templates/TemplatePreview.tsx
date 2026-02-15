"use client";

import { useEffect, useRef, useMemo } from "react";
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

interface TemplatePreviewProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  className?: string;
}

export default function TemplatePreview({
  templateId,
  resumeData,
  className = "",
}: TemplatePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  return (
    <iframe
      ref={iframeRef}
      className={`w-full border-0 ${className}`}
      title={`${templateId} template preview`}
      sandbox="allow-same-origin"
    />
  );
}
