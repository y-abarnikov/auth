import { Module } from '@nestjs/common';
import { ConnectionOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { RegistrationKeysModule } from './registration-keys/registration-keys.module';
import { AppController } from './app.controller';
import CONFIG from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [CONFIG],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ConnectionOptions => {
        return configService.get<ConnectionOptions>('postgres');
      },
    }),
    AuthModule,
    UsersModule,
    FacilitiesModule,
    RegistrationKeysModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
