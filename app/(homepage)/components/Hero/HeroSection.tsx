"use client";

import { useCallback, useEffect, useRef } from "react";
import { TOTAL_FRAMES } from "@/constants";
import { useLoadImageStore } from "@/stores/useLoadImageStore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BATCH_SIZE = 10;
const FRAME_URLS = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `/motion/frame_${i.toString().padStart(5, "0")}.webp`,
);

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const stRef = useRef<ScrollTrigger | null>(null);
  const isMobileRef = useRef(false);
  const mountedRef = useRef(true);

  const setImages = useLoadImageStore((s) => s.setImages);
  const images = useLoadImageStore((s) => s.images);
  const setIsReady = useLoadImageStore((s) => s.setIsReady);
  const setLoadedImageCount = useLoadImageStore((s) => s.setLoadedImageCount);

  // Render frame
  const render = useCallback(() => {
    const frame = frameRef.current;
    if (isMobileRef.current) {
      const img = imgRef.current;
      if (img) img.src = FRAME_URLS[frame];
    } else {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      const img = imagesRef.current[frame];
      if (!ctx || !canvas || !img?.complete) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const ratio = Math.max(cw / iw, ch / ih);
      const w = iw * ratio;
      const h = ih * ratio;
      const x = (cw - w) / 2;
      const y = (ch - h) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, x, y, w, h);
    }
  }, []);

  // Setup ScrollTrigger
  const setupST = useCallback(() => {
    stRef.current?.kill();
    const mobile = isMobileRef.current;
    const h = window.innerHeight;

    const navEls = gsap.utils.toArray<HTMLElement>("nav, .open__drawer");
    const navContainer = document.querySelector<HTMLElement>(".nav__container");
    const heroHeader = document.querySelector<HTMLElement>(".hero__header");
    const heroWrapper = document.querySelector<HTMLElement>(".hero__wrapper");
    const scrollIndicator = document.querySelector<HTMLElement>(
      ".hero__scroll-indicator",
    );

    const setNavOpacity = navEls.length
      ? gsap.quickSetter(navEls, "opacity")
      : null;
    const setHeaderOpacity = heroHeader
      ? gsap.quickSetter(heroHeader, "opacity")
      : null;
    const setScrollIndicatorOpacity = scrollIndicator
      ? gsap.quickSetter(scrollIndicator, "opacity")
      : null;
    const setScrollIndicatorScale = scrollIndicator
      ? (v: number) => {
          if (scrollIndicator) gsap.set(scrollIndicator, { scale: v });
        }
      : null;
    const setHeaderZ = heroHeader
      ? (v: number) => heroHeader.style.setProperty("--hero-z", `${v}px`)
      : null;
    const setWrapperMargin = heroWrapper
      ? gsap.quickSetter(heroWrapper, "margin")
      : null;

    if (heroWrapper) {
      heroWrapper.style.overflow = "hidden";
      heroWrapper.style.borderRadius = "0";
    }

    let lastZone = -1;
    let lastHeaderVisible = -1;
    let lastWrapperZone = -1;
    let lastOpacity = -1;

    stRef.current = ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: `+=${h * 4.5}`,
      pin: true,
      scrub: mobile ? 1 : 0.5,
      onUpdate: (self) => {
        const p = self.progress;

        // Frame
        const targetFrame = Math.round(
          Math.min(p / 0.9, 1) * (TOTAL_FRAMES - 1),
        );
        if (frameRef.current !== targetFrame) {
          frameRef.current = targetFrame;
          render();
        }

        // Nav zones
        const zone = p <= 0.1 ? 0 : p >= 0.85 ? 2 : 1;
        if (zone === 0) {
          const opacity = 1 - p / 0.1;
          if (opacity !== lastOpacity) {
            setNavOpacity?.(opacity);
            lastOpacity = opacity;
          }
          if (lastZone !== 0) {
            gsap.set(navEls, {
              zIndex: 100,
              color: "var(--background)",
              borderColor: "var(--background)",
            });
            if (navContainer && !mobile)
              gsap.set(navContainer, {
                backdropFilter: "blur(0px)",
                background: "transparent",
              });
          }
        } else if (zone === 1 && lastZone !== 1) {
          gsap.set(navEls, {
            opacity: 0,
            zIndex: 0,
            borderColor: "var(--foreground)",
          });
          if (navContainer && !mobile)
            gsap.set(navContainer, {
              background:
                "color-mix(in srgb, var(--background) 5%, transparent)",
              backdropFilter: "blur(8px)",
            });
          lastOpacity = 0;
        }
        lastZone = zone;

        // Header + scroll indicator
        const headerVisible = p <= 0.25 ? 1 : 0;
        if (headerVisible) {
          const zProgress = p / 0.25;
          setHeaderZ?.(zProgress * -500);
          const opacity = p >= 0.2 ? 1 - (p - 0.2) / 0.05 : 1;
          // Scale down to match header's perspective zoom (translateZ -500px)
          const scale = 1 - zProgress * 0.5; // Scale from 1 to 0.5
          setHeaderOpacity?.(opacity);
          setScrollIndicatorOpacity?.(opacity);
          setScrollIndicatorScale?.(scale);
        } else if (lastHeaderVisible !== 0) {
          setHeaderOpacity?.(0);
          setScrollIndicatorOpacity?.(0);
          setScrollIndicatorScale?.(0.5);
        }
        lastHeaderVisible = headerVisible;

        // Wrapper
        const wrapperZone = p >= 0.85 ? 1 : 0;
        if (wrapperZone) {
          const w = window.innerWidth;
          const margin = (w <= 768 ? 120 : 560) * (p - 0.85);
          setWrapperMargin?.(`0 ${margin}px`);
          const revealOpacity = Math.min((p - 0.85) / 0.15, 1);
          if (revealOpacity !== lastOpacity) {
            setNavOpacity?.(revealOpacity);
            lastOpacity = revealOpacity;
          }
          if (lastWrapperZone !== 1) {
            gsap.set(navEls, {
              zIndex: 1,
              color: "var(--foreground)",
              borderColor: "var(--foreground)",
            });
            if (heroWrapper)
              heroWrapper.style.borderRadius = w <= 768 ? "16px" : "24px";
          }
        } else if (lastWrapperZone !== 0) {
          setWrapperMargin?.("0 0px");
          if (heroWrapper) heroWrapper.style.borderRadius = "0";
        }
        lastWrapperZone = wrapperZone;
      },
    });
  }, [render]);

  // Init
  useEffect(() => {
    mountedRef.current = true;
    isMobileRef.current = window.innerWidth < 768;
    const mobile = isMobileRef.current;

    // Setup canvas (desktop only)
    if (!mobile) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      ctxRef.current = ctx;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const finishSetup = (imgs: HTMLImageElement[]) => {
      if (!mountedRef.current) return;
      imagesRef.current = imgs;
      frameRef.current = 0;
      render();
      requestAnimationFrame(() => {
        if (!mountedRef.current) return;
        setupST();
        requestAnimationFrame(() => {
          if (!mountedRef.current) return;
          setIsReady(true);
          ScrollTrigger.refresh();
        });
      });
    };

    // Load images
    if (images.length > 0) {
      finishSetup(images);
    } else {
      const newImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);
      let loaded = 0;

      const onLoad = (i: number) => {
        loaded++;
        if (loaded % 20 === 0 || loaded === TOTAL_FRAMES) {
          if (mountedRef.current) setLoadedImageCount(loaded);
        }
        if (loaded === TOTAL_FRAMES) {
          if (mountedRef.current) {
            setImages(newImages);
            finishSetup(newImages);
          }
          return;
        }
        if (loaded % BATCH_SIZE === 0) loadBatch(loaded);
      };

      const loadBatch = (start: number) => {
        const end = Math.min(start + BATCH_SIZE, TOTAL_FRAMES);
        for (let i = start; i < end; i++) {
          const img = new Image();
          img.decoding = "async";
          newImages[i] = img;
          img.onload = () => onLoad(i);
          img.onerror = () => onLoad(i);
          img.src = FRAME_URLS[i];
        }
      };

      // Start parallel batches
      for (let i = 0; i < (mobile ? 4 : 6); i++) loadBatch(i * BATCH_SIZE);
    }

    // Resize handler
    const handleResize = () => {
      if (!mobile) {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      render();
      stRef.current?.refresh();
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);

    return () => {
      mountedRef.current = false;
      stRef.current?.kill();
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimer);
      setIsReady(false);
      setLoadedImageCount(0);
    };
  }, [images, render, setupST, setImages, setIsReady, setLoadedImageCount]);

  return (
    <section className="hero">
      <div className="hero__wrapper box-border flex items-center justify-center">
        <canvas ref={canvasRef} className="max-md:hidden" />
        <img
          ref={imgRef}
          alt=""
          className="md:hidden w-full object-cover"
          style={{ height: "100lvh" }}
          src={FRAME_URLS[0]}
        />
      </div>
      <div className="hero__content absolute top-2/5 left-1/2 -translate-x-1/2 py-2 perspective-distant transform-3d">
        <div className="hero__header text-background absolute top-1/2 left-1/2 flex w-screen origin-center flex-col items-center gap-4 text-center will-change-[transform,opacity]">
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
      {/* Scroll indicator mouse */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
        <div className="hero__scroll-indicator text-background origin-center">
          <div className="relative flex h-12 w-7 items-start justify-center rounded-full border-2 border-current p-1.5">
            <div className="scroll-wheel h-2 w-1.5 rounded-full bg-current" />
          </div>
        </div>
      </div>
    </section>
  );
}
