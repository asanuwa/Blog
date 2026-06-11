import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { blogService } from "@/services/blog.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${env.siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${env.siteUrl}/blogs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${env.siteUrl}/blogs/create`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const blogs = await blogService.getBlogs({
      page: 1,
      limit: 100,
      published: true,
      sort: "newest",
    });

    return [
      ...routes,
      ...blogs.data.map((blog) => ({
        url: `${env.siteUrl}/blogs/${blog.id}`,
        lastModified: new Date(blog.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return routes;
  }
}
