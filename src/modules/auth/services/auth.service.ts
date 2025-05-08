import { UserMapper } from "@modules/admin/access/users/users.mapper";
import { UsersService } from "@modules/admin/access/users/users.service";
import { HttpService } from "@nestjs/axios";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { JwtPayload } from "../dtos";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private tokenService: TokenService,
    private userService: UsersService,
    private configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.axiosInstance = this.httpService.axiosRef; // Get Axios instance
    this.axiosInstance.defaults.baseURL =
      this.configService.get("CAMDIGKEY_URL");
  }

  public async getLoginUrl(): Promise<any> {
    const result = await this.axiosInstance.get("/get-login-url");

    return result.data?.data;
  }

  protected async getCamdigkeyUser(authToken: string) {
    try {
      const result = await this.axiosInstance.post("/get-user-login", {
        authToken: authToken,
      });
      return result.data?.payload?.data;
    } catch (e) {
      throw new UnauthorizedException("Invalid auth token");
    }
  }

  public async loginWithCamdigkey(authToken: string) {
    const userCamdigikey = await this.getCamdigkeyUser(authToken);

    let user = await this.userService.findUserByPersonalCode(
      userCamdigikey.personal_code
    );

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.personalCode,
      personalCode: user.personalCode,
    };
    const token = await this.tokenService.generateAuthToken(payload);
    return {
      user: UserMapper.toDto(user),
      token,
    };

    return {
      token,
    };
  }

  async logout(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    await this.tokenService.invalidateToken(token, 3600);

    return { message: "Logout successfully" };
  }
}
