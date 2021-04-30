import { Request } from 'express';
import User from '../../users/entities/user.entity';

export default interface RequestWithUser extends Request {
  user: User;
}
