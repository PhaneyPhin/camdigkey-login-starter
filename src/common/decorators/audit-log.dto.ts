import { SetMetadata } from "@nestjs/common";

export const AUDIT_META_KEY = "AUDIT_LOG";

export const AuditLog = (action: string, resource: string) =>
  SetMetadata(AUDIT_META_KEY, { action, resource });
