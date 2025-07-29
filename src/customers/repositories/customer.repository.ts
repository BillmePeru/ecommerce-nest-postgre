import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../common/base.repository';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomerRepository extends BaseRepository<Customer> {
  protected readonly logger = new Logger(CustomerRepository.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {
    super(customerRepository);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    try {
      return await this.customerRepository.findOne({
        where: { email },
      });
    } catch (error) {
      this.logger.error(
        `Error finding customer by email ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findByName(name: string): Promise<Customer[]> {
    try {
      const searchTerm = `%${name.toLowerCase()}%`;
      return await this.customerRepository
        .createQueryBuilder('customer')
        .where('LOWER(customer.firstName) LIKE :searchTerm', { searchTerm })
        .orWhere('LOWER(customer.lastName) LIKE :searchTerm', { searchTerm })
        .getMany();
    } catch (error) {
      this.logger.error(
        `Error finding customers by name ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findActiveCustomers(): Promise<Customer[]> {
    try {
      return await this.customerRepository.find({
        where: { isActive: true },
      });
    } catch (error) {
      this.logger.error(
        `Error finding active customers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
