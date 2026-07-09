import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/studio", "/api/", "/preview/"],
      },
    ],
    sitemap: "https://coopbank.co.tz/sitemap.xml",
    host: "https://coopbank.co.tz",
  };
}
