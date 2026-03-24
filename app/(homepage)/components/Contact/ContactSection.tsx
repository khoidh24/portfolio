"use client";

import { useRef } from "react";

import { usePageReady } from "@/hooks/usePageReady";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

import TransitionLink from "@/components/TransitionLink";

const CTA_TEXT = "Start a conversation";

export default function ContactSection() {
  const isPageReady = usePageReady();
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useGSAP(
    () => {
      if (!isPageReady || animatedRef.current) return;
      animatedRef.current = true;

      const st = {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      };

      gsap.set(".contact__label", { yPercent: 120, opacity: 0 });
      gsap.set(".contact__word", { yPercent: 110 });
      gsap.set(".contact__sub", { opacity: 0, y: 20 });
      gsap.set(".contact__cta", { opacity: 0, y: 24, scale: 0.95 });

      gsap.to(".contact__label", {
        yPercent: 0,
        opacity: 1,
        duration: 0.35,
        ease: "power3.out",
        scrollTrigger: st,
      });
      gsap.to(".contact__word", {
        yPercent: 0,
        duration: 0.45,
        ease: "power4.out",
        stagger: 0.04,
        scrollTrigger: st,
      });
      gsap.to(".contact__sub", {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
        delay: 0.15,
        scrollTrigger: st,
      });
      gsap.to(".contact__cta", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.35,
        ease: "back.out(1.4)",
        delay: 0.2,
        scrollTrigger: st,
      });

      const btn =
        containerRef.current?.querySelector<HTMLElement>(".contact__cta");
      if (!btn) return;

      // Hover char animation — desktop only
      if (window.matchMedia("(hover: none)").matches) return;

      const topChars = btn.querySelectorAll<HTMLElement>(".cta-char-top");
      const botChars = btn.querySelectorAll<HTMLElement>(".cta-char-bot");
      gsap.set(botChars, { yPercent: 100 });

      const tl = gsap.timeline({ paused: true });
      tl.to(topChars, {
        yPercent: -100,
        duration: 0.3,
        ease: "power3.inOut",
        stagger: 0.01,
      }).to(
        botChars,
        { yPercent: 0, duration: 0.3, ease: "power3.inOut", stagger: 0.01 },
        "<",
      );

      btn.addEventListener("mouseenter", () => tl.play());
      btn.addEventListener("mouseleave", () => tl.reverse());
    },
    { dependencies: [isPageReady], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="container mx-auto w-full px-4 py-16 md:px-10 md:py-24 2xl:py-32"
    >
      <div className="mb-3 overflow-hidden md:mb-6">
        <p className="contact__label text-foreground/40 text-[10px] font-semibold tracking-[0.25em] uppercase md:text-xs">
          Get in touch
        </p>
      </div>

      <div className="mb-8 overflow-hidden md:mb-10">
        <h2 className="flex w-fit flex-wrap gap-x-[0.2em] text-[clamp(32px,7vw,96px)] leading-[1.05] font-bold tracking-tight">
          {["Let's", "work", "together."].map((word, i) => (
            <span key={i} className="contact__word inline-block">
              {word}
            </span>
          ))}
        </h2>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <p className="contact__sub text-foreground/50 max-w-[400px] text-sm leading-relaxed md:text-base">
          Have a project in mind, or just want to say hi?
          <br />
          My inbox is always open.
        </p>

        <TransitionLink
          href="/contact"
          className="contact__cta border-foreground/20 hover:bg-foreground hover:text-background inline-flex w-fit items-center gap-3 border px-6 py-4 text-sm font-semibold transition-colors duration-200 md:px-8 md:py-5 md:text-base"
        >
          <span className="relative flex overflow-hidden">
            <span className="flex" aria-hidden>
              {CTA_TEXT.split("").map((char, i) => (
                <span key={`t-${i}`} className="cta-char-top inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
            <span className="absolute inset-0 flex" aria-hidden>
              {CTA_TEXT.split("").map((char, i) => (
                <span key={`b-${i}`} className="cta-char-bot inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
            <span className="sr-only">{CTA_TEXT}</span>
          </span>
          <ArrowUpRight size={18} />
        </TransitionLink>
      </div>
    </div>
  );
}
