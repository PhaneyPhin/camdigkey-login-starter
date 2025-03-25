import { BaseEntity } from "@database/entities";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "customer" })
export class CustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id", type: "integer" })
  id: number;

  @Column({
    name: "endpoint_id",
    type: "varchar",
    nullable: true,
  })
  endpoint_id: string;

  @Column({
    name: "supplier_id",
    type: "varchar",
    nullable: true,
  })
  supplier_id: string;

  @Column({
    name: "moc_id",
    type: "varchar",
    nullable: true,
  })
  moc_id: string;

  @Column({
    name: "entity_name_en",
    type: "varchar",
    nullable: true,
  })
  entity_name_en: string;

  @Column({
    name: "entity_name_kh",
    type: "varchar",
    nullable: true,
  })
  entity_name_kh: string;

  @Column({
    name: "tin",
    type: "varchar",
    nullable: true,
  })
  tin: string;

  @Column({
    name: "date_of_incorporation",
    type: "timestamp",
    nullable: true,
  })
  date_of_incorporation: Date;

  @Column({
    name: "business_type",
    type: "varchar",
    nullable: true,
  })
  business_type: string;

  @Column({
    name: "city",
    type: "varchar",
    nullable: true,
  })
  city: string;

  @Column({
    name: "country",
    type: "varchar",
    nullable: true,
  })
  country: string;

  @Column({
    name: "phone_number",
    type: "varchar",
    nullable: true,
  })
  phone_number: string;

  @Column({
    name: "email",
    type: "varchar",
    nullable: true,
  })
  email: string;

  @Column({
    name: "description",
    type: "varchar",
    nullable: true,
  })
  description: string;

  @Column({
    name: "address",
    type: "varchar",
    nullable: true,
  })
  address: string;

  @Column({
    name: "active",
    type: "boolean",
    nullable: false,
    default: true,
  })
  active: boolean;

  @Column({
    name: "created_by",
    type: "uuid",
    nullable: true,
  })
  created_by: string;

  constructor(partial?: Partial<CustomerEntity>) {
    super();
    Object.assign(this, partial);
  }
}
