import { InvalidCredentialsException } from "@common/http/exceptions";
import { UserEntity } from "@modules/admin/access/users/user.entity";
import { UsersService } from "@modules/admin/access/users/users.service";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "./dtos";

export const headerOrCookieExtractor = (req): string | null => {
  const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (tokenFromHeader) {
    return tokenFromHeader;
  }
  if (req && req.cookies) {
    return req.cookies.access_token || null;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private userService: UsersService,
    private configService: ConfigService,
    private reflector: Reflector
  ) {
    super({
      jwtFromRequest: headerOrCookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get("TOKEN_SECRET"),
      passReqToCallback: true, // <-- Important to access request in validate()
    });
  }

  async validate(req: any, payload: JwtPayload): Promise<UserEntity> {
    this.logger.log("payload==>", payload);
    const user = await this.userService.findUserByPersonalCode(
      payload.personalCode
    );
    if (!user) {
      throw new InvalidCredentialsException();
    }

    let allowBusiness = false;
    return user;
  }
}
