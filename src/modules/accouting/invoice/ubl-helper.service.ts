import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { join } from "path";
import { DocumentEntity } from "./document.entity";
import { TaxSubtotal } from "./dto";
import {
  AllowanceChargeDto,
  InvoiceLineDto,
  TaxCategoryDto,
} from "./dto/create-invoice.dto";
import { InvoiceType } from "./enums/InvoiceType";
import { HandlebarsService } from "./handle-bar.service";

@Injectable()
export class UBLHelperService {
  private static InvoiceTypeCode = {
    [InvoiceType.TAX_INVOICE]: 388,
    [InvoiceType.COMMERCIAL_INVOICE]: 380,
  };
  constructor(private readonly handlebarsService: HandlebarsService) {}

  public generateXml(
    documentType: "INVOICE" | "CREDIT_NOTE",
    invoice: any
  ): string {
    const templatePath = join(
      __dirname,
      UBLHelperService.ublTemplate[documentType]
    );
    const xmlDocument = this.handlebarsService.compile(templatePath, invoice);
    return xmlDocument;
  }

  static ublTemplate = {
    INVOICE: "../../../../views/invoice-ubl.hbs",
    CREDIT_NOTE: "../../../../views/credit-note-ubl.hbs",
    DEBIT_NOTE: "../../../../views/debit-note-ubl.hbs",
  };
  public toUBL(document: DocumentEntity): string {
    this.fillInvoiceInformation(document);
    const templatePath = join(
      __dirname,
      UBLHelperService.ublTemplate[document.document_type]
    );
    const xmlDocument = this.handlebarsService.compile(templatePath, document);

    return xmlDocument;
  }

  private calculateAllowanceCharges(
    allowanceChargeTotal: { charges: number; allowances: number },
    taxCategorySubtotals: Record<string, TaxSubtotal>,
    allowanceCharges: AllowanceChargeDto[]
  ) {
    for (let allowanceCharge of allowanceCharges) {
      if (allowanceCharge.charge_indicator) {
        allowanceChargeTotal.charges += allowanceCharge.amount;
      } else {
        allowanceChargeTotal.allowances += allowanceCharge.amount;
      }

      if (allowanceCharge.tax_categories) {
        this.calculateTaxSubtotal(
          taxCategorySubtotals,
          allowanceCharge.tax_categories
        );
      }
    }
  }

  public fillInvoiceInformation(invoice: Partial<DocumentEntity>) {
    try {
      let taxCategorySubTotal: Record<string, TaxSubtotal> = {};
      let allowanceChargeTotal = { charges: 0, allowances: 0 };
      invoice.invoice_type_code =
        UBLHelperService.InvoiceTypeCode[invoice.invoice_type_code as any] ||
        UBLHelperService.InvoiceTypeCode[InvoiceType.TAX_INVOICE];

      const { totalExtensionAmount, totalVatExclusiveAmount } =
        this.processInvoiceLines(invoice, taxCategorySubTotal);

      if (invoice.allowance_charges) {
        this.calculateAllowanceCharges(
          allowanceChargeTotal,
          taxCategorySubTotal,
          invoice.allowance_charges
        );
      }

      const { taxAmount, taxSubtotals } =
        this.processInvoiceTaxSummary(taxCategorySubTotal);

      this.processInvoiceTotals(invoice, {
        totalExtensionAmount,
        totalVatExclusiveAmount,
        allowanceChargeTotal,
        taxAmount,
      });
    } catch (e) {
      throw new UnprocessableEntityException("Invalid info");
    }
  }

  private processInvoiceLines(
    invoice: Partial<DocumentEntity>,
    taxCategorySubTotal: Record<string, TaxSubtotal>
  ) {
    let totalExtensionAmount = 0;
    let totalVatExclusiveAmount = 0;

    invoice.invoice_lines?.forEach((line, index) => {
      totalExtensionAmount += line.line_extension_amount;
      line.id = index + 1;
      let vatExclusiveAmount = line.line_extension_amount;
      line.tax_total = { tax_amount: 0, tax_subtotals: [] };

      const vatTax = this.processLineTaxes(
        line,
        vatExclusiveAmount,
        taxCategorySubTotal
      );

      // Always set amounts (default fallback)
      line.vat_exclusive_amount = vatExclusiveAmount;
      line.tax_inclusive_amount = vatExclusiveAmount;

      totalVatExclusiveAmount += vatExclusiveAmount;
    });

    return { totalExtensionAmount, totalVatExclusiveAmount };
  }

