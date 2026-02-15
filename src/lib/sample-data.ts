import { ResumeData } from "@/types/resume";

export const sampleResume: ResumeData = {
  name: "Alex Johnson",
  title: "Senior Full-Stack Developer",
  email: "alex@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  website: "https://alexjohnson.dev",
  linkedin: "linkedin.com/in/alexjohnson",
  github: "github.com/alexjohnson",
  summary:
    "Passionate full-stack developer with 8+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture. Led teams of 5-10 engineers delivering products used by millions.",
  experience: [
    {
      company: "TechCorp Inc.",
      position: "Senior Full-Stack Developer",
      startDate: "2021",
      endDate: "Present",
      description: [
        "Led development of microservices architecture serving 2M+ daily users",
        "Reduced API response times by 40% through optimization and caching strategies",
        "Mentored 5 junior developers and established code review best practices",
      ],
    },
    {
      company: "StartupXYZ",
      position: "Full-Stack Developer",
      startDate: "2018",
      endDate: "2021",
      description: [
        "Built real-time collaboration features using WebSocket and React",
        "Designed and implemented RESTful APIs handling 500K+ requests/day",
        "Introduced CI/CD pipeline reducing deployment time by 60%",
      ],
    },
    {
      company: "Digital Agency Co.",
      position: "Frontend Developer",
      startDate: "2016",
      endDate: "2018",
      description: [
        "Developed responsive web applications for 20+ enterprise clients",
        "Created reusable component library adopted across 5 project teams",
      ],
    },
  ],
  education: [
    {
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2012",
      endDate: "2016",
      gpa: "3.8",
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
    "GraphQL",
    "Redis",
    "Git",
  ],
  languages: ["English (Native)", "Spanish (Conversational)", "Mandarin (Basic)"],
  certifications: [
    "AWS Solutions Architect - Professional",
    "Google Cloud Professional Developer",
  ],
  projects: [
    {
      name: "OpenSource Dashboard",
      description:
        "An analytics dashboard for open-source project maintainers with real-time metrics and insights.",
      technologies: ["React", "D3.js", "Node.js", "PostgreSQL"],
      link: "https://github.com/alexjohnson/os-dashboard",
    },
    {
      name: "AI Code Reviewer",
      description:
        "Automated code review tool using machine learning to detect bugs and suggest improvements.",
      technologies: ["Python", "TensorFlow", "FastAPI", "Docker"],
      link: "https://github.com/alexjohnson/ai-reviewer",
    },
  ],
};
