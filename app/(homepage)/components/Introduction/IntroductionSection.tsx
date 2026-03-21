"use client";

import { useRef } from "react";

import { usePageReady } from "@/hooks/usePageReady";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Calendar,
  GraduationCap,
  Map,
  MapPin,
  School,
  User,
} from "lucide-react";
import Image from "next/image";

const STATS = [
  { label: "Years of\nExperience", value: "3.5" },
  { label: "Projects\nDelivered", value: "20+" },
  { label: "GPA\nScore", value: "3.2" },
  { label: "Cups of\nCoffee", value: "∞" },
];

const INFO_ITEMS = [
  { icon: User, value: "Duong Hoang Khoi" },
  { icon: Calendar, value: "2001 / 06 / 24" },
  { icon: GraduationCap, value: "SWE Bachelor" },
  { icon: School, value: "University of Greenwich" },
  { icon: Map, value: "Ho Chi Minh City" },
  { icon: MapPin, value: "Software Engineer" },
];

export default function IntroductionSection() {
  const isPageReady = usePageReady();
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useGSAP(
    () => {
      if (!isPageReady || animatedRef.current) return;
      animatedRef.current = true;

      const st = {
        trigger: containerRef.current,
        start: "top 70%",
        toggleActions: "play none none none",
      };

      gsap.set(".intro__eyebrow", { yPercent: 120, opacity: 0 });
      gsap.set(".intro__word", { yPercent: 110 });
      gsap.set(".intro__body", { opacity: 0, y: 24 });
      gsap.set(".intro__stat", { opacity: 0, scale: 0.6, y: 16 });
      gsap.set(".intro__divider", {
        scaleX: 0,
        transformOrigin: "left center",
      });
      gsap.set(".intro__info-item", { opacity: 0, x: -16 });
      gsap.set(".intro__image", { scale: 1.08, opacity: 0 });
      gsap.set(".intro__image-label", { opacity: 0, y: 12 });

      gsap.to(".intro__eyebrow", {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: st,
      });
      gsap.to(".intro__word", {
        yPercent: 0,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.05,
        scrollTrigger: st,
      });
      gsap.to(".intro__divider", {
        scaleX: 1,
        duration: 0.7,
        ease: "power3.inOut",
        delay: 0.15,
        scrollTrigger: st,
      });
      gsap.to(".intro__body", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: st,
      });
      gsap.to(".intro__stat", {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.45,
        ease: "back.out(1.7)",
        stagger: 0.08,
        delay: 0.2,
        scrollTrigger: st,
      });
      gsap.to(".intro__info-item", {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: "power3.out",
        stagger: 0.05,
        delay: 0.3,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 55%",
          toggleActions: "play none none none",
        },
      });
      gsap.to(".intro__image", {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: "power4.out",
        delay: 0.15,
        scrollTrigger: st,
      });
      gsap.to(".intro__image-label", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.4,
        scrollTrigger: st,
      });
    },
    { dependencies: [isPageReady], scope: containerRef },
  );

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="introduction__container relative w-full overflow-hidden px-4 md:px-10"
    >
      <div className="container mx-auto w-full py-16 md:py-24 2xl:py-32">
        <div className="mb-3 overflow-hidden md:mb-6">
          <p className="intro__eyebrow text-foreground/40 font-sans text-[10px] font-semibold tracking-[0.25em] uppercase md:text-xs">
            About me — An Enthusiast Software Engineer
          </p>
        </div>

        <div className="mb-6 overflow-hidden md:mb-10">
          <h2 className="font-heading flex w-fit flex-wrap gap-x-[0.25em] text-[clamp(28px,7vw,96px)] leading-[1.05] font-bold tracking-tight">
            {["Where", "arts", "&", "logic", "meet."].map((word, i) => (
              <span key={i} className="intro__word inline-block">
                {word}
              </span>
            ))}
          </h2>
        </div>

        <div className="intro__divider bg-foreground/15 mb-8 h-px w-full md:mb-12" />

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_420px] xl:gap-24">
          <div className="flex flex-col gap-8 md:gap-12">
            <p className="intro__body text-foreground/60 max-w-[520px] font-sans text-base leading-relaxed">
              Once curious about how websites came to life, the journey began
              with late nights exploring HTML and CSS. Discovery turned into
              passion when React entered the picture — bringing structure to
              creativity. From simple UI components to large-scale applications,
              every bug fixed and feature shipped added a brick to a growing
              foundation.
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="intro__stat flex flex-col gap-1">
                  <span className="font-heading text-[clamp(28px,4vw,48px)] leading-none font-bold tracking-tight">
                    {s.value}
                  </span>
                  <span className="text-foreground/40 font-sans text-[11px] font-medium tracking-widest whitespace-pre-line uppercase">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-foreground/10 grid grid-cols-1 gap-0 border-t sm:grid-cols-2">
              {INFO_ITEMS.map(({ icon: Icon, value }, idx) => (
                <div
                  key={value}
                  className={cn(
                    "intro__info-item hover:bg-foreground/3 border-foreground/10 flex items-center gap-3 border-b py-3 pr-4 md:px-3",
                    idx % 2 === 0 ? "sm:border-foreground/10 sm:border-r" : "",
                  )}
                >
                  <Icon size={14} className="text-foreground/30 shrink-0" />
                  <span className="text-foreground/70 font-sans text-sm">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 xl:items-end">
            <div className="intro__image-wrap relative w-full max-w-[420px] xl:w-[420px]">
              <div className="intro__image-label bg-foreground absolute -top-3 -left-3 z-10 px-3 py-1">
                <span className="text-background font-sans text-[10px] font-semibold tracking-widest uppercase">
                  Volunote ©
                </span>
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/motion/signature-creature.webp"
                  width={500}
                  height={500}
                  alt="Volunote — A Joyful Software Engineer"
                  title="Volunote — A Joyful Software Engineer"
                  className="intro__image w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="intro__image-label mt-3 flex items-center justify-between">
                <span className="text-foreground/30 font-sans text-xs tracking-wide">
                  Ho Chi Minh City, VN
                </span>
                <span className="text-foreground/30 font-sans text-xs tracking-wide">
                  Software Engineer
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
