export class UpdateBusinessRequestDto {
  endpoint_id?: string;
  entity_id?: string;
  entity_name_en?: string;
  entity_name_kh?: string;
  tin?: string;
  entity_type?: string;

  // business_detail fields
  date_of_incorporation?: Date;
  city?: string;
  country?: string;
  phone_number?: string;
  email?: string;
  national_id?: string;
  description?: string;
  logo_file_name?: string;
  step?: number;
  status?: string;
  is_active?: boolean;
  is_kyb_valid?: boolean;
}
