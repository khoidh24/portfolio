import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://portfolio.veinz.blog";

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/private/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/", "/private/"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/api/", "/private/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
