"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";
import { appConfig } from "@/config/app.config";
import { blogService } from "@/services/blog.service";
import type { BlogResponse, GetBlogsQuery } from "@/types/blog.types";

export const BLOG_REFRESH_INTERVAL_MS = 15_000;

const DEFAULT_BLOGS_QUERY: Required<
  Pick<GetBlogsQuery, "page" | "limit" | "sort">
> = {
  page: appConfig.blog.defaultPage,
  limit: appConfig.blog.pageSize,
  sort: appConfig.blog.defaultSort,
};

export type NormalizedBlogsQuery = {
  page: number;
  limit: number;
  search?: string;
  published?: boolean;
  sort: "newest" | "oldest";
};

export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (query: GetBlogsQuery = {}) =>
    [...blogKeys.lists(), normalizeBlogsQuery(query)] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,
};

export function normalizeBlogsQuery(
  query: GetBlogsQuery = {},
): NormalizedBlogsQuery {
  return {
    page: query.page ?? DEFAULT_BLOGS_QUERY.page,
    limit: query.limit ?? DEFAULT_BLOGS_QUERY.limit,
    search: query.search?.trim() || undefined,
    published: query.published,
    sort: query.sort ?? DEFAULT_BLOGS_QUERY.sort,
  };
}

export function isBlogListQueryKey(
  queryKey: QueryKey,
): queryKey is ReturnType<typeof blogKeys.list> {
  return queryKey[0] === "blogs" && queryKey[1] === "list";
}

export function getBlogsQueryFromKey(
  queryKey: QueryKey,
): NormalizedBlogsQuery | undefined {
  if (!isBlogListQueryKey(queryKey)) {
    return undefined;
  }

  return queryKey[2];
}

export function useBlogs(query: GetBlogsQuery = {}) {
  const normalizedQuery = normalizeBlogsQuery(query);

  return useQuery({
    queryKey: blogKeys.list(normalizedQuery),
    queryFn: ({ signal }) => blogService.getBlogs(normalizedQuery, { signal }),
    refetchInterval: BLOG_REFRESH_INTERVAL_MS,
  });
}

export function useBlog(id: string) {
  return useQuery<BlogResponse>({
    queryKey: blogKeys.detail(id),
    queryFn: ({ signal }) => blogService.getBlogById(id, { signal }),
    enabled: Boolean(id),
    refetchInterval: BLOG_REFRESH_INTERVAL_MS,
  });
}
