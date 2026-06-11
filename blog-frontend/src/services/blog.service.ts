import { apiRequest, ApiClientError } from "@/services/api";
import type {
  AddCommentResponse,
  BlogComment,
  BlogResponse,
  BlogStatsResponse,
  BlogListResponse,
  CoverUploadResponse,
  CreateBlogPayload,
  DeleteCommentResponse,
  DeleteBlogResponse,
  GetBlogsQuery,
  UpdateBlogPayload,
} from "@/types/blog.types";

const BLOGS_ENDPOINT = `/blogs`;

type BlogRequestOptions = {
  signal?: AbortSignal;
};

async function requestBlogService<TResponse>(
  request: () => Promise<TResponse>,
): Promise<TResponse> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new Error("Unable to complete the blog request. Please try again.");
  }
}

function buildBlogQueryParams(query: GetBlogsQuery = {}) {
  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.published !== undefined) {
    params.set("published", String(query.published));
  }

  if (query.sort) {
    params.set("sort", query.sort);
  }

  return params;
}

function appendQueryParams(endpoint: string, query?: GetBlogsQuery): string {
  const params = buildBlogQueryParams(query);
  const queryString = params.toString();

  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

export const blogService = {
  getBlogs(
    query?: GetBlogsQuery,
    options?: BlogRequestOptions,
  ): Promise<BlogListResponse> {
    return requestBlogService(() =>
      apiRequest<BlogListResponse>({
        method: "GET",
        url: appendQueryParams(BLOGS_ENDPOINT, query),
        signal: options?.signal,
      }),
    );
  },

  getBlogStats(): Promise<BlogStatsResponse> {
    return requestBlogService(() =>
      apiRequest<BlogStatsResponse>({
        method: "GET",
        url: `${BLOGS_ENDPOINT}/stats`,
      }),
    );
  },

  getBlogById(id: string, options?: BlogRequestOptions): Promise<BlogResponse> {
    return requestBlogService(() =>
      apiRequest<BlogResponse>({
        method: "GET",
        url: `${BLOGS_ENDPOINT}/${id}`,
        signal: options?.signal,
      }),
    );
  },

  createBlog(payload: CreateBlogPayload): Promise<BlogResponse> {
    return requestBlogService(() =>
      apiRequest<BlogResponse>({
        method: "POST",
        url: BLOGS_ENDPOINT,
        data: payload,
      }),
    );
  },

  updateBlog(id: string, payload: UpdateBlogPayload): Promise<BlogResponse> {
    return requestBlogService(() =>
      apiRequest<BlogResponse>({
        method: "PATCH",
        url: `${BLOGS_ENDPOINT}/${id}`,
        data: payload,
      }),
    );
  },

  deleteBlog(id: string): Promise<DeleteBlogResponse> {
    return requestBlogService(() =>
      apiRequest<DeleteBlogResponse>({
        method: "DELETE",
        url: `${BLOGS_ENDPOINT}/${id}`,
      }),
    );
  },

  likeBlog(id: string): Promise<BlogResponse> {
    return requestBlogService(() =>
      apiRequest<BlogResponse>({
        method: "POST",
        url: `${BLOGS_ENDPOINT}/${id}/like`,
      }),
    );
  },

  addComment(id: string, text: string): Promise<AddCommentResponse> {
    return requestBlogService(() =>
      apiRequest<AddCommentResponse>({
        method: "POST",
        url: `${BLOGS_ENDPOINT}/${id}/comments`,
        data: { text },
      }),
    );
  },

  getComments(id: string): Promise<BlogComment[]> {
    return requestBlogService(() =>
      apiRequest<BlogComment[]>({
        method: "GET",
        url: `${BLOGS_ENDPOINT}/${id}/comments`,
      }),
    );
  },

  deleteComment(id: string, commentId: string): Promise<DeleteCommentResponse> {
    return requestBlogService(() =>
      apiRequest<DeleteCommentResponse>({
        method: "DELETE",
        url: `${BLOGS_ENDPOINT}/${id}/comments/${commentId}`,
      }),
    );
  },

  uploadCoverImage(file: File): Promise<CoverUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return requestBlogService(() =>
      apiRequest<CoverUploadResponse>({
        method: "POST",
        url: `${BLOGS_ENDPOINT}/cover-upload`,
        data: formData,
      }),
    );
  },
};
