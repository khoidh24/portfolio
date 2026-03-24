import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const getBanners = () =>
  [
    document.getElementById("banner-1"),
    document.getElementById("banner-2"),
    document.getElementById("banner-3"),
    document.getElementById("banner-4"),
  ].filter(Boolean);

// Page-in with loading screen (first load only)
export const pageInLoadingAnimation = (onComplete?: () => void) => {
  const banners = getBanners();
  const loading = document.getElementById("loading");
  if (banners.length !== 4 || !loading) return;

  gsap.killTweensOf([...banners, loading]);

  const tl = gsap.timeline();
  tl.set(banners, { yPercent: 0 })
    .to(loading, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        loading.style.display = "none";
      },
    })
    .to(
      banners,
      {
        yPercent: 100,
        stagger: 0.04,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete,
      },
      "+=0.1",
    );
};

// Page-in without loading screen (subsequent navigations)
export const pageInWithoutLoadingAnimation = (onComplete?: () => void) => {
  const banners = getBanners();
  const loading = document.getElementById("loading");
  if (banners.length !== 4) return;

  if (loading) {
    loading.style.display = "none";
    loading.style.opacity = "0";
  }

  gsap.killTweensOf(banners);
  gsap.timeline().set(banners, { yPercent: 0 }).to(banners, {
    yPercent: 100,
    stagger: 0.04,
    duration: 0.5,
    ease: "power3.inOut",
    onComplete,
  });
};

// Page-out overlay animation
const runPageOutOverlay = (onComplete?: () => void, skipLoading?: boolean) => {
  const banners = getBanners();
  const loading = document.getElementById("loading");
  if (banners.length !== 4 || !loading) return;

  gsap.killTweensOf([...banners, loading]);

  const tl = gsap.timeline();
  tl.set(banners, { yPercent: -100 }).to(banners, {
    yPercent: 0,
    stagger: 0.04,
    duration: 0.45,
    ease: "power3.inOut",
  });

  if (skipLoading) {
    loading.style.display = "none";
    loading.style.opacity = "0";
    tl.call(() => onComplete?.(), [], "+=0.05");
  } else {
    tl.to(
      loading,
      {
        opacity: 1,
        duration: 0.2,
        onStart: () => {
          loading.style.display = "flex";
          window.dispatchEvent(new CustomEvent("resetLoadingProgress"));
        },
        onComplete,
      },
      "+=0.1",
    );
  }
};

// Page-out with navigation
export const pageOutLoadingAnimation = (
  href: string,
  router: AppRouterInstance,
  onComplete?: () => void,
  skipLoading?: boolean,
) => {
  runPageOutOverlay(() => {
    ScrollTrigger.getAll().forEach((st) => st.kill(true));
    router.push(href);
    onComplete?.();
    if (skipLoading) {
      window.dispatchEvent(new CustomEvent("pageOutComplete"));
    }
  }, skipLoading);
};
