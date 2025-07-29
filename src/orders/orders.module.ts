import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';
import { BillingModule } from 'src/billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CustomersModule,
    ProductsModule,
    BillingModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, OrderItemRepository],
  exports: [OrderService],
})
export class OrdersModule {}
