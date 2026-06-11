"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileText, Layers3, Send } from "lucide-react";
import { useBlogStats } from "@/hooks/useBlogStats";
import { cn } from "@/lib/utils";

const statCards = [
  {
    key: "totalPosts",
    label: "Total Posts",
    description: "All blog entries in the CMS",
    icon: Layers3,
  },
  {
    key: "draftPosts",
    label: "Draft Posts",
    description: "Posts waiting to be published",
    icon: FileText,
  },
  {
    key: "publishedPosts",
    label: "Published Posts",
    description: "Live posts available to readers",
    icon: Send,
  },
] as const;

export function DashboardStats() {
  const { data, isFetching } = useBlogStats();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      aria-labelledby="dashboard-stats-title"
      className="grid gap-4"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Dashboard overview</p>
          <h2
            id="dashboard-stats-title"
            className="text-2xl font-semibold tracking-normal text-foreground"
          >
            Blog performance at a glance
          </h2>
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {isFetching ? "Updating stats..." : "Stats are live"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = data?.[card.key] ?? 0;

          return (
            <motion.article
              key={card.key}
              whileHover={shouldReduceMotion ? undefined : { y: -5 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn(
                "surface-elevated interactive-surface relative isolate grid gap-5 overflow-hidden rounded-2xl p-5",
                isFetching && "opacity-90",
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-primary/70" />
              <div className="grid size-11 place-items-center rounded-xl bg-secondary text-primary shadow-xs">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="grid gap-1">
                <p className="text-4xl font-semibold tracking-normal text-foreground">
                  {value}
                </p>
                <h3 className="text-sm font-semibold text-foreground">
                  {card.label}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}
