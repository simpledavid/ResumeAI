export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
  certifications: string[];
  projects: Project[];
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export type TemplateId = "minimal" | "modern" | "creative" | "professional" | "developer";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  color: string;
  gradient: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple design focused on content",
    color: "#1a1a2e",
    gradient: "from-gray-900 to-gray-700",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary layout with bold accents",
    color: "#6366f1",
    gradient: "from-indigo-600 to-purple-600",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Expressive design for creative professionals",
    color: "#f43f5e",
    gradient: "from-rose-500 to-orange-500",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional and polished corporate style",
    color: "#0f766e",
    gradient: "from-teal-700 to-emerald-600",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Tech-oriented with terminal aesthetics",
    color: "#22c55e",
    gradient: "from-green-600 to-cyan-600",
  },
];
