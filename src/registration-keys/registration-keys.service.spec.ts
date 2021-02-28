import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationKeysService } from './registration-keys.service';

describe('UserRegistrationKeysService', () => {
  let service: RegistrationKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationKeysService],
    }).compile();

    service = module.get<RegistrationKeysService>(RegistrationKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
