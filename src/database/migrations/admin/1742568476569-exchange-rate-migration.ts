import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ExchangeRateMigration1742568476569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "exchange_rate",
        columns: [
          {
            name: "date",
            type: "date",
            isPrimary: true,
          },
          {
            name: "rate",
            type: "float",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("exchange_rate");
  }
}
