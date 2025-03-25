import { ServiceAccountService } from "@modules/e-invoice/business/service-account.service";
import { UserService } from "@modules/e-invoice/user/user.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard, PermissionsGuard } from "./guards";
import { JwtStrategy } from "./jwt.strategy";
import { AuthService, TokenService } from "./services";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([]),
    // UsersModule,
    HttpModule,
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get("TOKEN_SECRET"),
        signOptions: {
          expiresIn: config.get("ACCESS_TOKEN_EXPIRES_IN"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    ServiceAccountService,
    UserService,
  ],
  exports: [JwtStrategy, PassportModule, TokenService, AuthService],
})
export class AuthModule {}
