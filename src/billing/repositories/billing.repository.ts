import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Billing } from '../entities/billing.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BillingRepository extends BaseRepository<Billing> {
  protected readonly logger = new Logger(BillingRepository.name);

  constructor(
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
  ) {
    super(billingRepository);
  }
}
