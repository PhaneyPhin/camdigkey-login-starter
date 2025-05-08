import { InternalServerErrorException, RequestTimeoutException, NotFoundException, Injectable } from '@nestjs/common';
import { ForeignKeyConflictException, RoleExistsException } from '@common/http/exceptions';
import { Pagination, PaginationRequest, PaginationResponseDto } from '@libs/pagination';
import { CreateRoleRequestDto, UpdateRoleRequestDto, RoleResponseDto } from './dtos';
import { RolesRepository } from './roles.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { DBErrorCode } from '@common/enums';
import { RoleMapper } from './role.mapper';
import { TimeoutError } from 'rxjs';
import { RoleEntity } from './role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private rolesRepository: RolesRepository,
  ) {}

  /**
   * Get a paginated role list
   * @param pagination {PaginationRequest}
   * @returns {Promise<PaginationResponseDto<RoleResponseDto>>}
   */
  public async getRoles(
    pagination: PaginationRequest,
  ): Promise<PaginationResponseDto<RoleResponseDto>> {
    try {
      const [roleEntities, totalRoles] = await this.getRolesAndCount(pagination);

      const roleDtos = await Promise.all(roleEntities.map(RoleMapper.toDtoWithRelations));
      return Pagination.of(pagination, totalRoles, roleDtos);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Get role by id
   * @param id {number}
   * @returns {Promise<RoleResponseDto>}
   */
  public async getRoleById(id: number): Promise<RoleResponseDto> {
    const roleEntity = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!roleEntity) {
      throw new NotFoundException();
    }

    return RoleMapper.toDtoWithRelations(roleEntity);
  }

  public async getAllRole() : Promise<{ id: number, name: string }[]> {
    return this.rolesRepository.createQueryBuilder('r').select(['name', 'id']).getRawMany()
  }

  /**
   * Create new role
   * @param roleDto {CreateRoleRequestDto}
   * @returns {Promise<RoleResponseDto>}
   */
  public async createRole(roleDto: CreateRoleRequestDto): Promise<RoleResponseDto> {
    try {
      let roleEntity = RoleMapper.toCreateEntity(roleDto);
      roleEntity = await this.rolesRepository.save(roleEntity);
      return RoleMapper.toDto(roleEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new RoleExistsException(roleDto.name);
      }
      if (
        error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
        error.code == DBErrorCode.PgNotNullConstraintViolation
      ) {
        throw new ForeignKeyConflictException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Update role by id
   * @param id {number}
   * @param roleDto {UpdateRoleRequestDto}
   * @returns {Promise<RoleResponseDto>}
   */
  public async updateRole(id: number, roleDto: UpdateRoleRequestDto): Promise<RoleResponseDto> {
    let roleEntity = await this.rolesRepository.findOneBy({ id });
    if (!roleEntity) {
      throw new NotFoundException();
    }

    try {
      roleEntity = RoleMapper.toUpdateEntity(roleEntity, roleDto);
      roleEntity = await this.rolesRepository.save(roleEntity);
      return RoleMapper.toDto(roleEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new RoleExistsException(roleDto.name);
      }
      if (
        error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
        error.code == DBErrorCode.PgNotNullConstraintViolation
      ) {
        throw new ForeignKeyConflictException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Get roles list
   * @param pagination {PaginationRequest}
   * @returns [roleEntities: RoleEntity[], totalRoles: number]
   */
  public async getRolesAndCount(
    pagination: PaginationRequest,
  ): Promise<[roleEntities: RoleEntity[], totalRoles: number]> {
    const {
      skip,
      limit: take,
      order,
      params: { search, name },
    } = pagination;
    try {
      const orderBy = {}
      for (var key in order) {
        orderBy['r.' + key] = order[key]
      }
      const query = this.rolesRepository.createQueryBuilder('r')
        .innerJoinAndSelect('r.permissions', 'p')
        .skip(skip)
        .take(take)
        .orderBy(orderBy)

      // .orderBy({[`r.${order.orderBy}`]: order.orderDirection });
      if (name) {
        query.where('r.name ILIKE :search', { search: `%${name}%` });
      }

      if (search) {
        query.where('r.name ILIKE :search', { search: `%${search}%` });
      }

    return await query.getManyAndCount();
    } catch (e) {
      console.log(e)
      throw e;
    }
  }
}
