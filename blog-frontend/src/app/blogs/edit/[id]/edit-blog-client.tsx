"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { BlogForm } from "@/components/forms/blog-form";
import { PageTransition } from "@/components/common/page-transition";
import { Button } from "@/components/ui/button";
import { useBlog } from "@/hooks/useBlogs";
import { useUpdateBlog } from "@/hooks/useUpdateBlog";
import type { CreateBlogInput } from "@/lib/validators";

type EditBlogClientProps = {
  id: string;
};

export function EditBlogClient({ id }: EditBlogClientProps) {
  const router = useRouter();
  const blogQuery = useBlog(id);
  const updateBlog = useUpdateBlog();

  async function handleSubmit(values: CreateBlogInput) {
    await updateBlog.mutateAsync({
      id,
      payload: values,
    });

    router.push(`/blogs/${id}`);
  }

  if (blogQuery.isLoading) {
    return <EditBlogLoading />;
  }

  if (blogQuery.isError || !blogQuery.data) {
    return (
      <EditBlogError
        message={
          blogQuery.error instanceof Error
            ? blogQuery.error.message
            : "Unable to load this blog post."
        }
      />
    );
  }

  const blog = blogQuery.data;

  return (
    <PageTransition className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button asChild variant="ghost" className="-ml-2">
          <Link href={`/blogs/${id}`}>
            <ArrowLeft />
            Back to blog
          </Link>
        </Button>
      </div>

      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Edit post</p>
        <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
          Update blog
        </h1>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Make changes to the title, content, author, or publication status.
        </p>
      </header>

      <section className="surface-soft rounded-xl p-5 sm:p-6">
        <BlogForm
          initialValues={{
            title: blog.title,
            content: blog.content,
            author: blog.author,
            coverImageUrl: blog.coverImageUrl ?? "",
            readingTimeMinutes:
              blog.readingTimeMinutes === undefined
                ? ""
                : String(blog.readingTimeMinutes),
            published: blog.published,
          }}
          onSubmit={handleSubmit}
          disabled={updateBlog.isPending}
          submitLabel="Update blog"
          loadingLabel="Updating..."
          successMessage="Blog updated successfully."
          errorMessage="Unable to update blog. Please try again."
        />
      </section>
    </PageTransition>
  );
}

function EditBlogLoading() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-3">
        <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="surface-soft grid gap-5 rounded-xl p-5 sm:p-6">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-20 w-full animate-pulse rounded-lg bg-muted" />
        <div className="ml-auto h-9 w-28 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function EditBlogError({ message }: { message: string }) {
  return (
    <div className="mx-auto grid max-w-2xl place-items-center py-16 text-center">
      <div className="surface-soft grid gap-4 rounded-xl p-8">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-secondary text-secondary-foreground">
          <FileText className="size-6" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Unable to edit blog
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/blogs">
              <ArrowLeft />
              Back to blogs
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
