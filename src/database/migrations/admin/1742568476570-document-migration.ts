import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateInvoiceTableWithDraftSupport1742568476570
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "document",
        columns: [
          {
            name: "document_id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "document_number",
            type: "varchar",
            isNullable: true, // draft safe
            length: "100",
          },
          {
            name: "issue_date",
            type: "date",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            length: "40",
            isNullable: true,
          },
          {
            name: "due_date",
            type: "date",
            isNullable: true,
          },
          {
            name: "note",
            type: "varchar",
            isNullable: true,
            length: "100",
          },
          {
            name: "payment_term",
            type: "varchar",
            isNullable: true,
            length: "100",
          },
          {
            name: "paymentNote",
            type: "varchar",
            isNullable: true,
            length: "100",
          },
          {
            name: "exchange_rate",
            type: "numeric",
            isNullable: true,
          },
          {
            name: "currency",
            type: "varchar",
            isNullable: true,
            length: "100",
          },
          {
            name: "sub_total",
            type: "numeric",
            isNullable: true,
          },
          {
            name: "invoice_lines",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "allowance_charges",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "invoice_type",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "prepaid_payment",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "additional_document_references",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "reference_document_id",
            type: "varchar",
            isNullable: true,
            length: "100",
          },
          {
            name: "reference_document_number",
            type: "varchar",
            isNullable: true,
            length: "100",
          },

          {
            name: "document_type",
            type: "varchar",
            isNullable: false,
            length: "100",
          },
          {
            name: "customer_id",
            type: "integer",
            isNullable: true, // drafts might not have buyer yet
          },
          {
            name: "supplier_id",
            type: "varchar",
            length: "100",
            isNullable: true, // drafts might not have buyer yet
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "NOW()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "NOW()",
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      "document",
      new TableForeignKey({
        columnNames: ["customer_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "customer",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("document");
  }
}
