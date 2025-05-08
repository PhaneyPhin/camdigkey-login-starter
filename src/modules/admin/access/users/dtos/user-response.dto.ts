import { ApiProperty } from "@nestjs/swagger";
import { PermissionResponseDto } from "../../permissions/dtos";
import { RoleResponseDto } from "../../roles/dtos";
import { UserStatus } from "../user-status.enum";

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  personalCode: string;

  @ApiProperty()
  firstNameEn: string;

  @ApiProperty()
  lastNameEn: string;

  @ApiProperty()
  firstNameKh: string;

  @ApiProperty()
  lastNameKh: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  mobilePhone: string;

  @ApiProperty({ type: [RoleResponseDto] })
  roles?: RoleResponseDto[];

  @ApiProperty({ type: [PermissionResponseDto] })
  permissions?: PermissionResponseDto[];

  @ApiProperty()
  isSuperUser: boolean;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  gender: string;
}
