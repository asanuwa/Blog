"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileText } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BlogCard } from "@/components/blogs/blog-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { appConfig } from "@/config/app.config";
import { Button } from "@/components/ui/button";
import { useBlogs } from "@/hooks/useBlogs";
import { cn } from "@/lib/utils";
import {
  useBlogStore,
  type BlogFilters,
  type PublishedFilter,
} from "@/store/blog.store";

export function BlogsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useBlogStore((state) => state.filters);
  const setFilters = useBlogStore((state) => state.setFilters);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setFilters(parseBlogQuery(searchParams));
  }, [searchParams, setFilters]);

  const blogsQuery = useMemo(
    () => ({
      page: filters.page,
      limit: appConfig.blog.pageSize,
      search: filters.search || undefined,
      published:
        filters.published === "all"
          ? undefined
          : filters.published === "published",
      sort: filters.sort,
    }),
    [filters],
  );

  const { data, error, isError, isFetching, isLoading } = useBlogs(blogsQuery);
  const blogs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const hasBlogs = blogs.length > 0;

  function updateQuery(nextQuery: Partial<BlogFilters>) {
    const mergedQuery = {
      ...filters,
      ...nextQuery,
      page: nextQuery.page ?? 1,
    };

    setFilters(mergedQuery);
    router.replace(`${pathname}?${buildBlogSearchParams(mergedQuery)}`, {
      scroll: false,
    });
  }

  return (
    <div className="grid gap-8">
      <section className="surface-elevated grid gap-4 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-2">
            <p className="text-sm font-medium text-primary">Blog library</p>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              Explore posts
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Search the archive, scan publication status, and sort by the
              newest or oldest entries.
            </p>
          </div>

          <div
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground"
            aria-live="polite"
          >
            {data ? `${data.total} total posts` : "Loading posts"}
          </div>
        </div>
      </section>

      <section
        aria-label="Blog filters"
        className="surface-elevated interactive-surface grid gap-4 rounded-2xl p-4 sm:p-5"
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <SearchBar
            value={filters.search}
            onChange={(search) => updateQuery({ search })}
            placeholder="Search by title or author"
          />

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Status</span>
            <select
              aria-label="Filter by publication status"
              value={filters.published}
              onChange={(event) =>
                updateQuery({
                  published: event.target.value as PublishedFilter,
                })
              }
              className="h-10 min-w-36 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="all">All posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Sort</span>
            <select
              aria-label="Sort blog posts"
              value={filters.sort}
              onChange={(event) =>
                updateQuery({
                  sort: event.target.value as BlogFilters["sort"],
                })
              }
              className="h-10 min-w-36 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {isError ? (
          <motion.div
            key="blogs-error"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <ErrorState
              title="Unable to load blogs"
              message={
                error instanceof Error
                  ? error.message
                  : "Something went wrong while loading posts."
              }
            />
          </motion.div>
        ) : null}

        {isLoading ? <BlogSkeletonGrid key="blogs-loading" /> : null}

        {!isLoading && !isError && !hasBlogs ? (
          <motion.div
            key="blogs-empty"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <EmptyState
              title="No blog posts yet"
              description="No blog posts yet. Create your first blog post"
              icon={<FileText className="size-6" aria-hidden="true" />}
              action={
                <Button asChild>
                  <Link href="/blogs/create">Create your first blog post</Link>
                </Button>
              }
            />
          </motion.div>
        ) : null}

        {!isLoading && !isError && hasBlogs ? (
          <motion.div key="blogs-results" className="grid gap-8">
            <motion.div
              aria-busy={isFetching}
              className={cn(
                "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
                isFetching && "opacity-70",
              )}
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: shouldReduceMotion ? 0 : 0.06,
                  },
                },
              }}
            >
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </motion.div>

            <Pagination
              page={filters.page}
              totalPages={totalPages}
              isLoading={isFetching}
              onPageChange={(page) => updateQuery({ page })}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function parseBlogQuery(searchParams: URLSearchParams): BlogFilters {
  const page = Number(searchParams.get("page"));
  const published = searchParams.get("published");
  const sort = searchParams.get("sort");

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: searchParams.get("search") ?? "",
    published:
      published === "true"
        ? "published"
        : published === "false"
          ? "draft"
          : "all",
    sort: sort === "oldest" ? "oldest" : "newest",
  };
}

function buildBlogSearchParams(query: BlogFilters) {
  const params = new URLSearchParams();

  params.set("page", String(query.page));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.published === "published") {
    params.set("published", "true");
  }

  if (query.published === "draft") {
    params.set("published", "false");
  }

  params.set("sort", query.sort);

  return params.toString();
}

export function BlogSkeletonGrid() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Loading blog posts"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: appConfig.blog.pageSize }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="surface-soft grid min-h-56 gap-5 rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="grid gap-3">
            <div className="h-6 w-4/5 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="mt-auto h-px bg-border" />
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading blog posts</span>
    </motion.div>
  );
}
