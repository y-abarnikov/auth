import { Module } from '@nestjs/common';
import { ConnectionOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ConnectRedis from 'connect-redis';
import * as session from 'express-session';
import { RedisService } from 'nestjs-redis';
import { RedisModule, RedisModuleOptions } from 'nestjs-redis';
import { NestSessionOptions, SessionModule } from 'nestjs-session';
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
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): RedisModuleOptions => {
        return configService.get<RedisModuleOptions>('sessionRedis');
      },
    }),
    SessionModule.forRootAsync({
      imports: [RedisModule, ConfigModule],
      inject: [RedisService, ConfigService],
      useFactory: (
        redisService: RedisService,
        configService: ConfigService,
      ): NestSessionOptions => {
        const redisClient = redisService.getClient();
        const RedisStore = ConnectRedis(session);
        const store = new RedisStore({ client: redisClient as any });
        return {
          session: {
            store,
            secret: configService.get<string>('SESSION_SECRET'),
          },
        };
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
