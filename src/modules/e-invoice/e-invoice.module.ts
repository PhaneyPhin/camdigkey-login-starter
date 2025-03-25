import { CommonModule } from "@common/common.module";
import { Global, Module } from "@nestjs/common";
import { MinioModule } from "src/minio/minio.module";
import { AttestationService } from "./attestation/attestation.service";
import { BusinessController } from "./business/business.controller";
import { ServiceAccountService } from "./business/service-account.service";
import { InvoiceProcessorService } from "./invoiceprocessor/invoiceprocessor.service";
import { NotificationService } from "./notification/notificaiton.service";
import { UserController } from "./user/user.controller.";
import { UserService } from "./user/user.service";

@Module({
  imports: [MinioModule, CommonModule],
  controllers: [UserController, BusinessController],
  providers: [
    UserService,
    ServiceAccountService,
    NotificationService,
    InvoiceProcessorService,
    AttestationService,
  ],
  exports: [
    UserService,
    ServiceAccountService,
    NotificationService,
    InvoiceProcessorService,
    AttestationService,
  ], // export so other modules can use it
})
@Global()
export class EInvoiceModule {}
