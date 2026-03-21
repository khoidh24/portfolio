"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import gsap from "gsap";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    gsap.killTweensOf(drawer);

    gsap.to(drawer, {
      duration: isOpen ? 0.6 : 0.5,
      clipPath: isOpen ? "circle(150% at 50% 0%)" : "circle(0% at 90.5% 4%)",
      ease: "power3.out",
      onStart: () => {
        if (isOpen) drawer.style.pointerEvents = "auto";
      },
      onComplete: () => {
        if (!isOpen) drawer.style.pointerEvents = "none";
      },
    });
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={drawerRef}
      className={`bg-neutral-950 fixed inset-0 z-200 ${className ?? ""}`}
      style={{ clipPath: "circle(0% at 100% 30%)", pointerEvents: "none" }}
    >
      <div className="bg-background absolute top-2 right-4 flex cursor-pointer items-center justify-center rounded-full p-3">
        <X size={16} onClick={() => onClose()} className="text-foreground" />
      </div>
      {children}
    </div>,
    document.body,
  );
}
