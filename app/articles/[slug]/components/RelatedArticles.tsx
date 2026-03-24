import TransitionLink from "@/components/TransitionLink";
import { NAVIGATION_PATHS } from "@/constants";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";

type RelatedArticle = {
  slug: string;
  title: string;
  thumbnail_url: string;
  created_at: string;
  author: string;
  summary?: string;
};

type Props = { articles: RelatedArticle[] };

export default function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null;

  return (
    <div className="mx-auto mt-20 max-w-3xl border-t border-foreground/10 pt-14">
      <p className="mb-8 text-[10px] font-semibold tracking-[0.25em] text-foreground/40 uppercase">
        Related articles
      </p>

      <div className="flex flex-col">
        {articles.map((article, idx) => (
          <TransitionLink
            key={article.slug}
            href={`${NAVIGATION_PATHS.articles.href}/${article.slug}`}
            className="text-left group border-t border-foreground/10 py-6 first:border-t-0"
          >
            <div className="flex gap-5 md:gap-8">
              {/* Thumbnail */}
              <div className="relative aspect-video w-28 shrink-0 overflow-hidden md:w-36">
                <Image
                  src={article.thumbnail_url}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 112px, 144px"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between gap-2 py-0.5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-foreground/30 tabular-nums">
                    <span>{String(idx + 1).padStart(2, "0")}</span>
                    <span>—</span>
                    <span>
                      {moment(article.created_at).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold leading-snug tracking-tight transition-colors duration-200 group-hover:text-foreground/70 md:text-base">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="line-clamp-2 text-xs text-foreground/40 leading-relaxed hidden md:block">
                      {article.summary}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-widest text-foreground/30 uppercase transition-colors duration-200 group-hover:text-foreground/60">
                  Read →
                </span>
              </div>
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
