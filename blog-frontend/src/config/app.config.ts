import type { BlogSortOrder } from "@/types/blog.types";

export const appConfig = {
  blog: {
    pageSize: 6,
    defaultPage: 1,
    defaultSort: "newest" satisfies BlogSortOrder,
    defaultPublishedFilter: "all",
  },
  api: {
    timeoutMs: 15_000,
  },
} as const;
