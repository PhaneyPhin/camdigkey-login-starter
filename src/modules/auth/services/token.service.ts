import {
  AccessTokenExpiredException,
  InvalidTokenException,
  RefreshTokenExpiredException,
} from "@common/http/exceptions";
import { UserStatus } from "@modules/e-invoice/user/enums/UserStatus";
import { UserService } from "@modules/e-invoice/user/user.service";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as NodeCache from "node-cache";
import { JwtPayload, TokenDto, ValidateTokenResponseDto } from "../dtos";
import { TokenError, TokenType } from "../enums";

@Injectable()
export class TokenService {
  private readonly cache: NodeCache;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    this.cache = new NodeCache({ stdTTL: 24 * 3600, checkperiod: 600 }); // 1 hour TTL, clean every 10 minutes
  }

  /**
   * Generate Auth token(JWT) service for login user
   * @param JwtPayload {JwtPayload}
   * @returns TokenDto Returns access and refresh tokens with expiry
   */
  public generateAuthToken(payload: JwtPayload): TokenDto {
    const accessTokenExpires = this.configService.get(
      "ACCESS_TOKEN_EXPIRES_IN"
    );
    const refreshTokenExpires = this.configService.get(
      "REFRESH_TOKEN_EXPIRES_IN"
    );
    const tokenType = this.configService.get("TOKEN_TYPE");
    const accessToken = this.generateToken(payload, accessTokenExpires);
    const refreshToken = this.generateToken(payload, refreshTokenExpires);

    return {
      tokenType,
      accessToken,
      accessTokenExpires,
      refreshToken,
    };
  }

  /**
   * Generate Refresh token(JWT) service for generating new refresh and access tokens
   * @param payload {JwtPayload}
   * @returns  Returns access and refresh tokens with expiry or error
   */
  public generateRefreshToken(refreshToken: string): TokenDto {
    const { id, username, nationalId } = this.verifyToken(
      refreshToken,
      TokenType.RefreshToken
    );
    return this.generateAuthToken({ id, username, nationalId });
  }

  /**
   * Verify JWT service
   * @param token JWT token
   * @param type {TokenType} "refresh" or "access"
   * @returns decrypted payload from JWT
   */
  public verifyToken(token: string, type: TokenType) {
    try {
      console.log("verifytoken", { token });
      return this.jwtService.verify(token);
    } catch ({ name }) {
      if (
        name == TokenError.TokenExpiredError &&
        type == TokenType.AccessToken
      ) {
        throw new AccessTokenExpiredException();
      }
      if (
        name == TokenError.TokenExpiredError &&
        type == TokenType.RefreshToken
      ) {
        throw new RefreshTokenExpiredException();
      }
      throw new InvalidTokenException();
    }
  }

  /**
   * Validate received JWT
   * @param token {string}
   * @returns valid: boolean
   */
  public async validateToken(token: string): Promise<ValidateTokenResponseDto> {
    try {
      const { id } = this.jwtService.verify(token);
      const user = await this.userService.findById(id);
      if (!user || user.status == UserStatus.INACTIVE) {
        return { valid: false };
      }

      return { valid: !!id };
    } catch (error) {
      Logger.error("Validation token error", error);
      return { valid: false };
    }
  }

  /**
   * Generate JWT token
   * @private
   * @param payload {JwtPayload}
   * @param expiresIn {string}
   * @returns JWT
   */
  private generateToken(payload: JwtPayload, expiresIn: string): string {
    const token = this.jwtService.sign(payload, { expiresIn });
    return token;
  }

  invalidateToken(token: string, ttl: number): void {
    this.cache.set(token, true, ttl);
  }

  isTokenValid(token: string): boolean {
    return !this.cache.has(token);
  }
}
