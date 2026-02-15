import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { parseResumeText } from "@/lib/parse-resume";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const parser = new PDFParse({ data });
    const textResult = await parser.getText();
    const text = textResult.text;
    await parser.destroy();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The file might be image-based." },
        { status: 422 }
      );
    }

    const resumeData = parseResumeText(text);

    return NextResponse.json({ data: resumeData, rawText: text });
  } catch (error) {
    console.error("Error parsing resume:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
