import { PaginationRequest } from "@libs/pagination";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { UserResponseDto } from "../user/dtos";
import { BusinessResponseDto, CreateBusinessRequestDto } from "./dtos";
import { NotificationSettingDto } from "./dtos/notification-setting.dto";

@Injectable()
export class ServiceAccountService implements OnModuleInit {
  private businessClient: ClientProxy;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.businessClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get("SERVICE_ACCOUNT_HOST", "localhost"),
        port: 3002,
      },
    });
  }

  // 1. Register Business
  async registerBusiness(payload: CreateBusinessRequestDto) {
    return firstValueFrom(
      this.businessClient.send("business.register", payload)
    );
  }

  async getBusinessProfile(
    user: UserResponseDto
  ): Promise<BusinessResponseDto | null> {
    try {
      return await this.getBusinessByEndpoint(user.endpoint_id);
    } catch (e) {
      try {
        return await this.getByNationalId(user.personal_code);
      } catch (e) {
        return null;
      }
    }
  }

  // 2. Update Business
  async updateBusiness(id: number, data: CreateBusinessRequestDto) {
    return firstValueFrom(
      this.businessClient.send("business.update", { id, data })
    );
  }

  // 3. Get Business By ID
  async getBusinessById(id: number) {
    return firstValueFrom(
      this.businessClient.send("business.findById", { id })
    );
  }

  // 4. Get Business By Endpoint
  async getBusinessByEndpoint(endpointId: string) {
    try {
      return firstValueFrom(
        this.businessClient.send("business.getByEndpointId", endpointId)
      );
    } catch (e) {
      return { step: 1 };
    }
  }

  // 5. List Business (with pagination)
  async listBusiness(payload: PaginationRequest) {
    return firstValueFrom(this.businessClient.send("business.list", payload));
  }

  // 6. Get All Businesses (no pagination)
  async getAllBusiness() {
    return firstValueFrom(this.businessClient.send("business.all", {}));
  }

  // 7. Approve Business
  async approveBusiness(id: number, by: string) {
    return firstValueFrom(
      this.businessClient.send("business.approve", { id, by })
    );
  }

  // 8. Reject Business
  async rejectBusiness(id: number, type: string, message: string, by: string) {
    return firstValueFrom(
      this.businessClient.send("business.reject", { id, type, message, by })
    );
  }

  // 9. Set Notification
  async setNotification(payload: NotificationSettingDto) {
    return firstValueFrom(
      this.businessClient.send("business.setNotification", payload)
    );
  }

  // 9. Set Notification
  async getByNationalId(id: string) {
    return firstValueFrom(
      this.businessClient.send("business.getByNationalId", id)
    );
  }

  // 10. Get Notification
  async getNotification(payload: string) {
    return firstValueFrom(
      this.businessClient.send("business.getNotification", payload)
    );
  }

  async call(pattern: string, payload: any) {
    const value = await firstValueFrom(
      this.businessClient.send(pattern, payload)
    );

    return value;
  }
}
