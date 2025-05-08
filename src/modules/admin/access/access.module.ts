import { Module } from "@nestjs/common";
import { PermissionsModule } from "./permissions/permissions.module";
import { RolesModule } from "./roles/roles.module";
import { UsersModule } from "./users/users.module";
@Module({
  imports: [RolesModule, PermissionsModule, UsersModule],
})
export class AccessModule {}
