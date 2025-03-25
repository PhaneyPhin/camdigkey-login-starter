import { ErrorType } from "@common/enums";
import { DisabledUserException } from "@common/http/exceptions";
import { UserStatus } from "@modules/e-invoice/user/enums/UserStatus";
import { UserService } from "@modules/e-invoice/user/user.service";
import { HttpService } from "@nestjs/axios";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import {
  AuthCredentialsRequestDto,
  JwtPayload,
  LoginResponseDto,
} from "../dtos";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
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
    let user;
    try {
      const user = await this.userService.findByNationalId(
        userCamdigikey.personal_code
      );
    } catch (e) {
      user = await this.userService.createFromCamdigikey(userCamdigikey);
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      nationalId: user.personal_code,
    };
    const token = await this.tokenService.generateAuthToken(payload);
    return {
      user,
      token,
    };

    return {
      token,
    };
  }

  /**
   * User authentication
   * @param authCredentialsDto {AuthCredentialsRequestDto}
   * @returns {Promise<LoginResponseDto>}
   */
  public async login({
    username,
    password,
  }: AuthCredentialsRequestDto): Promise<LoginResponseDto> {
    const user = await this.userService.login({ username, password });

    if (user.status == UserStatus.INACTIVE) {
      throw new DisabledUserException(ErrorType.InactiveUser);
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      nationalId: user.personal_code,
    };
    const token = await this.tokenService.generateAuthToken(payload);

    return {
      user: user,
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
