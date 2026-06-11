import type { Metadata } from "next";
import { AboutClient } from "./about-client";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn the story behind the blog, what readers can expect, and how to stay connected.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About",
    description:
      "Learn the story behind the blog, what readers can expect, and how to stay connected.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description:
      "Learn the story behind the blog, what readers can expect, and how to stay connected.",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
