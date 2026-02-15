import { ResumeData } from "@/types/resume";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function e(text: string): string {
  return escapeHtml(text);
}

export function renderSkills(data: ResumeData): string {
  if (data.skills.length === 0) return "";
  return data.skills.map((s) => e(s)).join(", ");
}

export function hasContent(data: ResumeData): {
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  hasProjects: boolean;
  hasCertifications: boolean;
  hasLanguages: boolean;
  hasSummary: boolean;
} {
  return {
    hasExperience: data.experience.length > 0,
    hasEducation: data.education.length > 0,
    hasSkills: data.skills.length > 0,
    hasProjects: data.projects.length > 0,
    hasCertifications: data.certifications.length > 0,
    hasLanguages: data.languages.length > 0,
    hasSummary: data.summary.length > 0,
  };
}
