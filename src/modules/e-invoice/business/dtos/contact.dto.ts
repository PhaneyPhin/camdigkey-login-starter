import { ContainsTooManySpecialChars } from "@common/decorators/container-too-many-special-chars.decorator";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from "class-validator";

export class ContactDto {
  @ApiProperty()
  @IsNotEmpty()
  @ContainsTooManySpecialChars(5)
  @IsEmail({ ignore_max_length: true })
  @MaxLength(100)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @ContainsTooManySpecialChars(5)
  @IsString()
  @IsPhoneNumber("KH")
  phone_number: string;
}
