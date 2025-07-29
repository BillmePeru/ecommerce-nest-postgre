import { DataSource } from 'typeorm';
import { BaseSeed } from './base.seed';
import {
  Order,
  OrderStatus,
  PaymentStatus,
} from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';

/**
 * Seed data for orders
 */
export class OrderSeed extends BaseSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const orderRepository = this.dataSource.getRepository(Order);
    const orderItemRepository = this.dataSource.getRepository(OrderItem);
    const customerRepository = this.dataSource.getRepository(Customer);
    const productRepository = this.dataSource.getRepository(Product);

    const isEmpty = await this.isTableEmpty('orders');

    if (!isEmpty) {
      this.log('Orders table is not empty. Skipping seed.');
      return;
    }

    // Check if customers and products exist
    const customersCount = await customerRepository.count();
    const productsCount = await productRepository.count();

    if (customersCount === 0 || productsCount === 0) {
      this.log('Customers or products missing. Please run those seeds first.');
      return;
    }

    this.log('Seeding orders...');

    // Get all customers and products for reference
    const customers = await customerRepository.find();
    const products = await productRepository.find();

    // Create sample orders
    const orders: Partial<Order>[] = [
      {
        customerId: customers[0].id,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        total: 999.98,
        tax: 80.0,
        shipping: 15.0,
        discount: 0,
        trackingNumber: 'TRK123456789',
        shippingAddress: {
          street: customers[0].address.street,
          city: customers[0].address.city,
          state: customers[0].address.state,
          postalCode: customers[0].address.postalCode,
          country: customers[0].address.country,
        },
        billingAddress: {
          street: customers[0].address.street,
          city: customers[0].address.city,
          state: customers[0].address.state,
          postalCode: customers[0].address.postalCode,
          country: customers[0].address.country,
        },
        notes: 'Priority shipping',
        orderDate: new Date('2025-06-01T10:30:00'),
        shippedDate: new Date('2025-06-02T14:20:00'),
        deliveredDate: new Date('2025-06-05T09:15:00'),
      },
      {
        customerId: customers[1].id,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        total: 199.99,
        tax: 16.0,
        shipping: 0,
        discount: 20.0,
        shippingAddress: {
          street: customers[1].address.street,
          city: customers[1].address.city,
          state: customers[1].address.state,
          postalCode: customers[1].address.postalCode,
          country: customers[1].address.country,
        },
        billingAddress: {
          street: customers[1].address.street,
          city: customers[1].address.city,
          state: customers[1].address.state,
          postalCode: customers[1].address.postalCode,
          country: customers[1].address.country,
        },
        notes: 'Gift wrapping requested',
        orderDate: new Date('2025-07-10T15:45:00'),
      },
      {
        customerId: customers[2].id,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        total: 89.99,
        tax: 7.2,
        shipping: 5.0,
        discount: 0,
        shippingAddress: {
          street: customers[2].address.street,
          city: customers[2].address.city,
          state: customers[2].address.state,
          postalCode: customers[2].address.postalCode,
          country: customers[2].address.country,
        },
        billingAddress: {
          street: customers[2].address.street,
          city: customers[2].address.city,
          state: customers[2].address.state,
          postalCode: customers[2].address.postalCode,
          country: customers[2].address.country,
        },
        orderDate: new Date('2025-07-15T09:20:00'),
      },
      {
        customerId: customers[3].id,
        status: OrderStatus.SHIPPED,
        paymentStatus: PaymentStatus.PAID,
        total: 1299.99,
        tax: 104.0,
        shipping: 0,
        discount: 0,
        trackingNumber: 'TRK987654321',
        shippingAddress: {
          street: customers[3].address.street,
          city: customers[3].address.city,
          state: customers[3].address.state,
          postalCode: customers[3].address.postalCode,
          country: customers[3].address.country,
        },
        billingAddress: {
          street: customers[3].address.street,
          city: customers[3].address.city,
          state: customers[3].address.state,
          postalCode: customers[3].address.postalCode,
          country: customers[3].address.country,
        },
        notes: 'Express shipping',
        orderDate: new Date('2025-07-12T11:30:00'),
        shippedDate: new Date('2025-07-13T16:45:00'),
      },
      {
        customerId: customers[4].id,
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
        total: 289.98,
        tax: 23.2,
        shipping: 10.0,
        discount: 0,
        shippingAddress: {
          street: customers[4].address.street,
          city: customers[4].address.city,
          state: customers[4].address.state,
          postalCode: customers[4].address.postalCode,
          country: customers[4].address.country,
        },
        billingAddress: {
          street: customers[4].address.street,
          city: customers[4].address.city,
          state: customers[4].address.state,
          postalCode: customers[4].address.postalCode,
          country: customers[4].address.country,
        },
        notes: 'Customer requested cancellation',
        orderDate: new Date('2025-07-05T14:20:00'),
      },
    ];

    // Save orders and create order items
    for (const orderData of orders) {
      const order = orderRepository.create(orderData);
      const savedOrder = await orderRepository.save(order);

      // Create order items based on the order
      await this.createOrderItems(savedOrder, products, orderItemRepository);
    }

    this.log(`Seeded ${orders.length} orders successfully`);
  }

  /**
   * Create order items for an order
   */
  private async createOrderItems(
    order: Order,
    products: Product[],
    orderItemRepository: ReturnType<DataSource['getRepository']>,
  ): Promise<void> {
    // Create different items based on order status
    let orderItems: Partial<OrderItem>[] = [];

    switch (order.status) {
      case OrderStatus.DELIVERED:
        // First order - smartphone and headphones
        orderItems = [
          {
            orderId: order.id,
            productId: products[0].id, // Smartphone
            quantity: 1,
            price: products[0].price,
            discount: 0,
          },
          {
            orderId: order.id,
            productId: products[2].id, // Wireless Headphones
            quantity: 1,
            price: products[2].price,
            discount: 0,
          },
        ];
        break;

      case OrderStatus.PROCESSING:
        // Second order - smart watch
        orderItems = [
          {
            orderId: order.id,
            productId: products[3].id, // Smart Watch
            quantity: 1,
            price: products[3].price,
            discount: 20.0,
            notes: 'Promotional discount applied',
          },
        ];
        break;

      case OrderStatus.PENDING:
        // Third order - bluetooth speaker
        orderItems = [
          {
            orderId: order.id,
            productId: products[4].id, // Bluetooth Speaker
            quantity: 1,
            price: products[4].price,
            discount: 0,
          },
        ];
        break;

      case OrderStatus.SHIPPED:
        // Fourth order - laptop
        orderItems = [
          {
            orderId: order.id,
            productId: products[1].id, // Laptop Pro
            quantity: 1,
            price: products[1].price,
            discount: 0,
          },
        ];
        break;

      case OrderStatus.CANCELLED:
        // Fifth order - headphones and speaker
        orderItems = [
          {
            orderId: order.id,
            productId: products[2].id, // Wireless Headphones
            quantity: 1,
            price: products[2].price,
            discount: 0,
          },
          {
            orderId: order.id,
            productId: products[4].id, // Bluetooth Speaker
            quantity: 1,
            price: products[4].price,
            discount: 0,
          },
        ];
        break;
    }

    // Save all order items
    for (const itemData of orderItems) {
      const orderItem = orderItemRepository.create(itemData);
      await orderItemRepository.save(orderItem);
    }
  }
}
