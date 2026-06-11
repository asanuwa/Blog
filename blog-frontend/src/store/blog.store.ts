import { create } from "zustand";
import { appConfig } from "@/config/app.config";
import type { BlogSortOrder } from "@/types/blog.types";

export type PublishedFilter = "all" | "published" | "draft";

export type BlogFilters = {
  page: number;
  search: string;
  published: PublishedFilter;
  sort: BlogSortOrder;
};

export type BlogModalState =
  | {
      type: "delete";
      blogId: string;
      title: string;
    }
  | {
      type: null;
      blogId: null;
      title: null;
    };

type BlogStoreState = {
  filters: BlogFilters;
  modal: BlogModalState;
  ui: {
    mobileNavOpen: boolean;
  };
};

type BlogStoreActions = {
  setFilters: (filters: Partial<BlogFilters>) => void;
  resetFilters: () => void;
  openDeleteModal: (blog: { id: string; title: string }) => void;
  closeModal: () => void;
  setMobileNavOpen: (open: boolean) => void;
};

export type BlogStore = BlogStoreState & BlogStoreActions;

export const defaultBlogFilters: BlogFilters = {
  page: appConfig.blog.defaultPage,
  search: "",
  published: appConfig.blog.defaultPublishedFilter,
  sort: appConfig.blog.defaultSort,
};

const closedModal: BlogModalState = {
  type: null,
  blogId: null,
  title: null,
};

export const useBlogStore = create<BlogStore>((set) => ({
  filters: defaultBlogFilters,
  modal: closedModal,
  ui: {
    mobileNavOpen: false,
  },
  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),
  resetFilters: () =>
    set({
      filters: defaultBlogFilters,
    }),
  openDeleteModal: (blog) =>
    set({
      modal: {
        type: "delete",
        blogId: blog.id,
        title: blog.title,
      },
    }),
  closeModal: () =>
    set({
      modal: closedModal,
    }),
  setMobileNavOpen: (open) =>
    set((state) => ({
      ui: {
        ...state.ui,
        mobileNavOpen: open,
      },
    })),
}));
