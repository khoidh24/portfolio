import { NAVIGATION_PATHS } from "@/constants";
import moment from "moment";
import Image from "next/image";

import LinkAnimation from "@/components/LinkAnimation";

import { ArticleData } from "../services/article.type";

type Props = { data: ArticleData; index: number };

export default function BlogItem({ data, index }: Props) {
  return (
    <LinkAnimation
      href={`${NAVIGATION_PATHS.articles.href}/${data.slug}`}
      label={data.title}
      className="group block w-full text-left"
    >
      <div className="border-foreground/10 grid grid-cols-1 gap-6 border-t py-10 transition-colors duration-300 md:grid-cols-[380px_1fr] md:gap-12 md:py-14">
        <div className="relative aspect-16/10 w-full overflow-hidden">
          <Image
            src={data.thumbnail_url}
            alt={data.title}
            title={data.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 380px"
          />
        </div>

        <div className="flex flex-col justify-between gap-6 py-1">
          <div className="flex flex-col gap-4">
            <div className="text-foreground/40 flex items-center gap-2 text-xs">
              <span className="tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>—</span>
              <span className="tabular-nums">
                {moment(data.created_at).format("MMM DD, YYYY")}
              </span>
              {data.author && (
                <>
                  <span>·</span>
                  <span>{data.author}</span>
                </>
              )}
            </div>

            <h2 className="font-sans text-[clamp(20px,2.5vw,36px)] leading-[1.15] font-bold tracking-tight">
              {data.title}
            </h2>

            {data.summary && (
              <p className="text-foreground/50 line-clamp-3 font-sans text-sm leading-relaxed md:text-base">
                {data.summary}
              </p>
            )}

            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-foreground/15 text-foreground/40 border px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <span className="text-foreground/30 group-hover:text-foreground w-fit font-sans text-xs font-semibold tracking-widest uppercase transition-colors duration-200">
            Read article →
          </span>
        </div>
      </div>
    </LinkAnimation>
  );
}
