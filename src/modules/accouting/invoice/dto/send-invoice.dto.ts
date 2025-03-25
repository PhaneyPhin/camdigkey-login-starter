import { Expose } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsString, IsArray, ArrayMinSize } from 'class-validator';

export class SubmitInvoiceDto {
    @Expose()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    documents: [];
}
