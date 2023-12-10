import InvoiceLink from "./invoiceLink";
import getInvoices from "@/app/(screen)/utils/notion/getInvoices";
import { SlPencil, SlEnvolopeLetter, SlCheck } from "react-icons/sl";
import "./sidebar.css";
import { plain_text } from "@/app/(screen)/utils/properties/plain_text";

const InvoiceSidebar = async () => {
    const draft = await getInvoices("ドラフト");
    const sent = await getInvoices("送付済み");
    const completed = await getInvoices("支払い済み");
    return (
        <aside className="fixed top-16 w-2/12 bg-slate-800 rounded-tr-2xl rounded-br-2xl shadow shadow-slate-950 border-r border-t border-b border-slate-600 py-8 px-5 transition-all">
            <h2 className=" text-2xl font-bold mb-5">Notion Invoice</h2>

            <ul>
                <li>
                    <details>
                        <summary>
                            <SlPencil /> ドラフト
                        </summary>
                        <ul className="aside_draft">
                            {
                                draft.map(invoice => {
                                    const number = plain_text(invoice.properties['請求書番号']);
                                    return (
                                        <li key="number">
                                            <InvoiceLink number={number} />
                                        </li>
                                    )
                                })
                            }

                        </ul>
                    </details>
                </li>
                <li>
                    <details>
                        <summary>
                            <SlEnvolopeLetter /> 送付済み
                        </summary>
                        <ul className="aside_sent">
                            {
                                sent.map(invoice => {
                                    const number = plain_text(invoice.properties['請求書番号']);
                                    return (
                                        <li key="number">
                                            <InvoiceLink number={number} />
                                        </li>
                                    )
                                })
                            }

                        </ul>
                    </details>
                </li>
                <li>
                    <details>
                        <summary>
                            <SlCheck /> 支払い済み
                        </summary>
                        <ul className="aside_completed">
                            {
                                completed.map(invoice => {
                                    const number = plain_text(invoice.properties['請求書番号']);
                                    return (
                                        <li key="number">
                                            <InvoiceLink number={number} />
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </details>
                </li>
            </ul>
        </aside>
    );
}

export default InvoiceSidebar;