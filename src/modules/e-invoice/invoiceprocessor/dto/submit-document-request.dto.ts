import { DocumentType } from "@modules/accouting/invoice/enums/DocumentType";

export class SubmitDocumentRequestDto {
  document: string;
  document_type: DocumentType;
  supplier_id: string;
}
