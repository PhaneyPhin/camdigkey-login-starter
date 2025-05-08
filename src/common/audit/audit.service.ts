import { BaseCrudService } from "@common/services/base-crud.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLogEntity } from "./audit-log.entity";

@Injectable()
export class AuditLogService extends BaseCrudService {
  protected FILTER_FIELDS: string[] = ["action", "description"];
  protected SEARCH_FIELDS: string[] = ["action", "description"];

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>
  ) {
    super();
  }

  protected getFilters() {
    return {};
  }

  protected queryName: string = "audit";

  protected getListQuery() {
    return this.auditRepo.createQueryBuilder(this.queryName);
  }

  protected getMapperResponseEntityFields() {
    return (a) => a;
  }

  /**
   * Create an audit log entry
   */
  async logAction({
    actorId,
    action,
    resourceId,
    resourceType,
    fields,
    oldData = null,
    newData = null,
  }: {
    actorId: string;
    action: string;
    resourceId: string;
    resourceType: string;
    fields: string[];
    oldData?: Record<string, any> | null;
    newData?: any | null;
  }): Promise<AuditLogEntity> {
    try {
      const audit = this.auditRepo.create({
        actor_id: actorId,
        action,
        resource_id: resourceId,
        resource_type: resourceType,
        fields: fields.join(","), // stored as comma-separated string
        old_data: oldData,
        new_data: newData,
      });

      return this.auditRepo.save(audit);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Retrieve audit logs by resource
   */
  async getLogsForResource(
    resourceType: string,
    resourceId: string
  ): Promise<AuditLogEntity[]> {
    return this.auditRepo.find({
      where: {
        resource_type: resourceType,
        resource_id: resourceId,
      },
      order: { created_at: "DESC" },
    });
  }

  /**
   * Retrieve audit logs for an actor (user)
   */
  async getLogsByActor(actorId: string): Promise<AuditLogEntity[]> {
    return this.auditRepo.find({
      where: { actor_id: actorId },
      order: { created_at: "DESC" },
    });
  }
}
