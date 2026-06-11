import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { appConfig } from "@/config/app.config";
import { env } from "@/config/env";
import { tokenStorage } from "@/lib/token-storage";

export type NormalizedApiError = {
  message: string;
  statusCode: number | null;
  code?: string;
  details?: unknown;
  isTimeout: boolean;
  isUnauthorized: boolean;
};

type ApiErrorResponse = {
  success?: false;
  statusCode?: number;
  message?: string | string[];
  error?: string;
  details?: unknown;
};

export class ApiClientError extends Error {
  statusCode: number | null;
  code?: string;
  details?: unknown;
  isTimeout: boolean;
  isUnauthorized: boolean;

  constructor(error: NormalizedApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.statusCode = error.statusCode;
    this.code = error.code;
    this.details = error.details;
    this.isTimeout = error.isTimeout;
    this.isUnauthorized = error.isUnauthorized;
  }
}

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: appConfig.api.timeoutMs,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.set("X-Requested-With", "XMLHttpRequest");

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  },
  (error: AxiosError) =>
    Promise.reject(new ApiClientError(normalizeApiError(error))),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.isUnauthorized && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("api:unauthorized"));
    }

    return Promise.reject(new ApiClientError(normalizedError));
  },
);

export function normalizeApiError(
  error: AxiosError<unknown>,
): NormalizedApiError {
  const statusCode = error.response?.status ?? null;
  const responseData = parseApiErrorResponse(error.response?.data);
  const isTimeout = error.code === "ECONNABORTED";
  const isUnauthorized = statusCode === 401;

  return {
    message: getApiErrorMessage(error, responseData, isTimeout),
    statusCode,
    code: error.code,
    details: responseData?.details ?? responseData,
    isTimeout,
    isUnauthorized,
  };
}

function getApiErrorMessage(
  error: AxiosError<unknown>,
  responseData: ApiErrorResponse | undefined,
  isTimeout: boolean,
): string {
  if (isTimeout) {
    return "The request took too long. Please try again.";
  }

  if (Array.isArray(responseData?.message)) {
    return responseData.message.join(", ");
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (!error.response) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}

function parseApiErrorResponse(data: unknown): ApiErrorResponse | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  return data as ApiErrorResponse;
}

export async function apiRequest<TResponse>(
  config: AxiosRequestConfig,
): Promise<TResponse> {
  const response = await api.request<TResponse>(config);
  return response.data;
}
