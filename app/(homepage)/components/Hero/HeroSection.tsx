"use client";

import { useCallback, useEffect, useRef } from "react";

import { TOTAL_FRAMES } from "@/constants";
import { useLoadImageStore } from "@/stores/useLoadImageStore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BATCH_SIZE = 8;

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const videoFrameRef = useRef<{ frame: number }>({ frame: 0 });
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const canvasDimsRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setImages = useLoadImageStore((state) => state.setImages);
  const images = useLoadImageStore((state) => state.images);
  const setIsReady = useLoadImageStore((state) => state.setIsReady);
  const setLoadedImageCount = useLoadImageStore(
    (state) => state.setLoadedImageCount,
  );

  const currentFrame = (index: number) =>
    `/motion/frame_${index.toString().padStart(5, "0")}.webp`;

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const pixelRatio = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    // Reset transform before scaling to avoid cumulative scale on resize
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    canvasDimsRef.current = { w, h };
  }, []);

  const render = useCallback(() => {
    const context = contextRef.current;
    const imgs = imagesRef.current;
    const { frame } = videoFrameRef.current;
    const { w, h } = canvasDimsRef.current;

    if (!context || !w || !h) return;

    const img = imgs[frame];
    if (!img?.complete || img.naturalWidth === 0) return;

    const imageAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = w / h;

    let drawWidth: number, drawHeight: number, drawX: number, drawY: number;
    if (imageAspect > canvasAspect) {
      drawHeight = h;
      drawWidth = drawHeight * imageAspect;
      drawX = (w - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = w;
      drawHeight = drawWidth / imageAspect;
      drawX = 0;
      drawY = (h - drawHeight) / 2;
    }

    context.clearRect(0, 0, w, h);
    context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }, []);

  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      render();
    });
  }, [render]);

  const handleResize = useCallback(() => {
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = setTimeout(() => {
      updateCanvasSize();
      render();
      scrollTriggerRef.current?.refresh();
    }, 150);
  }, [updateCanvasSize, render]);

  const setupScrollTrigger = useCallback(() => {
    scrollTriggerRef.current?.kill();

    const { h } = canvasDimsRef.current;
    const last = {
      navZone: -1,
      headerVisible: -1,
      wrapperZone: -1,
      navOpacity: -1,
    };

    const navEls = gsap.utils.toArray<HTMLElement>("nav, .open__drawer");
    const navContainer = document.querySelector<HTMLElement>(".nav__container");
    const heroHeader = document.querySelector<HTMLElement>(".hero__header");
    const heroWrapper = document.querySelector<HTMLElement>(".hero__wrapper");
    const setNavOpacity = navEls.length
      ? (gsap.quickSetter(navEls, "opacity") as (v: number) => void)
      : null;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: `+=${h * 4.5}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // Frame update — throttled via scheduleRender
        const animationProgress = Math.min(progress / 0.9, 1);
        const targetFrame = Math.round(animationProgress * (TOTAL_FRAMES - 1));
        if (videoFrameRef.current.frame !== targetFrame) {
          videoFrameRef.current.frame = targetFrame;
          scheduleRender();
        }

        // Nav opacity (0–10%)
        const navZone = progress <= 0.1 ? 0 : progress >= 0.85 ? 2 : 1;
        if (navZone === 0) {
          const opacity = Math.round((1 - progress / 0.1) * 100) / 100;
          if (opacity !== last.navOpacity) {
            setNavOpacity?.(opacity);
            last.navOpacity = opacity;
          }
          if (last.navZone !== 0) {
            gsap.set(navEls, {
              zIndex: 100,
              color: "var(--background)",
              borderColor: "var(--background)",
            });
            if (navContainer)
              gsap.set(navContainer, {
                backdropFilter: "blur(0px)",
                background: "transparent",
              });
          }
        } else if (navZone === 1) {
          if (last.navZone !== 1) {
            gsap.set(navEls, {
              opacity: 0,
              zIndex: 0,
              borderColor: "var(--foreground)",
            });
            if (navContainer)
              gsap.set(navContainer, {
                background:
                  "color-mix(in srgb, var(--background) 5%, transparent)",
                backdropFilter: "blur(8px)",
              });
            last.navOpacity = 0;
          }
        }
        last.navZone = navZone;

        // Hero header 3D zoom (0–25%)
        const headerVisible = progress <= 0.25 ? 1 : 0;
        if (headerVisible) {
          const zProgress = progress / 0.25;
          const translateZ = zProgress * -500;
          const opacity =
            progress >= 0.2 ? 1 - Math.min((progress - 0.2) / 0.05, 1) : 1;
          if (heroHeader)
            gsap.set(heroHeader, {
              transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
              opacity,
            });
        } else if (last.headerVisible !== 0) {
          if (heroHeader) gsap.set(heroHeader, { opacity: 0 });
        }
        last.headerVisible = headerVisible;

        // Canvas border-radius reveal (85–100%)
        const wrapperZone = progress >= 0.85 ? 1 : 0;
        if (wrapperZone) {
          const { w } = canvasDimsRef.current;
          const margin = (w <= 768 ? 120 : 560) * (progress - 0.85);
          if (heroWrapper)
            gsap.set(heroWrapper, {
              margin: `0 ${margin}px`,
              borderRadius: w <= 768 ? "16px" : "24px",
              overflow: "hidden",
              zIndex: 2,
            });
          const revealOpacity = Math.min(
            Math.max((progress - 0.85) / 0.15, 0),
            1,
          );
          if (revealOpacity !== last.navOpacity) {
            setNavOpacity?.(revealOpacity);
            last.navOpacity = revealOpacity;
          }
          if (last.wrapperZone !== 1) {
            gsap.set(navEls, {
              zIndex: 1,
              color: "var(--foreground)",
              borderColor: "var(--foreground)",
            });
          }
        } else if (last.wrapperZone !== 0) {
          if (heroWrapper)
            gsap.set(heroWrapper, { margin: "0 0px", borderRadius: 0 });
        }
        last.wrapperZone = wrapperZone;
      },
    });
  }, [scheduleRender]);

  // Separate flag to track if images were already loaded — avoids re-running effect on store update
  const initializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    contextRef.current = context;
    updateCanvasSize();

    const finishSetup = (imgs: HTMLImageElement[]) => {
      imagesRef.current = imgs;
      videoFrameRef.current.frame = 0;
      render();
      requestAnimationFrame(() => {
        setupScrollTrigger();
        requestAnimationFrame(() => {
          setIsReady(true);
          ScrollTrigger.refresh();
        });
      });
    };

    if (initializedRef.current) return;
    initializedRef.current = true;

    if (images.length > 0) {
      finishSetup(images);
    } else {
      const newImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);
      let imagesLoaded = 0;
      let batchesInFlight = 0;

      const loadBatch = (startIdx: number) => {
        if (startIdx >= TOTAL_FRAMES) return;
        batchesInFlight++;
        const end = Math.min(startIdx + BATCH_SIZE, TOTAL_FRAMES);

        for (let i = startIdx; i < end; i++) {
          const img = new Image();
          img.decoding = "async";
          newImages[i] = img;

          img.onload = img.onerror = () => {
            imagesLoaded++;

            if (imagesLoaded % 16 === 0 || imagesLoaded === TOTAL_FRAMES) {
              setLoadedImageCount(imagesLoaded);
            }

            if (imagesLoaded === TOTAL_FRAMES) {
              setImages(newImages);
              finishSetup(newImages);
              return;
            }

            // When this batch finishes, kick off the next one
            if (imagesLoaded % BATCH_SIZE === 0) {
              batchesInFlight--;
              loadBatch(imagesLoaded + batchesInFlight * BATCH_SIZE);
            }
          };

          img.src = currentFrame(i);
        }
      };

      // Kick off first 3 batches in parallel for faster initial load
      loadBatch(0);
      loadBatch(BATCH_SIZE);
      loadBatch(BATCH_SIZE * 2);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      scrollTriggerRef.current?.kill();
      window.removeEventListener("resize", handleResize);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="hero">
      <div className="hero__wrapper box-border flex items-center justify-center rounded-2xl">
        <canvas ref={canvasRef} />
      </div>
      <div className="hero__content absolute top-2/5 left-1/2 -translate-x-1/2 transform py-2 perspective-distant transform-3d">
        <div className="hero__header text-background absolute top-1/2 left-1/2 flex w-screen origin-center -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 text-center will-change-[transform,opacity]">
          <h1 className="font-sans text-2xl font-bold tracking-normal xl:text-4xl">
            Your results reflect{" "}
            <span className="inline max-xl:inline-block">
              the effort invested.
            </span>
          </h1>
          <p className="text-sm font-semibold xl:text-lg">
            An interface is not just something to look at
            <span className="block">but an experience to feel.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
