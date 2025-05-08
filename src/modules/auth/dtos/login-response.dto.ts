import { UserResponseDto } from "@modules/admin/access/users/dtos";
import { TokenDto } from "./token.dto";

export class LoginResponseDto {
  token: TokenDto;
  user: UserResponseDto;
  // access: AuthAccessDto;
}
