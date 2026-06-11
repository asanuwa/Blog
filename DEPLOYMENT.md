# Deployment Guide

## Production Checklist

1. Create a production MongoDB Atlas database.
2. Copy `.env.production.example` to `.env.production`.
3. Replace `DATABASE_URL` and `CORS_ORIGIN` with production values.
4. Keep `.env.production` out of Git.
5. Run Prisma schema sync before first deployment:

```bash
npx prisma db push
```

## Local Production Run

```bash
npm ci
npm run build
npm run start:prod
```

The API runs on:

```text
http://localhost:3000
```

Versioned routes use `/v1`, for example:

```text
GET /v1/blogs
GET /v1/health
```

Swagger is available at `/api/docs` when `SWAGGER_ENABLED=true`.

## Docker Run

Create `.env.production`, then run:

```bash
docker compose up --build
```

Health check:

```bash
curl http://localhost:3000/v1/health
```

Readiness check, including MongoDB connectivity:

```bash
curl http://localhost:3000/v1/health/readiness
```

## Environment Variables

```text
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb connection string
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
SWAGGER_ENABLED=false
API_VERSION=1
LOG_LEVEL=info
```

## Operational Notes

- Logs are written to stdout/stderr as structured JSON in production.
- Rate limiting is applied globally.
- Helmet and compression are enabled globally.
- The app listens for shutdown signals through Nest graceful shutdown hooks.
- Prisma disconnects cleanly during module shutdown.
- `/v1/health` is a liveness check; `/v1/health/readiness` checks MongoDB.
