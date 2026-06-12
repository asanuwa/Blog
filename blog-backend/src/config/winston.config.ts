import { ConfigService } from '@nestjs/config';
import { utilities } from 'nest-winston';
import winston from 'winston';

export const createWinstonTransports = (configService: ConfigService) => {
  const isProduction =
    configService.get<string>('app.nodeEnv') === 'production';
  const logLevel = configService.get<string>('app.logLevel') ?? 'info';

  return [
    new winston.transports.Console({
      level: logLevel,
      format: isProduction
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          )
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('BlogAPI', {
              colors: true,
              prettyPrint: true,
            }),
          ),
    }),
  ];
};
