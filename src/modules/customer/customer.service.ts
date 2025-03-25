import { BaseCrudService } from "@common/services/base-crud.service";
import { ServiceAccountService } from "@modules/e-invoice/business/service-account.service";
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { handleDeleteError, handleError } from "@utils/handle-error";
import { Filter, Repository } from "typeorm";
import { CustomerEntity } from "./customer.entity";
import { CustomerMapper } from "./customer.mapper";
import {
  CreateCustomerRequestDto,
  CustomerResponseDto,
  UpdateCustomerRequestDto,
} from "./dtos";

export const CUSTOMER_FILTER_FIELDS = [
  "endpoint_id",
  "moc_id",
  "entity_name_en",
  "entity_name_kh",
  "supplier_id",
  "tin",
  "date_of_incorporation",
  "business_type",
  "city",
  "country",
  "phone_number",
  "email",
  "description",
  "address",
];
@Injectable()
export class CustomerService extends BaseCrudService {
  protected queryName: string = "customer";
  protected SEARCH_FIELDS = [
    "endpoint_id",
    "moc_id",
    "entity_name_en",
    "entity_name_kh",
    "tin",
    "date_of_incorporation",
    "business_type",
    "city",
    "country",
    "phone_number",
    "email",
    "description",
    "address",
  ];
  protected FILTER_FIELDS = CUSTOMER_FILTER_FIELDS;

  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    private readonly serviceAccountService: ServiceAccountService
  ) {
    super();
  }

  /**
   * Convert a UserEntity to a UserResponseDto with relations.
   */
  protected getMapperResponseEntityFields() {
    return CustomerMapper.toDto;
  }

  /**
   * Customize filter by each field query logic on listing API
   */
  protected getFilters() {
    const filters: { [key: string]: Filter<CustomerEntity> } = {
      createdAt: (query, value) => {
        const [start, end] = value.split(",");
        return query.andWhere("customer.created_at BETWEEN :start AND :end", {
          start,
          end,
        });
      },
    };

    return filters;
  }

  /** Require for base query list of feature */
  protected getListQuery() {
    return this.customerRepository.createQueryBuilder("customer");
  }

  getAllCustomer(endpointId: string) {
    return this.customerRepository.find({
      where: {
        endpoint_id: endpointId,
      },
    });
  }

  private async validExistingCustomer(
    customerDto: CreateCustomerRequestDto,
    id: number | null = null
  ) {
    if (!customerDto.endpoint_id || customerDto.endpoint_id === "") {
      let entity = null;

      try {
        entity = await this.serviceAccountService.getBusinessByEndpoint(
          "KHUID" + customerDto.moc_id
        );
      } catch (e) {}

      if (entity && entity.endpoint_id !== customerDto.supplier_id) {
        throw new UnprocessableEntityException([
          {
            path: "moc_id",
            message: `This customer is member of E-invoice please search with ${
              "KHUID" + customerDto.moc_id
            }`,
          },
        ]);
      }
    }
  }
  /**
   * Get customer by id
   */
  public async getCustomerById(
    id: number,
    endpointId: string
  ): Promise<CustomerResponseDto> {
    const entity = await this.customerRepository.findOne({
      where: {
        endpoint_id: endpointId,
        id: id,
      },
    });

    if (!entity) {
      throw new NotFoundException();
    }
    return CustomerMapper.toDto(entity);
  }

  /**
   * Create new customer
   */
  public async createCustomer(
    dto: CreateCustomerRequestDto
  ): Promise<CustomerResponseDto> {
    try {
      await this.validExistingCustomer(dto);
      let entity = CustomerMapper.toCreateEntity(dto);
      entity = await this.customerRepository.save(entity);
      return CustomerMapper.toDto(entity);
    } catch (error) {
      handleError(error, dto);
    }
  }

  /**
   * Update customer by id
   */
  public async updateCustomer(
    id: number,
    dto: UpdateCustomerRequestDto
  ): Promise<CustomerResponseDto> {
    let entity = await this.customerRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException();
    }
    try {
      await this.validExistingCustomer(dto);
      entity = CustomerMapper.toUpdateEntity(entity, dto);
      entity = await this.customerRepository.save(entity);
      return CustomerMapper.toDto(entity);
    } catch (error) {
      handleError(error, dto);
    }
  }

  /**
   * Update customer by id
   */
  public async deleteCustomer(id: number): Promise<CustomerResponseDto> {
    let entity = await this.customerRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException();
    }
    try {
      await this.customerRepository.delete({ id: id });
      return CustomerMapper.toDto(entity);
    } catch (error) {
      handleDeleteError(id, error);
    }
  }
}
