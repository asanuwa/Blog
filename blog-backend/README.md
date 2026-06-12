# Blog API

A scalable RESTful Blog API built with NestJS, Prisma ORM, MongoDB, and TypeScript.

## Installation Commands

```bash
npm install
npm install @nestjs/config class-validator class-transformer @prisma/client prisma
npx prisma generate
```

For a brand-new project, the equivalent setup from scratch is:

```bash
npm i -g @nestjs/cli
nest new blog-api
cd blog-api
npm install @nestjs/config class-validator class-transformer @prisma/client prisma
npx prisma init
```

## Environment Setup

Create a `.env` file from `.env.example`:

```bash
DATABASE_URL="mongodb+srv://USER:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority"
PORT=3000
```

Use a MongoDB replica set connection string. MongoDB Atlas works out of the box.

## Prisma Setup

The Prisma schema is configured in `prisma/schema.prisma` with MongoDB as the datasource.

After changing the schema, push the changes to MongoDB and regenerate the Prisma client:

```bash
npx prisma db push
npx prisma generate
```

MongoDB does not use Prisma migrations in the same way SQL databases do. `npx prisma db push` syncs the Prisma schema with MongoDB and creates the unique index for `slug`.

Seed example data:

```bash
npx prisma db seed
```

## Run The API

```bash
npm run start:dev
```

The API listens on `http://localhost:3000` by default.

## REST Endpoints

```text
POST   /blogs
GET    /blogs
GET    /blogs/:id
PATCH  /blogs/:id
DELETE /blogs/:id
```

Example request body:

```json
{
  "title": "Building with NestJS",
  "content": "This is a practical blog post about NestJS, Prisma, and MongoDB.",
  "author": "Ben",
  "slug": "building-with-nestjs",
  "published": true
}
```

## Project Structure

```text
src/
 ├── blog/
 │    ├── dto/
 │    ├── entities/
 │    ├── blog.controller.ts
 │    ├── blog.service.ts
 │    ├── blog.module.ts
 ├── prisma/
 │    ├── prisma.service.ts
 │    ├── prisma.module.ts
 ├── app.module.ts
 └── main.ts
```

## Quality Checks

```bash
npm run build
npm run lint
```
"# Blog" 
