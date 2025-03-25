import { InvalidTokenException } from "@common/http/exceptions";
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ExtractJwt } from "passport-jwt";
import { SKIP_AUTH } from "../constants";
import { TokenType } from "../enums";
import { TokenService } from "../services";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private tokenService: TokenService,
    private reflector: Reflector
  ) {
    super();
  }

  /**
   * Verify the token is valid
   * @param context {ExecutionContext}
   * @returns super.canActivate(context)
   */
  canActivate(context: ExecutionContext) {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth) {
      return true;
    }

    let accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
      context.switchToHttp().getRequest()
    );
    if (!accessToken) {
      const request = context.switchToHttp().getRequest();
      console.log(request.cookies);
      // 1) Get JWT from a cookie
      //    (If you'd like to support fallback to Auth header, you could do so here)
      accessToken = request.cookies?.access_token;
      console.log(accessToken);
    }
    const isValid = this.tokenService.isTokenValid(accessToken);

    if (!isValid) {
      throw new UnauthorizedException("Token is invalid or blacklisted");
    }

    if (!accessToken) {
      throw new InvalidTokenException();
    }

    const payload = this.tokenService.verifyToken(
      accessToken,
      TokenType.AccessToken
    );

    if (!payload) {
      throw new UnauthorizedException();
    }
    return super.canActivate(context);
  }

  /**
   * Handle request and verify if exist an error or there's not user
   * @param error
   * @param user
   * @returns user || error
   */
  handleRequest(error, user) {
    if (error || !user) {
      throw new UnauthorizedException();
    }

    if (!user.allowBusiness) {
      throw new ForbiddenException();
    }
    return user;
  }
}
