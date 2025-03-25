import { ContainsTooManySpecialChars } from "@common/decorators/container-too-many-special-chars.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from "class-validator";
import { EntityRole } from "../enums/entity-role.enum";

export class CreateUserRequestDto {
  @ApiProperty({
    example: "KH-12345",
    description:
      "Personal code of the user (max 50 chars, no excessive special chars)",
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @ContainsTooManySpecialChars(5)
  personal_code: string;

  @ApiProperty({
    example: "someone@example.com",
    description: "An extra email address for the user",
  })
  @Expose()
  @IsNotEmpty()
  @IsEmail({ ignore_max_length: true })
  email: string;

  @ApiProperty({
    example: "+85512345678",
    description: "An extra mobile phone number (KH format)",
  })
  @Expose()
  @IsNotEmpty()
  @IsPhoneNumber("KH")
  mobile_phone: string;

  @ApiProperty({
    example: "ADMIN",
    enum: EntityRole,
    description: "Role assigned to the entity user",
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(EntityRole, {
    message: "role is invalid",
  })
  entity_role: EntityRole;

  endpoint_id?: string;
}
