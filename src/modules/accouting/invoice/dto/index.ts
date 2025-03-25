import { TaxCategoryDto } from "./create-invoice.dto";

export interface TaxSubtotal {
  tax_amount: number;
  taxable_amount?: number;
  tax_category: TaxCategoryDto;
}

export interface TaxTotal {
  tax_amount: number;

  tax_subtotals: TaxSubtotal[];
}

export interface AllowanceChargeTotal {
  charges: number;
  allowances: number;
}

export interface LegalMonetaryTotal {
  line_extension_amount: number;
  tax_exclusive_amount: number;
  tax_inclusive_amount: number;
  payable_amount: number;
  charge_total_amount?: number;
  prepaid_amount?: number;
  allowance_total_amount?: number;
}
