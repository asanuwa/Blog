# Deployment Guide

This frontend is a Next.js app that expects the backend API URL to be available at build/runtime through public environment variables.

## Environment Variables

Create these variables in your deployment platform:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/v1
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

For local production testing:

```bash
npm run build
npm run start
```

## Vercel

1. Push the project to GitHub, GitLab, or Bitbucket.
2. In Vercel, create a new project and select the `blog-frontend` directory as the root directory.
3. Add environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/v1
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

4. Use these build settings:

```bash
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm ci
Output Directory: .next
```

5. Deploy.

Recommended CI/CD:

- Use Vercel Git integration for automatic preview deployments on pull requests.
- Keep production deployments limited to the main branch.
- Add a pre-deploy check that runs:

```bash
npm ci
npm run lint
npm run build
```

## Netlify

1. Push the project to your Git provider.
2. In Netlify, create a new site from Git.
3. Set the base directory to:

```bash
blog-frontend
```

4. Add environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/v1
NEXT_PUBLIC_SITE_URL=https://your-netlify-domain.netlify.app
```

5. Use these build settings:

```bash
Build Command: npm run build
Publish Directory: .next
```

Netlify usually detects Next.js automatically. If it does not, install and configure the official Netlify Next.js runtime/plugin from the Netlify dashboard.

Recommended CI/CD:

- Enable deploy previews for pull requests.
- Run lint and build checks before merging.
- Keep production deploys tied to the main branch.

## Docker VPS Deployment

Build and run with Docker Compose from the `blog-frontend` directory:

```bash
docker compose up --build -d
```

Set production environment variables in a `.env` file beside `docker-compose.yml`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/v1
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

The container exposes the app on port `3001`:

```bash
http://your-server-ip:3001
```

For production, place a reverse proxy such as Nginx, Caddy, or Traefik in front of the container and enable HTTPS.

Example deployment flow:

```bash
git pull
npm ci
npm run lint
docker compose up --build -d
docker image prune -f
```

Recommended CI/CD:

- Build the Docker image in CI after `npm run lint` and `npm run build`.
- Push the image to a registry such as Docker Hub, GitHub Container Registry, or a private registry.
- On the VPS, pull the new image and restart with Docker Compose.
- Keep secrets and environment values outside the image.

## Production Checklist

- Backend API is deployed and reachable from the browser.
- `NEXT_PUBLIC_API_URL` points to the deployed backend `/v1` API path.
- `NEXT_PUBLIC_SITE_URL` points to the deployed frontend domain.
- `npm run lint` passes.
- `npm run build` passes.
- HTTPS is enabled in production.
- CORS on the backend allows the deployed frontend domain.
