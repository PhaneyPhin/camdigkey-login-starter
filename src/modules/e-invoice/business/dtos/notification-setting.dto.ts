import { ContainsTooManySpecialChars } from "@common/decorators/container-too-many-special-chars.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class NotificationSettingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ContainsTooManySpecialChars(5)
  telegram_chat_id: string;

  @ApiProperty()
  @IsBoolean()
  is_telegram_enabled: boolean;

  business_id: number;
}
