"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileImage, PenLine, Sparkles } from "lucide-react";
import { BlogForm } from "@/components/forms/blog-form";
import { PageTransition } from "@/components/common/page-transition";
import { Button } from "@/components/ui/button";
import { useCreateBlog } from "@/hooks/useCreateBlog";
import type { CreateBlogInput } from "@/lib/validators";

export function CreateBlogClient() {
  const router = useRouter();
  const createBlog = useCreateBlog();

  async function handleSubmit(values: CreateBlogInput) {
    await createBlog.mutateAsync(values);
    router.push("/blogs");
  }

  return (
    <PageTransition className="mx-auto grid max-w-5xl gap-6">
      <div>
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/blogs">
            <ArrowLeft aria-hidden="true" />
            Back to blogs
          </Link>
        </Button>
      </div>

      <header className="surface-elevated relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div className="grid gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              New post
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              Create a polished blog post
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Add a strong title, author details, story content, and a cover
              image. Required fields will show validation messages before the
              post is submitted.
            </p>
          </div>

          <div className="grid gap-3 rounded-xl border border-border bg-background/70 p-4">
            {[
              {
                icon: <PenLine className="size-4" aria-hidden="true" />,
                text: "Write a title with at least 5 characters.",
              },
              {
                icon: <FileImage className="size-4" aria-hidden="true" />,
                text: "Choose a cover image from your computer.",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 text-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  {item.icon}
                </span>
                <span className="leading-6 text-muted-foreground">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="surface-elevated interactive-surface rounded-2xl p-5 sm:p-6">
        <BlogForm
          onSubmit={handleSubmit}
          disabled={createBlog.isPending}
          submitLabel="Create blog"
          loadingLabel="Creating..."
          successMessage="Blog created successfully."
          errorMessage="Unable to create blog. Please review the form and try again."
        />
      </section>
    </PageTransition>
  );
}
