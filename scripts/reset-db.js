const { execSync } = require('child_process');

try {
  console.log('Dropping all tables...');
  
  // Connect to PostgreSQL and drop all tables
  const dropTablesQuery = `
    DROP TABLE IF EXISTS billing CASCADE;
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE IF EXISTS migrations CASCADE;
    DROP TYPE IF EXISTS "orders_status_enum" CASCADE;
    DROP TYPE IF EXISTS "orders_paymentstatus_enum" CASCADE;
  `;
  
  // Use node-postgres to execute the query
  const { Client } = require('pg');
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'ecommerce',
  });
  
  async function resetDatabase() {
    await client.connect();
    console.log('Connected to database');
    
    await client.query(dropTablesQuery);
    console.log('All tables dropped successfully');
    
    await client.end();
    console.log('Database connection closed');
    
    // Now run migrations and seeds
    console.log('Running migrations...');
    execSync('npm run migration:run', { stdio: 'inherit' });
    
    console.log('Running seeds...');
    execSync('npm run seed', { stdio: 'inherit' });
    
    console.log('Database reset completed successfully!');
  }
  
  resetDatabase().catch(console.error);
  
} catch (error) {
  console.error('Error during database reset:', error.message);
  process.exit(1);
}