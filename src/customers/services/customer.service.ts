import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { Customer } from '../entities/customer.entity';
import { DatabaseError } from '../../common/errors/database.error';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(private readonly customerRepository: CustomerRepository) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findById(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }
    return customer;
  }

  async create(customerData: Partial<Customer>): Promise<Customer> {
    try {
      // Check if email already exists
      const existingCustomer = await this.customerRepository.findByEmail(
        customerData.email!,
      );
      if (existingCustomer) {
        throw DatabaseError.duplicateEntry(
          'Customer',
          'email',
          customerData.email!,
        );
      }

      return await this.customerRepository.create(customerData);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      this.logger.error(
        `Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async update(
    id: number,
    customerData: Partial<Customer>,
  ): Promise<Customer | null> {
    // Ensure customer exists
    const customer = await this.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    try {
      // If email is being updated, check if it's already in use
      if (customerData.email) {
        const existingCustomer = await this.customerRepository.findByEmail(
          customerData.email,
        );
        if (existingCustomer && existingCustomer.id !== id) {
          throw DatabaseError.duplicateEntry(
            'Customer',
            'email',
            customerData.email,
          );
        }
      }

      return await this.customerRepository.update(id, customerData);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      this.logger.error(
        `Failed to update customer ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    // Ensure customer exists
    await this.findById(id);

    try {
      return await this.customerRepository.delete(id);
    } catch (error) {
      this.logger.error(
        `Failed to delete customer ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async findByName(name: string): Promise<Customer[]> {
    try {
      return await this.customerRepository.findByName(name);
    } catch (error) {
      this.logger.error(
        `Failed to find customers by name ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw DatabaseError.queryFailed(
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) },
      );
    }
  }

  async findActiveCustomers(): Promise<Customer[]> {
    try {
      return await this.customerRepository.findActiveCustomers();
    } catch (error) {
      this.logger.error(
        `Failed to find active customers: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
