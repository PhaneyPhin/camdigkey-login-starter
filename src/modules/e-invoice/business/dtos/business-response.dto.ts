import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BusinessStatus } from "../enums/business-status";

export class BusinessResponseDto {
  @ApiProperty({ description: "Business ID", example: 1 })
  id: number;

  @ApiProperty({
    description: "Endpoint ID where the business was created",
    example: "endpoint-123",
  })
  endpoint_id: string;

  @ApiProperty({
    description: "Entity ID of the business",
    example: "entity-abc",
  })
  entity_id: string;

  @ApiProperty({
    description: "Company name in English",
    example: "Global Tech Ltd.",
  })
  entity_name_en: string;

  @ApiProperty({
    description: "Company name in Khmer",
    example: "ក្រុមហ៊ុន ហ្គ្លូបាល់តេក",
  })
  entity_name_kh: string;

  @ApiProperty({
    description: "Tax Identification Number (TIN)",
    example: "KHM123456789",
  })
  tin: string;

  @ApiProperty({
    description: "Entity type",
    example: "Private Limited Company",
  })
  entity_type: string;

  // business_detail fields
  @ApiPropertyOptional({
    description: "Date of incorporation",
    example: "2020-05-20",
    type: "string",
    format: "date",
  })
  date_of_incorporation?: Date;

  @ApiPropertyOptional({
    description: "City where the business is located",
    example: "Phnom Penh",
  })
  city?: string;

  @ApiPropertyOptional({
    description: "Country where the business operates",
    example: "Cambodia",
  })
  country?: string;

  @ApiPropertyOptional({
    description: "Phone number of the business",
    example: "+85512345678",
  })
  phone_number?: string;

  @ApiPropertyOptional({
    description: "Email address of the business",
    example: "info@globaltech.com",
  })
  email?: string;

  @ApiPropertyOptional({
    description: "National ID or registration number",
    example: "ID987654321",
  })
  national_id?: string;

  @ApiPropertyOptional({
    description: "Short description of the business",
    example: "Leading manufacturer of electronics.",
  })
  description?: string;

  @ApiPropertyOptional({
    description: "Filename of the logo",
    example: "logo.png",
  })
  logo_file_name?: string;

  @ApiPropertyOptional({
    description: "Public URL of the logo",
    example: "https://cdn.example.com/logo.png",
  })
  logo_url?: string;

  @ApiPropertyOptional({
    description: "Step in onboarding process",
    example: 3,
  })
  step?: number;

  @ApiPropertyOptional({
    description: "Current business status",
    enum: BusinessStatus,
  })
  status?: BusinessStatus;

  @ApiPropertyOptional({
    description: "Whether the business is active",
    example: true,
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: "Whether the KYB (Know Your Business) process is valid",
    example: false,
  })
  is_kyb_valid?: boolean;

  // business_action history
  @ApiPropertyOptional({
    description: "List of actions performed on this business",
    type: "array",
    example: [
      {
        id: 1,
        type: "approve",
        by: "admin@example.com",
        message: "Approved by compliance team",
        action_type: "manual",
        created_at: "2024-01-01T12:00:00Z",
      },
    ],
  })
  actions?: {
    id: number;
    type: "approve" | "reject";
    by: string;
    message: string;
    action_type: string;
    created_at: Date;
  }[];
}
