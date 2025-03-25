import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
} from "class-validator";

export class CreateCustomerRequestDto {
  @ApiProperty()
  @IsOptional()
  @MaxLength(160)
  endpoint_id: string;

  supplier_id: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(160)
  moc_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(160)
  entity_name_en: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(160)
  entity_name_kh: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(160)
  tin: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(160)
  date_of_incorporation: Date;

  @ApiProperty()
  @IsOptional()
  @MaxLength(160)
  business_type: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(160)
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(160)
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(160)
  @IsPhoneNumber("KH")
  phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({ ignore_max_length: true })
  @MaxLength(100)
  email: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(160)
  description: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(160)
  address: string;

  createdBy: string;
}
