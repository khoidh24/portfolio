"use client";

import { useRef, useEffect } from "react";

import VolunoteWordmark from "./VolunoteWordmark";
import { usePageReady } from "@/hooks/usePageReady";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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

  // Set initial hidden state as soon as isPageReady — before IO fires
  useGSAP(
    () => {
      if (!isPageReady) {
        animatedRef.current = false;
        return;
      }
      gsap.set(".footer__wordmark", { yPercent: -100 });
      gsap.set(".footer__meta", { opacity: 0, y: 12 });
    },
    { dependencies: [isPageReady], scope: containerRef },
  );

  // IntersectionObserver — fires as soon as footer enters viewport, no scroll dependency
  useEffect(() => {
    if (!isPageReady) return;

    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      if (animatedRef.current) return;
      animatedRef.current = true;
      gsap.to(".footer__wordmark", {
        yPercent: 0,
        duration: 0.8,
        ease: "power4.out",
      });
      gsap.to(".footer__meta", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        delay: 0.3,
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.01 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isPageReady]);

  return (
    <div
      ref={containerRef}
      className="bg-foreground relative w-full overflow-hidden"
    >
      {/* VOLUNOTE wordmark — flush to top, full width */}
      <div className="w-full overflow-hidden">
        <VolunoteWordmark
          aria-label="Volunote"
          fill="none"
          style={{
            stroke: "var(--background)",
            strokeWidth: "0.18",
            opacity: 1,
          }}
          width="100%"
          height="100%"
          className="footer__wordmark block w-full"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Meta content */}
      <div className="border-background/10 mx-auto max-w-7xl px-4 pb-8 pt-6 md:pt-12 md:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto]">
          {/* Left — tagline */}
          <p className="footer__meta text-background/40 text-xs leading-relaxed tracking-wide">
            Crafting interfaces where arts & logic meet.
            <br />
            Ho Chi Minh City, Vietnam.
          </p>

          {/* Right — nav groups */}
          <nav className="footer__meta flex flex-wrap gap-x-10 gap-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.heading} className="flex flex-col gap-1.5">
                <span className="text-background/25 mb-1 text-[10px] font-semibold tracking-[0.2em] uppercase">
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
                    className="group text-background/50 hover:text-background relative w-fit text-xs font-medium transition-colors duration-200"
                  >
                    {link.label}
                    <span className="bg-background absolute -bottom-px left-0 h-px w-0 transition-all duration-300 group-hover:w-full" />
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="footer__meta border-background/10 mt-8 flex items-center justify-between border-t pt-5">
          <span
            className="text-background/25 text-[10px] tracking-wide"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} Volunote. All rights reserved.
          </span>
          <span className="text-background/25 text-[10px] tracking-wide">
            Built with Next.js & Lenis
          </span>
        </div>
      </div>
    </div>
  );
}
