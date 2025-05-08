import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import { commonFields } from "../common.fields";

const tableName = "admin.users";

export class createUsersTable1610321042350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: tableName,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            isGenerated: true,
            isNullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "email",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "is_supper_user",
            type: "boolean",
            default: false,
          },
          {
            name: "mobile_phone",
            type: "varchar",
            length: "20",
            isNullable: true,
            isUnique: true,
          },
          {
            name: "extra_email",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "extra_mobile_phone",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "is_super_user",
            type: "boolean",
            default: false,
          },
          {
            name: "personal_code",
            type: "varchar",
            length: "20",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "date_of_birth",
            type: "date",
            isNullable: true,
          },
          {
            name: "first_name_kh",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "last_name_kh",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "first_name_en",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "last_name_en",
            type: "varchar",
            length: "100",
            isNullable: true,
          },

          {
            name: "camdigikey_id",
            type: "varchar",
            length: "20",
            isNullable: true,
            isUnique: true,
          },
          {
            name: "gender",
            type: "varchar",
            length: "10",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            isNullable: false,
            default: `'ACTIVE'`,
          },
          {
            name: "endpoint_id",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "entity_role",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "logo_file_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "lastModifiedById",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "logsId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "created_by",
            type: "uuid",
            isNullable: true,
          },
          ...commonFields,
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      tableName,
      new TableForeignKey({
        columnNames: ["created_by"],
        referencedColumnNames: ["id"],
        referencedTableName: tableName,
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("created_by") !== -1
    );
    await queryRunner.dropForeignKey(tableName, foreignKey);
    await queryRunner.dropTable(tableName);
  }
}
