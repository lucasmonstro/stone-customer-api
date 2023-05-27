import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { UnavailableCacheException } from '../../../../../src/cache/exceptions';
import { CacheRepository } from '../../../../../src/cache/repositories';
import { GetCustomerRepository } from '../../../../../src/customers/repositories';
import { makeCustomer } from '../../../../mocks/customers/models/customer.model';

describe('GetCustomerRepository', () => {
  let cacheRepository: CacheRepository;
  let getCustomerRepository: GetCustomerRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CacheRepository, GetCustomerRepository],
    })
      .overrideProvider(CacheRepository)
      .useValue({ get: jest.fn() })
      .compile();
    cacheRepository = moduleRef.get<CacheRepository>(CacheRepository);
    getCustomerRepository = moduleRef.get<GetCustomerRepository>(
      GetCustomerRepository,
    );
  });

  it('should return null when Customer is not found in cache', async () => {
    jest.spyOn(cacheRepository, 'get').mockResolvedValueOnce(null);
    const customerId = faker.string.uuid();
    const result = await getCustomerRepository.execute(customerId);
    expect(result).toBeNull();
  });

  it('should throw UnavailableCacheException when cache is not available', async () => {
    jest.spyOn(cacheRepository, 'get').mockImplementationOnce(() => {
      throw new Error();
    });
    const customerId = faker.string.uuid();
    await expect(getCustomerRepository.execute(customerId)).rejects.toThrow(
      UnavailableCacheException,
    );
  });

  it('should return Customer when Customer is found in cache', async () => {
    const mockedCustomer = makeCustomer();
    jest
      .spyOn(cacheRepository, 'get')
      .mockResolvedValueOnce(mockedCustomer.toCache());
    const result = await getCustomerRepository.execute(mockedCustomer.id);
    expect(result).toStrictEqual(mockedCustomer);
  });
});
