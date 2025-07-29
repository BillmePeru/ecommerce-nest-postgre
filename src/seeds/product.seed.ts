import { DataSource } from 'typeorm';
import { BaseSeed } from './base.seed';
import { Product } from '../products/entities/product.entity';

/**
 * Seed data for products
 */
export class ProductSeed extends BaseSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const productRepository = this.dataSource.getRepository(Product);
    const isEmpty = await this.isTableEmpty('products');

    if (!isEmpty) {
      this.log('Products table is not empty. Skipping seed.');
      return;
    }

    this.log('Seeding products...');

    const products: Partial<Product>[] = [
      {
        name: 'Smartphone X',
        description: 'Latest smartphone with advanced features',
        price: 799.99,
        inventory: 50,
        sku: 'PHONE-X-001',
        categories: ['electronics', 'smartphones'],
        attributes: {
          color: 'Black',
          storage: '128GB',
          camera: '48MP',
        },
        imageUrl: 'https://example.com/images/smartphone-x.jpg',
        weight: 0.35,
        dimensions: {
          length: 15,
          width: 7.5,
          height: 0.8,
          unit: 'cm',
        },
      },
      {
        name: 'Laptop Pro',
        description: 'High-performance laptop for professionals',
        price: 1299.99,
        inventory: 25,
        sku: 'LAPTOP-PRO-001',
        categories: ['electronics', 'computers', 'laptops'],
        attributes: {
          processor: 'Intel i7',
          ram: '16GB',
          storage: '512GB SSD',
          display: '15.6 inch',
        },
        imageUrl: 'https://example.com/images/laptop-pro.jpg',
        weight: 2.1,
        dimensions: {
          length: 35.8,
          width: 24.5,
          height: 1.8,
          unit: 'cm',
        },
      },
      {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones',
        price: 199.99,
        inventory: 100,
        sku: 'AUDIO-HP-001',
        categories: ['electronics', 'audio', 'accessories'],
        attributes: {
          color: 'Silver',
          batteryLife: '20 hours',
          connectivity: 'Bluetooth 5.0',
        },
        imageUrl: 'https://example.com/images/wireless-headphones.jpg',
        weight: 0.25,
        dimensions: {
          length: 18,
          width: 15,
          height: 8,
          unit: 'cm',
        },
      },
      {
        name: 'Smart Watch',
        description: 'Fitness and health tracking smart watch',
        price: 249.99,
        inventory: 75,
        sku: 'WATCH-SW-001',
        categories: ['electronics', 'wearables', 'fitness'],
        attributes: {
          color: 'Black',
          display: 'AMOLED',
          waterproof: true,
          sensors: ['heart rate', 'GPS', 'accelerometer'],
        },
        imageUrl: 'https://example.com/images/smart-watch.jpg',
        weight: 0.05,
        dimensions: {
          length: 4.2,
          width: 3.6,
          height: 1.2,
          unit: 'cm',
        },
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable waterproof bluetooth speaker',
        price: 89.99,
        inventory: 120,
        sku: 'AUDIO-BS-001',
        categories: ['electronics', 'audio', 'accessories'],
        attributes: {
          color: 'Blue',
          batteryLife: '12 hours',
          waterproof: true,
        },
        imageUrl: 'https://example.com/images/bluetooth-speaker.jpg',
        weight: 0.45,
        dimensions: {
          length: 18,
          width: 7,
          height: 7,
          unit: 'cm',
        },
      },
    ];

    for (const productData of products) {
      const product = productRepository.create(productData);
      await productRepository.save(product);
    }

    this.log(`Seeded ${products.length} products successfully`);
  }
}
