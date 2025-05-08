import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { UserStatus } from "../user-status.enum";
import { UserEntity } from "../user.entity";

export class UpdateUserRequestDto {
  @IsNotEmpty()
  @MaxLength(20)
  @ApiProperty({
    example: "12345",
  })
  personalCode: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: "John",
  })
  firstNameEn: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: "Doe",
  })
  lastNameEn: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: "ចន",
  })
  firstNameKh: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: "ដូ",
  })
  lastNameKh: string;

  @IsNotEmpty()
  @MaxLength(100)
  @IsEmail()
  @ApiProperty({
    example: "admin@gmail.com",
  })
  email: string;

  @IsNotEmpty()
  @MaxLength(20)
  @ApiProperty({
    example: "012345678",
  })
  mobilePhone: string;

  @ApiProperty({ example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  roles: number[];

  createdBy: UserEntity;

  @ApiProperty()
  @IsOptional()
  @IsString()
  expiredAt: Date;

  @ApiProperty()
  @IsOptional()
  dateOfBirth: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  gender: string;

  @ApiProperty({
    enum: UserStatus,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
