import { BaseCrudService } from "@common/services/base-crud.service";
import { BusinessResponseDto } from "@modules/e-invoice/business/dtos";
import { InvoiceProcessorService } from "@modules/e-invoice/invoiceprocessor/invoiceprocessor.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UUID } from "crypto";
import { Repository } from "typeorm";
import { DocumentEntity } from "./document.entity";
import { InvoiceDto } from "./dto/create-invoice.dto";
import { CreditNoteDto } from "./dto/credit-note.dto";
import { DebitNoteDto } from "./dto/debit-note.dto";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { UBLHelperService } from "./ubl-helper.service";

@Injectable()
export class DocumentService extends BaseCrudService {
  protected FILTER_FIELDS: string[] = [];
  protected SEARCH_FIELDS: string[] = [];
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly ublHelperService: UBLHelperService,
    private readonly invoiceProcessorService: InvoiceProcessorService
  ) {
    super();
  }

  protected getFilters() {
    return {
      document_type: (query, value) => {
        return query.where(`document_type IN (:...document_type)`, {
          document_type: value,
        });
      },
    };
  }

  protected getMapperResponseEntityFields() {
    return (a) => a;
  }

  protected getListQuery() {
    return this.documentRepository.createQueryBuilder("document");
  }

  protected queryName: string = "";

  async create(document: InvoiceDto | CreditNoteDto | DebitNoteDto) {
    let documentEntity;
    if (document.is_draft) {
      document.status = "draft";
    } else {
      document.status = "posted";
    }

    if (document.document_id) {
      documentEntity = await this.documentRepository.findOneBy({
        document_id: document.document_id,
      });

      documentEntity = this.documentRepository.merge(documentEntity, document);
    } else {
      documentEntity = this.documentRepository.create(document);
    }

    return await this.documentRepository.save(documentEntity);
  }

  async update(
    documentId: UUID,
    document: InvoiceDto | CreditNoteDto | DebitNoteDto
  ) {
    let documentEntity;

    if (document.is_draft) {
      document.status = "draft";
    } else {
      document.status = "posted";
    }

    documentEntity = await this.documentRepository.findOneBy({
      document_id: documentId,
    });

    documentEntity = this.documentRepository.merge(documentEntity, document);

    return await this.documentRepository.save(documentEntity);
  }

  findById(id: UUID) {
    return this.documentRepository.findOne({
      where: { document_id: id },
      relations: ["customer"],
    });
  }

  public async submitDocument(
    document: DocumentEntity,
    supplier: BusinessResponseDto
  ): Promise<DocumentResponseDto> {
    if (document.status !== "posted") {
      throw new ForbiddenException(
        "Document not yet posted can't submit to e-invoice"
      );
    }
    const xml = this.ublHelperService.toUBL({
      ...document,
      supplier,
    });

    console.log(xml);
    const base64Xml = Buffer.from(xml).toString("base64");
    console.time("submit");
    const result = await this.invoiceProcessorService.submitDocument({
      document: base64Xml,
      document_type: document.document_type,
      supplier_id: supplier.endpoint_id,
    });

    console.timeEnd("submit");
    return result;
  }

  async remove(id: UUID) {
    return await this.documentRepository.delete({ document_id: id });
  }
}
