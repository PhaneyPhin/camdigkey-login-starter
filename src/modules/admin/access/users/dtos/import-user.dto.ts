import { ArrayNotEmpty, IsAlphanumeric, IsArray, IsDate, IsEmail, isEnum, IsEnum, IsInt, IsNotEmpty, Length, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../user.entity';
import { UserApproval } from '../user-approval';
import { UserStatus } from '../user-status.enum';

const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
export class ImportUserDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  @ApiProperty({
    example: 'jdoe',
  })
  username: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'John',
  })
  name: string;

  @IsNotEmpty()
  @MaxLength(100)
  @IsEmail()
  @ApiProperty({
    example: 'admin@gmail.com',
  })
  email: string;

  @Matches(passwordRegex, { message: 'Password too weak' })
  @IsNotEmpty()
  // @IsAlphanumeric()
  @Length(6, 20)
  @ApiProperty({
    example: 'Hello123',
  })
  password: string;

  createdBy: UserEntity

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  expiredAt: Date

  @ApiProperty({
    enum: UserApproval
  })
  @IsNotEmpty()
  @IsEnum(UserApproval)
  userApproval: UserApproval

  @ApiProperty({
    enum: UserStatus
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus
}
