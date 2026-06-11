import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { env } from "@/config/env";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Blog",
    template: "%s | Blog",
  },
  description: "A clean, responsive blog dashboard.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Blog",
    description: "A clean, responsive blog dashboard.",
    url: "/",
    siteName: "Blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: "A clean, responsive blog dashboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-soft focus:ring-2 focus:ring-ring"
            >
              Skip to content
            </a>
            <Navbar />

            <main
              id="main-content"
              tabIndex={-1}
              className="container-page flex-1 py-6 outline-none sm:py-8 lg:py-10"
            >
              {children}
            </main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
