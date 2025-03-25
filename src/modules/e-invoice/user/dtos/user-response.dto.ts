import { BusinessResponseDto } from "@modules/e-invoice/business/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { UserStatus } from "../enums/UserStatus";
import { UserApproval } from "../enums/user-approval";
import { PermissionResponseDto } from "./permission";
import { RoleResponseDto } from "./role";

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  endpoint_id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  personal_code: string;

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
  approvalStatus: UserApproval;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  password: string;

  business: BusinessResponseDto;
}
