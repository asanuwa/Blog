import app from './app';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const env = {
  port: Number(process.env.PORT) || 3000,
};

const server = app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down gracefully.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
