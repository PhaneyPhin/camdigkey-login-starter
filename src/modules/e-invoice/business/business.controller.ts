import { ApiGlobalResponse } from "@common/decorators";
import { CurrentUser, TOKEN_NAME } from "@modules/auth";
import { SkipApprove } from "@modules/auth/decorators/skip-approve";
import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { MinioService } from "src/minio/minio.service";
import { UserResponseDto } from "../user/dtos";
import { BusinessResponseDto, CreateBusinessRequestDto } from "./dtos";
import { ContactDto } from "./dtos/contact.dto";
import { NotificationSettingDto } from "./dtos/notification-setting.dto";
import { ServiceAccountService } from "./service-account.service";

@ApiTags("Business")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "business/",
  version: "1",
})
export class BusinessController {
  constructor(
    private readonly serviceAccountService: ServiceAccountService,
    private readonly minioService: MinioService
  ) {}

  @SkipApprove()
  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/")
  async getProfile(
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto | {}> {
    const business = this.serviceAccountService.getBusinessProfile(user);

    if (!business) {
      return {};
    }

    return business;
  }

  @SkipApprove()
  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/register")
  register(
    @Body() registration: CreateBusinessRequestDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    return this.serviceAccountService.registerBusiness({
      ...registration,
      national_id: user.personal_code,
    });
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/update-contact")
  async updateContact(
    @Body() contact: ContactDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );

    return this.serviceAccountService.updateBusiness(business.id, {
      ...business,
      ...contact,
      national_id: user.personal_code,
    });
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/notification-setting")
  async getNotificationSetting(
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    console.log(user);
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );

    return this.serviceAccountService.getNotification(business.id);
  }

  @ApiOperation({ description: "set notification" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/notification-setting")
  async setNotification(
    @Body() notification: NotificationSettingDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );

    return this.serviceAccountService.setNotification({
      ...notification,
      business_id: business.id,
    });
  }
}
