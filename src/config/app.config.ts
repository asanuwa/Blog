import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL ?? '60000', 10),
  rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT ?? '100', 10),
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
  apiVersion: process.env.API_VERSION ?? '1',
  logLevel: process.env.LOG_LEVEL ?? 'info',
}));
