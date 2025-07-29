# Database Seeds

This directory contains seed scripts for populating the database with test data for development purposes.

## Available Seeds

- `CustomerSeed`: Creates sample customer records
- `ProductSeed`: Creates sample product records

## Running Seeds

You can run all seeds using the npm script:

```bash
npm run seed
```

This will build the application and run the seed script, which will populate the database with sample data.

## Database Reset

To completely reset your database (run all migrations and then seed data), use:

```bash
npm run db:reset
```

## How Seeds Work

Seeds will only populate tables that are empty. If a table already contains data, the corresponding seed will be skipped.

## Creating New Seeds

To create a new seed:

1. Create a new file in the `src/seeds` directory (e.g., `your-entity.seed.ts`)
2. Extend the `BaseSeed` class
3. Implement the `run()` method
4. Add your seed to the `runSeeds()` function in `seed.ts`

Example:

```typescript
import { DataSource } from 'typeorm';
import { BaseSeed } from './base.seed';
import { YourEntity } from '../your-module/entities/your-entity.entity';

export class YourEntitySeed extends BaseSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(YourEntity);
    const isEmpty = await this.isTableEmpty('your_entity_table');

    if (!isEmpty) {
      this.log('Table is not empty. Skipping seed.');
      return;
    }

    this.log('Seeding your entities...');

    const entities = [
      // Your seed data here
    ];

    for (const entityData of entities) {
      const entity = repository.create(entityData);
      await repository.save(entity);
    }

    this.log(`Seeded ${entities.length} entities successfully`);
  }
}
```