import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from "class-validator";
import { BusinessStatus } from "../enums/business-status";

export class CreateBusinessRequestDto {
  @ApiProperty({ example: "My Company Ltd" })
  @IsNotEmpty()
  @IsString()
  entity_name_en: string;

  @ApiProperty({ example: "ក្រុមហ៊ុន របស់ខ្ញុំ" })
  @IsNotEmpty()
  @IsString()
  entity_name_kh: string;

  @ApiProperty({ example: "123456789" })
  @IsNotEmpty()
  @IsString()
  tin: string;

  @ApiProperty({ example: "PUBLIC_SECTOR" })
  @IsNotEmpty()
  @IsString()
  entity_type: string;

  @ApiPropertyOptional({ example: "13454533" })
  @IsOptional()
  @IsString()
  entity_id: string;

  // business_detail fields
  @ApiPropertyOptional({
    example: "2022-01-01T00:00:00.000Z",
    type: String,
    format: "date-time",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_of_incorporation?: Date;

  @ApiPropertyOptional({ example: "Phnom Penh" })
  @IsNotEmpty()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "Cambodia" })
  @IsNotEmpty()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: "+85512345678" })
  @IsOptional()
  @IsPhoneNumber("KH")
  phone_number?: string;

  @ApiPropertyOptional({ example: "example@company.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "A123456789" })
  @IsOptional()
  @IsString()
  national_id?: string;

  @ApiPropertyOptional({ example: "A logistics company" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "logo.png" })
  @IsOptional()
  @IsString()
  logo_file_name?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  step?: number;

  @ApiPropertyOptional({
    enum: BusinessStatus,
    example: BusinessStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_kyb_valid?: boolean;
}
