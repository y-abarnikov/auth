import { ConnectionOptions } from 'typeorm';
import { RedisModuleOptions } from 'nestjs-redis';

export interface IConfig {
  postgres: ConnectionOptions;
  sessionRedis: RedisModuleOptions;
}
