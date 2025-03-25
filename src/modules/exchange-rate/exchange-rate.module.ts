import { Global, Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExchangeRateController } from "./exchange-rate.controller";
import { ExchangeRateEntity } from "./exchange-rate.entity";
import { ExchangeRateService } from "./exchange-rate.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ExchangeRateEntity]),
  ],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService],
  exports: [ExchangeRateService], // export so other modules can use it
})
@Global()
export class ExchangeRateModule {}
