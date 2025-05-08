// common/common.module.ts
import { UserEntity } from "@modules/admin/access/users/user.entity";
import { UsersService } from "@modules/admin/access/users/users.service";
import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLogController } from "./audit/audit-log.controller";
import { AuditLogEntity } from "./audit/audit-log.entity";
import { AuditLogService } from "./audit/audit.service";

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity, UserEntity])],
  providers: [AuditLogService, UsersService],
  controllers: [AuditLogController],
  exports: [AuditLogService],
})
@Global()
export class CommonModule {}
