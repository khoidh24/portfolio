import { supabase } from "@/lib/supabaseClient";
import { Metadata } from "next";
import { Suspense } from "react";

import { ArticleData } from "./services/article.type";
import ArticlesClient from "./components/ArticlesClient";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Articles | Volunote - Zen Software Engineer",
  description:
    "Explore insightful articles about software development, web technologies, React, Next.js, and modern JavaScript.",
  authors: [{ name: "Volunote", url: "https://portfolio.veinz.blog" }],
  creator: "Volunote",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Articles | Volunote",
    description: "Explore insightful articles about software development.",
    url: "https://portfolio.veinz.blog/articles",
    siteName: "Volunote",
    images: [
      {
        url: "https://portfolio.veinz.blog/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  alternates: { canonical: "https://portfolio.veinz.blog/articles" },
};

export default async function BlogPage() {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "title, created_at, thumbnail_url, author, slug, summary, article_tags(tags(tag_name))",
    )
    .order("pin", { ascending: false })
    .order("created_at", { ascending: true });

  const isEmpty = !!error || !data || data.length === 0;

  const articles: ArticleData[] = isEmpty
    ? []
    : data.map((row) => ({
        title: row.title,
        created_at: row.created_at,
        thumbnail_url: row.thumbnail_url,
        author: row.author,
        slug: row.slug,
        summary: row.summary,
        tags: (
          row.article_tags as unknown as {
            tags: { tag_name: string } | null;
          }[]
        )
          ?.map((at) => at.tags?.tag_name)
          .filter((t): t is string => Boolean(t)),
      }));

  return (
    <div className="container mx-auto w-full px-4 pt-24 pb-24 md:px-10 md:pt-32 2xl:pt-40">
      <div className="mb-14 md:mb-20">
        <p className="text-foreground/40 mb-4 text-[10px] font-semibold tracking-[0.25em] uppercase md:text-xs">
          Writing
        </p>
        <h1 className="text-[clamp(32px,6vw,80px)] leading-[1.05] font-bold tracking-tight">
          A Space to Learn,
          <br />
          Share & Explore.
        </h1>
      </div>

      <Suspense>
        <ArticlesClient articles={articles} isEmpty={isEmpty} />
      </Suspense>
    </div>
  );
}
