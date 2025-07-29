import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../common/base.repository';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemRepository extends BaseRepository<OrderItem> {
  protected readonly logger = new Logger(OrderItemRepository.name);

  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {
    super(orderItemRepository);
  }

  async findByOrderId(orderId: number): Promise<OrderItem[]> {
    try {
      return await this.orderItemRepository.find({
        where: { orderId },
        relations: ['product'],
      });
    } catch (error) {
      this.logger.error(
        `Error finding items for order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findByProductId(productId: number): Promise<OrderItem[]> {
    try {
      return await this.orderItemRepository.find({
        where: { productId },
        relations: ['order'],
      });
    } catch (error) {
      this.logger.error(
        `Error finding order items with product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
