import { supabase } from "@/lib/supabaseClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogItem from "./components/BlogItem";

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
    .select("title, created_at, thumbnail_url, author, slug, summary")
    .order("pin", { ascending: false })
    .order("created_at", { ascending: true });

  if (!data || error) notFound();

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

      <div className="flex flex-col">
        {data.map((post, idx) => (
          <BlogItem key={post.slug} data={post} index={idx} />
        ))}
        <div className="border-foreground/10 border-t" />
      </div>
    </div>
  );
}
