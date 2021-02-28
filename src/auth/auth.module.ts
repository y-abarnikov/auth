import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from "../users/users.module";
import {RegistrationKeysModule} from "../registration-keys/registration-keys.module";

@Module({
  imports: [UsersModule, RegistrationKeysModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
