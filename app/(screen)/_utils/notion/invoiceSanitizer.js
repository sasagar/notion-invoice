import { plain_text } from '../properties/plain_text';
import getInvoiceRow from './getInvoiceRow';

/**
 *  Sanitize the invoice.
 *
 * @param {*} invoice
 * @return {} 
 */
const invoiceSanitizer = async invoice => {
  const sanitizedInvoice = {
    title: plain_text(invoice.properties.件名),
    created_at: invoice.created_time,
    updated_at: invoice.last_edited_time,
    customer_relation: invoice.properties.顧客.relation[0].id,
    status: invoice.properties.ステータス.status.name,
    published_at: invoice.properties.発行日.date.start,
    id: plain_text(invoice.properties.請求書番号),
    account: invoice.properties.担当者.relation[0].id,
    due_to: invoice.properties.支払い期限日.date.start,
    items: invoice.properties.請求内容.relation,
    tax10: invoice.properties['税金(10%分)'].formula.number,
    tax8: invoice.properties['税金(8%分)'].formula.number,
    sum10: invoice.properties['10%対象額 小計'].rollup.number,
    sum8: invoice.properties['8%対象額 小計'].rollup.number,
    sum0: invoice.properties['非課税対象額 小計'].rollup.number,
    invoice_sum: invoice.properties.請求金額.formula.number,
    sum: invoice.properties.請求金額.formula.number,
    withholding_flag: invoice.properties.源泉徴収非対象.checkbox,
    withholding: invoice.properties.源泉徴収.formula.number,
    tax: invoice.properties.税額.formula.number,
    tax_incl: invoice.properties.内税.checkbox,
    note: plain_text(invoice.properties.備考),
  };

  // formula, rollupのレスポンスがおかしいので対応

  const items = await getInvoiceRow(sanitizedInvoice.items);

  const sum10 = items
    .flatMap(item => item.properties)
    .reduce((sum, current) => sum + current['10%対象額'].formula.number, 0);

  const sum8 = items
    .flatMap(item => item.properties)
    .reduce((sum, current) => sum + current['8%対象額'].formula.number, 0);

  const sum0 = items
    .flatMap(item => item.properties)
    .reduce((sum, current) => sum + current.非課税対象額.formula.number, 0);

  /**
   * Calculate the tax at 10% based on the value of sanitizedInvoice.tax_incl.
   *
   * @return {number} The calculated tax amount
   */
  const tax10 = () => {
    if (sanitizedInvoice.tax_incl) {
      return sum10 - Math.floor(sum10 / 1.1);
    } else {
      return Math.floor(sum10 * 0.1);
    }
  }

  /**
   * Calculate the tax at 8% based on the value of sanitizedInvoice.tax_incl.
   *
   * @return {number} the calculated tax amount
   */
  const tax8 = () => {
    if (sanitizedInvoice.tax_incl) {
      return sum8 - Math.floor(sum8 / 1.08);
    } else {
      return Math.floor(sum8 * 0.08);
    }
  }

  const sum = items
    .flatMap(item => item.properties)
    .reduce((sum, current) => sum + current.小計.formula.number, 0);

  /**
   * This function calculates and returns the withholding amount based on the sanitized invoice data.
   *
   * @return {number} the calculated withholding amount
   */
  const withholding = () => {
    if (sanitizedInvoice.withholding_flag) {
      return 0;
    } else {
      if (sanitizedInvoice.tax_incl) {
        return Math.floor((sum10 + sum8 - tax10() - tax8()) * 0.1021 ) * -1;
      } else {
        return Math.floor((sum10 + sum8) * 0.1021) * -1;
      }
    }
  }

  /**
   * Calculates the sum of the invoice, taking into account the tax inclusion status. 
   *
   * @return {number} the total sum of the invoice
   */
  const invoice_sum = () => {
    if (sanitizedInvoice.tax_incl) {
      return (sum + withholding());
    } else {
      return (sum + tax10() + tax8() + withholding());
    }
  }
  
  sanitizedInvoice.sum10 = sum10;
  sanitizedInvoice.sum8 = sum8;
  sanitizedInvoice.sum0 = sum0;
  sanitizedInvoice.tax10 = tax10();
  sanitizedInvoice.tax8 = tax8();
  sanitizedInvoice.sum = sum;
  sanitizedInvoice.withholding = withholding();
  sanitizedInvoice.tax = sanitizedInvoice.tax10 + sanitizedInvoice.tax8;
  sanitizedInvoice.invoice_sum = invoice_sum();

  return sanitizedInvoice;
};

export default invoiceSanitizer;
