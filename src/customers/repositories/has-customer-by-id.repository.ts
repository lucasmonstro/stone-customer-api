import { Injectable } from '@nestjs/common';
import { CacheRepository } from '@/core/repositories';
import { Customer } from '../models';

@Injectable()
export class HasCustomerByIdRepository {
  constructor(private cacheRepository: CacheRepository) {}

  async execute(customerId: string): Promise<boolean> {
    const customerCacheKey = Customer.getCacheKey(customerId);
    const hasCustomerById = await this.cacheRepository.keyExists(
      customerCacheKey,
    );
    return hasCustomerById;
  }
}
