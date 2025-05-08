import { DBErrorCode } from "@common/enums";
import { BaseCrudService } from "@common/services/base-crud.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { handleError } from "@utils/handle-error";
import { DataSource, Filter, In, SelectQueryBuilder } from "typeorm";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from "./dtos";
import { UserStatus } from "./user-status.enum";
import { UserEntity } from "./user.entity";
import { UserMapper } from "./users.mapper";
import { UsersRepository } from "./users.repository";
export const USER_FILTER_FIELD = [
  "email",
  "mobile_phone",
  "status",
  "personal_code",
];

@Injectable()
export class UsersService extends BaseCrudService {
  protected queryName: string = "users";
  protected FILTER_FIELDS = USER_FILTER_FIELD;
  protected SEARCH_FIELDS = [
    "first_name_en",
    "last_name_en",
    "first_name_kh",
    "last_name_kh",
    "email",
    "mobile_phone",
  ];

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: UsersRepository,
    private dataSource: DataSource
  ) {
    super();
  }

  /**
   * Convert a UserEntity to a UserResponseDto with relations.
   */
  protected getMapperResponseEntityFields() {
    return UserMapper.toDto;
  }

  /**
   * Customize filter by each field query logic on listing API
   */
  protected getFilters() {
    const filters: { [key: string]: Filter<UserEntity> } = {
      status: (query: SelectQueryBuilder<UserEntity>, value) => {
        return query.andWhere(`${this.queryName}.status IN (:...status)`, {
          status: value.split(","),
        });
      },
      expiredAt: (query, value) => {
        const [start, end] = value.split(" to ");
        return query.andWhere(
          `${this.queryName}.created_at BETWEEN :start AND :end`,
          { start, end }
        );
      },
      createdAt: (query, value) => {
        const [start, end] = value.split(" to ");
        return query.andWhere(
          `${this.queryName}.created_at BETWEEN :start AND :end`,
          { start, end }
        );
      },
      createdBy: (query, value) => {
        return query.where(
          "CONCAT(uc.first_name_en, ' ', uc.last_name_en) ILIKE :createdBy",
          { createdBy: value }
        );
      },
    };

    return filters;
  }

  /** Require for base query list of feature */
  protected getListQuery() {
    return this.usersRepository
      .createQueryBuilder(this.queryName)
      .leftJoinAndSelect(`${this.queryName}.roles`, "r")
      .leftJoinAndSelect(`${this.queryName}.permissions`, "p")
      .leftJoinAndSelect(`${this.queryName}.createdBy`, "uc")
      .cache("users_list", 300000); // Cache for 5 minutes
  }

  getAllUser() {
    return this.usersRepository
      .createQueryBuilder("u")
      .select(["id", "name"])
      .getRawMany();
  }

  /**
   * Find user by username
   * @param username {string}
   * @returns Promise<UserEntity | null>
   */
  async findUserByUsername(username: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder("u")
      .leftJoinAndSelect("u.roles", "r", "r.active = true")
      .leftJoinAndSelect("r.permissions", "rp", "rp.active = true")
      .leftJoinAndSelect("u.permissions", "p", "p.active = true")
      .leftJoinAndSelect("u.createdBy", "uc")
      .where("u.username = :username", { username })
      .cache(`user_by_username_${username}`, 300000)
      .getOne();
  }

  /**
   * Get user by id
   * @param id {string}
   * @returns {Promise<UserResponseDto>}
   */
  public async getUserById(id: string): Promise<UserResponseDto> {
    const userEntity = await this.usersRepository.findOne({
      where: { id },
      relations: ["permissions", "roles", "warehouses"],
      cache: {
        id: `user_${id}`,
        milliseconds: 300000, // 5 minutes
      },
    });
    if (!userEntity) {
      throw new NotFoundException();
    }

    return UserMapper.toDtoWithRelations(userEntity);
  }

  async findUsersByIds(ids: string[]) {
    return this.usersRepository.find({
      where: { id: In(ids) },
    });
  }
  /**
   * Create new user
   * @param userDto {CreateUserRequestDto}
   * @returns {Promise<UserResponseDto>}
   */
  public async createUser(
    userDto: CreateUserRequestDto
  ): Promise<UserResponseDto> {
    try {
      let userEntity = UserMapper.toCreateEntity(userDto);
      userEntity.createdBy = { id: userDto.createdBy.id } as any;

      userEntity = await this.usersRepository.save(userEntity);
      // Invalidate user list cache
      await this.dataSource.queryResultCache.remove(["users_list"]);
      return UserMapper.toDto(userEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        const user = await this.usersRepository.findOne({
          where: [
            {
              personalCode: userDto.personalCode,
            },
            {
              email: userDto.email,
            },
          ],
          withDeleted: true,
        });
        if (user && user.deletedAt) {
          await this.usersRepository.restore(user.id);
          return await this.updateUser(user.id, userDto);
        }
      }
      console.error("Database Error:", error);
      handleError(error, userDto);
    }
  }

  /**
   * Update User by id
   * @param id {string}
   * @param userDto {UpdateUserRequestDto}
   * @returns {Promise<UserResponseDto>}
   */
  public async updateUser(
    id: string,
    userDto: UpdateUserRequestDto
  ): Promise<UserResponseDto> {
    let userEntity = await this.usersRepository.findOneBy({ id });
    if (!userEntity) {
      throw new NotFoundException();
    }

    try {
      userEntity = UserMapper.toUpdateEntity(userEntity, userDto);
      userEntity = await this.usersRepository.save(userEntity);
      // Invalidate specific user cache and list cache
      await this.dataSource.queryResultCache.remove([
        `user_${id}`,
        "users_list",
      ]);
      return UserMapper.toDto(userEntity);
    } catch (error) {
      handleError(error, userDto);
    }
  }

  async findUserById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      cache: {
        id: `user_id_${id}`,
        milliseconds: 300000, // Cache for 5 minutes
      },
    });
  }

  public async deleteById(id: string) {
    await this.usersRepository.softDelete(id);
    // Invalidate specific user cache and list cache
    await this.dataSource.queryResultCache.remove([`user_${id}`, "users_list"]);
  }

  async findUserByPersonalCode(personalCode: string) {
    const user = await this.usersRepository.findOne({
      where: { personalCode },
      relations: ["roles", "permissions"],
      cache: {
        id: `user_personal_code_${personalCode}`,
        milliseconds: 300000, // Cache for 5 minutes
      },
    });

    return user;
  }

  async createFromCamdigikey(userCamdigikey: any) {
    const user = await this.usersRepository.findOneBy({
      personalCode: userCamdigikey.personal_code,
    });
    if (user) {
      return user;
    }

    return this.usersRepository.save({
      personalCode: userCamdigikey.personal_code,
      firstNameEn: userCamdigikey.first_name,
      lastNameEn: userCamdigikey.last_name,
      firstNameKh: userCamdigikey.first_name_kh,
      lastNameKh: userCamdigikey.last_name_kh,
      email: userCamdigikey.email,
      mobilePhone: userCamdigikey.mobile_phone,
      gender: userCamdigikey.gender,
      dateOfBirth: userCamdigikey.date_of_birth,
      status: UserStatus.Active,
    });
  }
}
