import { ConnectionOptions } from 'typeorm';

export interface IConfig {
  postgres: ConnectionOptions,
}
