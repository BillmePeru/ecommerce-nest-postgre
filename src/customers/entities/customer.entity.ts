import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';

export type TypeDocument = 'RUC' | 'DNI' | 'CE';

@Entity('customers')
export class Customer extends BaseEntity {
  @ApiProperty({
    description: 'Type of document',
    enum: ['RUC', 'DNI', 'CE'],
    example: 'DNI',
  })
  @Column({ length: 100 })
  typeDocument: TypeDocument;

  @ApiProperty({ description: 'Document number', example: '12345678' })
  @Column({ length: 100 })
  numberDocument: string;

  @ApiProperty({ description: 'Customer first name', example: 'John' })
  @Column({ length: 100 })
  firstName: string;

  @ApiProperty({ description: 'Customer last name', example: 'Doe' })
  @Column({ length: 100 })
  lastName: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @Column({ length: 255 })
  @Index({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+1-555-123-4567',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({
    description: 'Customer address',
    example: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @ApiProperty({ description: 'Whether the customer is active', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Customer date of birth',
    example: '1985-07-15',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @ApiProperty({
    description: 'Customer preferences',
    example: { newsletter: true, marketingEmails: false },
    required: false,
  })
  @Column({ type: 'simple-json', nullable: true })
  preferences: Record<string, any>;

  @ApiProperty({
    description: 'Additional notes about the customer',
    example: 'VIP customer',
    required: false,
  })
  @Column({ nullable: true })
  notes: string;

  // Virtual property to get full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
