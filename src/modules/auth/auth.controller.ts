import { ApiGlobalResponse } from "@common/decorators";
import { UserResponseDto } from "@modules/admin/access/users/dtos";
import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Response } from "express";
import { ExtractJwt } from "passport-jwt";
import { CurrentUser, SkipAuth, TOKEN_NAME } from ".";
import { ValidateTokenRequestDto } from "./dtos";
import { LoginUrlResponseDto } from "./dtos/login-url.dto";
import { AuthService, TokenService } from "./services";
@ApiTags("Auth")
@Controller({
  path: "auth/camdigikey",
  version: "1",
})
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  @SkipAuth()
  @ApiOperation({ description: "User authentication" })
  @ApiGlobalResponse(LoginUrlResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/login")
  getLoginUrl(): Promise<LoginUrlResponseDto> {
    return this.authService.getLoginUrl();
  }

  @SkipAuth()
  @ApiOperation({ description: "User authentication" })
  @ApiOkResponse({ description: "Successfully authenticated user" })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/accessToken")
  async loginWithCamdigkey(
    @Body() body: ValidateTokenRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    const auth = await this.authService.loginWithCamdigkey(body.token);
    res.cookie("access_token", auth.token.accessToken, {
      httpOnly: true, // this makes it HTTP-only
      secure: process.env.NODE_ENV === "production", // set to true in production with HTTPS
      sameSite: "lax", // or 'strict' or 'none' based on your requirements
      maxAge: 1000 * 60 * 60 * 24, // expires in 1 day
    });

    res.cookie("refresh_token", auth.token.refreshToken, {
      httpOnly: true, // this makes it HTTP-only
      secure: process.env.NODE_ENV === "production", // set to true in production with HTTPS
      sameSite: "lax", // or 'strict' or 'none' based on your requirements
      maxAge: 1000 * 60 * 60 * 24, // expires in 1 day
    });

    return auth;
  }

  @ApiOperation({ description: "Get me" })
  @ApiOkResponse({ description: "My data retrived" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @ApiBearerAuth(TOKEN_NAME)
  @Get("/me")
  async me(@CurrentUser() user: UserResponseDto): Promise<any> {
    return user;
  }

  @SkipAuth()
  @ApiOperation({ description: "Validate token" })
  @ApiOkResponse({ description: "Validation was successful" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @ApiBearerAuth(TOKEN_NAME)
  @Post("/token/logout")
  async logout(@Req() request: Request): Promise<any> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return this.authService.logout(token);
  }
}
