"use client";

import { useEffect, useRef } from "react";

import gsap from "gsap";

// Tags that are always interactive
const INTERACTIVE_TAGS = new Set(["A", "BUTTON", "INPUT", "TEXTAREA", "LABEL"]);
// Heading tags
const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

export default function CustomCursor() {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  useEffect(() => {
    const outer = cursorOuterRef.current;
    const inner = cursorInnerRef.current;
    if (!outer || !inner) return;

    const setOuterX = gsap.quickSetter(outer, "x", "px") as (v: number) => void;
    const setOuterY = gsap.quickSetter(outer, "y", "px") as (v: number) => void;

    const toInnerX = gsap.quickTo(inner, "x", {
      duration: 0.2,
      ease: "power2.out",
    });
    const toInnerY = gsap.quickTo(inner, "y", {
      duration: 0.2,
      ease: "power2.out",
    });

    const setHover = (val: boolean) => {
      if (isHovering.current === val) return;
      isHovering.current = val;
      const size = val ? "56px" : "24px";
      const innerSize = val ? "52px" : "8px";
      gsap.to(outer, {
        width: size,
        height: size,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(inner, {
        width: innerSize,
        height: innerSize,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    // Cache exclusion zones — re-check only on DOM changes, not every mousemove
    let inExclusionZone = false;
    const exclusionSelectors = [".markdown-body", ".hero"];

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      setOuterX(clientX);
      setOuterY(clientY);
      toInnerX(clientX);
      toInnerY(clientY);

      const target = e.target as HTMLElement;
      const tag = target.tagName;

      // Fast path: check tag first before any DOM traversal
      const isInteractiveTag =
        INTERACTIVE_TAGS.has(tag) ||
        HEADING_TAGS.has(tag) ||
        (tag === "SPAN" &&
          HEADING_TAGS.has(target.parentElement?.tagName ?? "")) ||
        target.classList.contains("cursor-pointer") ||
        target.style.cursor === "pointer";

      if (!isInteractiveTag) {
        setHover(false);
        return;
      }

      // Only do expensive DOM traversal when tag check passes
      inExclusionZone = exclusionSelectors.some((sel) => target.closest(sel));
      if (inExclusionZone) {
        setHover(false);
        return;
      }

      // Check if inside interactive ancestor (only when needed)
      const interactive =
        INTERACTIVE_TAGS.has(tag) ||
        HEADING_TAGS.has(tag) ||
        (tag === "SPAN" &&
          HEADING_TAGS.has(target.parentElement?.tagName ?? "")) ||
        !!target.closest("a") ||
        !!target.closest("button") ||
        target.classList.contains("cursor-pointer") ||
        target.style.cursor === "pointer";

      setHover(interactive);
    };

    const handleMouseEnter = () =>
      gsap.to([outer, inner], { opacity: 1, duration: 0.3 });
    const handleMouseLeave = () =>
      gsap.to([outer, inner], { opacity: 0, duration: 0.3 });

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.body.addEventListener("mouseenter", handleMouseEnter);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorOuterRef}
        className="border-background pointer-events-none fixed top-0 left-0 z-9999 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 max-xl:hidden"
        style={{ mixBlendMode: "difference" }}
      />
      <div
        ref={cursorInnerRef}
        className="bg-background pointer-events-none fixed top-0 left-0 z-9999 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full max-xl:hidden"
        style={{ mixBlendMode: "difference" }}
      />
    </>
  );
}
