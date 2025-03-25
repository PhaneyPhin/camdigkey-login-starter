import { ContainsTooManySpecialChars } from "@common/decorators/container-too-many-special-chars.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, ValidateIf } from "class-validator";
import { InvoiceDto } from "./create-invoice.dto";

export class DebitNoteDto extends InvoiceDto {
  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reference_document_id: string;

  @ValidateIf((o) => !o.is_draft)
  @IsNotEmpty()
  @IsString()
  @ContainsTooManySpecialChars()
  reference_document_number: string;

  @ValidateIf((o) => !o.is_draft)
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  @ContainsTooManySpecialChars(5)
  note: string;
}
