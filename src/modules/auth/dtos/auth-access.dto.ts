export interface AuthAccessDto {
  allPermissions: string[]
  roles: {
    name: string;
    permissions: string[];
  }[];
}
