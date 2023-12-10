import Link from "next/link"
import { plain_text } from "../../utils/properties/plain_text"
import { get_customer } from "../../utils/properties/get_customer"
import { parseISO, format } from 'date-fns'
import ja from 'date-fns/locale/ja'
import StatusTag from "../../invoice/components/statusTag";

const InvoiceListRowItem = ({ invoice }) => {
    return (
        <Link href={`/invoice/${plain_text(invoice.properties['請求書番号'])}`}>
            <section className="mt-4 border rounded border-slate-700 px-6 py-4 bg-slate-900 shadow shadow-slate-900">
                <div className="flex justify-between">
                    <h2 className="text-xl font-bold leading-8">{plain_text(invoice.properties['件名'])}</h2>
                    <span>
                        <StatusTag status={plain_text(invoice.properties['ステータス'])} />
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm">#{plain_text(invoice.properties['請求書番号'])}</span>


                    <span className="text-sm">
                        顧客: <span className="font-bold">{get_customer(invoice.properties['顧客'].relation[0].id)}</span>
                    </span>

                    <span className="text-sm">
                        支払期限: <time className="font-bold" dateTime={invoice.properties['支払い期限日'].date.start}>{format(parseISO(invoice.properties['支払い期限日'].date.start), 'yyyy年MMMdo (eeeee)', { locale: ja })}</time>
                    </span>

                </div>
            </section>
        </Link>

    )
}

export default InvoiceListRowItem;