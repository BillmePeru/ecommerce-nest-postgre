import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Application environment'),
  PORT: Joi.number().default(3000).description('Application port'),

  // Database configuration
  DB_HOST: Joi.string().default('localhost').description('Database host'),
  DB_PORT: Joi.number().default(5432).description('Database port'),
  DB_USERNAME: Joi.string()
    .default('postgres')
    .description('Database username'),
  DB_PASSWORD: Joi.string()
    .default('postgres')
    .description('Database password'),
  DB_NAME: Joi.string().default('ecommerce').description('Database name'),
  DB_SYNCHRONIZE: Joi.boolean()
    .default(false)
    .description(
      'Automatically synchronize database schema (use with caution in production)',
    ),
  DB_LOGGING: Joi.boolean()
    .default(false)
    .description('Enable SQL query logging'),
  DB_SSL: Joi.boolean()
    .default(false)
    .description('Enable SSL for database connection'),

  // Connection pool settings
  DB_POOL_SIZE: Joi.number()
    .default(5)
    .description('Database connection pool size'),
  DB_CONNECTION_TIMEOUT: Joi.number()
    .default(10000)
    .description('Database connection timeout in milliseconds'),
  DB_MAX_QUERY_TIME: Joi.number()
    .default(5000)
    .description('Maximum query execution time in milliseconds'),
});

export function validateConfig(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const result = validationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (result.error) {
    const missingKeys = result.error.details.map((detail) => {
      return `${detail.path.join('.')}: ${detail.message}`;
    });

    throw new Error(
      `Configuration validation error: ${missingKeys.join(', ')}`,
    );
  }

  return result.value as Record<string, unknown>;
}
