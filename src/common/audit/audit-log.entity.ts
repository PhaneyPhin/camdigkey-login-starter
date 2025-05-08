import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("audit_log")
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column()
  resource_id: string;

  @Column()
  resource_type: string;

  @Column()
  fields: string;

  @Column()
  actor_id: string;

  @Column({ type: "json", nullable: true })
  old_data: Record<string, any>;

  @Column({ type: "json", nullable: true })
  new_data: Record<string, any>;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;
}
