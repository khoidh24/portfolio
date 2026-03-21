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

// Dispatched once the page-in animation completes — sections listen for this
// instead of subscribing to a Zustand store.
export const dispatchPageReady = () =>
  window.dispatchEvent(new CustomEvent("pageready"));

type Props = { children: ReactNode };

const SlotDigit = memo(function SlotDigit({ digit }: { digit: number }) {
  const fontSize = "clamp(80px, 18vw, 180px)";
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: "clamp(48px, 11vw, 110px)",
        height: "clamp(80px, 18vw, 180px)",
      }}
    >
      <div
        className="flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <div
            key={d}
            className="text-background flex shrink-0 items-center justify-center leading-none font-bold"
            style={{
              fontSize,
              height: "clamp(80px, 18vw, 180px)",
              lineHeight: 1,
            }}
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

  const isReady = useLoadImageStore((state) => state.isReady);
  const loadedImageCount = useLoadImageStore((state) => state.loadedImageCount);

  const percentNumber = useLoadingProgressStore((state) => state.percentNumber);
  const setPercentNumber = useLoadingProgressStore(
    (state) => state.setPercentNumber,
  );
  const isLoadingComplete = useLoadingProgressStore(
    (state) => state.isLoadingComplete,
  );
  const setIsLoadingComplete = useLoadingProgressStore(
    (state) => state.setIsLoadingComplete,
  );
  const hasInitialLoadCompleted = useLoadingProgressStore(
    (state) => state.hasInitialLoadCompleted,
  );
  const setHasInitialLoadCompleted = useLoadingProgressStore(
    (state) => state.setHasInitialLoadCompleted,
  );

  const animationTriggeredRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const hasInitialLoadCompletedRef = useRef(hasInitialLoadCompleted);
  const isDocumentReadyRef = useRef(false); // ref — doesn't need to drive rendering
  const lenisRef = useRef<Lenis | null>(null);

  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Keep refs in sync
  useEffect(() => {
    hasInitialLoadCompletedRef.current = hasInitialLoadCompleted;
  }, [hasInitialLoadCompleted]);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Smooth percent counter
  useEffect(() => {
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
  }, [percentNumber]);

  // Lenis setup — runs once, never torn down on navigation
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
    // Expose for TableOfContents and other consumers
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

  // Browser back/forward interception
  useEffect(() => {
    const handle = (e: PopStateEvent) => {
      const current = pathnameRef.current;
      const target = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (target === current) return;
      e.stopImmediatePropagation();
      window.history.pushState(window.history.state, "", current);
      pageOutLoadingAnimation(
        target,
        router,
        undefined,
        useLoadingProgressStore.getState().hasInitialLoadCompleted,
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Reset progress event (from page-out animation)
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

  // Track document ready for non-home pages
  useEffect(() => {
    if (pathname === "/") return;
    const check = () => {
      if (document.readyState === "complete") isDocumentReadyRef.current = true;
    };
    check();
    window.addEventListener("load", check);
    document.addEventListener("readystatechange", check);
    return () => {
      window.removeEventListener("load", check);
      document.removeEventListener("readystatechange", check);
    };
  }, [pathname]);

  // Loading progress calculation
  useEffect(() => {
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
  }, [pathname, loadedImageCount, setPercentNumber, setIsLoadingComplete]);

  // Subsequent navigations — page-in without loading screen
  useEffect(() => {
    if (!hasInitialLoadCompleted || animationTriggeredRef.current) return;
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

  // First load — run after loading hits 100%
  useEffect(() => {
    if (
      hasInitialLoadCompleted ||
      !isLoadingComplete ||
      animationTriggeredRef.current
    )
      return;
    const shouldRun = (pathname === "/" && isReady) || pathname !== "/";
    if (!shouldRun) return;
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
    }, 1600);
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
      "font-size: 48px; color: red; font-weight: bold; text-shadow: 1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black;",
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
      >
        <div
          className="flex items-end overflow-hidden"
          style={{ height: "clamp(80px, 18vw, 180px)" }}
        >
          <SlotNumber value={animatedPercent} />
          <span
            className="text-background leading-none font-bold"
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
