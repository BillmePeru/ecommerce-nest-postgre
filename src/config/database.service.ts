import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Define the database configuration interface
interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  ssl: boolean | { rejectUnauthorized: boolean };
  autoLoadEntities: boolean;
  poolSize?: number;
  connectionTimeout?: number;
  maxQueryExecutionTime?: number;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly maxRetries = 5;
  private readonly initialRetryDelay = 1000; // 1 second
  private connectionAttempts = 0;

  constructor(
    private configService: ConfigService,
    private dataSource?: DataSource,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing database connection...');
    // TypeORM will handle the initial connection
    // We'll just log the status
    if (this.dataSource && this.dataSource.isInitialized) {
      this.logger.log('Database connection established successfully');
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing database connection...');
    // Ensure all connections are properly closed
    if (this.dataSource && this.dataSource.isInitialized) {
      try {
        await this.dataSource.destroy();
        this.logger.log('Database connections closed successfully');
      } catch (error) {
        this.logger.error(
          `Error closing database connections: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  getTypeOrmConfig(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get<DatabaseConfig>('database');

    if (!dbConfig) {
      throw new Error('Database configuration is missing');
    }

    this.logger.log(
      `Connecting to PostgreSQL database at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    );

    return {
      ...dbConfig,
      autoLoadEntities: true,
      keepConnectionAlive: true,
      // Configure retry strategy with exponential backoff
      retryAttempts: this.maxRetries,
      retryDelay: (retryAttempt: number) =>
        this.calculateRetryDelay(retryAttempt),
      // Add connection pool settings
      poolSize: dbConfig.poolSize || 5,
      extra: {
        // PostgreSQL specific connection pool settings
        max: dbConfig.poolSize || 5,
        connectionTimeoutMillis: dbConfig.connectionTimeout || 10000,
        idleTimeoutMillis: 60000, // 1 minute idle timeout
        statement_timeout: dbConfig.maxQueryExecutionTime || 5000,
      },
    } as unknown as TypeOrmModuleOptions;
  }

  validateConnection(): boolean {
    try {
      const dbConfig = this.configService.get<DatabaseConfig>('database');

      if (!dbConfig) {
        throw new Error('Database configuration is missing');
      }

      // Validate required fields
      const requiredFields: Array<keyof DatabaseConfig> = [
        'host',
        'port',
        'username',
        'password',
        'database',
      ];

      for (const field of requiredFields) {
        if (!dbConfig[field]) {
          throw new Error(
            `Database configuration is missing required field: ${field}`,
          );
        }
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Database configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param retryAttempt Current retry attempt
   * @returns Delay in milliseconds
   */
  private calculateRetryDelay(retryAttempt: number): number {
    this.connectionAttempts = retryAttempt + 1;
    // Exponential backoff: initialDelay * 2^retryAttempt
    const delay = this.initialRetryDelay * Math.pow(2, retryAttempt);
    this.logger.warn(
      `Database connection failed. Retrying in ${delay}ms (attempt ${this.connectionAttempts}/${this.maxRetries})`,
    );
    return delay;
  }

  /**
   * Check if the database connection is healthy
   * @returns Promise resolving to true if connection is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      if (!this.dataSource || !this.dataSource.isInitialized) {
        return false;
      }

      // Execute a simple query to check connection
      const startTime = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      this.logger.debug(`Database health check successful (${responseTime}ms)`);
      return true;
    } catch (error) {
      this.logger.error(
        `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  /**
   * Attempt to reconnect to the database
   * @returns Promise resolving to true if reconnection was successful
   */
  async reconnect(): Promise<boolean> {
    if (!this.dataSource) {
      this.logger.error('Cannot reconnect: DataSource is not available');
      return false;
    }

    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }

      await this.dataSource.initialize();
      this.logger.log('Database reconnection successful');
      return true;
    } catch (error) {
      this.logger.error(
        `Database reconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }
}
