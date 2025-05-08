import { ApiProperty } from "@nestjs/swagger";
import { PermissionResponseDto } from "../../permissions/dtos";
import { RoleResponseDto } from "../../roles/dtos";
import { UserStatus } from "../user-status.enum";

export class UserExcelDto {
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

  @ApiProperty()
  expiredAt: Date;

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
  createdByName: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  gender: string;
}
