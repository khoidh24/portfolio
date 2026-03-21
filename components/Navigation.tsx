"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { NAVIGATION_PATHS } from "@/constants";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import LinkAnimation from "./LinkAnimation";
import MagneticElement from "./MagneticElement";
import Modal from "./Modal";

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    gsap.killTweensOf(drawer);

    gsap.to(drawer, {
      duration: isOpen ? 0.6 : 0.5,
      clipPath: isOpen ? "circle(150% at 50% 0%)" : "circle(0% at 100% 0%)",
      ease: "power3.out",
      onStart: () => {
        if (isOpen) drawer.style.pointerEvents = "auto";
      },
      onComplete: () => {
        if (!isOpen) drawer.style.pointerEvents = "none";
      },
    });

    gsap.to(".open__drawer", {
      opacity: isOpen ? 0 : 1,
      duration: 1,
      ease: "power3.out",
    });

    gsap.to(".close__drawer", {
      opacity: isOpen ? 1 : 0,
      duration: 1,
      ease: "power3.out",
    });
  }, [isOpen]);

  return (
    <>
      <nav className="nav__container text-foreground fixed top-0 left-0 z-50 w-full">
        <div className="container mx-auto flex items-center justify-between px-10 py-2 max-xl:px-4 xl:rounded-2xl xl:py-4">
          <MagneticElement>
            <div className="h-full text-end max-xl:hidden">
              <LinkAnimation
                href={NAVIGATION_PATHS.articles.href}
                label={NAVIGATION_PATHS.articles.label}
              />
            </div>
          </MagneticElement>
          <div className="h-full">
            {pathname !== NAVIGATION_PATHS.home.href ? (
              <LinkAnimation
                href={NAVIGATION_PATHS.home.href}
                label={NAVIGATION_PATHS.home.label}
              >
                <p className="font-heading text-2xl font-bold text-nowrap uppercase xl:text-2xl">
                  Volunote
                </p>
              </LinkAnimation>
            ) : (
              <h1 className="text-[24px] font-bold text-nowrap uppercase">
                Volunote
              </h1>
            )}
          </div>
          <MagneticElement>
            <div className="h-full text-end max-xl:hidden">
              <LinkAnimation
                href={NAVIGATION_PATHS.contact.href}
                label={NAVIGATION_PATHS.contact.label}
              />
            </div>
          </MagneticElement>
          <div className="flex h-full w-full items-center justify-end xl:hidden">
            <div className="open__drawer border-foreground rounded-full border p-3">
              <Menu
                size={16}
                className="open__drawer"
                onClick={() => setIsOpen(true)}
              />
            </div>
          </div>
        </div>
      </nav>

      {mounted &&
        createPortal(
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <p className="mx-4 mt-16 border-b border-neutral-400 pb-1 text-sm font-medium text-neutral-400">
              Navigation
            </p>
            <div className="text-background mx-4 mt-4 flex flex-col items-start justify-start gap-2">
              <LinkAnimation
                href={NAVIGATION_PATHS.home.href}
                label={NAVIGATION_PATHS.home.label}
                className={cn(
                  "text-5xl font-bold text-neutral-400 uppercase",
                  pathname === NAVIGATION_PATHS.home.href && "text-neutral-100",
                )}
                onClick={() => setIsOpen(false)}
              />
              <LinkAnimation
                href={NAVIGATION_PATHS.contact.href}
                label={NAVIGATION_PATHS.contact.label}
                className={cn(
                  "text-5xl font-bold text-neutral-400 uppercase",
                  pathname === NAVIGATION_PATHS.contact.href &&
                    "text-neutral-100",
                )}
                onClick={() => setIsOpen(false)}
              />
              <LinkAnimation
                href={NAVIGATION_PATHS.articles.href}
                label={NAVIGATION_PATHS.articles.label}
                className={cn(
                  "text-5xl font-bold text-neutral-400 uppercase",
                  pathname === NAVIGATION_PATHS.articles.href &&
                    "text-neutral-100",
                )}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </Modal>,
          document.body,
        )}
    </>
  );
}
