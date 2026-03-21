"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns true once the page-in animation has completed.
 * Replaces the old useSmoothScrollStore — no Zustand, no ScrollSmoother coupling.
 * Template dispatches a 'pageready' CustomEvent when the banner animation finishes.
 */
export function usePageReady() {
  const [ready, setReady] = useState(false);
  const setRef = useRef(setReady);

  useEffect(() => {
    // Reset on every mount (new page navigation)
    setRef.current(false);
    const handle = () => setRef.current(true);
    window.addEventListener("pageready", handle, { once: true });
    return () => window.removeEventListener("pageready", handle);
  }, []);

  return ready;
}
