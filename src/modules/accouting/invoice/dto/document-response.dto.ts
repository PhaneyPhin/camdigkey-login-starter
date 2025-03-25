import { ApiProperty } from "@nestjs/swagger";
import { UUID } from "crypto";
import { DocumentType } from "../enums/DocumentType";
import { InvoiceType } from "../enums/InvoiceType";
import {
  AllowanceChargeDto,
  InvoiceLineDto,
  TaxCategoryDto,
} from "./create-invoice.dto";

export class Party {
  @ApiProperty()
  endpoint_id: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  entity_name_kh: string;

  @ApiProperty()
  entity_name_en: string;

  @ApiProperty({ required: false })
  street?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  tin: string;

  @ApiProperty()
  entity_id: string;
}

export class AllowanceCharge {
  @ApiProperty()
  charge_indicator: boolean;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({
    type: [TaxCategoryDto],
  })
  tax_categories: {
    id: string;
    percent: number;
  }[];
}

export class PrepaidPayment {
  @ApiProperty()
  paid_amount: number;
}

export class LegalMonetaryTotal {
  @ApiProperty()
  line_extension_amount: number;

  @ApiProperty()
  tax_exclusive_amount: number;

  @ApiProperty()
  tax_inclusive_amount: number;

  @ApiProperty()
  payable_amount: number;
}

export class InvoiceItem {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}

export class InvoiceLineTax {
  @ApiProperty()
  tax_amount: number;

  @ApiProperty({
    type: [TaxCategoryDto],
  })
  tax_categories: {
    id: string;
    percent: number;
    tax_scheme: string;
  }[];
}

export class InvoiceLine {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  quantity_unit_code: string;

  @ApiProperty()
  line_extension_amount: number;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: () => InvoiceItem })
  item: InvoiceItem;

  @ApiProperty({ type: [AllowanceCharge] })
  allowance_charges: AllowanceCharge[];

  @ApiProperty()
  tax: InvoiceLineTax;
}

export class DocumentResponseDto {
  @ApiProperty({ required: false })
  document_id?: UUID;

  @ApiProperty()
  ubl_version: string;

  @ApiProperty()
  document_number: string;

  @ApiProperty({ enum: DocumentType })
  document_type: DocumentType;

  @ApiProperty()
  issue_date: Date;

  @ApiProperty()
  due_date: Date;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  invoice_type_code: string;

  @ApiProperty({ enum: InvoiceType })
  invoice_type: InvoiceType;

  @ApiProperty({ type: () => Party })
  supplier: Party;

  @ApiProperty({ type: () => Party })
  customer: Party;

  @ApiProperty()
  payment_term: string;

  @ApiProperty()
  prepaid_payment: PrepaidPayment;

  @ApiProperty({ type: [AllowanceChargeDto] })
  allowance_charges: AllowanceCharge[];

  @ApiProperty()
  tax_total: number;

  @ApiProperty()
  legal_monetary_total: LegalMonetaryTotal;

  @ApiProperty({ type: [InvoiceLineDto] })
  invoice_lines: InvoiceLine[];
}
