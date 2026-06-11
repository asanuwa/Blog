"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Edit3, Eye, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateReadingTime } from "@/lib/reading-time";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/blog.types";

type BlogCardProps = {
  blog: Blog;
};

const DeleteBlogButton = dynamic(() =>
  import("@/components/blogs/delete-blog-button").then(
    (mod) => mod.DeleteBlogButton,
  ),
);

function BlogCardComponent({ blog }: BlogCardProps) {
  const titleId = `blog-title-${blog.id}`;
  const shouldReduceMotion = useReducedMotion();
  const readingTime =
    blog.readingTimeMinutes ?? calculateReadingTime(blog.content);

  const likes = blog.likes ?? 0;
  const commentCount = blog.commentCount ?? 0;

  return (
    <motion.article
      aria-labelledby={titleId}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="surface-elevated interactive-surface group grid min-h-72 content-between overflow-hidden rounded-2xl"
    >
      {blog.coverImageUrl ? (
        <div className="relative aspect-video overflow-hidden bg-secondary">
          <Image
            src={blog.coverImageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div
          className="grid aspect-video place-items-center bg-secondary text-sm font-medium text-secondary-foreground"
          aria-hidden="true"
        >
          Blog post
        </div>
      )}

      <div className="grid gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium shadow-xs",
              blog.published
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {blog.published ? "Published" : "Draft"}
          </span>
          <time
            dateTime={blog.createdAt}
            className="text-xs text-muted-foreground"
          >
            {formatDate(blog.createdAt)}
          </time>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/70 px-2.5 py-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {readingTime} min read
        </div>

        <div className="grid gap-2">
          <h2
            id={titleId}
            className="line-clamp-2 text-lg font-semibold tracking-normal text-foreground transition-colors group-hover:text-primary"
          >
            {blog.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {blog.content}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/80 bg-secondary/20 p-5 pt-4">
        <p className="min-w-0 truncate text-sm text-muted-foreground">
          By <span className="font-medium text-foreground">{blog.author}</span>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex h-9 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
              aria-label={`${likes} likes`}
            >
              <Heart className="size-3.5" aria-hidden="true" />
              {likes}
            </span>
            <span className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background/70 px-3 text-sm text-muted-foreground">
              <MessageSquare className="size-3.5" aria-hidden="true" />
              {commentCount}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/blogs/${blog.id}`}
                aria-label={`View ${blog.title}`}
              >
                <Eye aria-hidden="true" />
                View
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/blogs/edit/${blog.id}`}
                aria-label={`Edit ${blog.title}`}
              >
                <Edit3 aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <DeleteBlogButton id={blog.id} title={blog.title} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export const BlogCard = memo(BlogCardComponent);

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
