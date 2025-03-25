import { Module } from "@nestjs/common";
import { BusinessController } from "./business.controller";
import { ServiceAccountService } from "./service-account.service";

@Module({
  imports: [],
  controllers: [BusinessController],
  providers: [ServiceAccountService],
  exports: [ServiceAccountService],
})
export class BusinessModule {}
