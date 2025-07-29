import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ProductSeed } from './product.seed';
import { CustomerSeed } from './customer.seed';
import { OrderSeed } from './order.seed';

// Load environment variables
config();

// Create a new data source for seeding
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ecommerce',
  entities: ['dist/src/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * Run all seed classes
 */
async function runSeeds() {
  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('Data source initialized');

    // Run seeds in order
    const productSeed = new ProductSeed(dataSource);
    const customerSeed = new CustomerSeed(dataSource);
    const orderSeed = new OrderSeed(dataSource);

    await customerSeed.run();
    await productSeed.run();
    await orderSeed.run();

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    // Close the connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Data source connection closed');
    }
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { runSeeds };
