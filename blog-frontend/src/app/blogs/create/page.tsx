import type { Metadata } from "next";
import { CreateBlogClient } from "./create-blog-client";

export const metadata: Metadata = {
  title: "Create Blog",
  description: "Create a new blog post.",
  alternates: {
    canonical: "/blogs/create",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreateBlogPage() {
  return <CreateBlogClient />;
}
