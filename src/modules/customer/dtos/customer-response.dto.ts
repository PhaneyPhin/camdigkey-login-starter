import { ApiProperty } from "@nestjs/swagger";

export class CustomerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  endpoint_id: string;

  @ApiProperty()
  supplier_id: string;

  @ApiProperty()
  moc_id: string;

  @ApiProperty()
  entity_name_en: string;

  @ApiProperty()
  entity_name_kh: string;

  @ApiProperty()
  tin: string;

  @ApiProperty()
  date_of_incorporation: Date;

  @ApiProperty()
  business_type: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  active: boolean;
}
