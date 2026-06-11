export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  coverImageUrl?: string | null;
  readingTimeMinutes?: number | null;
  likes?: number | null;
  commentCount?: number | null;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateBlogPayload = {
  title: string;
  content: string;
  author: string;
  coverImageUrl?: string;
  readingTimeMinutes?: number;
  published?: boolean;
};

export type UpdateBlogPayload = Partial<CreateBlogPayload>;

export type BlogComment = {
  id: string;
  text: string;
  blogId: string;
  createdAt: string;
};

export type BlogSortOrder = "newest" | "oldest";

export type GetBlogsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  published?: boolean;
  sort?: BlogSortOrder;
};

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends PaginationMeta {
  data: T[];
}

export type PaginatedBlogsResponse = PaginatedResponse<Blog>;

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type BlogResponse = Blog;

export type AddCommentResponse = {
  comment: BlogComment;
  blog: Blog;
};

export type DeleteCommentResponse = {
  message: string;
  blog: Blog;
};

export type BlogListResponse = PaginatedBlogsResponse;

export type DeleteBlogResponse = {
  message: string;
};

export type BlogStatsResponse = {
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
};

export type CoverUploadResponse = {
  coverImageUrl: string;
};
