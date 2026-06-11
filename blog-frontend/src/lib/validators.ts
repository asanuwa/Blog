import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Please enter a title before posting.")
    .min(5, "Title must be at least 5 characters."),
  content: z
    .string()
    .trim()
    .min(1, "Please write your blog content before posting.")
    .min(20, "Content must be at least 20 characters."),
  author: z.string().trim().min(1, "Please enter the author's name."),
  coverImageUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isValidUrl(value), {
      message: "Enter a valid cover image URL.",
    }),
  readingTimeMinutes: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value || (Number.isInteger(Number(value)) && Number(value) >= 1),
      {
        message: "Reading time must be at least 1 minute.",
      },
    ),
  published: z.boolean().optional(),
});

export const updateBlogSchema = createBlogSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

export const blogSortSchema = z.enum(["newest", "oldest"]);

export const getBlogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  published: z.coerce.boolean().optional(),
  sort: blogSortSchema.optional(),
});

export type CreateBlogFormValues = z.infer<typeof createBlogSchema>;
export type CreateBlogInput = Omit<
  CreateBlogFormValues,
  "coverImageUrl" | "readingTimeMinutes"
> & {
  coverImageUrl?: string;
  readingTimeMinutes?: number;
};
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type GetBlogsQueryInput = z.infer<typeof getBlogsQuerySchema>;
export type BlogSortInput = z.infer<typeof blogSortSchema>;

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
