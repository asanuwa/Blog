"use client";

import { useQuery } from "@tanstack/react-query";
import { BLOG_REFRESH_INTERVAL_MS } from "@/hooks/useBlogs";
import { blogService } from "@/services/blog.service";

export const blogStatsKey = ["blogs", "stats"] as const;

export function useBlogStats() {
  return useQuery({
    queryKey: blogStatsKey,
    queryFn: () => blogService.getBlogStats(),
    placeholderData: {
      totalPosts: 24,
      draftPosts: 5,
      publishedPosts: 19,
    },
    refetchInterval: BLOG_REFRESH_INTERVAL_MS,
  });
}
