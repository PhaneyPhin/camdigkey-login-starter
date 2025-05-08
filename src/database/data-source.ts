import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

ConfigModule.forRoot({
    envFilePath: '.env',
});

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('TYPEORM_HOST', 'localhost'),
  port: configService.get<number>('TYPEORM_PORT', 5432),
  username: configService.get<string>('TYPEORM_USERNAME', 'postgres'),
  password: configService.get<string>('TYPEORM_PASSWORD', 'password'),
  database: configService.get<string>('TYPEORM_DATABASE', 'nestjs_sample'),
  entities: [join(__dirname, '/../modules/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '/migrations/admin/*.{ts,js}')],
  logging: ['query'], // Enable query logging
  synchronize: false,
});
console.log( AppDataSource)