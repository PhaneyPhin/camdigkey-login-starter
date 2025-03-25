import { ContainsTooManySpecialChars } from "@common/decorators/container-too-many-special-chars.decorator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { TaxTotal } from ".";
import { DocumentType } from "../enums/DocumentType";
import { InvoiceType } from "../enums/InvoiceType";

export class TaxCategoryDto {
  @ApiProperty()
  @ContainsTooManySpecialChars()
  id: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  @ContainsTooManySpecialChars()
  percent: number;

  @ApiProperty()
  @IsNotEmpty()
  @ContainsTooManySpecialChars()
  tax_scheme: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @ContainsTooManySpecialChars()
  tax_amount: number;
}

export class ItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ContainsTooManySpecialChars(5)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ContainsTooManySpecialChars()
  name: string;

  @ApiPropertyOptional({ type: [TaxCategoryDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxCategoryDto)
  tax_categories: TaxCategoryDto[];
}

export class AllowanceChargeDto {
  @ApiProperty()
  @IsNotEmpty()
  charge_indicator: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ContainsTooManySpecialChars(5)
  reason: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ type: [TaxCategoryDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxCategoryDto)
  tax_categories: TaxCategoryDto[];
}

export class InvoiceLineDto {
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ContainsTooManySpecialChars(5)
  quantity_unit_code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ type: [AllowanceChargeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceChargeDto)
  allowance_charges: AllowanceChargeDto[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  line_extension_amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ type: ItemDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ItemDto)
  item: ItemDto;

  tax_total: TaxTotal;

  vat_exclusive_amount: number;
  tax_inclusive_amount: number;
}

export class PrepaidPaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  paid_amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ContainsTooManySpecialChars(5)
  receive_date: string;
}

export class BuyerDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ContainsTooManySpecialChars()
  customer_id: number;
}

export class AdditionalDocumentReferenceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ContainsTooManySpecialChars()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ContainsTooManySpecialChars()
  mime_code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ContainsTooManySpecialChars(3)
  filename: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  embedded_document_binary_object: string;
}

export class InvoiceDto {
  @IsOptional()
  @ApiProperty()
  is_draft: boolean;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  document_id: string;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @ContainsTooManySpecialChars(5)
  document_number: string;

  supplier_id: string;

  @ApiProperty()
  @IsOptional()
  document_type: DocumentType;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty({ enum: InvoiceType })
  invoice_type: InvoiceType;

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional()
  @IsOptional()
  due_date: Date;

  status: "draft" | "posted";

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional({ type: [AllowanceChargeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceChargeDto)
  allowance_charges: AllowanceChargeDto[];

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  exchange_rate: number;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  @IsNotEmpty()
  currency: string;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty({ type: [InvoiceLineDto] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  invoice_lines: InvoiceLineDto[];

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional({ type: PrepaidPaymentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PrepaidPaymentDto)
  prepaid_payment: PrepaidPaymentDto;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  sub_total: number;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  @IsNotEmpty()
  customer_id: number;

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional({ type: [AdditionalDocumentReferenceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalDocumentReferenceDto)
  additional_document_references: AdditionalDocumentReferenceDto[];

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note: string;

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  payment_term: string;

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issue_date: Date;

  @ValidateIf((o) => !o.is_draft)
  @ApiPropertyOptional()
  @IsOptional()
  paymentNote: string;
}
