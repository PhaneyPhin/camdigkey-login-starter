import { PaginationRequest, PaginationResponseDto } from "@libs/pagination";
import { AuthCredentialsRequestDto } from "@modules/auth/dtos";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { firstValueFrom, lastValueFrom } from "rxjs";
import {
  ChangePasswordRequestDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from "./dtos";

@Injectable()
export class UserService implements OnModuleInit {
  private client: ClientProxy;
  constructor(private readonly configService: ConfigService) {}
  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get("USER_HOST", "localhost"),
        port: 3003,
      },
    });
  }

  async call(pattern: string, payload: any) {
    const value = await firstValueFrom(this.client.send(pattern, payload));

    return value;
  }

  createFromCamdigikey(user: any) {
    return lastValueFrom(this.client.send("user.createFromCamdigikey", user));
  }

  list(
    pagination: PaginationRequest
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.client.send("user.list", pagination).toPromise();
  }

  getAllUsers(endpointId: string): Promise<UserResponseDto[]> {
    return this.client.send("user.entity.all", endpointId).toPromise();
  }

  findByIds(ids: string[]): Promise<UserResponseDto[]> {
    return this.client.send("user.byIds", ids).toPromise();
  }

  createUser(dto: CreateUserRequestDto): Promise<UserResponseDto> {
    return this.client.send("user.entity.create", dto).toPromise();
  }

  patch(where, patch: Partial<any>) {
    console.log("patching", "user.patch", { where, patch });
    return this.client.send("user.patch", { where, patch }).toPromise();
  }

  updateUser(id: string, dto: UpdateUserRequestDto): Promise<UserResponseDto> {
    return this.client.send("user.update", { id, userDto: dto }).toPromise();
  }

  findById(id: string): Promise<UserResponseDto> {
    return this.client.send("user.findById", id).toPromise();
  }

  deleteUser(id: string): Promise<boolean> {
    return this.client.send("user.delete", id).toPromise();
  }

  login(auth: AuthCredentialsRequestDto): Promise<UserResponseDto> {
    return this.client.send("user.login", auth).toPromise();
  }

  changePassword(
    userId: string,
    dto: ChangePasswordRequestDto
  ): Promise<UserResponseDto> {
    return this.client
      .send("user.changePassword", { userId, changePassword: dto })
      .toPromise();
  }

  findByNationalId(nationalId: string): Promise<UserResponseDto | null> {
    return this.client.send("user.findByNationalId", nationalId).toPromise();
  }

  findByUsername(username: string): Promise<UserResponseDto | null> {
    return this.client.send("user.findByUsername", username).toPromise();
  }
}
