import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("exchange_rate")
export class ExchangeRateEntity {
  @PrimaryColumn({ name: "date" })
  date: Date;

  @Column({ type: "float" })
  rate: number;
}
