# Final Frontend Requirements

This frontend is organized as a modular, production-ready Next.js application with strict TypeScript, reusable services, typed hooks, shared validation, and deployment tooling.

## Architecture

- `src/app`: Next.js App Router pages, layouts, metadata, loading states, and error boundaries.
- `src/components`: reusable UI, layout, blog, auth, form, and common presentation components.
- `src/config`: centralized app and environment configuration.
- `src/hooks`: TanStack Query hooks for blog data and mutations.
- `src/lib`: shared utilities, validation schemas, auth route helpers, token storage, and error helpers.
- `src/services`: API client and blog service layer.
- `src/store`: minimal Zustand UI/filter/modal state.
- `src/types`: backend-aligned TypeScript contracts.

## File Responsibilities

- `src/app/layout.tsx`: root shell, metadata defaults, providers, navbar/footer, skip link, semantic main content.
- `src/app/page.tsx`: optimized home dashboard entry point.
- `src/app/blogs/page.tsx`: SEO-enabled blogs route with suspense.
- `src/app/blogs/blogs-client.tsx`: search, filtering, sorting, pagination, loading/empty/error/results transitions.
- `src/app/blogs/[id]/page.tsx`: server-rendered blog details with dynamic metadata and safe error fallback.
- `src/app/blogs/[id]/loading.tsx`: route-level loading UI.
- `src/app/blogs/create/page.tsx`: create route metadata.
- `src/app/blogs/create/create-blog-client.tsx`: create mutation workflow using reusable form.
- `src/app/blogs/edit/[id]/page.tsx`: edit route metadata and ID handoff.
- `src/app/blogs/edit/[id]/edit-blog-client.tsx`: prefilled edit workflow with loading/error states.
- `src/app/error.tsx`: route-level error boundary fallback.
- `src/app/global-error.tsx`: application-level error boundary fallback.
- `src/app/providers.tsx`: theme, toast, auth, and TanStack Query providers.
- `src/app/robots.ts`: robots metadata route.
- `src/app/sitemap.ts`: sitemap metadata route.
- `src/components/auth/auth-provider.tsx`: future-ready auth context without full auth implementation.
- `src/components/blogs/blog-card.tsx`: responsive blog summary card with accessible actions and hover motion.
- `src/components/blogs/delete-blog-button.tsx`: confirmation dialog, optimistic delete trigger, toast feedback.
- `src/components/common/*`: reusable empty/error/loading/image/pagination/search/page-transition components.
- `src/components/forms/blog-form.tsx`: reusable create/edit form using React Hook Form and Zod.
- `src/components/layout/*`: persistent navbar and footer.
- `src/components/ui/*`: shadcn-based UI primitives.
- `src/config/app.config.ts`: centralized typed app constants.
- `src/config/env.ts`: required, validated public environment variables.
- `src/hooks/*`: typed query/mutation hooks with cache invalidation and optimistic updates.
- `src/lib/validators.ts`: shared Zod schemas and inferred form types.
- `src/services/api.ts`: Axios instance with interceptors, timeout, token support, and normalized errors.
- `src/services/blog.service.ts`: blog API service with typed CRUD methods and query parameter handling.
- `src/store/blog.store.ts`: minimal typed global state for filters and UI/modal state.
- `src/types/blog.types.ts`: backend-aligned blog, pagination, and API response types.

## Quality Rules Met

- Type safety: `strict` TypeScript is enabled and application code avoids `any`.
- Modularity: API, state, validation, hooks, pages, and UI are separated by responsibility.
- Maintainability: repeated app constants are centralized in `src/config/app.config.ts`.
- SEO: Metadata API, dynamic metadata, OpenGraph, Twitter cards, sitemap, robots, and canonical URLs are configured.
- Performance: server components are used where appropriate, image optimization is configured, dynamic imports are used for heavier client actions, and production output is standalone.
- Accessibility: semantic landmarks, skip link, ARIA labels, focus states, keyboard-friendly controls, and reduced-motion support are included.
- Production readiness: Docker, Docker Compose, ESLint, Prettier, Husky, lint-staged, deployment docs, and required env validation are configured.

## Verification Commands

```bash
npm run lint
npm run format:check
npm run build
```

## Deployment Files

- `Dockerfile`: optimized multi-stage standalone Next.js image.
- `docker-compose.yml`: VPS-ready container runtime configuration.
- `.env.example`: required public environment variable template.
- `DEPLOYMENT.md`: Vercel, Netlify, and Docker VPS deployment instructions.
