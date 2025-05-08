import { BaseEntity } from "@database/entities";
import minioClient from "@libs/pagination/minio";
import {
  AfterLoad,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PermissionEntity } from "../permissions/permission.entity";
import { RoleEntity } from "../roles/role.entity";
import { UserStatus } from "./user-status.enum";

@Entity({ schema: "admin", name: "users" })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true, unique: true, length: 20, name: "personal_code" })
  personalCode: string;

  @Column({ nullable: true, length: 100, name: "email" })
  email: string;

  @Column({ nullable: true, length: 20, name: "mobile_phone" })
  mobilePhone: string;

  @Column({ nullable: true, length: 100, name: "first_name_en" })
  firstNameEn: string;

  @Column({ nullable: true, length: 100, name: "last_name_en" })
  lastNameEn: string;

  @Column({ nullable: true, length: 100, name: "first_name_kh" })
  firstNameKh: string;

  @Column({ nullable: true, length: 100, name: "last_name_kh" })
  lastNameKh: string;

  @Column({ nullable: true, name: "is_super_user" })
  isSuperUser: boolean;

  @Column({ nullable: true, type: "timestamp", name: "date_of_birth" })
  dateOfBirth: Date;

  @Column({ nullable: true, type: "varchar", length: 10 })
  gender: string;

  @Column({
    name: "status",
    type: "enum",
    enum: UserStatus,
    default: UserStatus.Active,
  })
  status: UserStatus;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: "created_by" })
  createdBy: UserEntity;

  @OneToMany(() => UserEntity, (user) => user.createdBy)
  createdUsers: UserEntity[];

  @ManyToMany(() => RoleEntity, (role) => role.id, {
    lazy: true,
    cascade: true,
  })
  @JoinTable({
    name: "users_roles",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "role_id",
      referencedColumnName: "id",
    },
  })
  roles: Promise<RoleEntity[]>;

  @ManyToMany(() => PermissionEntity, (permission) => permission.id, {
    lazy: true,
    cascade: true,
  })
  @JoinTable({
    name: "users_permissions",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "permission_id",
      referencedColumnName: "id",
    },
  })
  permissions: Promise<PermissionEntity[]>;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt?: Date;

  @ManyToOne(() => UserEntity)
  lastModifiedBy: UserEntity;

  @Column({ nullable: true, length: 50, type: "varchar", name: "endpoint_id" })
  endpointId: string;

  @Column({ nullable: true, name: "logo_file_name" })
  logoFileName: string;

  @AfterLoad()
  async afterload() {
    this.fullName = this.firstNameEn + " " + this.lastNameEn;
    if (this.logoFileName) {
      this.logoUrl = await minioClient.presignedGetObject(
        "images",
        this.logoFileName
      );
    }
  }

  logoUrl: string;
  fullName: string;

  constructor(user?: Partial<UserEntity>) {
    super();
    Object.assign(this, user);
  }
}
