import { InternalServerErrorException, RequestTimeoutException, NotFoundException, Injectable } from '@nestjs/common';
import { CreatePermissionRequestDto, UpdatePermissionRequestDto, PermissionResponseDto } from './dtos';
import { Pagination, PaginationResponseDto, PaginationRequest } from '@libs/pagination';
import { PermissionExistsException } from '@common/http/exceptions';
import { PermissionMapper } from './permission.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { DBErrorCode } from '@common/enums';
import { TimeoutError } from 'rxjs';
import { PermissionEntity } from './permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private permissionsRepository: Repository<PermissionEntity>,
  ) {}

  /**
   * Get permision list
   * @param pagination {PaginationRequest}
   * @returns permissionEntities[] and totalPermissions
   */
  public async getPermissionsAndCount(
    pagination: PaginationRequest,
  ): Promise<[permissionEntities: PermissionEntity[], totalPermissions: number]> {
    const {
      skip,
      limit: take,
      order,
      params: { search, slug, description },
    } = pagination;
    const orderBy = {}
    for (var key in order) {
      orderBy['p.' + key] = order[key]
    }
    const query = this.permissionsRepository.createQueryBuilder('p')
      .skip(skip)
      .take(take)
      .orderBy(orderBy);

    if (search) {
      query.where('description ILIKE :search or slug ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (slug) {
      query.where('slug ILIKE :search', {
        slug: `%${slug}%`,
      });
    }

    if (description) {
      query.where('description ILIKE :search', {
        slug: `%${description}%`,
      });
    }

    return query.getManyAndCount();
  }

  public getAllPermissions() : Promise<{ id: number, name: string }[]> {
     return this.permissionsRepository.createQueryBuilder('p').select(['id', 'slug', 'description']).getRawMany()
  }
  
  /**
   * Get a paginated permission list
   * @param pagination {PaginationRequest}
   * @returns {Promise<PaginationResponseDto<PermissionResponseDto>>}
   */
  public async getPermissions(pagination: PaginationRequest): Promise<PaginationResponseDto<PermissionResponseDto>> {
    try {
      const [permissionEntities, totalPermissions] = await this.getPermissionsAndCount(
        pagination,
      );
      const permissionDtos = await Promise.all(permissionEntities.map(PermissionMapper.toDto));
      return Pagination.of(pagination, totalPermissions, permissionDtos);
    } catch (error) {
      console.log(error)
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
   * Get permission by id
   * @param id {number}
   * @returns {Promise<PermissionResponseDto>}
   */
  public async getPermissionById(id: number): Promise<PermissionResponseDto> {
    const permissionEntity = await this.permissionsRepository.findOneBy({ id });
    if (!permissionEntity) {
      throw new NotFoundException();
    }

    return PermissionMapper.toDto(permissionEntity);
  }

  /**
   * Create new permission
   * @param permissionDto {CreatePermissionRequestDto}
   * @returns {Promise<PermissionResponseDto>}
   */
  public async createPermission(permissionDto: CreatePermissionRequestDto): Promise<PermissionResponseDto> {
    try {
      let permissionEntity = PermissionMapper.toCreateEntity(permissionDto);
      permissionEntity = await this.permissionsRepository.save(permissionEntity);
      return PermissionMapper.toDto(permissionEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new PermissionExistsException(permissionDto.slug);
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Update permission by id
   * @param id {number}
   * @param permissionDto {UpdatePermissionRequestDto}
   * @returns {Promise<PermissionResponseDto>}
   */
  public async updatePermission(id: number, permissionDto: UpdatePermissionRequestDto): Promise<PermissionResponseDto> {
    let permissionEntity = await this.permissionsRepository.findOneBy({ id });
    if (!permissionEntity) {
      throw new NotFoundException();
    }

    try {
      permissionEntity = PermissionMapper.toUpdateEntity(permissionEntity, permissionDto);
      permissionEntity = await this.permissionsRepository.save(permissionEntity);
      return PermissionMapper.toDto(permissionEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new PermissionExistsException(permissionDto.slug);
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
