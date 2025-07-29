import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { DatabaseError } from '../../common/errors/database.error';
import { CustomerService } from '../../customers/services/customer.service';
import { ProductService } from '../../products/services/product.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { BillingService } from 'src/billing/services/billing.service';
import { getIgv } from 'src/shared/functions';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly customerService: CustomerService,
    private readonly productService: ProductService,
    private readonly billingService: BillingService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async findById(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByCustomerId(customerId: number): Promise<Order[]> {
    // Verify customer exists
    await this.customerService.findById(customerId);
    return this.orderRepository.findByCustomerId(customerId);
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderRepository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return this.orderRepository.findByDateRange(startDate, endDate);
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Verify customer exists
      await this.customerService.findById(createOrderDto.customerId);

      // Calculate order totals
      let subtotal = 0;
      let tax = 0;
      const orderItems: OrderItem[] = [];

      // Process each item in the order
      for (const item of createOrderDto.items) {
        // Verify product exists and get current price
        const product = await this.productService.findById(item.productId);

        // Check inventory
        if (product.inventory < item.quantity) {
          throw new Error(`Insufficient inventory for product ${product.name}`);
        }

        // Create order item
        const orderItem = new OrderItem();
        orderItem.productId = item.productId;
        orderItem.quantity = item.quantity;
        orderItem.price = product.price;
        orderItem.discount = item.discount || 0;
        orderItem.notes = item.notes!;

        // Add to items array
        orderItems.push(orderItem);

        // Update subtotal
        subtotal += (product.price - (item.discount || 0)) * item.quantity;

        // Update tax
        tax += getIgv(product.price);

        // Update inventory
        await this.productService.updateInventory(
          product.id,
          product.inventory - item.quantity,
        );
      }

      // Create the order
      const order = new Order();
      order.customerId = createOrderDto.customerId;
      order.shippingAddress = createOrderDto.shippingAddress;
      order.billingAddress =
        createOrderDto.billingAddress || createOrderDto.shippingAddress;
      order.notes = createOrderDto.notes!;
      order.status = OrderStatus.PENDING;
      order.tax = tax;
      order.shipping = createOrderDto.shipping || 0;
      order.discount = createOrderDto.discount || 0;
      order.total = subtotal + order.tax + order.shipping - order.discount;
      order.items = orderItems;

      // Save the order
      return await this.orderRepository.create(order);
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    // Verify order exists
    const order = await this.findById(id);

    // Only pending or processing orders can be updated
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new Error(`Cannot update order with status ${order.status}`);
    }

    try {
      return await this.orderRepository.updateStatus(id, status);
    } catch (error) {
      this.logger.error(
        `Failed to update order status ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async updatePaymentStatus(
    id: number,
    paymentStatus: PaymentStatus,
  ): Promise<Order | null> {
    // Verify order exists
    const order = await this.findById(id);

    // Only pending orders can be paid
    if (order.status !== OrderStatus.PENDING) {
      throw new Error(
        `Cannot update payment status for order with status ${order.status}`,
      );
    }

    try {
      return await this.orderRepository.updatePaymentStatus(id, paymentStatus);
    } catch (error) {
      this.logger.error(
        `Failed to update order payment status ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async cancel(id: number): Promise<Order | null> {
    const order = await this.findById(id);

    // Only pending or processing orders can be cancelled
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new Error(`Cannot cancel order with status ${order.status}`);
    }

    try {
      // Restore inventory for each item
      for (const item of order.items) {
        const product = await this.productService.findById(item.productId);
        await this.productService.updateInventory(
          product.id,
          product.inventory + item.quantity,
        );
      }

      // Update order status
      return await this.orderRepository.updateStatus(id, OrderStatus.CANCELLED);
    } catch (error) {
      this.logger.error(
        `Failed to cancel order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    // Verify order exists
    const order = await this.findById(id);

    // Only cancelled orders can be deleted
    if (order.status !== OrderStatus.CANCELLED) {
      throw new Error(
        `Cannot delete order with status ${order.status}. Cancel the order first.`,
      );
    }

    try {
      return await this.orderRepository.delete(id);
    } catch (error) {
      this.logger.error(
        `Failed to delete order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async confirmPayment(id: number): Promise<Order | null> {
    // Verify order exists
    const order = await this.findById(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Only pending orders can be paid
    if (order.status !== OrderStatus.PENDING) {
      throw new InternalServerErrorException(
        `Cannot confirm payment for order with status ${order.status}`,
      );
    }

    try {
      const payment = await this.orderRepository.confirmPayment(id);
      if (!payment) {
        throw new InternalServerErrorException(
          `Failed to confirm payment for order ${id}`,
        );
      }

      this.billingService.sendBilling(order);

      return payment;
    } catch (error) {
      this.logger.error(
        `Failed to confirm payment for order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
