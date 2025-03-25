import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AttestationService implements OnModuleInit {
  private client: ClientProxy;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get("ATTESTATION_HOST", "localhost"),
        port: 3007,
      },
    });
  }

  public attest(data) {
    return this.client.emit("attestation.attest", data);
  }

  async call(pattern: string, payload: any) {
    const value = await firstValueFrom(this.client.send(pattern, payload));

    return value;
  }
}
