import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BaseRepository } from '../../common/base.repository';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';

@Injectable()
export class OrderRepository extends BaseRepository<Order> {
  protected readonly logger = new Logger(OrderRepository.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    super(orderRepository);
  }

  async findByCustomerId(customerId: number): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        where: { customerId },
        order: { orderDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Error finding orders for customer ${customerId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        where: { status },
        order: { orderDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Error finding orders with status ${status}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        where: {
          orderDate: Between(startDate, endDate),
        },
        order: { orderDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Error finding orders between ${startDate.toString()} and ${endDate.toString()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    try {
      await this.orderRepository.update(id, { status });
      return this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error updating status for order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async updatePaymentStatus(
    id: number,
    paymentStatus: PaymentStatus,
  ): Promise<Order | null> {
    try {
      await this.orderRepository.update(id, { paymentStatus });
      return this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error updating payment status for order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async confirmPayment(id: number): Promise<Order | null> {
    try {
      await this.orderRepository.update(id, {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
      });

      return this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error confirming payment for order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
