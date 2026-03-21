import { supabase } from "@/lib/supabaseClient";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://portfolio.veinz.blog";

  const { data: articles } = await supabase
    .from("articles")
    .select("id, created_at, updated_at")
    .order("created_at", { ascending: false });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const articlesPages: MetadataRoute.Sitemap =
    articles?.map((post) => ({
      url: `${baseUrl}/articles/${post.id}`,
      lastModified: post.updated_at
        ? new Date(post.updated_at)
        : new Date(post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  return [...staticPages, ...articlesPages];
}
