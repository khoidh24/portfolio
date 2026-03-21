export type Journey = {
  index: string;
  company: string;
  role: string;
  period: string;
  image: string;
  description: string;
  tags: string[];
};

export const JOURNEYS: Journey[] = [
  {
    index: "01",
    company: "Started as an Internship",
    role: "Web Engineer Intern — Vietnam Suzuki",
    period: "Nov 2021 — Mar 2022",
    image: "/companies/suzuki.png",
    description:
      "First real-world exposure to production code. Built landing pages and internal web tools for Vietnam Suzuki, learning how to translate design into responsive UI while navigating a corporate codebase for the first time.",
    tags: ["React", "CSS", "HTML"],
  },
  {
    index: "02",
    company: "Become a Consultant",
    role: "ServiceNow Consultant — DXC Technology",
    period: "Feb 2023 — Jan 2024",
    image: "/companies/dxc.png",
    description:
      "Stepped into enterprise-scale work at a global tech firm. Delivered ITSM solutions in agile sprints, sharpened cross-functional collaboration skills, and learned how large teams ship software reliably under tight deadlines.",
    tags: ["ServiceNow", "ITSM", "Agile"],
  },
  {
    index: "03",
    company: "Frontend → Fullstack",
    role: "Software Engineer — Estuary Solutions",
    period: "Mar 2024 — Jun 2025",
    image: "/companies/estuary.png",
    description:
      "Started on the frontend, then gradually took on backend responsibilities as the team scaled. Evolved into a fullstack role — owning features from API design to UI delivery, contributing to a shared design system, and collaborating closely with product and backend teams.",
    tags: [
      "React",
      "Next.js",
      "Express.js",
      "TypeScript",
      "Design System",
      "GSAP",
    ],
  },
  {
    index: "04",
    company: "Current Chapter",
    role: "SWE Fullstack — BIN Corporation Group",
    period: "Jun 2025 — Present",
    image: "/companies/bin-corporation-group.png",
    description:
      "Continuing the fullstack path with a sharper focus on what makes software last — performance at scale, clean system design, and architecture decisions that hold up under pressure. Building things that are fast, maintainable, and built to grow.",
    tags: ["Next.js", "System Design", "Performance", "GSAP"],
  },
];
