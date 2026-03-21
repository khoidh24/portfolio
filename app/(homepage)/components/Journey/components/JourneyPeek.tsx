import { forwardRef } from "react";

export const PEEK_W = 200;
export const PEEK_H = 120;

type Props = {
  imgRefs: React.RefObject<HTMLImageElement | null>[];
  srcs: string[];
};

const imgStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: 12,
};

const JourneyPeek = forwardRef<HTMLDivElement, Props>(
  ({ imgRefs, srcs }, ref) => (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-9998 hidden overflow-hidden rounded-lg"
      style={{
        width: PEEK_W,
        height: PEEK_H,
        willChange: "transform",
        background: "var(--background)",
        border: "1px solid rgba(36,25,16,0.1)",
        boxShadow: "0 2px 12px rgba(36,25,16,0.07)",
      }}
    >
      {srcs.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          ref={imgRefs[i]}
          src={src}
          alt=""
          style={{ ...imgStyle, transform: "translateY(100%)" }}
        />
      ))}
    </div>
  ),
);

JourneyPeek.displayName = "JourneyPeek";

export default JourneyPeek;
