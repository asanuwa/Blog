"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/common/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterService } from "@/services/newsletter.service";

const storyCards = [
  {
    icon: UserRound,
    title: "My Story",
    text: "I'm Bliss, a voice shaped by reflection, curiosity, and a need to make sense of quiet moments. I started this blog at a turning point where clarity mattered more than noise. This platform exists to capture simple truths, honest thoughts, and the kind of perspective that lingers.",
  },
  {
    icon: BookOpen,
    title: "What's in it for them",
    text: "Readers come here for clear ideas, practical insights, and lessons drawn from real experience, things they can understand quickly and apply immediately.",
  },
  {
    icon: Award,
    title: "Credibility",
    text: "Built on real-world thinking and consistent exploration, my work reflects a clear, honest perspective shaped by practice, observation, and continuous refinement.",
  },
] as const;

const topics = [
  "Simple frameworks for thinking clearly and making better decisions",
  "Short lessons from real-life experiences and personal growth",
  "Practical ways to build consistency, focus, and discipline",
  "Insightful reflections that help readers see things differently and act with intention",
];

export function AboutClient() {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      await newsletterService.subscribe(email);
      toast.success("You're on the newsletter list.");
      setEmail("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to subscribe right now. Please try again.",
      );
    }
  }

  return (
    <PageTransition className="grid gap-10">
      <section className="surface-elevated relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-center">
          <div className="grid gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              About the blog
            </div>
            <div className="grid gap-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                Ideas, lessons, and field notes for people building better
                software.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                This page introduces the story behind the blog, the topics
                readers can expect, and the next steps for joining the
                community.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/blogs">
                  Read popular posts
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/blogs/create">Create a post</Link>
              </Button>
            </div>
          </div>

          <motion.div
            className="grid gap-4 rounded-2xl border border-border bg-background/70 p-5 shadow-soft"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-primary/15 bg-secondary shadow-soft">
              <Image
                src="/blissPng.jpeg"
                alt="Portrait of Bliss"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 352px"
              />
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium text-primary">Author profile</p>
              <h2 className="text-2xl font-semibold text-foreground">Bliss</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                A reflective voice sharing honest thoughts, simple truths, and
                practical perspective for readers who value clarity.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {storyCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.article
              key={card.title}
              className="surface-elevated interactive-surface grid gap-4 rounded-2xl p-5"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.22, delay: index * 0.04 }}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
            >
              <div className="grid size-11 place-items-center rounded-xl bg-secondary text-primary shadow-xs">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="grid gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {card.title}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.text}
                </p>
              </div>
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-elevated grid gap-4 rounded-2xl p-5 sm:p-6">
          <p className="text-sm font-medium text-primary">Topics covered</p>
          <h2 className="text-2xl font-semibold tracking-normal text-foreground">
            Practical content readers can use.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This space offers clear, practical ideas you can apply immediately,
            simple insights that help you think better, act with intention, and
            keep growing.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <motion.div
              key={topic}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs"
              whileHover={shouldReduceMotion ? undefined : { x: 4 }}
              transition={{ duration: 0.18 }}
            >
              <CheckCircle2
                className="size-5 text-primary"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-foreground">
                {topic}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="surface-elevated overflow-hidden rounded-2xl">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_24rem] lg:items-center lg:p-8">
          <div className="grid gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              <Mail className="size-4" aria-hidden="true" />
              Newsletter
            </div>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">
              Get new posts in your inbox.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Add a newsletter promise here: weekly notes, project breakdowns,
              or your best new articles. Keep it specific so readers know what
              they are signing up for.
            </p>
          </div>

          <form className="grid gap-3" onSubmit={handleNewsletterSubmit}>
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <Input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12"
            />
            <Button type="submit" size="lg">
              Join newsletter
              <ArrowRight aria-hidden="true" />
            </Button>
          </form>
        </div>
      </section>
    </PageTransition>
  );
}
