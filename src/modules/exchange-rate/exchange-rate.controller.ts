import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { SkipAuth, TOKEN_NAME } from "@auth";
import { ApiGlobalResponse } from "@common/decorators";
import { LoginUrlResponseDto } from "@modules/auth/dtos/login-url.dto";
import { ExchangeRateRequestDto } from "./dto/exchange-rate-request.dto";
import { ExchangeRateService } from "./exchange-rate.service";

@ApiTags("ExchangeRate")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/exchange-rate",
  version: "1",
})
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @SkipAuth()
  @ApiOperation({ description: "User authentication" })
  @ApiGlobalResponse(LoginUrlResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/")
  getExchangeRate(@Query() data: ExchangeRateRequestDto): Promise<any> {
    return this.exchangeRateService.getExchangeRateOnDate(data.date);
  }
}
