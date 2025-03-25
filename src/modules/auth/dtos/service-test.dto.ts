import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ServiceAccountTest {
  @IsNotEmpty()
  @ApiProperty({
    example: "registration.register",
  })
  readonly pattern: string;

  @IsNotEmpty()
  @ApiProperty({
    example: "{}",
  })
  readonly payload: any;
}
