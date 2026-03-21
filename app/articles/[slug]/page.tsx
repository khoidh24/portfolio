import { supabase } from "@/lib/supabaseClient";
import { CalendarFoldIcon, User } from "lucide-react";
import moment from "moment";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import View from "./components/View";

export const revalidate = 604800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase
    .from("articles")
    .select("id, title, created_at, thumbnail_url, content, author, summary")
    .eq("slug", slug)
    .single();

  if (!data) {
    return {
      title: "Blog Not Found | Volunote - Zen Software Engineer",
      description: "A Space to Learn, Share and Explore",
    };
  }

  const suffix = " | Volunote — Zen Software Engineer";
  const maxTitleLength = 60 - suffix.length;
  const truncatedTitle =
    data.title.length > maxTitleLength
      ? data.title.substring(0, maxTitleLength).trim() + "..."
      : data.title;
  const pageTitle = `${truncatedTitle}${suffix}`;
  const pageUrl = `https://portfolio.veinz.blog/articles/${slug}`;

  return {
    title: pageTitle,
    description: data.summary,
    keywords: [
      "software",
      "frontend",
      "backend",
      "developer",
      "volunote",
      data.title,
    ],
    openGraph: {
      title: pageTitle,
      description: data.summary,
      url: pageUrl,
      siteName: "Volunote",
      images: [
        {
          url:
            data.thumbnail_url || "https://portfolio.veinz.blog/og-image.jpg",
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
      locale: "vi_VN",
      type: "article",
      publishedTime: data.created_at,
      authors: [data.author],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: data.summary,
      images: [
        data.thumbnail_url || "https://portfolio.veinz.blog/og-image.jpg",
      ],
    },
  };
}

export async function generateStaticParams() {
  const { data } = await supabase.from("articles").select("slug");
  return (data ?? []).filter((x) => x.slug).map((x) => ({ slug: x.slug }));
}

function extractHeadings(markdown: string) {
  const lines = markdown.split("\n");
  const headings: { text: string; level: number; id: string }[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ text, level, id });
    }
  }

  return headings;
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, created_at, thumbnail_url, content, author")
    .eq("slug", slug)
    .single();

  if (!data || error) notFound();

  const headings = data.content ? extractHeadings(data.content) : [];

  return (
    <>
      <div className="mx-auto w-full xl:px-[84px]">
        <Image
          src={data.thumbnail_url}
          alt={data.title}
          title={data.title}
          width={1920}
          height={1080}
          priority
          className="h-[200px] object-cover object-center md:h-[300px] xl:h-[380px] xl:rounded-b-3xl"
        />
      </div>

      <section className="relative mx-auto w-full max-w-[1400px] px-4 pt-12 pb-24 md:px-10 xl:pt-16 xl:pb-32">
        {/* Article header */}
        <div className="mx-auto mb-10 max-w-3xl xl:mb-14">
          <h1 className="mb-6 text-[clamp(24px,4vw,52px)] leading-[1.1] font-bold tracking-tight">
            {data.title}
          </h1>
          <div className="text-foreground/40 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {data.author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarFoldIcon size={14} />
              {moment(data.created_at).format("MMM DD, YYYY")}
              <span className="opacity-60">
                · {moment(data.created_at).fromNow()}
              </span>
            </span>
          </div>
          <div className="bg-foreground/10 mt-8 h-px w-full" />
        </div>

        {/* Body */}
        <div className="markdown-wrapper mx-auto max-w-3xl">
          <View doc={data.content} titleForSEO={data.title} />
        </div>

        <div id="article-end" />
      </section>
    </>
  );
}
