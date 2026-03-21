"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";
import Lenis from "lenis";

type Heading = { text: string; level: number; id: string };
type Props = { headings: Heading[] };

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Scroll-based active heading — finds the last heading above the midpoint
  useEffect(() => {
    if (!headings.length) return;

    const update = () => {
      const mid = window.innerHeight * 0.35;
      let best = headings[0].id;

      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= mid) best = h.id;
      }

      setActiveId(best);
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // run once on mount
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [headings]);

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as { __lenis?: Lenis }).__lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: -100 });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const navItems = (prefix: string) =>
    headings.map((h, i) => {
      const isActive = activeId === h.id;
      return (
        <button
          key={`${prefix}-${i}`}
          onClick={() => handleScroll(h.id)}
          className={[
            "group relative w-full py-1.5 text-left text-[13px] leading-snug transition-colors duration-150",
            h.level === 3 ? "pl-5" : h.level === 2 ? "pl-2" : "pl-0",
            isActive
              ? "text-foreground font-medium"
              : "text-foreground/35 hover:text-foreground/70",
          ].join(" ")}
        >
          {/* active indicator — overlaps the border-l of the parent */}
          <span
            className={[
              "absolute top-0 -left-4 h-full w-0.5 rounded-full transition-all duration-200",
              isActive
                ? "bg-foreground opacity-100"
                : "opacity-0 group-hover:bg-foreground/30 group-hover:opacity-100",
            ].join(" ")}
          />
          {h.text}
        </button>
      );
    });

  return (
    <>
      {/* Desktop — sticky is handled by the parent aside */}
      <div className="hidden max-h-[calc(100vh-8rem)] overflow-y-auto xl:block">
        <p className="text-foreground/30 mb-4 text-[10px] font-semibold tracking-[0.2em] uppercase">
          On this page
        </p>
        <div className="border-foreground/10 flex flex-col gap-0.5 border-l pl-4">
          {navItems("desktop")}
        </div>
      </div>

      {/* Mobile — fixed below nav */}
      <div className="bg-background fixed top-[60px] right-0 left-0 z-40 xl:hidden">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="border-foreground/10 flex w-full items-center justify-between border-b px-4 py-3 text-left text-sm font-semibold"
        >
          <span>On this page</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div
            className="bg-background border-foreground/10 flex flex-col gap-0.5 border-b px-4 py-3"
            style={{ maxHeight: "50vh", overflowY: "auto" }}
          >
            {navItems("mobile")}
          </div>
        )}
      </div>
    </>
  );
}
