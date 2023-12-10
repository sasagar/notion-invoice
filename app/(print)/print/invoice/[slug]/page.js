import Image from "next/image";

import getInvoiceItem from "@/app/(screen)/utils/notion/getInvoiceItem";
import invoiceSanitizer from "@/app/(screen)/utils/notion/invoiceSanitizer";
import getInvoiceRow from "@/app/(screen)/utils/notion/getInvoiceRow";
import dateFormat from "@/app/(screen)/utils/properties/dateFormat";

import { plain_text } from "@/app/(screen)/utils/properties/plain_text";

import CustomerInfo from "./components/customerInfo";
import CustomerPerson from "./components/customerPerson";
import AccountInfo from "./components/accountInfo";
import PrintTaxTable from "./components/printTaxTable";
import PrintWithHoldingTable from "./components/printWithHoldingTable";
import PrintWithHoldingRow from "./components/printWithHoldingRow";

const invoicePrintPage = async ({ params }) => {

    const { invoices, customer, account } = await getInvoiceItem(params.slug);
    const sanitizedInvoice = await invoiceSanitizer(invoices[0]);
    const rows = await getInvoiceRow(sanitizedInvoice.items);

    return (
        <>
            <section className="border-t-[5mm] border-b-[2mm] border-kent-blue-500 py-4 px-4 mb-4 flex justify-between items-center break-inside-avoid-page">
                <h1 className="text-3xl font-bold">請求書</h1>
                <div className="text-right text-sm">
                    <p>#{sanitizedInvoice.id}</p>
                    <p>発行日: {dateFormat(sanitizedInvoice.created_at)}</p>
                </div>
            </section>

            <div className="flex justify-between gap-8 py-4 px-4 break-inside-avoid-page">
                <div className="flex-1">
                    <section className="mb-6">
                        <h2 className=" text-lg font-bold">{plain_text(customer.properties['社名/個人名'])} {plain_text(customer.properties['敬称'])}</h2>
                        <CustomerInfo customer={customer} />
                        <CustomerPerson customer={customer} />
                    </section>

                    <section className="mb-6">
                        <p>お世話になっております。下記の通りご請求いたします。</p>
                    </section>

                    <section className="double-border">
                        <div className="flex justify-start items-baseline gap-10 px-3 py-2 border-b-2 border-kent-blue-500">
                            <h2 className="text-xl">御請求額</h2>
                            <p className="text-2xl font-bold">¥ {sanitizedInvoice.sum.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-start items-baseline gap-10 px-3 py-2">
                            <h2 className="text-lg">支払期限</h2>
                            <p className="text-lg font-bold"><time dateTime={sanitizedInvoice.due_to}>{dateFormat(sanitizedInvoice.due_to)}</time></p>
                        </div>
                    </section>
                </div>

                <div className="min-w-fit">
                    <section className="flex gap-2">
                        <div className="">
                            <h2 className=" text-lg font-bold">{plain_text(account.properties['会社名'])}</h2>
                            <AccountInfo account={account} />
                            登録番号: {plain_text(account.properties['登録番号']) ? plain_text(account.properties['登録番号']) : "(未登録)"}
                        </div>
                        <div className="w-20 h-auto">
                            <Image src={account.properties['印鑑画像'].files[0].file.url} alt={account.properties['印鑑画像'].files[0].file.name} width={1024} height={1024} />
                        </div>
                    </section>
                    <section className="double-border my-3 flex-1">
                        <h2 className="text-lg font-bold border-b-2 border-kent-blue-500 mb-2">振込先情報</h2>
                        <p className="whitespace-pre-wrap">{plain_text(account.properties['銀行情報'])}</p>
                    </section>
                </div>
            </div>

            <section className="pb-4 px-4 break-inside-avoid-page">
                <h2 className="text-2xl font-bold mb-3 border-b-2 border-kent-blue-500 py-3">請求明細</h2>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th>項目</th>
                            <th>単価 {sanitizedInvoice.tax_incl ? "(税込)" : ""}</th>
                            <th>数量</th>
                            <th>小計 {sanitizedInvoice.tax_incl ? "(税込)" : ""}</th>
                            <th>税率</th>
                        </tr>

                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            return (
                                <tr key={index}>
                                    <td>{plain_text(row.properties['名前'])}</td>
                                    <td className="text-right">&yen; {row.properties['単価'].rollup.array[0].number.toLocaleString()}</td>
                                    <td className="text-right">{row.properties['数量'].number.toLocaleString()}</td>
                                    <td className="text-right">&yen; {row.properties['小計'].formula.number.toLocaleString()}</td>
                                    <td className="text-center">{plain_text(row.properties['税率'])}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </section>

            <section className="py-4 mx-4 flex justify-between gap-8 border-b-2 border-kent-blue-500 break-inside-avoid-page">
                <PrintTaxTable sanitizedInvoice={sanitizedInvoice} />
                <PrintWithHoldingTable sanitizedInvoice={sanitizedInvoice} />
            </section>

            <div className="flex justify-between gap-8 py-4 px-4 border-b-[5mm] border-kent-blue-500 break-inside-avoid-page">
                <section className="flex-1">
                    <h2 className="text-2xl font-bold mb-3 border-b-2 border-kent-blue-500 py-3">請求額</h2>
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>項目</th>
                                <th>小計</th>
                            </tr>

                        </thead>
                        <tbody>
                            <tr>
                                <td>請求額</td>
                                <td className="text-right">&yen; {sanitizedInvoice.sum.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>消費税{sanitizedInvoice.tax_incl ? "(内税額)" : ""}</td>
                                <td className="text-right">{sanitizedInvoice.tax_incl ? "(" : ""}&yen; {sanitizedInvoice.tax.toLocaleString()}{sanitizedInvoice.tax_incl ? ")" : ""}</td>
                            </tr>
                            <PrintWithHoldingRow sanitizedInvoice={sanitizedInvoice} />
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>請求額合計</th>
                                <td className="text-right text-2xl font-bold">&yen; {(sanitizedInvoice.invoice_sum).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </section>

                <section className="double-border my-3 flex-1 break-inside-avoid-page">
                    <h2 className="font-bold border-b-2 border-kent-blue-500 mb-2">備考</h2>
                    <p className="whitespace-pre-wrap">{sanitizedInvoice.note}{sanitizedInvoice.tax_incl ? <><br /><br />この請求書は内税にて計算をしております。</> : ""}</p>
                </section>
            </div>
        </>
    )
}

export default invoicePrintPage;