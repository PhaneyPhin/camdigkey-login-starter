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
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { UserService } from "@modules/e-invoice/user/user.service";
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
    private readonly userService: UserService
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
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<AuditLogEntity>> {
    const paginationData = await this.auditService.list<
      AuditLogEntity,
      AuditLogEntity & {
        by: UserResponseDto;
      }
    >({
      ...pagination,
      params: { ...pagination.params, supplier_id: user.endpoint_id },
    });

    const userIds = paginationData.content.map((content) => content.actor_id);
    const users = await this.userService.findByIds(userIds);
    paginationData.content = paginationData.content.map((content) => {
      content.by = users.find((user) => user.id === content.actor_id);
      return content;
    });

    return paginationData;
  }
}
