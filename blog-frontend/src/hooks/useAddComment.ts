"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogCommentKeys } from "@/hooks/useBlogComments";
import { blogKeys } from "@/hooks/useBlogs";
import { blogService } from "@/services/blog.service";
import type { AddCommentResponse, BlogListResponse } from "@/types/blog.types";

export function useAddComment(id: string) {
  const queryClient = useQueryClient();

  return useMutation<AddCommentResponse, Error, string>({
    mutationFn: (text) => blogService.addComment(id, text),
    onSuccess: ({ blog, comment }) => {
      queryClient.setQueryData(blogKeys.detail(blog.id), blog);
      queryClient.setQueryData(
        blogCommentKeys.list(blog.id),
        (current: AddCommentResponse["comment"][] | undefined) =>
          current ? [comment, ...current] : [comment],
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
              data: current.data.map((item) =>
                item.id === blog.id ? blog : item,
              ),
            };
          });
        });

      void queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: blogCommentKeys.list(blog.id),
      });
    },
  });
}
