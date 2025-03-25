import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, TOKEN_NAME } from "@auth";
import { AuditLogService } from "@common/audit/audit.service";
import { ApiGlobalResponse } from "@common/decorators";
import { ApiFields } from "@common/decorators/api-fields.decorator";
import {
  ApiPaginatedResponse,
  PaginationParams,
  PaginationRequest,
  PaginationResponseDto,
} from "@libs/pagination";
import { BusinessResponseDto } from "@modules/e-invoice/business/dtos";
import { ServiceAccountService } from "@modules/e-invoice/business/service-account.service";
import { InvoiceProcessorService } from "@modules/e-invoice/invoiceprocessor/invoiceprocessor.service";
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { UUID } from "crypto";
import { DocumentEntity } from "./document.entity";
import { DocumentService } from "./document.service";
import { InvoiceDto } from "./dto/create-invoice.dto";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { RejectDocumentRequest } from "./dto/reject-document.dto";
import { DocumentType } from "./enums/DocumentType";

@ApiTags("Invoice")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/invoice",
  version: "1",
})
export class InvoiceController {
  protected documentType = [DocumentType.INVOICE];

  constructor(
    private readonly documentService: DocumentService,
    private readonly auditLogService: AuditLogService,
    private readonly serviceAccountService: ServiceAccountService,
    private readonly invoiceProcessorService: InvoiceProcessorService
  ) {}

  @ApiOperation({ description: "Get a paginated invoices list" })
  @ApiPaginatedResponse(DocumentEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields([])
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get()
  public getInvoices(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.documentService.list({
      ...pagination,
      params: {
        ...pagination.params,
        supplier_id: user.endpoint_id,
        document_type: this.documentType,
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Issue new Invoice" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "Invoice already exist" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Post()
  public async createInvoice(
    @Body(ValidationPipe) dto: InvoiceDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const invoice = await this.documentService.create({
      ...dto,
      document_type: DocumentType.INVOICE,
      supplier_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "CREATE_INVOICE",
      resourceId: user.id,
      resourceType: "User",
      fields: Object.keys(dto),
      oldData: null,
      newData: invoice,
    });

    invoice.supplier = await this.serviceAccountService.getBusinessProfile(
      user
    );

    return invoice;
  }

  @ApiOperation({ description: "Update Invoice" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "Invoice already exist" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Put("/:id")
  public async updateInvoice(
    @Param("id") id: UUID,
    @Body(ValidationPipe) dto: InvoiceDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const invoice = await this.documentService.update(id, {
      ...dto,
      document_type: DocumentType.INVOICE,
      supplier_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "UPDATE_INVOICE",
      resourceId: user.id,
      resourceType: "User",
      fields: Object.keys(dto),
      oldData: null,
      newData: invoice,
    });

    invoice.supplier = await this.serviceAccountService.getBusinessProfile(
      user
    );

    return invoice;
  }

  @ApiOperation({ description: "Submit e-invoice" })
  @ApiGlobalResponse(DocumentResponseDto)
  @ApiConflictResponse({ description: "e-invoice existing" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Post("/:id")
  public async submit(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    const supplier = await this.serviceAccountService.getBusinessProfile(user);

    const einvoice = await this.documentService.submitDocument(
      document,
      supplier
    );

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "SUBMIT_INVOICE",
      resourceId: user.id,
      resourceType: "User",
      fields: ["*"],
      oldData: document,
      newData: { document_id: "einvoice id" },
    });

    // await this.documentService.remove(id);

    return einvoice;
  }

  @ApiOperation({ description: "Get a paginated invoices list" })
  @ApiPaginatedResponse(DocumentEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields([])
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/e-invoice")
  public getEInvoiceInvoices(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.invoiceProcessorService.list({
      ...pagination,
      params: {
        ...pagination.params,
        supplier_id: user.endpoint_id,
        document_type: this.documentType,
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Accept document" })
  @ApiGlobalResponse(DocumentEntity)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/accept")
  public async accept(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.customer.endpoint_id) {
      throw new NotFoundException();
    }

    return await this.invoiceProcessorService.accept(id);
  }

  @ApiOperation({ description: "send document" })
  @ApiGlobalResponse(DocumentEntity)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/send")
  public async send(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.documentService.findById(id);
    console.log(document);

    if (!document || user.endpoint_id !== document.supplier.endpoint_id) {
      throw new NotFoundException();
    }

    return await this.invoiceProcessorService.send(id);
  }

  @ApiOperation({ description: "Reject document" })
  @ApiGlobalResponse(DocumentEntity)
  @Patch("/e-invoice/:id/reject")
  public async reject(
    @Param("id") id: UUID,
    @Body() reject: RejectDocumentRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.customer.endpoint_id) {
      throw new NotFoundException();
    }

    return await this.invoiceProcessorService.reject({
      document_id: id,
      reason: reject.reason,
    });
  }

  @ApiOperation({ description: "Get einvoice by id" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Get("/e-invoice/:id")
  public async getEinvoiceById(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto> {
    const document = await this.invoiceProcessorService.findById(id);
    console.log(document);
    if (!document || user.endpoint_id !== document.supplier.endpoint_id) {
      throw new NotFoundException();
    }
    // await this.documentService.remove(id);

    return document;
  }

  @ApiOperation({ description: "Update delete invoice" })
  @ApiGlobalResponse(UserResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.delete")
  @Delete("/:id")
  public async delete(
    @Param("id") id: UUID,
    @CurrentUser() currentUser: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.documentService.findById(id);

    if (!document || document.supplier_id !== currentUser.endpoint_id) {
      throw new NotFoundException();
    }

    await this.documentService.remove(id);

    await this.auditLogService.logAction({
      actorId: currentUser.id,
      action: "DELETE_INVOICE",
      resourceId: document.document_id,
      resourceType: "Invoice",
      fields: ["*"],
      oldData: document,
      newData: null,
    });

    return document;
  }

  @ApiOperation({ description: "Get customer by id" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/:id")
  public async GetById(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto & { business: BusinessResponseDto }
  ): Promise<DocumentEntity & { supplier: BusinessResponseDto }> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    const business = await this.serviceAccountService.getBusinessProfile(user);

    return { ...document, supplier: business };
  }
}
