import { ArrowUpRight, Download } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import ContactForm from "./components/ContactForm";
import { CONTACT_INFORMATION } from "./services/pageContent";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Get in Touch | Volunote - Zen Software Engineer",
  description:
    "Ready to bring your web project to life? Contact Volunote, an experienced software engineer specializing in React, Next.js, and modern web technologies. Let's collaborate and create something amazing together.",
  keywords: [
    "contact software engineer",
    "hire software engineer",
    "web developer contact",
    "React developer",
    "Next.js developer",
    "freelance software engineer",
    "volunote",
  ],
  authors: [{ name: "Volunote", url: "https://portfolio.veinz.blog" }],
  creator: "Volunote",
  openGraph: {
    title: "Get in Touch | Volunote - Zen Software Engineer",
    description:
      "Ready to bring your web project to life? Contact Volunote, an experienced software engineer specializing in React, Next.js, and modern web technologies.",
    url: "https://portfolio.veinz.blog/contact",
    siteName: "Volunote",
    images: [
      {
        url: "https://portfolio.veinz.blog/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Volunote",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  alternates: { canonical: "https://portfolio.veinz.blog/contact" },
};

export default function Contact() {
  return (
    <section className="contact__container relative w-full overflow-hidden">
      <div className="container mx-auto w-full px-6 pt-28 md:px-10 md:pt-36">
        <div className="flex items-end justify-between gap-8 pb-10 md:pb-14">
          <h1 className="font-heading text-[clamp(28px,5vw,64px)] leading-[1.05] font-bold tracking-tight">
            Let me know
            <br />
            your idea.
          </h1>
          <div className="flex shrink-0 items-center gap-3 pb-1">
            <Image
              src="/profile-picture.webp"
              alt="Volunote"
              title="Volunote — Zen Software Engineer"
              width={200}
              height={200}
              className="h-20 w-20 object-cover xl:h-28 xl:w-28 rounded-full"
              loading="eager"
            />
            <div className="hidden xl:block">
              <p className="font-sans text-sm font-semibold">
                Duong Hoang Khoi
              </p>
              <p className="text-foreground/40 font-sans text-xs">
                Software Engineer
              </p>
            </div>
          </div>
        </div>

        <div className="bg-foreground/15 h-px w-full" />

        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] 2xl:grid-cols-[340px_1fr]">
          <aside className="border-foreground/10 flex flex-col gap-10 pt-12 pb-6 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-r xl:py-14 xl:pr-12">
            {CONTACT_INFORMATION.map((item, idx) => (
              <div key={idx}>
                <h2 className="text-foreground/40 mb-4 font-sans text-[10px] font-semibold tracking-[0.25em] uppercase md:text-xs">
                  {item.name}
                </h2>
                <div className="flex flex-col">
                  {item.value.map((value, valueIdx) => (
                    <div key={valueIdx}>
                      {value.title ? (
                        item.name === "Attachements" ? (
                          <a
                            className="border-foreground/10 group flex items-center justify-between border-b py-2.5 font-sans text-sm font-medium transition-opacity duration-200 hover:opacity-60"
                            title={`Download ${value.title}`}
                            href={value.value}
                            download
                          >
                            <span>{value.title}</span>
                            <Download
                              size={13}
                              className="text-foreground/30 transition-transform duration-200 group-hover:translate-y-0.5"
                            />
                          </a>
                        ) : (
                          <Link
                            className="border-foreground/10 group flex items-center justify-between border-b py-2.5 font-sans text-sm font-medium transition-opacity duration-200 hover:opacity-60"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={value.title}
                            href={value.value}
                          >
                            <span>{value.title}</span>
                            <ArrowUpRight
                              size={13}
                              className="text-foreground/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </Link>
                        )
                      ) : (
                        <p className="text-foreground/60 border-foreground/10 border-b py-2.5 font-sans text-sm">
                          {value.value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div className="py-6 pb-24 xl:py-14 xl:pb-28 xl:pl-16 2xl:pl-24">
            <p className="text-foreground mb-6 font-sans text-[10px] font-semibold tracking-[0.25em] uppercase xl:hidden">
              Or send me a message
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
