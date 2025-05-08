import { PermissionMapper } from "../permissions/permission.mapper";
import { RoleEntity } from "../roles/role.entity";
import { RoleMapper } from "../roles/role.mapper";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from "./dtos";
import { UserExcelDto } from "./dtos/user-excel.dto";
import { UserEntity } from "./user.entity";

export class UserMapper {
  public static async toDto(entity: UserEntity): Promise<UserResponseDto> {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.personalCode = entity.personalCode;
    dto.firstNameEn = entity.firstNameEn;
    dto.lastNameEn = entity.lastNameEn;
    dto.firstNameKh = entity.firstNameKh;
    dto.lastNameKh = entity.lastNameKh;
    dto.email = entity.email;
    dto.mobilePhone = entity.mobilePhone;
    dto.createdAt = entity.createdAt;
    dto.status = entity.status;
    dto.isSuperUser = entity.isSuperUser;
    dto.createdBy = entity.createdBy?.firstNameEn
      ? `${entity.createdBy.firstNameEn} ${entity.createdBy.lastNameEn}`
      : "System";

    if (entity.roles) {
      dto.roles = await Promise.all((await entity.roles).map(RoleMapper.toDto));
    }

    return dto;
  }

  public static async toExcelDto(entity: UserEntity): Promise<any> {
    const dto = new UserExcelDto();
    dto.id = entity.id;
    dto.personalCode = entity.personalCode;
    dto.firstNameEn = entity.firstNameEn;
    dto.lastNameEn = entity.lastNameEn;
    dto.firstNameKh = entity.firstNameKh;
    dto.lastNameKh = entity.lastNameKh;
    dto.status = entity.status;
    dto.createdByName = entity.createdBy
      ? `${entity.createdBy.firstNameEn} ${entity.createdBy.lastNameEn}`
      : "System";

    return dto;
  }

  public static async toDtoWithRelations(
    entity: UserEntity
  ): Promise<UserResponseDto> {
    const dto = new UserResponseDto();
    console.log("entity", entity);
    dto.id = entity.id;
    dto.personalCode = entity.personalCode;
    dto.firstNameEn = entity.firstNameEn;
    dto.lastNameEn = entity.lastNameEn;
    dto.firstNameKh = entity.firstNameKh;
    dto.lastNameKh = entity.lastNameKh;
    dto.email = entity.email;
    dto.mobilePhone = entity.mobilePhone;
    dto.createdBy = entity.createdBy
      ? `${entity.createdBy.firstNameEn} ${entity.createdBy.lastNameEn}`
      : "System";
    dto.permissions = await Promise.all(
      (await entity.permissions).map(PermissionMapper.toDto)
    );
    dto.roles = await Promise.all(
      (await entity.roles).map(RoleMapper.toDtoWithRelations)
    );
    dto.isSuperUser = entity.isSuperUser;
    dto.status = entity.status;
    return dto;
  }

  public static toCreateEntity(dto: CreateUserRequestDto): UserEntity {
    const entity = new UserEntity();
    entity.personalCode = dto.personalCode;
    entity.firstNameEn = dto.firstNameEn;
    entity.lastNameEn = dto.lastNameEn;
    entity.firstNameKh = dto.firstNameKh;
    entity.lastNameKh = dto.lastNameKh;
    entity.status = dto.status;
    entity.email = dto.email;
    entity.mobilePhone = dto.mobilePhone;
    entity.createdBy = dto.createdBy;
    entity.dateOfBirth = dto.dateOfBirth;
    entity.gender = dto.gender;

    entity.roles = Promise.resolve(
      dto.roles.map((id) => new RoleEntity({ id }))
    );
    entity.isSuperUser = false;

    return entity;
  }

  public static toUpdateEntity(
    entity: UserEntity,
    dto: UpdateUserRequestDto
  ): UserEntity {
    entity.personalCode = dto.personalCode;
    entity.firstNameEn = dto.firstNameEn;
    entity.lastNameEn = dto.lastNameEn;
    entity.firstNameKh = dto.firstNameKh;
    entity.lastNameKh = dto.lastNameKh;
    entity.status = dto.status;
    entity.email = dto.email;
    entity.mobilePhone = dto.mobilePhone;
    entity.createdBy = dto.createdBy;
    entity.dateOfBirth = dto.dateOfBirth;
    entity.gender = dto.gender;

    entity.roles = Promise.resolve(
      dto.roles.map((id) => new RoleEntity({ id }))
    );

    return entity;
  }
}
