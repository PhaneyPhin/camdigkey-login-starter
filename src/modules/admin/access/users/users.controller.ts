import { CurrentUser, Permissions, TOKEN_NAME } from "@auth";
import { ApiGlobalResponse } from "@common/decorators";
import { ApiFields } from "@common/decorators/api-fields.decorator";
import {
  ApiPaginatedResponse,
  PaginationParams,
  PaginationRequest,
  PaginationResponseDto,
} from "@libs/pagination";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from "./dtos";
import { UserEntity } from "./user.entity";
import { USER_FILTER_FIELD, UsersService } from "./users.service";

@ApiTags("Users")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "access/users",
  version: "1",
})
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ description: "Get a paginated user list" })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiQuery({
    name: "search",
    type: "string",
    required: false,
    example: "admin",
  })
  @ApiQuery({
    name: "expiredAt",
    type: "string",
    required: false,
    example: "",
    description: "2024-10-10,2024-10-11",
  })
  @ApiQuery({
    name: "createdBy",
    type: "string",
    required: false,
    example: "admin",
  })
  @ApiFields(USER_FILTER_FIELD)
  @Permissions(
    "admin.access.users.read",
    "admin.access.users.create",
    "admin.access.users.update"
  )
  @Get()
  public getUsers(
    @PaginationParams() pagination: PaginationRequest
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.usersService.list<UserEntity, UserResponseDto>(pagination);
  }

  @ApiOperation({ description: "Get all user list form select form" })
  @Permissions(
    "admin.access.users.read",
    "admin.access.users.create",
    "admin.access.users.update"
  )
  @Get("/select-options")
  public getAllUserForSelect(): Promise<any> {
    return this.usersService.getAllUser();
  }

  @ApiOperation({ description: "Create new user" })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: "User already exists" })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions("admin.access.users.create")
  @Post()
  public createUser(
    @Body() UserDto: CreateUserRequestDto,
    @CurrentUser() user: UserEntity
  ): Promise<UserResponseDto> {
    UserDto.createdBy = user;
    return this.usersService.createUser(UserDto);
  }

  @ApiOperation({ description: "Update user by id" })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: "User already exists" })
  @Permissions("admin.access.users.update")
  @Put("/:id")
  public updateUser(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) UserDto: UpdateUserRequestDto
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, UserDto);
  }

  @ApiOperation({ description: "Get user by id" })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions(
    "admin.access.users.read",
    "admin.access.users.create",
    "admin.access.users.update"
  )
  @Get("/:id")
  public getUserById(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<UserResponseDto> {
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ description: "Get user by id" })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions("admin.access.users.delete")
  @Delete("/:id")
  public async deleteUserById(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<Boolean> {
    if (user.id === id) {
      throw new HttpException(
        "You can't delete yourself",
        HttpStatus.BAD_REQUEST
      );
    }

    await this.usersService.deleteById(id);

    return true;
  }
}
