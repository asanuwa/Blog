"use client";

import { memo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteBlog } from "@/hooks/useDeleteBlog";

type DeleteBlogButtonProps = {
  id: string;
  title: string;
  redirectTo?: string;
  size?: "sm" | "default";
};

function DeleteBlogButtonComponent({
  id,
  title,
  redirectTo,
  size = "sm",
}: DeleteBlogButtonProps) {
  const router = useRouter();
  const deleteBlog = useDeleteBlog();
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      await deleteBlog.mutateAsync(id);
      toast.success("Blog deleted successfully.");
      setOpen(false);

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete blog. Please try again.",
      );
    }
  }, [deleteBlog, id, redirectTo, router]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size={size}
          disabled={deleteBlog.isPending}
          aria-busy={deleteBlog.isPending}
          aria-label={`Delete ${title}`}
        >
          {deleteBlog.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 aria-hidden="true" />
          )}
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this blog post?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-medium">{title}</span>. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteBlog.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
            disabled={deleteBlog.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {deleteBlog.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              "Delete blog"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const DeleteBlogButton = memo(DeleteBlogButtonComponent);
