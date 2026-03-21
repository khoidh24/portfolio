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
      onComplete: () => {
        loading.style.display = "none";
      },
    }).to(
      banners,
      {
        yPercent: 100,
        stagger: 0.05,
        onComplete: () => {
          onComplete?.();
        },
      },
      "+=0.5",
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
      stagger: 0.05,
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
      stagger: 0.05,
      overwrite: true,
    });

    if (skipLoadingPercent) {
      tl.call(
        () => {
          onComplete?.();
        },
        [],
        "+=0.3",
      );
    } else {
      tl.to(
        loading,
        {
          opacity: 1,
          onStart: () => {
            loading.style.display = "flex";
            window.dispatchEvent(new CustomEvent("resetLoadingProgress"));
          },
          onComplete: () => {
            onComplete?.();
          },
        },
        "+=0.5",
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
