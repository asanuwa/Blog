import type { Metadata } from "next";
import { EditBlogClient } from "./edit-blog-client";

type EditBlogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit Blog",
  description: "Edit an existing blog post.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  return <EditBlogClient id={id} />;
}
