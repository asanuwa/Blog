"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-utils";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="grid min-h-dvh place-items-center bg-background p-6 text-foreground">
          <section className="surface-soft grid max-w-lg gap-4 rounded-xl p-8 text-center">
            <div className="grid gap-2">
              <h1 className="text-2xl font-semibold">Something went wrong</h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {getErrorMessage(error)}
              </p>
            </div>
            <div className="flex justify-center">
              <Button onClick={reset}>
                <RotateCcw />
                Try again
              </Button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
