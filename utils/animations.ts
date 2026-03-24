import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

//*: Animation when entering page (first load — with loading %)
export const pageInLoadingAnimation = (onComplete?: () => void) => {
  const banners = [
    document.getElementById("banner-1"),
    document.getElementById("banner-2"),
    document.getElementById("banner-3"),
    document.getElementById("banner-4"),
  ].filter(Boolean);

  const loading = document.getElementById("loading");

  if (banners.length === 4 && loading) {
    gsap.killTweensOf(banners);
    gsap.killTweensOf(loading);

    const tl = gsap.timeline();

    tl.set(banners, { yPercent: 0 });

    tl.to(loading, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        loading.style.display = "none";
      },
    }).to(
      banners,
      {
        yPercent: 100,
        stagger: 0.04,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          onComplete?.();
        },
      },
      "+=0.1",
    );
  }
};

//*: Animation page in without loading % (subsequent navigations)
export const pageInWithoutLoadingAnimation = (onComplete?: () => void) => {
  const banners = [
    document.getElementById("banner-1"),
    document.getElementById("banner-2"),
    document.getElementById("banner-3"),
    document.getElementById("banner-4"),
  ].filter(Boolean);

  const loading = document.getElementById("loading");

  if (banners.length === 4) {
    if (loading) {
      loading.style.display = "none";
      loading.style.opacity = "0";
    }

    gsap.killTweensOf(banners);

    const tl = gsap.timeline();
    tl.set(banners, { yPercent: 0 });
    tl.to(banners, {
      yPercent: 100,
      stagger: 0.04,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        onComplete?.();
      },
    });
  }
};

//*: Animation when leaving page
export const runPageOutLoadingOverlayAnimation = (
  onComplete?: () => void,
  skipLoadingPercent?: boolean,
) => {
  const banners = [
    document.getElementById("banner-1"),
    document.getElementById("banner-2"),
    document.getElementById("banner-3"),
    document.getElementById("banner-4"),
  ].filter(Boolean);

  const loading = document.getElementById("loading");

  if (banners.length === 4 && loading) {
    gsap.killTweensOf(banners);
    gsap.killTweensOf(loading);

    const tl = gsap.timeline();

    tl.set(banners, { yPercent: -100 });

    tl.to(banners, {
      yPercent: 0,
      stagger: 0.04,
      duration: 0.45,
      ease: "power3.inOut",
      overwrite: true,
    });

    if (skipLoadingPercent) {
      // Subsequent nav: no loading %, navigate right after banners cover screen
      // Hide loading overlay immediately so it doesn't flash on the new page
      if (loading) {
        loading.style.display = "none";
        loading.style.opacity = "0";
      }
      tl.call(() => onComplete?.(), [], "+=0.05");
    } else {
      // First load: show loading % overlay, then navigate
      tl.to(
        loading,
        {
          opacity: 1,
          duration: 0.2,
          onStart: () => {
            loading.style.display = "flex";
            window.dispatchEvent(new CustomEvent("resetLoadingProgress"));
          },
          onComplete: () => {
            onComplete?.();
          },
        },
        "+=0.1",
      );
    }
  }
};

export const pageOutLoadingAnimation = (
  href: string,
  router: AppRouterInstance,
  onComplete?: () => void,
  skipLoadingPercent?: boolean,
) => {
  runPageOutLoadingOverlayAnimation(() => {
    // Kill only ScrollTrigger instances, NOT gsap.globalTimeline
    // (clearing globalTimeline kills the Lenis ticker and breaks smooth scroll)
    ScrollTrigger.getAll().forEach((st) => st.kill(true));
    router.push(href);
    onComplete?.();
    if (skipLoadingPercent) {
      window.dispatchEvent(new CustomEvent("pageOutComplete"));
    }
  }, skipLoadingPercent);
};
