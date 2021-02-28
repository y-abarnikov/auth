import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { ConnectionOptions } from 'typeorm';

const environment = process.env.NODE_ENV || 'development';
const fileConfigPath = `.env.${environment}`;
const env: any = fs.existsSync(fileConfigPath)
  ? dotenv.parse(fs.readFileSync(fileConfigPath))
  : dotenv.parse(fs.readFileSync('.env'));

export default (): ConnectionOptions => ({
    type: env.DATABASE_TYPE || 'postgres',
    host: env.DATABASE_HOST || 'postgres',
    port: env.DATABASE_PORT || 5432,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    entities: [path.join(process.cwd(), `dist/**/*.entity{.ts,.js}`)],

    // We are using migrations, synchronize should be set to false.
    synchronize: true,
});
