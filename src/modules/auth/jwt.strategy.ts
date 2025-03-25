import { InvalidCredentialsException } from "@common/http/exceptions";
import { BusinessStatus } from "@modules/e-invoice/business/enums/business-status";
import { ServiceAccountService } from "@modules/e-invoice/business/service-account.service";
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { UserService } from "@modules/e-invoice/user/user.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { SKIP_APPROVE } from "./constants";
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
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private reflector: Reflector,
    private serviceAccountService: ServiceAccountService
  ) {
    super({
      jwtFromRequest: headerOrCookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get("TOKEN_SECRET"),
      passReqToCallback: true, // <-- Important to access request in validate()
    });
  }

  async validate(
    req: any,
    payload: JwtPayload
  ): Promise<
    UserResponseDto & {
      allowBusiness: boolean;
    }
  > {
    const user = await this.userService.findByUsername(payload.username);

    const handler = req.route?.stack?.[0]?.handle;

    const skipApprove = this.reflector.getAllAndOverride<boolean>(
      SKIP_APPROVE,
      [handler, handler?.constructor]
    );

    if (!user) {
      throw new InvalidCredentialsException();
    }

    let allowBusiness = false;
    if (skipApprove) {
      allowBusiness = true;
    }

    const business = await this.serviceAccountService.getBusinessProfile(user);
    if (business && business.status == BusinessStatus.APPROVED) {
      allowBusiness = true;
    }
    return { ...user, allowBusiness };
  }
}
