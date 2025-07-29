import { DataSource } from 'typeorm';
import { BaseSeed } from './base.seed';
import { Customer } from '../customers/entities/customer.entity';

/**
 * Seed data for customers
 */
export class CustomerSeed extends BaseSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const customerRepository = this.dataSource.getRepository(Customer);
    const isEmpty = await this.isTableEmpty('customers');

    if (!isEmpty) {
      this.log('Customers table is not empty. Skipping seed.');
      return;
    }

    this.log('Seeding customers...');

    const customers: Partial<Customer>[] = [
      {
        typeDocument: 'DNI',
        numberDocument: '12345678',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
        },
        dateOfBirth: new Date('1985-07-15'),
        preferences: {
          newsletter: true,
          marketingEmails: false,
        },
        notes: 'Prefers email communication',
      },
      {
        typeDocument: 'DNI',
        numberDocument: '87654321',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
        address: {
          street: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          postalCode: '67890',
          country: 'USA',
        },
        dateOfBirth: new Date('1990-03-22'),
        preferences: {
          newsletter: true,
          marketingEmails: true,
        },
      },
      {
        typeDocument: 'RUC',
        numberDocument: '20123456789',
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.johnson@example.com',
        phone: '555-456-7890',
        address: {
          street: '789 Pine Rd',
          city: 'Elsewhere',
          state: 'TX',
          postalCode: '45678',
          country: 'USA',
        },
        dateOfBirth: new Date('1978-11-30'),
        preferences: {
          newsletter: false,
          marketingEmails: false,
        },
        notes: 'Prefers phone communication',
      },
      {
        typeDocument: 'CE',
        numberDocument: '001234567',
        firstName: 'Emily',
        lastName: 'Brown',
        email: 'emily.brown@example.com',
        phone: '555-234-5678',
        address: {
          street: '321 Elm St',
          city: 'Nowhere',
          state: 'FL',
          postalCode: '34567',
          country: 'USA',
        },
        dateOfBirth: new Date('1995-05-12'),
        preferences: {
          newsletter: true,
          marketingEmails: false,
        },
      },
      {
        typeDocument: 'DNI',
        numberDocument: '45678912',
        firstName: 'Michael',
        lastName: 'Wilson',
        email: 'michael.wilson@example.com',
        phone: '555-876-5432',
        address: {
          street: '654 Maple Ave',
          city: 'Somewhere Else',
          state: 'WA',
          postalCode: '23456',
          country: 'USA',
        },
        dateOfBirth: new Date('1982-09-18'),
        preferences: {
          newsletter: true,
          marketingEmails: true,
        },
        notes: 'VIP customer',
      },
    ];

    for (const customerData of customers) {
      const customer = customerRepository.create(customerData);
      await customerRepository.save(customer);
    }

    this.log(`Seeded ${customers.length} customers successfully`);
  }
}
