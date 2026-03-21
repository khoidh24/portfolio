"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { usePageReady } from "@/hooks/usePageReady";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import JourneyHeader from "./components/JourneyHeader";
import JourneyPeek, { PEEK_H } from "./components/JourneyPeek";
import JourneyRow from "./components/JourneyRow";
import { JOURNEYS } from "./constants/journeys";

// Module-level stable refs — never recreated across renders
const imgRefs = JOURNEYS.map(() => ({
  current: null as HTMLImageElement | null,
}));
const srcs = JOURNEYS.map((j) => j.image);

export default function JourneySection() {
  const isPageReady = usePageReady();
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);
  const currentIdxRef = useRef(-1);
  const animatedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      // Update peek position directly on mousemove instead of RAF loop
      if (isVisibleRef.current && peekRef.current) {
        gsap.set(peekRef.current, {
          x: e.clientX + 24,
          y: e.clientY - PEEK_H / 2,
        });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useGSAP(
    () => {
      if (!isPageReady || animatedRef.current) return;
      animatedRef.current = true;

      // Position is now updated directly in the mousemove handler above
      const startFollow = () => {
        // Snap to current position immediately on show
        if (peekRef.current) {
          gsap.set(peekRef.current, {
            x: mousePosRef.current.x + 24,
            y: mousePosRef.current.y - PEEK_H / 2,
          });
        }
      };

      const stopFollow = () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };

      // — Header reveal —
      gsap.set(".journey__label", { yPercent: 120, opacity: 0 });
      gsap.set(".journey__title span", { yPercent: 110 });

      const headerST = {
        trigger: containerRef.current,
        start: "top 88%",
        toggleActions: "play none none none",
      };
      gsap.to(".journey__label", {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power4.out",
        scrollTrigger: headerST,
      });
      gsap.to(".journey__title span", {
        yPercent: 0,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.06,
        scrollTrigger: headerST,
      });

      // — Row animations —
      gsap.utils.toArray<HTMLElement>(".journey__row").forEach((row) => {
        const line = row.querySelector(".journey__line");
        const index = row.querySelector(".journey__index");
        const content = row.querySelectorAll(".journey__content");
        const tags = row.querySelectorAll(".journey__tag");
        const rowIdx = Number(row.dataset.idx);

        gsap
          .timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          })
          .fromTo(
            line,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.5, ease: "power3.inOut" },
          )
          .fromTo(
            index,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" },
            "-=0.3",
          )
          .fromTo(
            content,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
            "-=0.3",
          )
          .fromTo(
            tags,
            { opacity: 0, y: 10, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.35,
              ease: "power2.out",
              stagger: 0.05,
            },
            "-=0.3",
          );

        gsap.to(index, {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: row,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        row.addEventListener("mouseenter", () => {
          const prevIdx = currentIdxRef.current;
          currentIdxRef.current = rowIdx;

          const incoming = imgRefs[rowIdx].current;
          const outgoing = prevIdx >= 0 ? imgRefs[prevIdx].current : null;
          if (!incoming) return;

          const dir: 1 | -1 = prevIdx === -1 || rowIdx > prevIdx ? 1 : -1;

          if (!isVisibleRef.current) {
            isVisibleRef.current = true;
            imgRefs.forEach((r) => {
              if (r.current) gsap.set(r.current, { y: PEEK_H });
            });
            gsap.set(incoming, { y: 0 });
            const peek = peekRef.current;
            if (peek) {
              gsap.killTweensOf(peek);
              gsap.set(peek, { display: "block", scale: 0.85, opacity: 0 });
              gsap.to(peek, {
                scale: 1,
                opacity: 1,
                duration: 0.35,
                ease: "power3.out",
              });
            }
            startFollow();
          } else {
            if (outgoing) {
              gsap.killTweensOf(outgoing);
              gsap.to(outgoing, {
                y: -dir * PEEK_H,
                duration: 0.28,
                ease: "power3.inOut",
              });
            }
            gsap.killTweensOf(incoming);
            gsap.set(incoming, { y: dir * PEEK_H });
            gsap.to(incoming, { y: 0, duration: 0.28, ease: "power3.inOut" });
          }
        });
      });

      rowsRef.current?.addEventListener("mouseleave", () => {
        const peek = peekRef.current;
        if (!peek || !isVisibleRef.current) return;
        isVisibleRef.current = false;
        currentIdxRef.current = -1;
        stopFollow();
        gsap.killTweensOf(peek);
        gsap.to(peek, {
          scale: 0.85,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(peek, { display: "none" });
          },
        });
      });
    },
    { dependencies: [isPageReady], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="journey__container container mx-auto w-full px-4 py-16 md:px-10 md:py-24 2xl:py-32"
    >
      {mounted &&
        createPortal(
          <JourneyPeek ref={peekRef} imgRefs={imgRefs} srcs={srcs} />,
          document.body,
        )}

      <JourneyHeader />

      <div ref={rowsRef} className="flex flex-col">
        {JOURNEYS.map((item, idx) => (
          <JourneyRow key={item.index} item={item} idx={idx} />
        ))}
        <div className="h-px w-full bg-neutral-300" />
      </div>
    </div>
  );
}
