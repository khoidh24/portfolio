"use client";

import {
  ReactElement,
  RefAttributes,
  cloneElement,
  useEffect,
  useRef,
} from "react";

import gsap from "gsap";

type MagneticElementProps = {
  children: ReactElement<unknown>;
};

export default function MagneticElement({ children }: MagneticElementProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;

    const toX = gsap.quickTo(element, "x", {
      duration: 1.5,
      ease: "elastic.out(1, 0.25)",
    });
    const toY = gsap.quickTo(element, "y", {
      duration: 1.5,
      ease: "elastic.out(1, 0.25)",
    });

    // Cache rect — only re-read on resize, not every mousemove
    let rect = element.getBoundingClientRect();
    const updateRect = () => {
      rect = element.getBoundingClientRect();
    };
    window.addEventListener("resize", updateRect, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });

    const mouseMove = (e: MouseEvent) => {
      const x = (e.clientX - (rect.left + rect.width / 2)) * 0.6;
      const y = (e.clientY - (rect.top + rect.height / 2)) * 0.4;
      toX(x);
      toY(y);
    };

    const mouseLeave = () => {
      toX(0);
      toY(0);
    };

    element.addEventListener("mousemove", mouseMove);
    element.addEventListener("mouseleave", mouseLeave);

    return () => {
      element.removeEventListener("mousemove", mouseMove);
      element.removeEventListener("mouseleave", mouseLeave);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, []);

  return cloneElement(children, { ref } as Partial<unknown> &
    RefAttributes<HTMLElement>);
}
