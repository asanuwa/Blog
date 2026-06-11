import { apiRequest, ApiClientError } from "@/services/api";

type NewsletterSubscription = {
  id: string;
  email: string;
  createdAt: string;
};

async function requestNewsletterService<TResponse>(
  request: () => Promise<TResponse>,
): Promise<TResponse> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new Error("Unable to subscribe right now. Please try again.");
  }
}

export const newsletterService = {
  subscribe(email: string): Promise<NewsletterSubscription> {
    return requestNewsletterService(() =>
      apiRequest<NewsletterSubscription>({
        method: "POST",
        url: "/newsletter/subscribe",
        data: { email },
      }),
    );
  },
};
