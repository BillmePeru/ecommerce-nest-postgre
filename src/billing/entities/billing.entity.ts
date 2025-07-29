import { BaseEntity } from 'src/common/base.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, JoinColumn } from 'typeorm';

@Entity('billing')
export class Billing extends BaseEntity {
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'payload', type: 'text' })
  payload: string;

  @Column({ length: 100 })
  description: string;

  @Column({ type: 'text' })
  xmlDocument: string;

  @Column({ type: 'text', nullable: true })
  cdrResult: string;

  @Column({ type: 'text', nullable: true })
  xmlResult: string;
}
