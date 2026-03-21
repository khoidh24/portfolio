"use client";

import { ReactNode, useState } from "react";

import { useLoadingProgressStore } from "@/stores/useLoadingProgress";
import { cn } from "@/lib/utils";
import { pageOutLoadingAnimation } from "@/utils/animations";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  href: string;
  label?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
};

const TransitionLink = ({
  href,
  label,
  className,
  children,
  onClick,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [animating, setAnimating] = useState(false);
  const hasInitialLoadCompleted = useLoadingProgressStore(
    (state) => state.hasInitialLoadCompleted,
  );

  const handleClick = () => {
    if (pathname !== href) {
      setAnimating(true);
      pageOutLoadingAnimation(
        href,
        router,
        () => {
          onClick?.();
          setAnimating(false);
        },
        hasInitialLoadCompleted,
      );
    }
  };

  return (
    <button
      className={cn("cursor-pointer text-xl", className)}
      onClick={handleClick}
      title={label}
      disabled={animating}
    >
      {children || label}
    </button>
  );
};

export default TransitionLink;
