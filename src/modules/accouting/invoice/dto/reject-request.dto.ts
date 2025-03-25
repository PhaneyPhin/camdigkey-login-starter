import { UUID } from "crypto";

export class RejectRequestDto {
  document_id: UUID;
  reason: string;
}
