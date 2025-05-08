import { ValidationPipe, ParseIntPipe, Controller, UseGuards, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@libs/pagination';
import { ApiConflictResponse, ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateRoleRequestDto, CreateRoleRequestDto, RoleResponseDto } from './dtos';
import { ApiGlobalResponse } from '@common/decorators';
import { RolesService } from '../roles/roles.service';
import { Permissions, TOKEN_NAME } from '@auth';

@ApiTags('Roles')
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: 'access/roles',
  version: '1',
})
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ description: 'Get a paginated role list' })
  @ApiPaginatedResponse(RoleResponseDto)
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
    example: 'admin',
  })
  @Permissions('admin.access.roles.read', 'admin.access.roles.create', 'admin.access.roles.update')
  @Get()
  public getRoles(@PaginationParams() pagination: PaginationRequest): Promise<PaginationResponseDto<RoleResponseDto>> {
    return this.rolesService.getRoles(pagination);
  }

  @ApiOperation({ description: 'Get all user list form select form' })  
  @Permissions('admin.access.users.read', 'admin.access.users.create', 'admin.access.users.update')
  @Get('/select-options')
  public getAllUserForSelect(): Promise<{ id: number, name: string }[]> {
    return this.rolesService.getAllRole();
  }
  
  @ApiOperation({ description: 'Get role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @Permissions('admin.access.roles.read', 'admin.access.roles.create', 'admin.access.roles.update')
  @Get('/:id')
  public getRoleById(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    return this.rolesService.getRoleById(id);
  }


  @ApiOperation({ description: 'Create new role' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions('admin.access.roles.create')
  @Post()
  public createRole(@Body(ValidationPipe) roleDto: CreateRoleRequestDto): Promise<RoleResponseDto> {
    return this.rolesService.createRole(roleDto);
  }

  @ApiOperation({ description: 'Update role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions('admin.access.roles.update')
  @Put('/:id')
  public updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) roleDto: UpdateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.updateRole(id, roleDto);
  }

  @ApiOperation({ description: 'Delete role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions('admin.access.roles.delete')
  @Delete('/:id')
  public delete(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) roleDto: UpdateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.updateRole(id, roleDto);
  }
}
