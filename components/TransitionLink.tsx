"use client";

import { ReactNode, useState } from "react";

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
        true,
      );
    }
  };

  return (
    <button
      className={cn("cursor-pointer text-xl", className)}
      onClick={handleClick}
      onMouseEnter={() => router.prefetch(href)}
      title={label}
      disabled={animating}
    >
      {children || label}
    </button>
  );
};

export default TransitionLink;
