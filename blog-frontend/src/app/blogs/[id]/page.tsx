import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Edit3,
  FileText,
  UserRound,
} from "lucide-react";
import { PostEngagement } from "@/components/blogs/post-engagement";
import { PageTransition } from "@/components/common/page-transition";
import { env } from "@/config/env";
import { Button } from "@/components/ui/button";
import { calculateReadingTime } from "@/lib/reading-time";
import { ApiClientError } from "@/services/api";
import { blogService } from "@/services/blog.service";
import type { Blog } from "@/types/blog.types";

type BlogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const DeleteBlogButton = dynamic(() =>
  import("@/components/blogs/delete-blog-button").then(
    (mod) => mod.DeleteBlogButton,
  ),
);

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const blog = await blogService.getBlogById(id);
    const description = createDescription(blog.content);

    return {
      title: blog.title,
      description,
      alternates: {
        canonical: `/blogs/${blog.id}`,
      },
      openGraph: {
        title: blog.title,
        description,
        url: `/blogs/${blog.id}`,
        type: "article",
        authors: [blog.author],
        publishedTime: blog.createdAt,
        modifiedTime: blog.updatedAt,
        images: blog.coverImageUrl ? [{ url: blog.coverImageUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description,
      },
    };
  } catch {
    return {
      title: "Blog post not found",
      description: "The requested blog post could not be loaded.",
      alternates: {
        canonical: `/blogs/${id}`,
      },
    };
  }
}

export default async function BlogDetailsPage({ params }: BlogPageProps) {
  const { id } = await params;
  let blog: Blog;

  try {
    blog = await blogService.getBlogById(id);
  } catch (error) {
    return <BlogErrorState message={getErrorMessage(error)} />;
  }

  return <BlogArticle blog={blog} />;
}

function BlogArticle({ blog }: { blog: Blog }) {
  const readingTime =
    blog.readingTimeMinutes ?? calculateReadingTime(blog.content);

  return (
    <PageTransition>
      <article className="mx-auto grid max-w-4xl gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="ghost" className="-ml-2">
            <Link href="/blogs">
              <ArrowLeft aria-hidden="true" />
              Back to blogs
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/blogs/edit/${blog.id}`}>
                <Edit3 aria-hidden="true" />
                Edit post
              </Link>
            </Button>
            <DeleteBlogButton
              id={blog.id}
              title={blog.title}
              redirectTo="/blogs"
              size="default"
            />
          </div>
        </div>

        <header className="grid gap-5">
          <AuthorProfile blog={blog} />

          {blog.coverImageUrl ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
              <Image
                src={blog.coverImageUrl}
                alt=""
                fill
                unoptimized
                priority
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {blog.published ? "Published" : "Draft"}
            </span>
            <span className="text-sm text-muted-foreground">
              Updated {formatDate(blog.updatedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" aria-hidden="true" />
              {readingTime} min read
            </span>
          </div>

          <div className="grid gap-4">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
              {blog.title}
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              {createDescription(blog.content)}
            </p>
          </div>

          <div className="surface-soft grid gap-4 rounded-xl p-4 sm:grid-cols-3">
            <ArticleMeta
              icon={<UserRound className="size-4" aria-hidden="true" />}
              label="Author"
              value={blog.author}
            />
            <ArticleMeta
              icon={<CalendarDays className="size-4" aria-hidden="true" />}
              label="Created"
              value={formatDate(blog.createdAt)}
            />
            <ArticleMeta
              icon={<Clock className="size-4" aria-hidden="true" />}
              label="Reading time"
              value={`${readingTime} min`}
            />
          </div>
        </header>

        <div className="surface-soft rounded-xl p-5 sm:p-8">
          <div>
            {blog.content.split(/\n{2,}/).map((paragraph) => (
              <p
                key={paragraph}
                className="mb-5 text-base leading-8 text-foreground last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <PostEngagement
          blogId={blog.id}
          title={blog.title}
          url={`${env.siteUrl}/blogs/${blog.id}`}
          initialLikes={blog.likes ?? 0}
          initialCommentCount={blog.commentCount ?? 0}
        />
      </article>
    </PageTransition>
  );
}

function AuthorProfile({ blog }: { blog: Blog }) {
  const initials = blog.author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join("");

  return (
    <section className="surface-soft flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className="grid size-14 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 text-base font-semibold text-primary shadow-soft sm:size-16"
          aria-hidden="true"
        >
          {initials || <UserRound className="size-6" />}
        </div>
        <div className="grid gap-1">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Written by
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            {blog.author}
          </h2>
          <p className="text-sm text-muted-foreground">
            Author of this post and curator of the article notes below.
          </p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Published {formatDate(blog.createdAt)}
      </div>
    </section>
  );
}

function ArticleMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function BlogErrorState({ message }: { message: string }) {
  return (
    <PageTransition className="mx-auto grid max-w-2xl place-items-center py-16 text-center">
      <div className="surface-soft grid gap-4 rounded-xl p-8">
        <div
          className="mx-auto grid size-12 place-items-center rounded-lg bg-secondary text-secondary-foreground"
          aria-hidden="true"
        >
          <FileText className="size-6" aria-hidden="true" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Blog post unavailable
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/blogs">
              <ArrowLeft aria-hidden="true" />
              Back to blogs
            </Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The blog post could not be loaded. Please try again.";
}

function createDescription(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 155);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