  private processLineTaxes(
    line: InvoiceLineDto,
    vatExclusiveAmount: number,
    taxCategorySubTotal: Record<string, TaxSubtotal>
  ) {
    let vatTax: TaxCategoryDto | null = null;
    for (let taxCategory of line?.item?.tax_categories || []) {
      if (taxCategory.tax_scheme !== "VAT") {
        this.applyTaxOnItem(line, taxCategory.tax_amount, taxCategory);
        vatExclusiveAmount += taxCategory.tax_amount;
      } else {
        vatTax = taxCategory;
      }
      this.calculateTaxSubtotal(taxCategorySubTotal, [taxCategory]);
    }

    if (vatTax) {
      const calculatedVat = (vatExclusiveAmount * vatTax.percent) / 100;
      this.applyTaxOnItem(line, calculatedVat, vatTax);
    }

    return vatTax;
  }

  private calculateTaxSubtotal(
    taxCategorySubTotal: Record<string, TaxSubtotal>,
    taxCategories: TaxCategoryDto[] | undefined
  ) {
    if (!taxCategories) return;

    for (let taxCategory of taxCategories) {
      let key = `${taxCategory.id}-${taxCategory.percent}-${taxCategory.tax_scheme}`;

      if (!taxCategorySubTotal[key]) {
        taxCategorySubTotal[key] = {
          tax_amount: 0,
          taxable_amount: 0,
          tax_category: taxCategory,
        };
      }

      //Avoid dividing by 0
      if (taxCategory.percent === 0) {
        taxCategorySubTotal[key].taxable_amount = 0;
      } else {
        taxCategorySubTotal[key].taxable_amount! +=
          taxCategory.tax_amount / (taxCategory.percent / 100);
      }

      taxCategorySubTotal[key].tax_amount += taxCategory.tax_amount;
    }
  }

  private applyTaxOnItem(
    line: InvoiceLineDto,
    amount: number,
    taxCategory: TaxCategoryDto
  ) {
    if (!line.tax_total) {
      line.tax_total = {
        tax_amount: 0,
        tax_subtotals: [],
      };
    }
    line.tax_total.tax_amount += amount;
    line.tax_total?.tax_subtotals.push({
      tax_amount: taxCategory.tax_amount,
      tax_category: taxCategory,
    });
  }

  private processInvoiceTaxSummary(
    taxCategorySubTotal: Record<string, TaxSubtotal>
  ) {
    let taxAmount = 0;
    let taxSubtotals: TaxSubtotal[] = [];

    for (const key in taxCategorySubTotal) {
      taxAmount += taxCategorySubTotal[key].tax_amount;
      taxSubtotals.push(taxCategorySubTotal[key]);
    }

    return { taxAmount, taxSubtotals };
  }

  private processInvoiceTotals(invoice: Partial<DocumentEntity>, context: any) {
    const { totalExtensionAmount, allowanceChargeTotal, taxAmount } = context;
    const taxableAmount = totalExtensionAmount;

    invoice.tax_total = {
      tax_amount: taxAmount,
      tax_subtotals: context.taxSubtotals,
    };

    invoice.legal_monetary_total = {
      line_extension_amount: totalExtensionAmount,
      tax_exclusive_amount:
        taxableAmount +
        allowanceChargeTotal.charges -
        allowanceChargeTotal.allowances,
      tax_inclusive_amount:
        taxableAmount +
        allowanceChargeTotal.charges -
        allowanceChargeTotal.allowances +
        taxAmount,
      payable_amount:
        taxableAmount +
        allowanceChargeTotal.charges -
        allowanceChargeTotal.allowances +
        taxAmount -
        (invoice.prepaid_payment?.paid_amount ?? 0),
      charge_total_amount: allowanceChargeTotal.charges || undefined,
      prepaid_amount: invoice.prepaid_payment?.paid_amount ?? undefined,
      allowance_total_amount: allowanceChargeTotal.allowances || undefined,
    };
  }

  public fromUBL(xml: string): DocumentEntity {
    //
    return new DocumentEntity();
  }
}
