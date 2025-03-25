// common/common.module.ts
import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLogController } from "./audit/audit-log.controller";
import { AuditLogEntity } from "./audit/audit-log.entity";
import { AuditLogService } from "./audit/audit.service";

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [AuditLogService],
  controllers: [AuditLogController],
  exports: [AuditLogService],
})
@Global()
export class CommonModule {}
