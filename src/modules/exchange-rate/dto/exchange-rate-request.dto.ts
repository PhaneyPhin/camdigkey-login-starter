import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsOptional } from "class-validator";

const slugRegex = /^[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*$/;
export class ExchangeRateRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  date: Date;
}
