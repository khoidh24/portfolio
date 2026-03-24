"use client";

import { useCallback, useEffect, useRef } from "react";

import { TOTAL_FRAMES } from "@/constants";
import { useLoadImageStore } from "@/stores/useLoadImageStore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BATCH_SIZE = 8;

const getIsMobile = () =>
  typeof window !== "undefined" && window.innerWidth < 768;
const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

// Pre-build frame URL cache — avoids string allocation on every scroll tick
const FRAME_URLS = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `/motion/frame_${i.toString().padStart(5, "0")}.webp`,
);
const currentFrame = (index: number) => FRAME_URLS[index];

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const bitmapsRef = useRef<(ImageBitmap | null)[]>([]);
  const videoFrameRef = useRef<{ frame: number }>({ frame: 0 });
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const canvasDimsRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const mountedRef = useRef(false);
  const isMobileRef = useRef(false);
  // Track in-progress createImageBitmap calls to avoid duplicates
  const decodingRef = useRef<Set<number>>(new Set());

  const setImages = useLoadImageStore((s) => s.setImages);
  const images = useLoadImageStore((s) => s.images);
  const setIsReady = useLoadImageStore((s) => s.setIsReady);
  const setLoadedImageCount = useLoadImageStore((s) => s.setLoadedImageCount);

  // ── Bitmap decode (desktop only) ────────────────────────────────────────
  // createImageBitmap is async and runs off the main thread in modern browsers.
  // No worker needed — avoids double-fetching frames that <img> already loaded.
  const decodeBitmap = useCallback((index: number, img: HTMLImageElement) => {
    if (isMobileRef.current) return;
    const bitmaps = bitmapsRef.current;
    const decoding = decodingRef.current;
    if (bitmaps[index] != null || decoding.has(index)) return;
    decoding.add(index);
    createImageBitmap(img)
      .then((bitmap) => {
        decoding.delete(index);
        if (!mountedRef.current) {
          bitmap.close();
          return;
        }
        bitmaps[index] = bitmap;
        if (videoFrameRef.current.frame === index) scheduleRender();
      })
      .catch(() => decoding.delete(index));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ───────────────────────────────────────────────────────────────
  // Mobile: swap <img> src — browser handles decode/cache, zero GPU overhead
  const renderMobile = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const src = currentFrame(videoFrameRef.current.frame);
    if (!el.src.endsWith(src)) el.src = src;
  }, []);

  const drawSource = useCallback(
    (source: HTMLImageElement | ImageBitmap, sw: number, sh: number) => {
      const context = contextRef.current;
      const { w, h } = canvasDimsRef.current;
      if (!context || !w || !h) return;

      const imageAspect = sw / sh;
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
      context.drawImage(source, drawX, drawY, drawWidth, drawHeight);
    },
    [],
  );

  const renderDesktop = useCallback(() => {
    const { frame } = videoFrameRef.current;
    const bitmap = bitmapsRef.current[frame];
    if (bitmap) {
      drawSource(bitmap, bitmap.width, bitmap.height);
      return;
    }
    const img = imagesRef.current[frame];
    if (img?.complete && img.naturalWidth > 0)
      drawSource(img, img.naturalWidth, img.naturalHeight);
  }, [drawSource]);

  const render = useCallback(() => {
    if (isMobileRef.current) renderMobile();
    else renderDesktop();
  }, [renderMobile, renderDesktop]);

  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      render();
    });
  }, [render]);

  // ── Canvas size (desktop only) ───────────────────────────────────────────
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const pixelRatio = getPixelRatio();
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    canvasDimsRef.current = { w, h };
  }, []);

  const handleResize = useCallback(() => {
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = setTimeout(() => {
      if (!isMobileRef.current) updateCanvasSize();
      else
        canvasDimsRef.current = { w: window.innerWidth, h: window.innerHeight };
      render();
      scrollTriggerRef.current?.refresh();
    }, 150);
  }, [updateCanvasSize, render]);

  // ── ScrollTrigger ────────────────────────────────────────────────────────
  const setupScrollTrigger = useCallback(() => {
    scrollTriggerRef.current?.kill();

    const { h } = canvasDimsRef.current;
    const mobile = isMobileRef.current;
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
      scrub: mobile ? 1 : 0.5,
      onUpdate: (self) => {
        const progress = self.progress;

        const animationProgress = Math.min(progress / 0.9, 1);
        const targetFrame = Math.round(animationProgress * (TOTAL_FRAMES - 1));
        if (videoFrameRef.current.frame !== targetFrame) {
          videoFrameRef.current.frame = targetFrame;
          scheduleRender();
        }

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
          if (last.wrapperZone !== 1)
            gsap.set(navEls, {
              zIndex: 1,
              color: "var(--foreground)",
              borderColor: "var(--foreground)",
            });
        } else if (last.wrapperZone !== 0) {
          if (heroWrapper)
            gsap.set(heroWrapper, { margin: "0 0px", borderRadius: 0 });
        }
        last.wrapperZone = wrapperZone;
      },
    });
  }, [scheduleRender]);

  // ── Mount / init ─────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    initializedRef.current = false;
    return () => {
      mountedRef.current = false;
      // Reset ready state so template waits for canvas on next visit
      setIsReady(false);
      setLoadedImageCount(0);
    };
  }, [setIsReady, setLoadedImageCount]);

  useEffect(() => {
    isMobileRef.current = getIsMobile();
    const mobile = isMobileRef.current;

    if (!mobile) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;
      contextRef.current = context;
      updateCanvasSize();
    } else {
      canvasDimsRef.current = { w: window.innerWidth, h: window.innerHeight };
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    // Init bitmaps array once
    if (bitmapsRef.current.length === 0) {
      bitmapsRef.current = new Array(TOTAL_FRAMES).fill(null);
    }

    const finishSetup = (imgs: HTMLImageElement[]) => {
      if (!mountedRef.current) return;
      imagesRef.current = imgs;
      videoFrameRef.current.frame = 0;
      render();
      requestAnimationFrame(() => {
        if (!mountedRef.current) return;
        setupScrollTrigger();
        requestAnimationFrame(() => {
          if (!mountedRef.current) return;
          setIsReady(true);
          ScrollTrigger.refresh();
        });
      });
    };

    if (images.length > 0) {
      finishSetup(images);
      // Decode bitmaps for cached images (desktop only)
      if (!mobile) {
        images.forEach((img, i) => {
          if (img.complete && img.naturalWidth > 0) decodeBitmap(i, img);
        });
      }
    } else {
      const newImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);
      let imagesLoaded = 0;

      const onLoad = (img: HTMLImageElement, i: number) => {
        imagesLoaded++;
        if (imagesLoaded % 16 === 0 || imagesLoaded === TOTAL_FRAMES) {
          if (mountedRef.current) setLoadedImageCount(imagesLoaded);
        }
        // Decode to ImageBitmap immediately after img loads — no double fetch
        if (!mobile) decodeBitmap(i, img);

        if (imagesLoaded === TOTAL_FRAMES) {
          if (mountedRef.current) {
            setImages(newImages);
            finishSetup(newImages);
          }
          return;
        }
        if (imagesLoaded % BATCH_SIZE === 0) loadBatch(imagesLoaded);
      };

      const loadBatch = (startIdx: number) => {
        if (startIdx >= TOTAL_FRAMES) return;
        const end = Math.min(startIdx + BATCH_SIZE, TOTAL_FRAMES);
        for (let i = startIdx; i < end; i++) {
          const img = new Image();
          img.decoding = "async";
          newImages[i] = img;
          img.onload = () => onLoad(img, i);
          img.onerror = () => onLoad(img, i);
          img.src = currentFrame(i);
        }
      };

      // Start more batches upfront for faster initial load
      loadBatch(0);
      loadBatch(BATCH_SIZE);
      loadBatch(BATCH_SIZE * 2);
      loadBatch(BATCH_SIZE * 3);
      if (!mobile) {
        loadBatch(BATCH_SIZE * 4);
        loadBatch(BATCH_SIZE * 5);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => {
      scrollTriggerRef.current?.kill();
      window.removeEventListener("resize", handleResize);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      bitmapsRef.current.forEach((bmp) => bmp?.close());
      bitmapsRef.current = new Array(TOTAL_FRAMES).fill(null);
      decodingRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="hero">
      <div className="hero__wrapper box-border flex items-center justify-center rounded-2xl">
        {/* Desktop: canvas with bitmap pre-decode */}
        <canvas ref={canvasRef} className="max-md:hidden" />
        {/* Mobile: plain <img> swap — browser handles decode/cache, no GPU overhead */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          alt=""
          className="md:hidden h-screen w-full object-cover"
          src={currentFrame(0)}
        />
      </div>
      <div className="hero__content absolute top-2/5 left-1/2 -translate-x-1/2 transform py-2 perspective-distant transform-3d">
        <div className="hero__header text-background absolute top-1/2 left-1/2 flex w-screen origin-center -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 text-center will-change-[transform,opacity]">
          <h1 className="font-sans text-2xl font-bold tracking-normal xl:text-4xl cursor-default">
            Your results reflect{" "}
            <span className="inline max-xl:inline-block">
              the effort invested.
            </span>
          </h1>
          <p className="text-sm font-semibold xl:text-lg cursor-default">
            An interface is not just something to look at
            <span className="block">but an experience to feel.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
