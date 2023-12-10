import Image from "next/image";

import getInvoiceItem from "@/app/(screen)/utils/notion/getInvoiceItem";
import getInvoiceRow from "@/app/(screen)/utils/notion/getInvoiceRow";
// import getInvoiceRowItem from "@/app/(screen)/utils/notion/getInvoiceRowItem";
import invoiceSanitizer from "@/app/(screen)/utils/notion/invoiceSanitizer";
import dateFormat from "@/app/(screen)/utils/properties/dateFormat";
import dateTimeFormat from "@/app/(screen)/utils/properties/dateTimeFormat";

import StatusTag from "../components/statusTag";
import { plain_text } from "@/app/(screen)/utils/properties/plain_text";

import './style.css';

import TaxTable from "../components/taxTable";
import WithHoldingTable from "../components/withHoldingTable";
import WithHoldingRow from "../components/withHoldingRow";
import PdfDownload from "../components/pdfDownload";


const InvoiceDetail = async ({ params }) => {
    const { invoices, customer, account } = await getInvoiceItem(params.slug);

    const sanitizedInvoice = await invoiceSanitizer(invoices[0]);

    const rows = await getInvoiceRow(sanitizedInvoice.items);

    // const tmpRowItem = await getInvoiceRowItem(rows[0].properties['項目'].relation[0].id);

    return (
        <article className="mr-8">
            <section className="rounded border border-slate-600 bg-slate-900 px-6 py-4 flex justify-between items-center mb-5 gap-6">
                <div className="">
                    <div className="flex justify-start items-center gap-5 flex-wrap">
                        <h1 className="text-3xl font-bold">{sanitizedInvoice.title}</h1>
                        <StatusTag status={sanitizedInvoice.status} />
                    </div>
                    <div className="mt-5">
                        <PdfDownload number={sanitizedInvoice.id} customer={customer} account={account} />
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div>
                        #{sanitizedInvoice.id}
                    </div>
                    <div className="text-right">
                        最終更新日: <span className="font-bold">{dateTimeFormat(sanitizedInvoice.updated_at)}</span>
                    </div>
                </div>
            </section>
            <section className="rounded border border-slate-600 bg-slate-900 px-6 py-4 flex justify-between items-start mb-5">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3">請求情報</h2>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">請求日</h3>
                        <time dateTime={sanitizedInvoice.published_at}>{dateFormat(sanitizedInvoice.published_at)}</time>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">支払期限</h3>
                        <time dateTime={sanitizedInvoice.due_to}>{dateFormat(sanitizedInvoice.due_to)}</time>
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3">請求先</h2>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">顧客名</h3>
                        <span>{plain_text(customer.properties['顧客名'])}</span>
                    </div>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">宛名</h3>
                        <span>{plain_text(customer.properties['社名/個人名'])} {plain_text(customer.properties['敬称'])}</span>
                    </div>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">会社情報</h3>
                        <span className="whitespace-pre-wrap">{plain_text(customer.properties['会社情報'])}</span>
                    </div>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">担当者名</h3>
                        <span>{plain_text(customer.properties['担当者名'])}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3">自社情報</h2>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">担当者名</h3>
                        <span>{plain_text(account.properties['担当者名'])}</span>
                    </div>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">会社名</h3>
                        <div className="flex items-center justify-start gap-2">
                            <span>{plain_text(account.properties['会社名'])}</span>
                            <Image src={account.properties['印鑑画像'].files[0].file.url} alt={account.properties['印鑑画像'].files[0].name} className="w-10 h-10 object-contain" width="1024" height="1024" />
                        </div>
                    </div>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">会社情報</h3>
                        <span className="whitespace-pre-wrap">{plain_text(account.properties['会社情報'])}</span>
                    </div>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">口座情報</h3>
                        <span className="whitespace-pre-wrap">{plain_text(account.properties['銀行情報'])}</span>
                    </div>
                    <div className="mb-2">
                        <h3 className="text-xl font-bold">適格請求書 登録番号</h3>
                        <span className="whitespace-pre-wrap">{plain_text(account.properties['登録番号']) ? plain_text(account.properties['登録番号']) : "(未登録)"}</span>
                    </div>
                </div>
            </section>
            <section className="rounded border border-slate-600 bg-slate-900 px-6 py-4 mb-5">
                <div className="mb-5">
                    <h2 className="text-2xl font-bold mb-3">請求内容</h2>
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>表示名</th>
                                <th>項目名</th>
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
                                        <td className="text-slate-400">{row.properties['項目名'].rollup.array[0].title[0].plain_text}</td>
                                        <td className="text-right">&yen; {row.properties['単価'].rollup.array[0].number.toLocaleString()}</td>
                                        <td className="text-right">{row.properties['数量'].number.toLocaleString()}</td>
                                        <td className="text-right">&yen; {row.properties['小計'].formula.number.toLocaleString()}</td>
                                        <td className="text-center">{plain_text(row.properties['税率'])}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-8 justify-stretch mb-5">
                    <TaxTable sanitizedInvoice={sanitizedInvoice} />
                    <WithHoldingTable sanitizedInvoice={sanitizedInvoice} />
                </div>

                <div className="mb-5 w-full max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-3">請求額</h2>
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
                            <WithHoldingRow sanitizedInvoice={sanitizedInvoice} />
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>請求額合計</th>
                                <td className="text-right text-2xl font-bold">&yen; {(sanitizedInvoice.invoice_sum).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="mb-5">
                    <h2 className="text-2xl font-bold mb-3">備考</h2>
                    <p className="whitespace-pre-wrap">{sanitizedInvoice.note}{sanitizedInvoice.tax_incl ? <><br /><br />この請求書は内税にて計算をしております。</> : ""}</p>
                </div>
            </section>
        </article>
    );
}

export default InvoiceDetail;