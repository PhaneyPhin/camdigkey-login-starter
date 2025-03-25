import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { TokenDto } from "./token.dto";

export class LoginResponseDto {
  token: TokenDto;
  user: UserResponseDto;
  // access: AuthAccessDto;
}
