"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { blogKeys } from "@/hooks/useBlogs";
import { blogService } from "@/services/blog.service";
import type { Blog, BlogListResponse, BlogResponse } from "@/types/blog.types";

type LikeBlogContext = {
  previousBlog?: BlogResponse;
  previousLists: Array<[QueryKey, BlogListResponse | undefined]>;
};

export function useLikeBlog(id: string) {
  const queryClient = useQueryClient();

  return useMutation<BlogResponse, Error, void, LikeBlogContext>({
    mutationFn: () => blogService.likeBlog(id),
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: blogKeys.detail(id) }),
        queryClient.cancelQueries({ queryKey: blogKeys.lists() }),
      ]);

      const previousBlog = queryClient.getQueryData<BlogResponse>(
        blogKeys.detail(id),
      );
      const previousLists = queryClient.getQueriesData<BlogListResponse>({
        queryKey: blogKeys.lists(),
      });

      updateBlogEverywhere(queryClient, id, (blog) => ({
        ...blog,
        likes: (blog.likes ?? 0) + 1,
      }));

      return { previousBlog, previousLists };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(blogKeys.detail(id), context?.previousBlog);
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (blog) => {
      const normalizedBlog = {
        ...blog,
        likes: blog.likes ?? 0,
        commentCount: blog.commentCount ?? 0,
      };

      queryClient.setQueryData(blogKeys.detail(blog.id), normalizedBlog);
      updateBlogEverywhere(queryClient, blog.id, () => normalizedBlog);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

function updateBlogEverywhere(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  updater: (blog: Blog) => Blog,
) {
  queryClient.setQueryData<BlogResponse>(blogKeys.detail(id), (current) =>
    current ? updater(current) : current,
  );

  queryClient
    .getQueriesData<BlogListResponse>({ queryKey: blogKeys.lists() })
    .forEach(([queryKey]) => {
      queryClient.setQueryData<BlogListResponse>(queryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.map((blog) =>
            blog.id === id ? updater(blog) : blog,
          ),
        };
      });
    });
}
