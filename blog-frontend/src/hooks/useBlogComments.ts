"use client";

import { useQuery } from "@tanstack/react-query";
import { BLOG_REFRESH_INTERVAL_MS } from "@/hooks/useBlogs";
import { blogService } from "@/services/blog.service";

export const blogCommentKeys = {
  all: ["blog-comments"] as const,
  list: (blogId: string) => [...blogCommentKeys.all, blogId] as const,
};

export function useBlogComments(blogId: string) {
  return useQuery({
    queryKey: blogCommentKeys.list(blogId),
    queryFn: () => blogService.getComments(blogId),
    enabled: Boolean(blogId),
    refetchInterval: BLOG_REFRESH_INTERVAL_MS,
  });
}
