import { DatabaseModule } from "@database/database.module";
import { AuthModule } from "@modules/auth/auth.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MinioModule } from "./minio/minio.module";
// import { UsersController } from "./user/user.controller";
import { CommonModule } from "@common/common.module";
import { CustomerModule } from "@modules/customer/customer.module";
import { EInvoiceModule } from "@modules/e-invoice/e-invoice.module";
import { ExchangeRateModule } from "@modules/exchange-rate/exchange-rate.module";
import { InvoiceModule } from './modules/accouting/invoice/invoice.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env"],
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    EInvoiceModule,
    ExchangeRateModule,
    CommonModule,
    // AdminModule,
    CustomerModule,
    MinioModule,
    InvoiceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  static port: number;
  static apiVersion: string;
  static apiPrefix: string;

  constructor(private readonly configService: ConfigService) {
    AppModule.port = +this.configService.get("API_PORT");
    AppModule.apiVersion = this.configService.get("API_VERSION");
    AppModule.apiPrefix = this.configService.get("API_PREFIX");
  }
}
