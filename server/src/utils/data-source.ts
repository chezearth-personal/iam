import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from 'config';

const postgresConfig = config.get<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>('postgresConfig');

const AppDataSource = new DataSource({
  ...postgresConfig,
  type: 'postgres',
  synchronize: false,
  logging: false,
  entities: ['entities/**/*.entity{.ts,.js}'],
  migrations: ['migrations/**/*{.ts,.js}'],
  subscribers: ['subscribers/**/*{.ts,.js}']
});

export { AppDataSource };
