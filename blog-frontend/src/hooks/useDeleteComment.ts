"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogCommentKeys } from "@/hooks/useBlogComments";
import { blogKeys } from "@/hooks/useBlogs";
import { blogService } from "@/services/blog.service";
import type {
  BlogComment,
  BlogListResponse,
  DeleteCommentResponse,
} from "@/types/blog.types";

type DeleteCommentVariables = {
  commentId: string;
};

export function useDeleteComment(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation<DeleteCommentResponse, Error, DeleteCommentVariables>({
    mutationFn: ({ commentId }) => blogService.deleteComment(blogId, commentId),
    onSuccess: ({ blog }, { commentId }) => {
      queryClient.setQueryData(blogKeys.detail(blog.id), blog);
      queryClient.setQueryData<BlogComment[]>(
        blogCommentKeys.list(blog.id),
        (current) =>
          current?.filter((comment) => comment.id !== commentId) ?? current,
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

      void queryClient.invalidateQueries({
        queryKey: blogCommentKeys.list(blog.id),
      });
      void queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}
