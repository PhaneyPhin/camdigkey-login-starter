import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { CUSTOMER_FILTER_FIELDS, CustomerService } from "./customer.service";
import {
  CreateCustomerRequestDto,
  CustomerResponseDto,
  UpdateCustomerRequestDto,
} from "./dtos";

import { CurrentUser, SuperUserGuard, TOKEN_NAME } from "@auth";
import { ApiGlobalResponse } from "@common/decorators";
import { ApiFields } from "@common/decorators/api-fields.decorator";
import {
  ApiPaginatedResponse,
  PaginationParams,
  PaginationRequest,
  PaginationResponseDto,
} from "@libs/pagination";
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { CustomerEntity } from "./customer.entity";

@ApiTags("Customer")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/customer",
  version: "1",
})
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ description: "Get a paginated customer list" })
  @ApiPaginatedResponse(CustomerResponseDto)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields(CUSTOMER_FILTER_FIELDS)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get()
  public getCustomers(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<CustomerResponseDto>> {
    return this.customerService.list<CustomerEntity, CustomerResponseDto>({
      ...pagination,
      params: { ...pagination.params, supplier_id: user.endpoint_id },
    });
  }

  @ApiOperation({ description: "Get all customer list form select form" })
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/select-options")
  public getAllCustomerForSelect(
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerEntity[]> {
    console.log(user);
    return this.customerService.getAllCustomer(user.endpoint_id);
  }

  @ApiOperation({ description: "Get customer by id" })
  @ApiGlobalResponse(CustomerResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/:id")
  public getCustomerById(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerResponseDto> {
    return this.customerService.getCustomerById(id, user.endpoint_id);
  }

  @ApiOperation({ description: "Create new customer" })
  @ApiGlobalResponse(CustomerResponseDto)
  @ApiConflictResponse({ description: "Customer already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Post()
  public createCustomer(
    @Body(ValidationPipe) dto: CreateCustomerRequestDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerResponseDto> {
    return this.customerService.createCustomer({
      ...dto,
      supplier_id: user.endpoint_id,
      createdBy: user.id,
    });
  }

  @ApiOperation({ description: "Update customer by id" })
  @ApiGlobalResponse(CustomerResponseDto)
  @ApiConflictResponse({ description: "Customer already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.update")
  @Put("/:id")
  public updateCustomer(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateCustomerRequestDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerResponseDto> {
    return this.customerService.updateCustomer(id, {
      ...dto,
      supplier_id: user.endpoint_id,
      updatedBy: user.id,
    });
  }

  @ApiOperation({ description: "Update customer by id" })
  @ApiGlobalResponse(CustomerResponseDto)
  @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.delete")
  @Delete("/:id")
  public deleteCustomer(
    @Param("id", ParseIntPipe) id: number
  ): Promise<CustomerResponseDto> {
    return this.customerService.deleteCustomer(id);
  }
}
