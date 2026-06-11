import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.blog.createMany({
    data: [
      {
        title: 'Getting Started With NestJS',
        content:
          'NestJS gives Node.js applications a structured, scalable foundation for building APIs with TypeScript.',
        author: 'Ben',
        slug: 'getting-started-with-nestjs',
        published: true,
      },
      {
        title: 'Using Prisma With MongoDB',
        content:
          'Prisma maps MongoDB documents into type-safe models while keeping database access clean and predictable.',
        author: 'Ben',
        slug: 'using-prisma-with-mongodb',
        published: false,
      },
      {
        title: 'Clean API Architecture',
        content:
          'A clean NestJS API separates modules, controllers, services, DTOs, and persistence concerns.',
        author: 'Ben',
        slug: 'clean-api-architecture',
        published: true,
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
