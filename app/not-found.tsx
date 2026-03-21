import { NAVIGATION_PATHS } from "@/constants";
import Link from "next/link";

import TransitionLink from "@/components/TransitionLink";

export default function NotFound() {
  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center gap-10">
      <h1 className="text-6xl font-bold xl:text-9xl">Got Lost?</h1>
      <p className="text-center text-lg xl:text-xl">
        Maybe you followed a broken link <br />
        or mistyped the address :D
      </p>
      <Link href={NAVIGATION_PATHS.home.href}>
        <TransitionLink
          href={NAVIGATION_PATHS.home.href}
          label="Back to homepage"
          className="bg-foreground text-background rounded-2xl px-4 py-2"
        >
          Back to home
        </TransitionLink>
      </Link>
    </section>
  );
}
