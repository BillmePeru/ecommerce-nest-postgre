# Database Migrations

This directory contains TypeORM database migrations for the ecommerce application.

## Migration Commands

The following npm scripts are available for managing migrations:

- `npm run migration:generate -- src/migrations/MigrationName` - Generate a new migration based on entity changes
- `npm run migration:create -- src/migrations/MigrationName` - Create a new empty migration file
- `npm run migration:run` - Run all pending migrations
- `npm run migration:revert` - Revert the most recent migration
- `npm run migration:show` - Show all migrations and their status

## Migration Workflow

1. Make changes to your entity files
2. Generate a migration: `npm run migration:generate -- src/migrations/DescriptiveChangeName`
3. Review the generated migration file in the `src/migrations` directory
4. Run the migration: `npm run migration:run`
5. Commit both the entity changes and the new migration file to version control

## Initial Schema

The initial schema migration (`1626456789000-InitialSchema.ts`) creates the following tables:

- `customers` - Customer information
- `products` - Product catalog
- `orders` - Order header information
- `order_items` - Order line items

## Best Practices

- Always run migrations in development before deploying to production
- Never modify an existing migration that has been applied to any environment
- Create a new migration instead of modifying an existing one
- Include descriptive names for migrations that explain what they do
- Test migrations by running them both up and down