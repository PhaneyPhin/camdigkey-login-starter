import { PermissionEntity } from "@admin/access/permissions/permission.entity";
import { RoleEntity } from "@admin/access/roles/role.entity";
import { UserStatus } from "@admin/access/users/user-status.enum";
import minioClient from "@libs/pagination/minio";
import { UserEntity } from "@modules/admin/access/users/user.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";

// Define seed data
const baseUsers: any[] = [
  {
    name: "Admin",
    personalCode: "030551786",
    first_name_en: "Admin",
    last_name_en: "Admin",
    first_name_kh: "Admin",
    last_name_kh: "Admin",
    email: "admin@admin.com",
    mobile_phone: "030551786",
    gender: "Male",
    date_of_birth: "1990-01-01",
    is_supper_user: true,
    status: UserStatus.Active, // Default status which will be overridden by Faker and random assignment.
  },
  {
    name: "User",
    personalCode: "030551787",
    first_name_en: "User",
    last_name_en: "User",
    first_name_kh: "User",
    last_name_kh: "User",
    email: "user@user.com",
    mobile_phone: "030551787",
    gender: "Male",
    date_of_birth: "1990-01-01",
    is_supper_user: false,
    status: UserStatus.Active,
  },
];

const permissions = [
  { slug: "admin.access.users.read", description: "Read users" },
  { slug: "admin.access.users.create", description: "Create users" },
  { slug: "admin.access.users.update", description: "Update users" },
  { slug: "admin.access.users.import", description: "Import users" },
  { slug: "admin.access.users.export", description: "Export users" },
  { slug: "admin.access.users.delete", description: "Delete users" },

  { slug: "admin.access.roles.read", description: "Read Roles" },
  { slug: "admin.access.roles.create", description: "Create Roles" },
  { slug: "admin.access.roles.update", description: "Update Roles" },
];

const rolePermissions = {
  Management: [...permissions].splice(8, permissions.length),
  Accounting: [...permissions].splice(8, permissions.length),
  Admin: permissions,
};

const seedBuckets = ["images", "files"];

// // Utility function for random status selection
// function getRandomStatus(): UserStatus {
//   return Math.random() < 0.5 ? UserStatus.Active : UserStatus.Inactive;
// }

async function createBucket(bucketName: string) {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
  }
}

async function seedDatabase(dataSource: DataSource) {
  const roleNames = Object.keys(rolePermissions);

  // Create permissions
  const allPermissions = permissions;
  const permissionEntities = allPermissions.map((permission) =>
    dataSource.manager.create(PermissionEntity, permission)
  );
  const savedPermissions = await dataSource.manager.save(permissionEntities);

  // Map saved permissions to their slugs
  const permissionMap = Object.fromEntries(
    savedPermissions.map((p) => [p.slug, p])
  );

  // Create roles
  const roleEntities = roleNames.map((roleName) =>
    dataSource.manager.create(RoleEntity, {
      name: roleName,
      permissions: rolePermissions[roleName].map((p) => permissionMap[p.slug]),
    })
  );
  const savedRoles = await dataSource.manager.save(roleEntities);

  const baseUser = baseUsers[0];

  const users = await dataSource.manager.create(
    UserEntity,
    baseUsers.map((user) => ({
      ...user,
      roles: savedRoles,
    }))
  );
  await dataSource.manager.save(users);

  // await dataSource.manager.save(analysisCodes);
  console.log("Database seeded successfully!");
}

// Bootstrap the seeding process
async function bootstrap() {
  // Initialize ConfigModule
  ConfigModule.forRoot({
    envFilePath: ".env",
  });

  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: "postgres",
    host: configService.get<string>("TYPEORM_HOST", "localhost"),
    port: configService.get<number>("TYPEORM_PORT", 5432),
    username: configService.get<string>("TYPEORM_USERNAME", "postgres"),
    password: configService.get<string>("TYPEORM_PASSWORD", "password"),
    database: configService.get<string>("TYPEORM_DATABASE", "nestjs_sample"),
    entities: [
      require("path").join(__dirname, "../../modules/**/*.entity.{ts,js}"),
    ],
    synchronize: false,
    logging: configService.get<boolean>("TYPEORM_LOGGING", false),
  });

  await Promise.all(seedBuckets.map(createBucket));
  await dataSource.initialize();
  await seedDatabase(dataSource);
  await dataSource.destroy();
}

bootstrap().catch((error) => {
  console.error("Error during database seeding:", error);
  process.exit(1);
});
