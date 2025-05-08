import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AuditLog1742568476568 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "audit_log",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "action",
            type: "varchar",
          },
          {
            name: "resource_id",
            type: "varchar",
          },
          {
            name: "resource_type",
            type: "varchar",
          },
          {
            name: "fields",
            type: "varchar",
          },
          {
            name: "actor_id",
            type: "varchar",
          },
          {
            name: "old_data",
            type: "json",
            isNullable: true,
          },
          {
            name: "new_data",
            type: "json",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("audit_log");
  }
}
