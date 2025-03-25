import { CustomerEntity } from "@modules/customer/customer.entity";
import { BusinessResponseDto } from "@modules/e-invoice/business/dtos";
import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LegalMonetaryTotal, TaxTotal } from "./dto";
import {
  AdditionalDocumentReferenceDto,
  AllowanceChargeDto,
  InvoiceLineDto,
  PrepaidPaymentDto,
} from "./dto/create-invoice.dto";
import { DocumentType } from "./enums/DocumentType";

@Entity("document")
export class DocumentEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  document_id: string;

  @ApiProperty()
  @Column()
  document_number: string;

  @ApiProperty({ enum: DocumentType })
  @Column({ type: "enum", enum: DocumentType })
  document_type: DocumentType;

  @ApiProperty()
  @Column()
  supplier_id: string;

  @ApiProperty()
  @Column({ type: "date", nullable: true })
  issue_date?: Date;

  @ApiProperty()
  @Column({ type: "date", nullable: true })
  due_date?: Date;

  @ApiProperty()
  @Column({ nullable: true })
  note?: string;

  @ApiProperty()
  @Column({ nullable: true })
  payment_term?: string;

  @ApiProperty()
  @Column({ nullable: true })
  paymentNote?: string;

  @ApiProperty()
  @Column({ type: "numeric", nullable: true })
  exchange_rate?: number;

  @ApiProperty()
  @Column({ type: "varchar" })
  currency: string;

  @ApiProperty()
  @Column({ type: "numeric" })
  sub_total: number;

  @ApiProperty({ type: [InvoiceLineDto] })
  @Column({ type: "jsonb" })
  invoice_lines: InvoiceLineDto[];

  @Column({ type: "jsonb", nullable: true })
  @ApiProperty({ type: [AllowanceChargeDto] })
  allowance_charges: AllowanceChargeDto[];

  @Column({ type: "jsonb", nullable: true })
  prepaid_payment: PrepaidPaymentDto;

  @Column({ type: "jsonb", nullable: true })
  additional_document_references: AdditionalDocumentReferenceDto[];

  // Credit Note specific fields
  @Column({ nullable: true })
  reference_document_id?: string;

  @Column({ nullable: true })
  reference_document_number?: string;

  @Column()
  status: "draft" | "posted";

  @Column()
  customer_id: number;

  // Relationship for buyer (Customer)
  @ManyToOne(() => CustomerEntity, { eager: true })
  @JoinColumn({ name: "customer_id" })
  customer: CustomerEntity;

  // Timestamps (optional)
  @Column({ type: "timestamp", default: () => "NOW()" })
  created_at: Date;

  @Column({ type: "timestamp", default: () => "NOW()", onUpdate: "NOW()" })
  updated_at: Date;

  supplier: BusinessResponseDto;

  tax_total: TaxTotal;

  legal_monetary_total: LegalMonetaryTotal;

  invoice_type_code: number;
}
