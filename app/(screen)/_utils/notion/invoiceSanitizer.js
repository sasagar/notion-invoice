import { plain_text } from "../properties/plain_text";

const invoiceSanitizer = async (invoice) => {

    const sanitizedInvoice = {
        title: plain_text(invoice.properties['件名']),
        created_at: invoice.created_time,
        updated_at: invoice.last_edited_time,
        customer_relation: invoice.properties['顧客'].relation[0].id,
        status: invoice.properties['ステータス'].status.name,
        published_at: invoice.properties['発行日'].date.start,
        id: plain_text(invoice.properties['請求書番号']),
        account: invoice.properties['担当者'].relation[0].id,
        due_to: invoice.properties['支払い期限日'].date.start,
        items: invoice.properties['請求内容'].relation,
        tax10: invoice.properties['税金(10%分)'].formula.number,
        tax8: invoice.properties['税金(8%分)'].formula.number,
        sum10: invoice.properties['10%対象額 小計'].rollup.number,
        sum8: invoice.properties['8%対象額 小計'].rollup.number,
        sum0: invoice.properties['非課税対象額 小計'].rollup.number,
        invoice_sum: invoice.properties['請求金額'].formula.number,
        sum: invoice.properties['請求合計(税抜)'].rollup.number,
        withholding_flag: invoice.properties['源泉徴収非対象'].checkbox,
        withholding: invoice.properties['源泉徴収'].formula.number,
        tax: invoice.properties['税額'].formula.number,
        tax_incl: invoice.properties['内税'].checkbox,
        note: plain_text(invoice.properties['備考']),
    }

    return sanitizedInvoice;
}

export default invoiceSanitizer;