"use client";

import { useState, type ReactNode } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast, Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { getErrorMessage, shouldShowErrorToast } from "@/lib/error-utils";
import { ApiClientError } from "@/services/api";

type ProvidersProps = {
  children: ReactNode;
};

const STALE_TIME_MS = 60_000;
const GC_TIME_MS = 5 * 60_000;
const MAX_RETRY_COUNT = 2;

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiClientError) {
    if (error.isUnauthorized || error.statusCode === 404) {
      return false;
    }

    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }
  }

  return failureCount < MAX_RETRY_COUNT;
}

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (process.env.NODE_ENV === "development") {
          console.error("React Query error:", error);
        }

        if (query.state.data !== undefined && shouldShowErrorToast(error)) {
          toast.error(getErrorMessage(error));
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (shouldShowErrorToast(error)) {
          toast.error(getErrorMessage(error));
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster richColors closeButton position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
