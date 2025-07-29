import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Billing } from './entities/billing.entity';
import { BillingService } from './services/billing.service';
import { BillingRepository } from './repositories/billing.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Billing])],
  controllers: [],
  providers: [BillingService, BillingRepository],
  exports: [BillingService, BillingRepository],
})
export class BillingModule {}
