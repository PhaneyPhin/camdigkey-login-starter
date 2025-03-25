import { ContainsTooManySpecialChars } from "@common/decorators/container-too-many-special-chars.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { InvoiceDto } from "./create-invoice.dto";

export class CreditNoteDto extends InvoiceDto {
  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ContainsTooManySpecialChars()
  reference_document_id: string;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ContainsTooManySpecialChars()
  reference_document_number: string;
}
