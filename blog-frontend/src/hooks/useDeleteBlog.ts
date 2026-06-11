"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { blogService } from "@/services/blog.service";
import { blogKeys } from "@/hooks/useBlogs";
import type {
  BlogListResponse,
  BlogResponse,
  DeleteBlogResponse,
} from "@/types/blog.types";

type DeleteBlogContext = {
  previousBlog?: BlogResponse;
  previousLists: Array<[QueryKey, BlogListResponse | undefined]>;
};

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation<DeleteBlogResponse, Error, string, DeleteBlogContext>({
    mutationFn: (id) => blogService.deleteBlog(id),
    onMutate: async (id) => {
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

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<BlogListResponse>(queryKey, (current) => {
          if (!current) {
            return current;
          }

          const nextTotal = Math.max(0, current.total - 1);

          return {
            ...current,
            data: current.data.filter((blog) => blog.id !== id),
            total: nextTotal,
            totalPages: Math.max(1, Math.ceil(nextTotal / current.limit)),
          };
        });
      });

      queryClient.removeQueries({ queryKey: blogKeys.detail(id) });

      return { previousBlog, previousLists };
    },
    onError: (_error, id, context) => {
      queryClient.setQueryData(blogKeys.detail(id), context?.previousBlog);

      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: (_data, _error, id) => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: blogKeys.detail(id) });
    },
  });
}
