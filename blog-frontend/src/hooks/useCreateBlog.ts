"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { blogService } from "@/services/blog.service";
import { calculateReadingTime } from "@/lib/reading-time";
import {
  blogKeys,
  getBlogsQueryFromKey,
  type NormalizedBlogsQuery,
} from "@/hooks/useBlogs";
import type {
  Blog,
  BlogListResponse,
  BlogResponse,
  CreateBlogPayload,
} from "@/types/blog.types";

type CreateBlogContext = {
  previousLists: Array<[QueryKey, BlogListResponse | undefined]>;
};

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shouldIncludeOptimisticBlog(
  blog: Blog,
  query: NormalizedBlogsQuery | undefined,
) {
  if (!query) {
    return true;
  }

  if (query.published !== undefined && blog.published !== query.published) {
    return false;
  }

  if (!query.search) {
    return true;
  }

  const search = query.search.toLowerCase();

  return (
    blog.title.toLowerCase().includes(search) ||
    blog.author.toLowerCase().includes(search)
  );
}

function createOptimisticBlog(payload: CreateBlogPayload): Blog {
  const now = new Date().toISOString();

  return {
    id: `optimistic-${crypto.randomUUID()}`,
    title: payload.title,
    content: payload.content,
    author: payload.author,
    slug: createSlug(payload.title),
    coverImageUrl: payload.coverImageUrl,
    readingTimeMinutes:
      payload.readingTimeMinutes ?? calculateReadingTime(payload.content),
    likes: 0,
    commentCount: 0,
    published: payload.published ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation<BlogResponse, Error, CreateBlogPayload, CreateBlogContext>(
    {
      mutationFn: (payload) => blogService.createBlog(payload),
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: blogKeys.lists() });

        const previousLists = queryClient.getQueriesData<BlogListResponse>({
          queryKey: blogKeys.lists(),
        });
        const optimisticBlog = createOptimisticBlog(payload);

        previousLists.forEach(([queryKey]) => {
          const query = getBlogsQueryFromKey(queryKey);

          if (!shouldIncludeOptimisticBlog(optimisticBlog, query)) {
            return;
          }

          queryClient.setQueryData<BlogListResponse>(queryKey, (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              data: [optimisticBlog, ...current.data].slice(0, current.limit),
              total: current.total + 1,
              totalPages: Math.max(
                1,
                Math.ceil((current.total + 1) / current.limit),
              ),
            };
          });
        });

        return { previousLists };
      },
      onError: (_error, _payload, context) => {
        context?.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      },
      onSuccess: (createdBlog) => {
        queryClient.setQueryData(blogKeys.detail(createdBlog.id), createdBlog);
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      },
    },
  );
}
