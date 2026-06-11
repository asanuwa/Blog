import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Check API health',
    description: 'Returns application liveness status.',
  })
  @ApiOkResponse({
    description: 'The API process is healthy.',
    schema: {
      example: {
        status: 'ok',
        uptime: 120.45,
        timestamp: '2026-06-03T12:00:00.000Z',
      },
    },
  })
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  @ApiOperation({
    summary: 'Check API readiness',
    description: 'Verifies MongoDB connectivity for traffic readiness.',
  })
  @ApiOkResponse({
    description: 'The API and database are ready.',
    schema: {
      example: {
        status: 'ready',
        uptime: 120.45,
        timestamp: '2026-06-03T12:00:00.000Z',
        database: {
          status: 'up',
        },
      },
    },
  })
  async readiness() {
    try {
      await this.prisma.$runCommandRaw({ ping: 1 });

      return {
        status: 'ready',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: 'up',
        },
      };
    } catch {
      throw new ServiceUnavailableException('Database health check failed');
    }
  }
}
