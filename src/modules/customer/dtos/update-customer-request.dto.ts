import { CreateCustomerRequestDto } from "./create-customer-request.dto";

export class UpdateCustomerRequestDto extends CreateCustomerRequestDto {
  updatedBy: string;
}
