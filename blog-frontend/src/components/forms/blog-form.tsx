"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calculateReadingTime } from "@/lib/reading-time";
import { cn } from "@/lib/utils";
import {
  createBlogSchema,
  type CreateBlogFormValues,
  type CreateBlogInput,
} from "@/lib/validators";
import { blogService } from "@/services/blog.service";

type BlogFormProps = {
  initialValues?: Partial<CreateBlogFormValues>;
  onSubmit: (values: CreateBlogInput) => Promise<void> | void;
  className?: string;
  submitLabel?: string;
  loadingLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  disabled?: boolean;
};

const defaultValues: CreateBlogFormValues = {
  title: "",
  content: "",
  author: "",
  coverImageUrl: "",
  readingTimeMinutes: "",
  published: false,
};

export function BlogForm({
  initialValues,
  onSubmit,
  className,
  submitLabel = "Save blog",
  loadingLabel = "Saving...",
  successMessage = "Blog saved successfully.",
  errorMessage = "Unable to save blog. Please review the form and try again.",
  disabled = false,
}: BlogFormProps) {
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageName, setCoverImageName] = useState("");
  const form = useForm<CreateBlogFormValues>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
      published: initialValues?.published ?? defaultValues.published,
    },
  });

  const isSubmitting = form.formState.isSubmitting || disabled;
  const contentValue = useWatch({
    control: form.control,
    name: "content",
  });
  const calculatedReadingTime = calculateReadingTime(contentValue);

  useEffect(() => {
    form.reset({
      ...defaultValues,
      ...initialValues,
      published: initialValues?.published ?? defaultValues.published,
    });
  }, [form, initialValues]);

  async function handleSubmit(values: CreateBlogFormValues) {
    try {
      const coverImageUrl = coverImageFile
        ? (await blogService.uploadCoverImage(coverImageFile)).coverImageUrl
        : values.coverImageUrl;

      await onSubmit(normalizeBlogFormValues({ ...values, coverImageUrl }));
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage);
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn("grid gap-5", className)}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Building a REST API with NestJS"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write the blog content..."
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use at least 20 characters for the blog body.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="Ben" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-foreground">
              Cover image
            </label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              disabled={isSubmitting}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setCoverImageFile(file);
                setCoverImageName(file?.name ?? "");
              }}
            />
            <p className="text-sm text-muted-foreground">
              {coverImageName
                ? `Selected: ${coverImageName}`
                : initialValues?.coverImageUrl
                  ? "Current cover image will be kept unless you choose a new one."
                  : "Choose a local image from your file manager."}
            </p>
          </div>

          <FormItem>
            <FormLabel>Reading time</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                value={calculatedReadingTime}
                readOnly
                disabled={isSubmitting}
                aria-label="Automatically calculated reading time"
              />
            </FormControl>
            <FormDescription>
              Auto-calculated at 225 words per minute.
            </FormDescription>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
              <FormControl>
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-input accent-primary"
                  checked={field.value}
                  disabled={isSubmitting}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <div className="grid gap-1">
                <FormLabel>Publish now</FormLabel>
                <FormDescription>
                  Leave unchecked to save the blog as a draft.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            Title, content, and author are required before posting. Duplicate
            titles will be rejected with a clear message.
          </p>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {loadingLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function normalizeBlogFormValues(
  values: CreateBlogFormValues,
): CreateBlogInput {
  return {
    title: values.title,
    content: values.content,
    author: values.author,
    published: values.published,
    coverImageUrl: values.coverImageUrl?.trim() || undefined,
    readingTimeMinutes: calculateReadingTime(values.content),
  };
}
