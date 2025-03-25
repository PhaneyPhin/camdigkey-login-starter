import { PartialType } from "@nestjs/swagger";
import { InvoiceDto } from "./create-invoice.dto";

export class UpdateInvoiceDto extends PartialType(InvoiceDto) {}
