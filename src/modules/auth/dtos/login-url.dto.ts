import { ApiProperty } from "@nestjs/swagger";

export class LoginUrlResponseDto {
  @ApiProperty()
  loginToken: string;

  @ApiProperty()
  loginUrl: string;
}
