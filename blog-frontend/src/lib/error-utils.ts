import { ApiClientError } from "@/services/api";

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function shouldShowErrorToast(error: unknown) {
  if (error instanceof ApiClientError) {
    return !error.isUnauthorized;
  }

  return true;
}
