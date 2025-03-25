import { ApiProperty } from "@nestjs/swagger";
import { PermissionResponseDto } from "../permission";

export class RoleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [PermissionResponseDto] })
  permissions: PermissionResponseDto[];

  @ApiProperty()
  active: boolean;
}
