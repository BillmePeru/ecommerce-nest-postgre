import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1626456789000 implements MigrationInterface {
  name = 'InitialSchema1626456789000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create base tables with common fields
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "typeDocument" character varying(100) NOT NULL,
        "numberDocument" character varying(100) NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone" character varying(20),
        "address" jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "dateOfBirth" date,
        "preferences" json,
        "notes" character varying,
        CONSTRAINT "PK_customers" PRIMARY KEY ("id")
      )
    `);

    // Create email index for customers
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_customers_email" ON "customers" ("email")
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "price" decimal(10,2) NOT NULL,
        "inventory" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "sku" character varying(50),
        "categories" text,
        "attributes" json,
        "imageUrl" character varying,
        "weight" decimal(4,2) NOT NULL DEFAULT 0,
        "dimensions" jsonb,
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);

    // Create index on product name
    await queryRunner.query(`
      CREATE INDEX "IDX_products_name" ON "products" ("name")
    `);

    // Create order status enum
    await queryRunner.query(`
      CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    `);

    // Create payment status enum
    await queryRunner.query(`
      CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "customer_id" integer NOT NULL,
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending',
        "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'pending',
        "total" decimal(10,2) NOT NULL,
        "tax" decimal(10,2) NOT NULL DEFAULT 0,
        "shipping" decimal(10,2) NOT NULL DEFAULT 0,
        "discount" decimal(10,2) NOT NULL DEFAULT 0,
        "trackingNumber" character varying,
        "shippingAddress" jsonb,
        "billingAddress" jsonb,
        "notes" character varying,
        "order_date" TIMESTAMP NOT NULL DEFAULT now(),
        "shippedDate" TIMESTAMP,
        "deliveredDate" TIMESTAMP,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);

    // Create order items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "order_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "quantity" integer NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "discount" decimal(10,2) NOT NULL DEFAULT 0,
        "notes" character varying,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_customers" 
      FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_orders" 
      FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_products" 
      FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create billing table
    await queryRunner.query(`
      CREATE TABLE "billing" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "order_id" integer NOT NULL,
        "description" character varying(100) NOT NULL,
        "xmlDocument" text NOT NULL,
        "cdrResult" text,
        "xmlResult" text,
        CONSTRAINT "PK_billing" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_products"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_orders"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_customers"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "billing"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "customers"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_products_name"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_email"`);
  }
}
