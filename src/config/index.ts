import { IConfig } from './config.intrface';
import postgresConfig from './potgres.config';
import sessionsRedisConfig from './sessionRedis.config';

export default (): IConfig => ({
  postgres: postgresConfig(),
  sessionRedis: sessionsRedisConfig(),
});
