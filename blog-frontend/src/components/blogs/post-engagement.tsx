"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Link2, MessageSquare, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddComment } from "@/hooks/useAddComment";
import { useBlogComments } from "@/hooks/useBlogComments";
import { useDeleteComment } from "@/hooks/useDeleteComment";
import { useLikeBlog } from "@/hooks/useLikeBlog";

type PostEngagementProps = {
  blogId: string;
  title: string;
  url: string;
  initialLikes: number;
  initialCommentCount: number;
};

export function PostEngagement({
  blogId,
  title,
  url,
  initialLikes,
  initialCommentCount,
}: PostEngagementProps) {
  const shouldReduceMotion = useReducedMotion();
  const likeBlog = useLikeBlog(blogId);
  const addComment = useAddComment(blogId);
  const deleteComment = useDeleteComment(blogId);
  const blogComments = useBlogComments(blogId);
  const [likes, setLikes] = useState(initialLikes);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [hasLiked, setHasLiked] = useState(() => hasUserLikedPost(blogId));
  const [comment, setComment] = useState("");
  const comments = blogComments.data ?? [];
  const displayedCommentCount = blogComments.data?.length ?? commentCount;

  const shareLinks = useMemo(
    () => [
      {
        label: "Share on X",
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      },
      {
        label: "Share on LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      },
    ],
    [title, url],
  );

  async function handleLike() {
    if (hasLiked || likeBlog.isPending) {
      return;
    }

    setLikes((current) => current + 1);
    setHasLiked(true);

    try {
      const blog = await likeBlog.mutateAsync();
      setLikes(blog.likes ?? likes + 1);
      rememberLikedPost(blogId);
      toast.success("Thanks for liking this post.");
    } catch (error) {
      setLikes((current) => Math.max(0, current - 1));
      setHasLiked(false);
      toast.error(
        error instanceof Error ? error.message : "Unable to like post.",
      );
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied.");
    } catch {
      toast.error("Unable to copy the post link.");
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = comment.trim();

    if (!message) {
      return;
    }

    setCommentCount((current) => current + 1);

    try {
      const { blog } = await addComment.mutateAsync(message);
      setCommentCount(blog.commentCount ?? commentCount + 1);
      setComment("");
      toast.success("Comment added.");
    } catch (error) {
      setCommentCount((current) => Math.max(0, current - 1));
      toast.error(
        error instanceof Error ? error.message : "Unable to add comment.",
      );
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const { blog } = await deleteComment.mutateAsync({ commentId });
      setCommentCount(blog.commentCount ?? Math.max(0, commentCount - 1));
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete comment.",
      );
    }
  }

  return (
    <motion.section
      className="grid gap-6"
      aria-labelledby="post-engagement-title"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="surface-elevated interactive-surface flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <h2 id="post-engagement-title" className="text-lg font-semibold">
            Join the conversation
          </h2>
          <p className="text-sm text-muted-foreground">
            Like, share, or leave a comment on this post.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={hasLiked ? "default" : "outline"}
            onClick={() => void handleLike()}
            disabled={hasLiked || likeBlog.isPending}
            aria-pressed={hasLiked}
            className="border-red-200 bg-red-50 text-red-600 transition-transform hover:bg-red-100 hover:text-red-700 active:scale-95 data-[state=open]:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
          >
            <Heart aria-hidden="true" />
            {hasLiked
              ? `${likes} ${likes === 1 ? "Like" : "Likes"}`
              : `${likes} Like`}
          </Button>
          {shareLinks.map((link) => (
            <Button key={link.label} asChild variant="outline">
              <a href={link.href} target="_blank" rel="noreferrer">
                <Share2 aria-hidden="true" />
                {link.label}
              </a>
            </Button>
          ))}
          <Button type="button" variant="outline" onClick={handleCopyLink}>
            <Link2 aria-hidden="true" />
            Copy link
          </Button>
        </div>
      </div>

      <section
        className="surface-elevated grid gap-5 rounded-2xl p-5"
        aria-labelledby="comments-title"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" aria-hidden="true" />
          <h2 id="comments-title" className="text-lg font-semibold">
            Comments ({displayedCommentCount})
          </h2>
        </div>

        <form className="grid gap-3" onSubmit={handleCommentSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Add a comment</span>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your thoughts..."
              aria-label="Comment"
              className="min-h-36"
            />
          </label>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!comment.trim() || addComment.isPending}
            >
              Post comment
            </Button>
          </div>
        </form>

        <div className="grid gap-3" aria-live="polite">
          {blogComments.isLoading ? (
            <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
              No comments yet. Start the discussion.
            </p>
          ) : (
            comments.map((item) => (
              <motion.article
                key={item.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="rounded-xl border border-border bg-background/70 p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">Guest reader</h3>
                    <time
                      dateTime={item.createdAt}
                      className="text-xs text-muted-foreground"
                    >
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(item.createdAt))}
                    </time>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleDeleteComment(item.id)}
                    disabled={deleteComment.isPending}
                    aria-label="Delete comment"
                    className="text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </motion.article>
            ))
          )}
        </div>
      </section>
    </motion.section>
  );
}

function likedStorageKey(blogId: string) {
  return `blog.liked.${blogId}`;
}

function hasUserLikedPost(blogId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(likedStorageKey(blogId)) === "true";
}

function rememberLikedPost(blogId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(likedStorageKey(blogId), "true");
}
