import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../entities/product.entity';
import { DatabaseError } from '../../common/errors/database.error';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly productRepository: ProductRepository) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(productData: Partial<Product>): Promise<Product> {
    try {
      return await this.productRepository.create(productData);
    } catch (error) {
      this.logger.error(
        `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async update(
    id: number,
    productData: Partial<Product>,
  ): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    try {
      return await this.productRepository.update(id, productData);
    } catch (error) {
      this.logger.error(
        `Failed to update product ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    try {
      return await this.productRepository.delete(id);
    } catch (error) {
      this.logger.error(
        `Failed to delete product ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async updateInventory(id: number, quantity: number): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    try {
      return await this.productRepository.updateInventory(id, quantity);
    } catch (error) {
      this.logger.error(
        `Failed to update inventory for product ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async findByCategory(category: string): Promise<Product[]> {
    try {
      return await this.productRepository.findByCategory(category);
    } catch (error) {
      this.logger.error(
        `Failed to find products by category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }
}
