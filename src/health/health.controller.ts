import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService, HealthCheckResult } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2025-07-29T18:00:00.000Z' },
        database: {
          type: 'object',
          properties: {
            connected: { type: 'boolean', example: true },
            responseTime: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Application is unhealthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'unhealthy' },
        timestamp: { type: 'string', example: '2025-07-29T18:00:00.000Z' },
        database: {
          type: 'object',
          properties: {
            connected: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Connection timeout' },
          },
        },
      },
    },
  })
  async checkHealth(@Res() response: Response): Promise<void> {
    const result: HealthCheckResult = await this.healthService.checkHealth();

    const statusCode =
      result.status === 'healthy'
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;

    response.status(statusCode).json(result);
  }
}
