import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { commonFields } from "../common.fields";

const tableName = "customer";

export class CustomerMigration1742568476568 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: tableName,
        columns: [
          {
            name: "id",
            type: "integer",
            isGenerated: true,
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "endpoint_id",
            type: "varchar",
            length: "160",
            isNullable: true,
          },
          {
            name: "supplier_id",
            type: "varchar",
            length: "160",
            isNullable: false,
          },

          {
            name: "moc_id",
            type: "varchar",
            length: "160",
            isNullable: true,
          },
          {
            name: "entity_name_en",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "entity_name_kh",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "tin",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "date_of_incorporation",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "business_type",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "city",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "country",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "phone_number",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "email",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "description",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "address",
            type: "varchar",
            length: "160",
            isNullable: true,
          },

          {
            name: "created_by",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "updated_by",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "active",
            type: "boolean",
            isNullable: false,
            default: true,
          },
          ...commonFields,
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    await queryRunner.dropTable(tableName, true);
  }
}
