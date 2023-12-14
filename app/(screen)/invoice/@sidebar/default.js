import InvoiceLink from "./_components/invoiceLink";
import getInvoices from "@/app/(screen)/_utils/notion/getInvoices";
import { SlPencil, SlEnvolopeLetter, SlCheck } from "react-icons/sl";
import { plain_text } from "@/app/(screen)/_utils/properties/plain_text";

import './style.css'

const InvoiceSidebarDefault = async () => {
    const draft = await getInvoices("ドラフト");
    const sent = await getInvoices("送付済み");
    const completed = await getInvoices("支払い済み");

    return (
        <aside className="fixed top-16 w-2/12 bg-slate-800 rounded-tr-2xl rounded-br-2xl shadow shadow-slate-950 border-r border-t border-b border-slate-600 py-8 px-5 transition-all">
            <h2 className="text-2xl font-bold mb-5">Notion Invoice</h2>

            <ul>
                <li>
                    <details>
                        <summary className="bg-lime-500/30 border-lime-500/50 hover:bg-lime-500/40 transition-all">
                            <SlPencil /> ドラフト
                        </summary>
                        <ul className="aside_draft">
                            {
                                draft.map(invoice => {
                                    const number = plain_text(invoice.properties['請求書番号']);
                                    return (
                                        <li key={number}>
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
                        <summary className="bg-amber-500/30 border-amber-500/50 hover:bg-amber-500/40 transition-all">
                            <SlEnvolopeLetter /> 送付済み
                        </summary>
                        <ul className="aside_sent">
                            {
                                sent.map(invoice => {
                                    const number = plain_text(invoice.properties['請求書番号']);
                                    return (
                                        <li key={number}>
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
                        <summary className="bg-blue-500/30  border-blue-500/50 hover:bg-blue-500/40 transition-all">
                            <SlCheck /> 支払い済み
                        </summary>
                        <ul className="aside_completed">
                            {
                                completed.map(invoice => {
                                    const number = plain_text(invoice.properties['請求書番号']);
                                    return (
                                        <li key={number}>
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

export default InvoiceSidebarDefault;