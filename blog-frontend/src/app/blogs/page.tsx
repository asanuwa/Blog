import { Suspense } from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/common/page-transition";
import { BlogSkeletonGrid, BlogsClient } from "./blogs-client";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Browse, search, filter, and sort blog posts.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Blogs",
    description: "Browse, search, filter, and sort blog posts.",
    url: "/blogs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blogs",
    description: "Browse, search, filter, and sort blog posts.",
  },
};

export default function BlogsPage() {
  return (
    <PageTransition>
      <Suspense fallback={<BlogSkeletonGrid />}>
        <BlogsClient />
      </Suspense>
    </PageTransition>
  );
}
