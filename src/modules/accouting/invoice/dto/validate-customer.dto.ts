import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class ValidateCustomerDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  company_id: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  entity_name_en: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  entity_name_kh: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  tin: string;
}
