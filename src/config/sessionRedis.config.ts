import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { RedisModuleOptions } from 'nestjs-redis';

const environment = process.env.NODE_ENV || 'development';
const fileConfigPath = `.env.${environment}`;
const env: any = fs.existsSync(fileConfigPath)
  ? dotenv.parse(fs.readFileSync(fileConfigPath))
  : dotenv.parse(fs.readFileSync('.env'));

export default (): RedisModuleOptions => ({
  host: env.SESSION_REDIS_HOST || 'redis',
  port: Number.parseInt(env.SESSION_REDIS_PORT, 10) || 6379,
});
