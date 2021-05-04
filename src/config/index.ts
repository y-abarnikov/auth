import { IConfig } from './config.intrface';
import postgresConfig from './potgres.config';

export default (): IConfig => ({
  postgres: postgresConfig(),
});
