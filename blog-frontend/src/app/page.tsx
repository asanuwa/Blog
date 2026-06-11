import Link from "next/link";
import { ArrowRight, FileText, PencilLine, Search } from "lucide-react";
import { DashboardStats } from "@/components/blogs/dashboard-stats";
import { PageTransition } from "@/components/common/page-transition";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <PageTransition className="grid gap-12">
      <section className="grid gap-8 py-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="grid gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <span className="size-1.5 rounded-full bg-accent" />
            Blog workspace
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Write, organize, and manage your blog posts.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Manage your blog content from one place. Create new post, edit
            existing articles, and browse published content with ease.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/blogs">
                Browse posts
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/blogs/create">Create blog</Link>
            </Button>
          </div>
        </div>

        <div className="surface-elevated interactive-surface grid gap-4 rounded-2xl p-5">
          {[
            {
              icon: <Search className="size-5" aria-hidden="true" />,
              title: "Search and filter",
              text: "Find posts by title, author, publication status, and sort order.",
            },
            {
              icon: <PencilLine className="size-5" aria-hidden="true" />,
              title: "Create and edit",
              text: "Use validated forms with optimistic updates and clear feedback.",
            },
            {
              icon: <FileText className="size-5" aria-hidden="true" />,
              title: "Read details",
              text: "Open full posts with metadata, author information, and dates.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group flex gap-3 rounded-xl border border-border/70 bg-secondary/55 p-4 transition-colors hover:bg-secondary"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-background text-primary shadow-xs transition-transform duration-200 group-hover:-translate-y-0.5">
                {item.icon}
              </div>
              <div className="grid gap-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DashboardStats />
    </PageTransition>
  );
}
