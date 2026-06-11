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
  UpdateBlogPayload,
} from "@/types/blog.types";

type UpdateBlogVariables = {
  id: string;
  payload: UpdateBlogPayload;
};

type UpdateBlogContext = {
  previousBlog?: BlogResponse;
  previousLists: Array<[QueryKey, BlogListResponse | undefined]>;
};

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation<
    BlogResponse,
    Error,
    UpdateBlogVariables,
    UpdateBlogContext
  >({
    mutationFn: ({ id, payload }) => blogService.updateBlog(id, payload),
    onMutate: async ({ id, payload }) => {
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

      const updatedAt = new Date().toISOString();

      queryClient.setQueryData<BlogResponse>(blogKeys.detail(id), (current) =>
        current ? { ...current, ...payload, updatedAt } : current,
      );

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<BlogListResponse>(queryKey, (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            data: current.data.map((blog) =>
              blog.id === id ? { ...blog, ...payload, updatedAt } : blog,
            ),
          };
        });
      });

      return { previousBlog, previousLists };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        blogKeys.detail(variables.id),
        context?.previousBlog,
      );

      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (updatedBlog) => {
      queryClient.setQueryData(blogKeys.detail(updatedBlog.id), updatedBlog);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: blogKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}
