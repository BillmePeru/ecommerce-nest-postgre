import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @ApiProperty({ description: 'Product name', example: 'iPhone 14 Pro' })
  @Column({ length: 100 })
  @Index()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced features',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Product price', example: 999.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Available inventory quantity', example: 50 })
  @Column({ default: 0 })
  inventory: number;

  @ApiProperty({ description: 'Whether the product is active', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Product SKU',
    example: 'IPH14PRO-128GB',
    required: false,
  })
  @Column({ length: 50, nullable: true })
  sku: string;

  @ApiProperty({
    description: 'Product categories',
    example: ['Electronics', 'Smartphones'],
    required: false,
  })
  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @ApiProperty({
    description: 'Product attributes',
    example: { color: 'Space Black', storage: '128GB' },
    required: false,
  })
  @Column({ type: 'simple-json', nullable: true })
  attributes: Record<string, any>;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/iphone14pro.jpg',
    required: false,
  })
  @Column({ nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Product weight in kg', example: 0.206 })
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  weight: number;

  @ApiProperty({
    description: 'Product dimensions',
    example: { length: 14.75, width: 7.15, height: 0.79, unit: 'cm' },
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}
