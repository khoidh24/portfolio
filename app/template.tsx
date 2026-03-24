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
  const lenisRef = useRef<Lenis | null>(null);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Lenis — desktop only
  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const lenis = new Lenis({
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 2.5),
      smoothWheel: true,
      wheelMultiplier: 1.2,
    });
    lenisRef.current = lenis;
    (window as any).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);

  // Smooth percent counter
  useEffect(() => {
    if (hasInitialLoadCompleted) return;
    const tween = gsap.to(
      { value: animatedPercent },
      {
        value: percentNumber,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: function () {
          setAnimatedPercent(Math.round(this.targets()[0].value));
        },
      },
    );
    return () => {
      tween.kill();
    };
  }, [percentNumber, hasInitialLoadCompleted, animatedPercent]);

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
    let isAnimating = false;
    const handle = (e: PopStateEvent) => {
      const target = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (target === pathname || isAnimating) return;
      e.stopImmediatePropagation();
      window.history.pushState(window.history.state, "", pathname);
      isAnimating = true;
      pageOutInProgressRef.current = true;
      pageOutLoadingAnimation(
        target,
        router,
        () => {
          isAnimating = false;
          pageOutInProgressRef.current = false;
        },
        true,
      );
    };
    window.addEventListener("popstate", handle, { capture: true });
    return () =>
      window.removeEventListener("popstate", handle, { capture: true });
  }, [router, pathname]);

  // Reset on route change
  useEffect(() => {
    animationTriggeredRef.current = false;
    if (!hasInitialLoadCompleted) {
      setPercentNumber(0);
      setIsLoadingComplete(false);
      setAnimatedPercent(0);
    }
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
      const checkReady = () => {
        if (document.readyState === "complete") {
          setPercentNumber(100);
          setIsLoadingComplete(true);
        }
      };
      checkReady();
      window.addEventListener("load", checkReady);
      document.addEventListener("readystatechange", checkReady);

      const interval = setInterval(() => {
        setPercentNumber((p) => (p >= 90 ? p : Math.min(p + 10, 90)));
      }, 100);

      return () => {
        clearInterval(interval);
        window.removeEventListener("load", checkReady);
        document.removeEventListener("readystatechange", checkReady);
      };
    }
  }, [
    pathname,
    loadedImageCount,
    hasInitialLoadCompleted,
    setPercentNumber,
    setIsLoadingComplete,
  ]);

  // Page-in animations (subsequent navigations only, not first load)
  useEffect(() => {
    if (!hasInitialLoadCompleted || animationTriggeredRef.current) return;

    const scrollToTop = () => {
      lenisRef.current?.scrollTo(0, { immediate: true }) ??
        window.scrollTo(0, 0);
    };

    // Non-home page-in
    if (pathname !== "/") {
      if (pageOutInProgressRef.current) {
        const interval = setInterval(() => {
          if (!pageOutInProgressRef.current) {
            clearInterval(interval);
            animationTriggeredRef.current = true;
            scrollToTop();
            pageInWithoutLoadingAnimation(() => {
              ScrollTrigger.refresh();
              dispatchPageReady();
            });
          }
        }, 16);
        return () => clearInterval(interval);
      }
      animationTriggeredRef.current = true;
      scrollToTop();
      requestAnimationFrame(() => {
        pageInWithoutLoadingAnimation(() => {
          ScrollTrigger.refresh();
          dispatchPageReady();
        });
      });
      return;
    }

    // Homepage page-in (wait for canvas ready)
    if (isReady && !pageOutInProgressRef.current) {
      animationTriggeredRef.current = true;
      scrollToTop();
      requestAnimationFrame(() => {
        pageInWithoutLoadingAnimation(() => {
          ScrollTrigger.refresh();
          dispatchPageReady();
        });
      });
    }
  }, [pathname, isReady]);

  // First load animation
  useEffect(() => {
    if (
      hasInitialLoadCompleted ||
      !isLoadingComplete ||
      animationTriggeredRef.current
    )
      return;
    if (pathname === "/" && !isReady) return;

    const timeout = setTimeout(() => {
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

    return () => clearTimeout(timeout);
  }, [
    pathname,
    isReady,
    isLoadingComplete,
    hasInitialLoadCompleted,
    setHasInitialLoadCompleted,
  ]);

  // Console easter egg
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
