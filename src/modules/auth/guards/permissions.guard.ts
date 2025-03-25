import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Check if the user has permission to access the resource
   * @param context {ExecutionContext}
   * @returns{boolean}
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>(
      "permissions",
      context.getHandler()
    );
    if (!permissions?.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return this.matchPermissions(permissions, user);
  }

  /**
   * Verifies permissions match the user's permissions
   * @param permissions {string[]}
   * @param user {UserEntity}
   * @returns {boolean}
   */
  async matchPermissions(
    permissions: string[],
    user: UserResponseDto
  ): Promise<boolean> {
    const { permissions: permissionDto, roles } = user;

    let allPermissions: string[] = permissionDto.map(({ slug }) => slug);
    roles.forEach(({ permissions }) => {
      const rolePermissions = permissions.map(({ slug }) => slug);
      allPermissions = allPermissions.concat(rolePermissions);
    });

    return permissions.some((permission) =>
      allPermissions?.includes(permission)
    );
  }
}
