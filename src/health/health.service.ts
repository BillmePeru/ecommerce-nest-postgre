import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../config/database.service';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    responseTime?: number;
    error?: string;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async checkHealth(): Promise<HealthCheckResult> {
    this.logger.log('Performing health check');

    const startTime = Date.now();
    let dbConnected = false;
    let dbError: string | undefined = undefined;

    try {
      dbConnected = await this.databaseService.checkHealth();
    } catch (error: unknown) {
      dbError = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Health check failed: ${dbError}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    const responseTime = Date.now() - startTime;

    return {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        responseTime,
        error: dbError,
      },
    };
  }
}
