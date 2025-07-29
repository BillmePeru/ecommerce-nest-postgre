import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPayloadToBilling1753812954742 implements MigrationInterface {
  name = 'AddPayloadToBilling1753812954742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_orders"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_products"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_customers"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_customers_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_products_name"`);
    await queryRunner.query(
      `ALTER TABLE "billing" ADD "payload" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP COLUMN "preferences"`,
    );
    await queryRunner.query(`ALTER TABLE "customers" ADD "preferences" text`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "attributes"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "attributes" text`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8536b8b85c06969f84f0c098b0"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "attributes"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "attributes" json`);
    await queryRunner.query(
      `ALTER TABLE "customers" DROP COLUMN "preferences"`,
    );
    await queryRunner.query(`ALTER TABLE "customers" ADD "preferences" json`);
    await queryRunner.query(`ALTER TABLE "billing" DROP COLUMN "payload"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_products_name" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_customers_email" ON "customers" ("email") `,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_customers" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_products" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_orders" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
