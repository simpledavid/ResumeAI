import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const { resumeData, templateId } = (await request.json()) as {
      resumeData: ResumeData;
      templateId: TemplateId;
    };

    if (!resumeData || !templateId) {
      return NextResponse.json({ error: "Missing resume data or template ID" }, { status: 400 });
    }

    const generator = generators[templateId];
    if (!generator) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    const html = generator(resumeData);

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Error generating site:", error);
    return NextResponse.json({ error: "Failed to generate site" }, { status: 500 });
  }
}
