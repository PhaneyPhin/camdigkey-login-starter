import { Module } from '@nestjs/common';
import { MinioProvider } from './minio.provider';
import { MinioService } from './minio.service';
import { FileController } from './file/file.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [],
  providers: [MinioProvider, MinioService],
  exports: [MinioService],
  controllers: [FileController]
})
export class MinioModule {}
