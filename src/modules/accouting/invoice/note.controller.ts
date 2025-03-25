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
import { CreditNoteDto } from "./dto/credit-note.dto";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { RejectDocumentRequest } from "./dto/reject-document.dto";
import { DocumentType } from "./enums/DocumentType";

@ApiTags("Note")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/note",
  version: "1",
})
export class NoteController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly auditLogService: AuditLogService,
    private readonly serviceAccountService: ServiceAccountService,
    private readonly invoiceProcessorService: InvoiceProcessorService
  ) {}

  @ApiOperation({ description: "Get a paginated notes list" })
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
        document_type: pagination.params?.document_type
          ? [pagination.params.document_type]
          : [DocumentType.CREDIT_NOTE, DocumentType.DEBIT_NOTE],
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Get credit/debit note by id" })
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

  @ApiOperation({ description: "Create new credit note" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "Customer already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Post("/credit-note")
  public async CreateCreditNote(
    @Body(ValidationPipe) dto: CreditNoteDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const creditNote = await this.documentService.create({
      ...dto,
      document_type: DocumentType.CREDIT_NOTE,
      supplier_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: dto.document_id ? "UPDATE_CREDIT_NOTE" : "CREATE_CREDIT_NOTE",
      resourceId: user.id,
      resourceType: "User",
      fields: Object.keys(dto),
      oldData: null,
      newData: creditNote,
    });

    creditNote.supplier = await this.serviceAccountService.getBusinessProfile(
      user
    );

    return creditNote;
  }

  @Post("/debit-note")
  public async creditDebitNote(
    @Body(ValidationPipe) dto: CreditNoteDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const creditNote = await this.documentService.create({
      ...dto,
      document_type: DocumentType.CREDIT_NOTE,
      supplier_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: dto.document_id ? "UPDATE_CREDIT_NOTE" : "CREATE_CREDIT_NOTE",
      resourceId: user.id,
      resourceType: "User",
      fields: Object.keys(dto),
      oldData: null,
      newData: creditNote,
    });

    creditNote.supplier = await this.serviceAccountService.getBusinessProfile(
      user
    );

    return creditNote;
  }

  @ApiOperation({ description: "Update credit note" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "credit note" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Put("/credit-note/:id")
  public async updateInvoice(
    @Param("id") id: UUID,
    @Body(ValidationPipe) dto: CreditNoteDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const creditNote = await this.documentService.update(id, {
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
      newData: creditNote,
    });

    creditNote.supplier = await this.serviceAccountService.getBusinessProfile(
      user
    );

    return creditNote;
  }

  @ApiOperation({ description: "Update debit note" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "debit ntoe already exist" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Put("/debit-note/:id")
  public async updateDebitNote(
    @Param("id") id: UUID,
    @Body(ValidationPipe) dto: CreditNoteDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const creditNote = await this.documentService.update(id, {
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
      newData: creditNote,
    });

    creditNote.supplier = await this.serviceAccountService.getBusinessProfile(
      user
    );

    return creditNote;
  }

  @ApiOperation({ description: "submit credit/debit note" })
  @ApiGlobalResponse(DocumentResponseDto)
  @ApiConflictResponse({ description: "Customer already exists" })
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
      action: "SUBMIT_" + document.document_type,
      resourceId: user.id,
      resourceType: "User",
      fields: ["*"],
      oldData: document,
      newData: { document_id: "einvoice id" },
    });

    // await this.documentService.remove(id);

    return einvoice;
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

  @ApiOperation({ description: "Accept document" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/accept")
  public async accept(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.customer.endpoint_id) {
      throw new NotFoundException();
    }

    return await this.invoiceProcessorService.accept(id);
  }

  @ApiOperation({ description: "Accept document" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/send")
  public async send(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    return await this.invoiceProcessorService.send(id);
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

    if (
      !document ||
      (user.endpoint_id !== document.supplier.endpoint_id &&
        user.endpoint_id !== document.customer.endpoint_id)
    ) {
      throw new NotFoundException();
    }
    // await this.documentService.remove(id);

    return document;
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

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    return await this.invoiceProcessorService.reject({
      document_id: id,
      reason: reject.reason,
    });
  }
}
