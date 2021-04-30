import User from '../users/entities/user.entity';

export interface CreateFacility {
  serialNumber: string;
  manufacturer: string;
  model: string;
  registrationKey: string;
  user: User;
}
