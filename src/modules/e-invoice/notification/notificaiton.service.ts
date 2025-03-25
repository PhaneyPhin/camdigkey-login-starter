import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class NotificationService implements OnModuleInit {
  private businessClient: ClientProxy;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.businessClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get("NOTIFICATION_HOST", "localhost"),
        port: 3004,
      },
    });
  }

  async call(pattern: string, payload: any) {
    const value = await firstValueFrom(
      this.businessClient.send(pattern, payload)
    );

    return value;
  }
}
