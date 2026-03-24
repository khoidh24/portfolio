"use client";

import { useRef } from "react";

import { usePageReady } from "@/hooks/usePageReady";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const NAV_GROUPS = [
  {
    heading: "Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "Articles", href: "/articles" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Social",
    links: [
      { label: "GitHub", href: "https://github.com/khoidh24" },
      { label: "LinkedIn", href: "https://linkedin.com/in/hoangkhoi2406" },
    ],
  },
  {
    heading: "Contact",
    links: [
      {
        label: "hoangkhoiduong24@gmail.com",
        href: "mailto:hoangkhoiduong24@gmail.com",
      },
    ],
  },
];

export default function FooterSection() {
  const isPageReady = usePageReady();
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useGSAP(
    () => {
      if (!isPageReady) {
        animatedRef.current = false;
        return;
      }
      if (animatedRef.current) return;
      animatedRef.current = true;

      const container = containerRef.current;
      if (!container) return;

      gsap.set(".footer__letter", { yPercent: 110 });
      gsap.set(".footer__meta", { opacity: 0, y: 16 });

      // Check if footer is already in viewport — if so, play immediately
      const rect = container.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight;

      const animate = () => {
        gsap.to(".footer__letter", {
          yPercent: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.035,
        });
        gsap.to(".footer__meta", {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.07,
          delay: 0.2,
        });
      };

      if (alreadyVisible) {
        animate();
      } else {
        ScrollTrigger.create({
          trigger: container,
          start: "top 95%",
          invalidateOnRefresh: true,
          onEnter: animate,
        });
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    },
    { dependencies: [isPageReady], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="bg-foreground relative w-full overflow-hidden px-4 pt-14 pb-8 md:px-10 md:pt-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden md:mb-12">
          <p
            aria-label="Volunote"
            className="flex font-sans leading-none font-bold tracking-tighter whitespace-nowrap"
            style={{
              fontSize: "clamp(40px, 12vw, 200px)",
              WebkitTextStroke: "1.5px var(--background)",
              color: "transparent",
            }}
          >
            {"VOLUNOTE".split("").map((char, i) => (
              <span key={i} className="footer__letter inline-block">
                {char}
              </span>
            ))}
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="footer__meta text-background/50 max-w-[320px] text-sm leading-relaxed">
            Crafting interfaces where arts & logic meet.
            <br />
            Ho Chi Minh City, Vietnam.
          </p>

          <nav className="flex flex-wrap gap-x-12 gap-y-6">
            {NAV_GROUPS.map((group) => (
              <div
                key={group.heading}
                className="footer__meta flex flex-col gap-2"
              >
                <span className="text-background/30 mb-1 text-xs font-medium tracking-widest uppercase">
                  {group.heading}
                </span>
                {group.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={
                      link.href.startsWith("http") ||
                      link.href.startsWith("mailto")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="group text-background/60 hover:text-background relative w-fit text-sm font-medium transition-colors duration-200"
                  >
                    {link.label}
                    <span className="bg-background absolute -bottom-px left-0 h-px w-0 transition-all duration-300 group-hover:w-full" />
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="footer__meta border-background/10 mt-10 flex items-center justify-between border-t pt-6">
          <span className="text-background/30 text-xs" suppressHydrationWarning>
            © {new Date().getFullYear()} Volunote. All rights reserved.
          </span>
          <span className="text-background/30 text-xs">
            Built with Next.js & Lenis
          </span>
        </div>
      </div>
    </div>
  );
}
