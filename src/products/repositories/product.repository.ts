import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../common/base.repository';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  protected readonly logger = new Logger(ProductRepository.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }

  async findByName(name: string): Promise<Product[]> {
    try {
      return await this.productRepository.find({
        where: { name: name },
      });
    } catch (error) {
      this.logger.error(
        `Error finding products by name ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findBySku(sku: string): Promise<Product | null> {
    try {
      return await this.productRepository.findOne({
        where: { sku: sku },
      });
    } catch (error) {
      this.logger.error(
        `Error finding product by SKU ${sku}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findByCategory(category: string): Promise<Product[]> {
    try {
      // Using TypeORM's query builder for array contains operation
      return await this.productRepository
        .createQueryBuilder('product')
        .where(':category = ANY(product.categories)', { category })
        .getMany();
    } catch (error) {
      this.logger.error(
        `Error finding products by category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async updateInventory(id: number, quantity: number): Promise<Product | null> {
    try {
      // First, find the product
      const product = await this.findById(id);
      if (!product) {
        return null;
      }

      await this.productRepository
        .createQueryBuilder()
        .update(Product)
        .set({ inventory: quantity })
        .where('id = :id', { id })
        .execute();

      return await this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error updating inventory for product ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
