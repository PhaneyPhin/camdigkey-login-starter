import { Controller, Get } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, TOKEN_NAME } from "@auth";
import { ApiFields } from "@common/decorators/api-fields.decorator";
import {
  ApiPaginatedResponse,
  PaginationParams,
  PaginationRequest,
  PaginationResponseDto,
} from "@libs/pagination";
import { UserEntity } from "@modules/admin/access/users/user.entity";
import { UsersService } from "@modules/admin/access/users/users.service";
import { AuditLogEntity } from "./audit-log.entity";
import { AuditLogService } from "./audit.service";

@ApiTags("AuditLog")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/audit-log",
  version: "1",
})
export class AuditLogController {
  constructor(
    private readonly auditService: AuditLogService,
    private readonly userService: UsersService
  ) {}

  @ApiOperation({ description: "Get a paginated customer list" })
  @ApiPaginatedResponse(AuditLogEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields(["actor_id", "action"])
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get()
  public async getAuditLog(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserEntity
  ): Promise<PaginationResponseDto<AuditLogEntity>> {
    const paginationData = await this.auditService.list<
      AuditLogEntity,
      AuditLogEntity & {
        by: UserEntity;
      }
    >({
      ...pagination,
      params: { ...pagination.params },
    });

    const userIds = paginationData.content.map((content) => content.actor_id);
    const users = await this.userService.findUsersByIds(userIds);
    paginationData.content = paginationData.content.map((content) => {
      content.by = users.find((user) => user.id === content.actor_id);
      return content;
    });

    return paginationData;
  }
}
