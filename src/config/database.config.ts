import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ecommerce',
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true' || false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  autoLoadEntities: true,
  // Connection pool settings optimized for small ecommerce
  poolSize: parseInt(process.env.DB_POOL_SIZE!, 10) || 5,
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT!, 10) || 10000,
  maxQueryExecutionTime: parseInt(process.env.DB_MAX_QUERY_TIME!, 10) || 5000,
}));
