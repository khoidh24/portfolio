"use client";

import {
  ReactNode,
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { TOTAL_FRAMES } from "@/constants";
import { useLoadImageStore } from "@/stores/useLoadImageStore";
import { useLoadingProgressStore } from "@/stores/useLoadingProgress";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname, useRouter } from "next/navigation";

import FooterSection from "@/components/Footer/FooterSection";
import Navigation from "@/components/Navigation";
import {
  pageInLoadingAnimation,
  pageInWithoutLoadingAnimation,
  pageOutLoadingAnimation,
} from "@/utils/animations";

gsap.registerPlugin(ScrollTrigger);

export const dispatchPageReady = () =>
  window.dispatchEvent(new CustomEvent("pageready"));

type Props = { children: ReactNode };

// Slot digit — memoized, only re-renders when digit changes
const SlotDigit = memo(function SlotDigit({ digit }: { digit: number }) {
  const size = "clamp(80px, 18vw, 180px)";
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: "clamp(48px, 11vw, 110px)", height: size }}
    >
      <div
        className="flex flex-col"
        style={{
          transform: `translateY(-${digit * 10}%)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <div
            key={d}
            className="text-background flex shrink-0 items-center justify-center font-bold leading-none"
            style={{ fontSize: size, height: size, lineHeight: 1 }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
});

function SlotNumber({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const digits =
    clamped === 100 ? [1, 0, 0] : [Math.floor(clamped / 10), clamped % 10];
  return (
    <div className="flex">
      {digits.map((d, i) => (
        <SlotDigit key={i} digit={d} />
      ))}
    </div>
  );
}

export default function Template({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Split selectors to avoid re-renders from unrelated store changes
  const isReady = useLoadImageStore((s) => s.isReady);
  const loadedImageCount = useLoadImageStore((s) => s.loadedImageCount);
  const percentNumber = useLoadingProgressStore((s) => s.percentNumber);
  const setPercentNumber = useLoadingProgressStore((s) => s.setPercentNumber);
  const isLoadingComplete = useLoadingProgressStore((s) => s.isLoadingComplete);
  const setIsLoadingComplete = useLoadingProgressStore(
    (s) => s.setIsLoadingComplete,
  );
  const hasInitialLoadCompleted = useLoadingProgressStore(
    (s) => s.hasInitialLoadCompleted,
  );
  const setHasInitialLoadCompleted = useLoadingProgressStore(
    (s) => s.setHasInitialLoadCompleted,
  );

  const animationTriggeredRef = useRef(false);
  const pageOutInProgressRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const hasInitialLoadCompletedRef = useRef(hasInitialLoadCompleted);
  const isDocumentReadyRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);

  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Sync refs
  useEffect(() => {
    hasInitialLoadCompletedRef.current = hasInitialLoadCompleted;
  }, [hasInitialLoadCompleted]);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Smooth percent counter — only during initial load
  useEffect(() => {
    if (hasInitialLoadCompleted) return;
    const obj = { value: animatedPercent };
    const tween = gsap.to(obj, {
      value: percentNumber,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => setAnimatedPercent(Math.round(obj.value)),
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentNumber, hasInitialLoadCompleted]);

  // Lenis — runs once
  useLayoutEffect(() => {
    ScrollTrigger.normalizeScroll(true);
    const lenis = new Lenis({
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 2.5),
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;
    (window as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 700);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // Non-home nav styles
  useEffect(() => {
    if (pathname === "/") return;
    gsap.set("nav, .open__drawer", {
      zIndex: 1,
      color: "var(--foreground)",
      borderColor: "var(--foreground)",
    });
    gsap.set(".nav__container", {
      background: "color-mix(in srgb, var(--background) 30%, transparent)",
      backdropFilter: "blur(8px)",
    });
  }, [pathname]);

  // Back/forward interception
  useEffect(() => {
    const isAnimatingRef = { current: false };
    const handle = (e: PopStateEvent) => {
      const current = pathnameRef.current;
      const target = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (target === current || isAnimatingRef.current) return;
      e.stopImmediatePropagation();
      window.history.pushState(window.history.state, "", current);
      isAnimatingRef.current = true;
      pageOutInProgressRef.current = true;
      pageOutLoadingAnimation(
        target,
        router,
        () => {
          isAnimatingRef.current = false;
          pageOutInProgressRef.current = false;
        },
        true,
      );
    };
    window.addEventListener("popstate", handle, { capture: true });
    return () =>
      window.removeEventListener("popstate", handle, { capture: true });
  }, [router]);

  // Reset on route change
  useEffect(() => {
    animationTriggeredRef.current = false;
    if (!hasInitialLoadCompletedRef.current) {
      isDocumentReadyRef.current = false;
      setPercentNumber(0);
      setIsLoadingComplete(false);
      setAnimatedPercent(0);
    } else {
      setAnimatedPercent(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Reset progress event
  useEffect(() => {
    const handle = () => {
      if (hasInitialLoadCompletedRef.current) return;
      setPercentNumber(0);
      setIsLoadingComplete(false);
      setAnimatedPercent(0);
    };
    window.addEventListener("resetLoadingProgress", handle);
    return () => window.removeEventListener("resetLoadingProgress", handle);
  }, [setPercentNumber, setIsLoadingComplete]);

  // Track document ready (non-home, first load only)
  useEffect(() => {
    if (pathname === "/" || hasInitialLoadCompleted) return;
    const check = () => {
      if (document.readyState === "complete") {
        isDocumentReadyRef.current = true;
        setPercentNumber(100);
        setIsLoadingComplete(true);
      }
    };
    check();
    window.addEventListener("load", check);
    document.addEventListener("readystatechange", check);
    return () => {
      window.removeEventListener("load", check);
      document.removeEventListener("readystatechange", check);
    };
  }, [
    pathname,
    hasInitialLoadCompleted,
    setPercentNumber,
    setIsLoadingComplete,
  ]);

  // Loading progress
  useEffect(() => {
    if (hasInitialLoadCompleted) return;
    if (pathname === "/") {
      setPercentNumber(Math.round((loadedImageCount / TOTAL_FRAMES) * 100));
      if (loadedImageCount === TOTAL_FRAMES) setIsLoadingComplete(true);
    } else {
      if (isDocumentReadyRef.current) {
        setPercentNumber(100);
        setIsLoadingComplete(true);
      } else {
        const id = setInterval(() => {
          setPercentNumber((p) => (p >= 90 ? p : Math.min(p + 10, 90)));
        }, 100);
        return () => clearInterval(id);
      }
    }
  }, [
    pathname,
    loadedImageCount,
    hasInitialLoadCompleted,
    setPercentNumber,
    setIsLoadingComplete,
  ]);

  // Page-in: non-home
  useEffect(() => {
    if (!hasInitialLoadCompleted || animationTriggeredRef.current) return;
    if (pathname === "/") return;
    if (pageOutInProgressRef.current) {
      const id = setInterval(() => {
        if (!pageOutInProgressRef.current) {
          clearInterval(id);
          animationTriggeredRef.current = true;
          lenisRef.current?.scrollTo(0, { immediate: true }) ??
            window.scrollTo(0, 0);
          pageInWithoutLoadingAnimation(() => {
            ScrollTrigger.refresh();
            dispatchPageReady();
          });
        }
      }, 16);
      return () => clearInterval(id);
    }
    animationTriggeredRef.current = true;
    lenisRef.current?.scrollTo(0, { immediate: true }) ?? window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => {
      pageInWithoutLoadingAnimation(() => {
        ScrollTrigger.refresh();
        dispatchPageReady();
      });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Page-in: homepage (waits for canvas)
  useEffect(() => {
    if (!hasInitialLoadCompleted || animationTriggeredRef.current) return;
    if (pathname !== "/" || !isReady || pageOutInProgressRef.current) return;
    animationTriggeredRef.current = true;
    lenisRef.current?.scrollTo(0, { immediate: true }) ?? window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => {
      pageInWithoutLoadingAnimation(() => {
        ScrollTrigger.refresh();
        dispatchPageReady();
      });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // First load
  useEffect(() => {
    if (
      hasInitialLoadCompleted ||
      !isLoadingComplete ||
      animationTriggeredRef.current
    )
      return;
    if (pathname === "/" && !isReady) return;
    const id = setTimeout(() => {
      window.history.scrollRestoration = "manual";
      lenisRef.current?.scrollTo(0, { immediate: true }) ??
        window.scrollTo(0, 0);
      pageInLoadingAnimation(() => {
        setHasInitialLoadCompleted(true);
        ScrollTrigger.refresh();
        dispatchPageReady();
      });
      animationTriggeredRef.current = true;
    }, 800);
    return () => clearTimeout(id);
  }, [
    pathname,
    isReady,
    isLoadingComplete,
    hasInitialLoadCompleted,
    setHasInitialLoadCompleted,
  ]);

  useEffect(() => {
    console.log(
      "%c⚠️ I see you ⚠️",
      "font-size: 48px; color: red; font-weight: bold;",
    );
    console.log(
      "%c      ┍--------------------------------------------------┑",
      "font-weight: bold;",
    );
    console.log(
      "%c      |        What are you doing in here, Buddy?        |",
      "font-weight: bold;",
    );
    console.log(
      "%c      ┕--------------------------------------------------┙",
      "font-weight: bold;",
    );
    console.log(
      "%c             Peeking my code, huh?",
      "font-weight: bold; font-style: italic; font-size: 16px;",
    );
    console.log(
      "%c  Just contact me if you want the same one :D",
      "font-weight: bold; font-style: italic; font-size: 16px;",
    );
  }, []);

  return (
    <div>
      <div
        id="banner-1"
        className="fixed top-0 left-0 z-9999 min-h-screen w-1/4 bg-neutral-950"
      />
      <div
        id="banner-2"
        className="fixed top-0 left-1/4 z-9999 min-h-screen w-1/4 bg-neutral-950"
      />
      <div
        id="banner-3"
        className="fixed top-0 left-1/2 z-9999 min-h-screen w-1/4 bg-neutral-950"
      />
      <div
        id="banner-4"
        className="fixed top-0 left-3/4 z-9999 min-h-screen w-1/4 bg-neutral-950"
      />
      <div
        id="loading"
        className="fixed inset-0 z-9999 flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6"
        style={
          hasInitialLoadCompleted ? { display: "none", opacity: 0 } : undefined
        }
      >
        <div
          className="flex items-end overflow-hidden"
          style={{ height: "clamp(80px, 18vw, 180px)" }}
        >
          <SlotNumber value={animatedPercent} />
          <span
            className="text-background font-bold leading-none"
            style={{ fontSize: "clamp(40px, 9vw, 90px)", lineHeight: 1 }}
          >
            %
          </span>
        </div>
      </div>
      <main className="font-sans">
        <Navigation />
        {children}
        <FooterSection />
      </main>
    </div>
  );
}
