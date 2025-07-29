# E-commerce API

A comprehensive e-commerce API built with NestJS, PostgreSQL, and TypeORM. This API provides complete functionality for managing customers, products, orders, and billing operations.

## 🚀 Features

- **Customer Management**: Create, read, update, and delete customer records with document validation
- **Product Catalog**: Manage products with inventory tracking and categorization
- **Order Processing**: Complete order lifecycle management with status tracking
- **Billing Integration**: Automated billing to SUNAT and invoice generation with external API integration
- **Health Monitoring**: Application health checks with database connectivity status
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## 📚 API Documentation

Once the application is running, you can access the interactive API documentation at:

**Swagger UI**: `http://localhost:3000/api`

The Swagger documentation provides:
- Complete API endpoint documentation
- Request/response schemas with examples
- Interactive API testing interface
- Data validation rules
- Error response formats

## 🛠️ Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM with migrations
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Create an account in [Billme](https://billmeperu.com)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd ecommerce-nest-postgre
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=ecommerce
DB_SYNCHRONIZE=false
DB_LOGGING=true
DB_SSL=false
DB_MIGRATIONS_RUN=true

# Connection Pool
DB_POOL_SIZE=5
DB_CONNECTION_TIMEOUT=10000
DB_MAX_QUERY_TIME=5000

# Billing API (Comunication with SUNAT)
BILLME_API_URL=https://www.api.billmeperu.com/api/v1/Emission
BILLME_API_KEY=your_api_key
COMPANY_NAME=Your Company Name
COMPANY_DOCUMENT_NUMBER=20123456789
```

### 4. Database Setup
```bash
# Run migrations to create tables
npm run migration:run

# Seed the database with sample data
npm run seed

# Or reset and seed everything
npm run db:reset
```

### 5. Start the application
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000` and the Swagger documentation at `http://localhost:3000/api`.

## 📖 API Endpoints

### Customers
- `GET /customers` - Get all customers (with filters)
- `GET /customers/:id` - Get customer by ID
- `GET /customers/email/:email` - Get customer by email
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Products
- `GET /products` - Get all products (with category filter)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `PATCH /products/:id/inventory` - Update product inventory
- `DELETE /products/:id` - Delete product

### Orders
- `GET /orders` - Get all orders (with filters)
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/cancel` - Cancel order
- `PATCH /orders/:id/confirm-payment` - Confirm payment
- `DELETE /orders/:id` - Delete order

### Health
- `GET /health` - Application health check

## 🗄️ Database Schema

The application uses the following main entities:

- **Customers**: Customer information with document validation
- **Products**: Product catalog with inventory management
- **Orders**: Order management with status tracking
- **Order Items**: Individual items within orders
- **Billing**: Billing records and invoice tracking

## 🔧 Development Commands

```bash
# Development
npm run start:dev          # Start in development mode
npm run build             # Build the application

# Database
npm run migration:generate -- src/migrations/MigrationName  # Generate migration
npm run migration:run     # Run pending migrations
npm run migration:revert  # Revert last migration
npm run seed             # Run database seeds
npm run db:reset         # Reset database and run seeds

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:cov         # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

## 🏗️ Project Structure

```
src/
├── common/              # Shared utilities and base classes
├── config/              # Configuration modules
├── customers/           # Customer management module
├── products/            # Product management module
├── orders/              # Order management module
├── billing/             # Billing and invoicing module
├── health/              # Health check module
├── migrations/          # Database migrations
├── seeds/               # Database seed files
└── main.ts             # Application entry point
```

## 🔒 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment | `development` | No |
| `PORT` | Application port | `3000` | No |
| `DB_HOST` | Database host | `localhost` | Yes |
| `DB_PORT` | Database port | `5432` | Yes |
| `DB_USERNAME` | Database username | `postgres` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | `ecommerce` | Yes |

## 🆘 Support

If you have any questions or need help, please:
1. Check the [API documentation](http://localhost:3000/api) when running locally
2. Review the existing issues in the repository
3. Create a new issue with detailed information

## 🔄 Version History

- **v1.0.0** - Initial release with core e-commerce functionality
  - Customer management
  - Product catalog
  - Order processing
  - Billing integration
  - Swagger documentation