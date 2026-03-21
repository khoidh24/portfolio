"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const COPY_ANIMATION_START = 0;
const COPY_ANIMATION_END = 0.5;

function getFrameSrc(index: number) {
  return `/motion/frame_${String(index).padStart(5, "0")}.webp`;
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const images: HTMLImageElement[] = [];
      const state = { frame: 0 };
      let rafId: number | null = null;

      const drawFrame = (frameIndex: number) => {
        const image = images[frameIndex];
        if (!image || !image.complete || image.naturalWidth === 0) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.floor(vw * dpr);
        canvas.height = Math.floor(vh * dpr);
        canvas.style.width = "100dvw";
        canvas.style.height = "100dvh";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);

        const scale = Math.max(
          vw / image.naturalWidth,
          vh / image.naturalHeight,
        );
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const x = (vw - drawWidth) / 2;
        const y = (vh - drawHeight) / 2;

        ctx.drawImage(image, x, y, drawWidth, drawHeight);
      };

      const requestDraw = () => {
        if (rafId !== null) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          drawFrame(state.frame);
        });
      };

      for (let i = 0; i < FRAME_COUNT; i += 1) {
        const img = new Image();
        img.src = getFrameSrc(i);
        img.decoding = "async";
        img.onload = requestDraw;
        images.push(img);
      }

      drawFrame(0);

      gsap.set(copyRef.current, {
        scale: 1,
        autoAlpha: 1,
        transformOrigin: "50% 50%",
      });

      const tween = gsap.to(state, {
        frame: FRAME_COUNT - 1,
        snap: "frame",
        ease: "none",
        onUpdate: requestDraw,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const hideProgress = gsap.utils.clamp(
              0,
              1,
              gsap.utils.mapRange(
                COPY_ANIMATION_START,
                COPY_ANIMATION_END,
                0,
                1,
                self.progress,
              ),
            );

            gsap.set(copyRef.current, {
              scale: 1 - hideProgress,
              autoAlpha: 1 - hideProgress,
            });
          },
        },
      });

      const handleResize = () => requestDraw();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        tween.kill();
      };
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative h-dvh w-dvw overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-dvh w-dvw" />
      <div
        ref={copyRef}
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 will-change-transform"
      >
        <div className="max-w-3xl text-center text-white lg:mb-64">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Your results reflect the effort invested.
          </h1>
          <p className="mt-5 text-base text-white/85 md:text-xl">
            An interface is not just something to look at but an experience to
            feel.
          </p>
        </div>
      </div>
    </section>
  );
}
