import type { MetadataRoute } from "next";
import { POSTS } from "@/content/blog";
import { PROGRAMS } from "@/content/programs";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = [
    ["", 1, "weekly"],
    ["/programs", 0.9, "monthly"],
    ["/membership", 0.9, "weekly"],
    ["/contact", 0.9, "monthly"],
    ["/training", 0.8, "monthly"],
    ["/nutrition", 0.8, "monthly"],
    ["/trainers", 0.7, "monthly"],
    ["/schedule", 0.7, "weekly"],
    ["/gallery", 0.6, "monthly"],
    ["/blog", 0.6, "weekly"],
    ["/privacy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
  ] as const;

  return [
    ...staticPages.map(([path, priority, changeFrequency]) => ({
      url: `${SITE.url}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...PROGRAMS.map((p) => ({
      url: `${SITE.url}/programs/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...POSTS.map((p) => ({
      url: `${SITE.url}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
