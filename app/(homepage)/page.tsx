import { Metadata } from "next";

export const dynamic = "force-static";

import {
  ContactSection,
  HeroSection,
  IntroductionSection,
  JourneySection,
} from "./components";

export const metadata: Metadata = {
  title: "Volunote — Zen Software Engineer | React & Next.js Expert",
  description:
    "Welcome to Volunote's portfolio. I'm a passionate software engineer specializing in React, Next.js, TypeScript, and modern web technologies. Creating beautiful, performant, and user-friendly web experiences with clean code and attention to detail.",
  keywords: [
    "Volunote",
    "software engineer",
    "React developer",
    "Next.js developer",
    "TypeScript developer",
    "web developer",
    "portfolio",
  ],
  authors: [{ name: "Volunote", url: "https://portfolio.veinz.blog" }],
  creator: "Volunote",
  openGraph: {
    title: "Volunote — Zen Software Engineer",
    description:
      "Welcome to Volunote's portfolio. I'm a passionate software engineer specializing in React, Next.js, TypeScript, and modern web technologies.",
    url: "https://portfolio.veinz.blog",
    siteName: "Volunote",
    images: [
      {
        url: "https://portfolio.veinz.blog/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Volunote - Zen Software Engineer Portfolio",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  alternates: {
    canonical: "https://portfolio.veinz.blog",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <IntroductionSection />
      <JourneySection />
      <ContactSection />
    </>
  );
}
