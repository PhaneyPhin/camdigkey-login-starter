import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentEntity } from "./document.entity";
import { DocumentService } from "./document.service";
import { HandlebarsService } from "./handle-bar.service";
import { InvoiceController } from "./invoice.controller";
import { NoteController } from "./note.controller";
import { UBLHelperService } from "./ubl-helper.service";

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  controllers: [InvoiceController, NoteController],
  providers: [DocumentService, UBLHelperService, HandlebarsService],
})
export class InvoiceModule {}
