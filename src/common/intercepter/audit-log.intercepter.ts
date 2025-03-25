import { AuditLogService } from "@common/audit/audit.service";
import { AUDIT_META_KEY } from "@common/decorators/audit-log.dto";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditLogService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.get(AUDIT_META_KEY, context.getHandler());

    if (!auditMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;

    return next.handle().pipe(
      tap(async (result) => {
        const resourceId = result?.id || request.params?.id || "unknown";

        // Optional: if controller sets oldData in request.locals (e.g., from service layer)
        const oldData = request.locals?.oldData || null;

        await this.auditService.logAction({
          actorId: currentUser?.id || "anonymous",
          action: auditMeta.action,
          resourceId,
          resourceType: auditMeta.resource,
          fields: auditMeta.fields || [],
          oldData,
          newData: result || null,
        });
      })
    );
  }
}
