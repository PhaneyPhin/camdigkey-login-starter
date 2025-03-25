import { CustomerEntity } from "./customer.entity";
import {
  CreateCustomerRequestDto,
  CustomerResponseDto,
  UpdateCustomerRequestDto,
} from "./dtos";

export class CustomerMapper {
  public static async toDto(
    entity: CustomerEntity
  ): Promise<CustomerResponseDto> {
    const dto = new CustomerResponseDto();
    dto.id = entity.id;
    dto.active = (entity as any).active; // or your default fields
    dto.endpoint_id = entity.endpoint_id;
    dto.supplier_id = entity.supplier_id;
    dto.moc_id = entity.moc_id;
    dto.entity_name_en = entity.entity_name_en;
    dto.entity_name_kh = entity.entity_name_kh;
    dto.tin = entity.tin;
    dto.date_of_incorporation = entity.date_of_incorporation;
    dto.business_type = entity.business_type;
    dto.city = entity.city;
    dto.country = entity.country;
    dto.phone_number = entity.phone_number;
    dto.email = entity.email;
    dto.description = entity.description;
    dto.address = entity.address;

    return dto;
  }

  public static toCreateEntity(dto: CreateCustomerRequestDto): CustomerEntity {
    const entity = new CustomerEntity();
    // default fields?
    entity.active = true;
    entity.endpoint_id = dto.endpoint_id;
    entity.supplier_id = dto.supplier_id;
    entity.moc_id = dto.moc_id;
    entity.entity_name_en = dto.entity_name_en;
    entity.entity_name_kh = dto.entity_name_kh;
    entity.tin = dto.tin;
    entity.date_of_incorporation = dto.date_of_incorporation;
    entity.business_type = dto.business_type;
    entity.city = dto.city;
    entity.country = dto.country;
    entity.phone_number = dto.phone_number;
    entity.email = dto.email;
    entity.description = dto.description;
    entity.address = dto.address;

    return entity;
  }

  public static toUpdateEntity(
    entity: CustomerEntity,
    dto: UpdateCustomerRequestDto
  ): CustomerEntity {
    entity.endpoint_id = dto.endpoint_id;
    entity.supplier_id = dto.supplier_id;
    entity.moc_id = dto.moc_id;
    entity.entity_name_en = dto.entity_name_en;
    entity.entity_name_kh = dto.entity_name_kh;
    entity.tin = dto.tin;
    entity.date_of_incorporation = dto.date_of_incorporation;
    entity.business_type = dto.business_type;
    entity.city = dto.city;
    entity.country = dto.country;
    entity.phone_number = dto.phone_number;
    entity.email = dto.email;
    entity.description = dto.description;
    entity.address = dto.address;

    return entity;
  }
}
